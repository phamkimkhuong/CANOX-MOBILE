/**
 * Checkout Preview Adapter
 *
 * Transform Checkout Preview API response (DTO) to UI types.
 * Reuses existing UI types from checkout.ts and cart.ts.
 */

import type { VoucherUI } from '@/types/cart';
import type {
    CheckoutApiPaymentMethod,
    CheckoutCalculationResult,
    CheckoutItemUI,
    CheckoutLoyaltyInfoUI,
    CheckoutValidationIssueUI,
    PlatformLoyaltyAllocationUI,
    PlatformLoyaltyUI,
    CheckoutShopUI,
    ShippingMethod,
    ShopShippingOptions,
    ShopSubtotal,
    VoucherValidationResult,
} from '@/types/checkout';
import type {
    CheckoutLoyaltyInfoDTO,
    CheckoutOrderSummaryDTO,
    CheckoutPlatformLoyaltyInfoDTO,
    CheckoutPreviewDataDTO,
    CheckoutPreviewItemDTO,
    CheckoutPreviewRequest,
    CheckoutPreviewShopDTO,
    CheckoutPreviewShopRequest,
    CheckoutShippingOptionDTO,
    CheckoutShopSummaryDTO,
    CheckoutValidationIssueDTO,
    CheckoutVoucherDetailDTO,
    CheckoutVoucherResultDTO,
} from '@/types/checkout/checkoutPreview';
import type { RecommendedVoucherDetailDTO } from '@/types/checkout/platformVoucherRecommendation';
import { formatCurrency } from '../format';

const DEFAULT_IMAGE = 'https://via.placeholder.com/96';

// ============================================
// ITEM TRANSFORM
// ============================================

/**
 * Transform checkout item DTO to UI type.
 * Reuses CheckoutItemUI from checkout.ts.
 */
export const toCheckoutItemUI = (dto: CheckoutPreviewItemDTO): CheckoutItemUI => ({
    id: dto.itemId,
    productId: dto.productId,
    variantId: dto.variantId,
    productName: dto.productName,
    variantAttributes: dto.variantAttributes || '',
    imageUrl: dto.imageUrl ?? DEFAULT_IMAGE,
    unitPrice: dto.unitPrice ?? 0,
    quantity: dto.quantity ?? 1,
    discountAmount: dto.pricing.discount ?? 0,
    finalLinePrice: (dto.pricing.finalPrice !== 0 || dto.pricing.discount > 0)
        ? dto.pricing.finalPrice
        : (dto.unitPrice ?? 0) * (dto.quantity ?? 1),
    shopId: '', // Will be set by parent
    promotionId: dto.promotion?.promotionId ?? null,
});

// ============================================
// SHIPPING TRANSFORM
// ============================================

/**
 * Transform shipping option DTO to ShippingMethod UI type.
 * Maps backend shipping option to the UI shipping model.
 */
const inferShippingMethodType = (label: string): ShippingMethod['type'] => {
    const normalized = label.toLowerCase();

    if (normalized.includes('hỏa tốc') || normalized.includes('hoa toc') || normalized.includes('express')) {
        return 'express';
    }
    if (normalized.includes('nhanh')) {
        return 'fast';
    }
    if (normalized.includes('tiêu chuẩn') || normalized.includes('tieu chuan') || normalized.includes('standard') || normalized.includes('supership')) {
        return 'supper_ship';
    }
    return 'standard';
};

export const toShippingMethod = (dto: CheckoutShippingOptionDTO): ShippingMethod => ({
    id: String(dto.serviceCode ?? ''),
    type: inferShippingMethodType(dto.label ?? ''),
    name: dto.label ?? '',
    description: dto.estimated ?? '',
    estimatedDays: parseEstimatedDays(dto.estimated ?? ''),
    fee: dto.totalFee ?? 0,
});

/**
 * Parse estimated days from delivery time string.
 * Example: "2-3 ngày" → 3 (use max)
 */
const parseEstimatedDays = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)/g);
    if (match && match.length > 0) {
        return parseInt(match[match.length - 1], 10);
    }
    return 3; // Default
};

/**
 * Transform shipping options array to ShopShippingOptions.
 */
export const toShopShippingOptions = (
    shopId: string,
    options: CheckoutShippingOptionDTO[] | null | undefined
): ShopShippingOptions => {
    const safeOptions = options ?? [];
    const selectedOption = safeOptions.find((option) => option.isSelected);
    const selectedMethodId = selectedOption
        ? String(selectedOption.serviceCode ?? '')
        : (safeOptions[0] ? String(safeOptions[0].serviceCode ?? '') : '');

    return {
        shopId,
        methods: safeOptions.map(toShippingMethod),
        selectedMethodId,
        isLoading: false,
    };
};

// ============================================
// VOUCHER TRANSFORM
// ============================================

/**
 * Transform voucher detail DTO to VoucherUI.
 * Used to show applied/invalid vouchers in UI.
 */
export const toVoucherUI = (dto: CheckoutVoucherDetailDTO, isValid: boolean): VoucherUI => ({
    id: dto.code ?? '',
    code: dto.code ?? '',
    title: dto.type ?? '',  // "SHOP" or "PLATFORM"
    description: dto.reason ?? '',
    discountDisplay: formatDiscountDisplay(dto.discount ?? 0, dto.method ?? 'FIXED_AMOUNT'),
    minOrderDisplay: dto.minOrderAmount ? `Đơn tối thiểu ${formatCurrency(dto.minOrderAmount)}` : 'Mọi đơn hàng',
    isApplicable: isValid,
    expiresAt: null,
    // Map discountTarget to category for UI filtering
    category: dto.target === 'SHIP' || dto.target === 'SHIPPING' ? 'SHIPPING' : 'DISCOUNT',
});

/**
 * Transform Recommendation Voucher DTO to UI type.
 * Handles RecommendedVoucherDetailDTO from API v2.
 */
export const transformVoucherDTOToUI = (
    voucher: RecommendedVoucherDetailDTO,
    applicable: boolean,
    reason?: string | null,
    calculatedDiscount?: number | null,
    category?: 'SHIPPING' | 'DISCOUNT'
): VoucherUI => {
    const discountValue = voucher.discountValue ?? 0;
    const isPercentage = voucher.discountType === 'PERCENTAGE';
    const maxDiscount = voucher.maxDiscount ?? null;

    // Format discount display: "Giảm 9%" hoặc "Giảm 50K"
    const discountDisplay = isPercentage
        ? `Giảm\u00A0${Math.round(discountValue)}%`
        : `Giảm\u00A0${formatCurrency(discountValue)}`;

    const maxDiscountDisplay = isPercentage && maxDiscount && maxDiscount > 0
        ? `Giảm tối đa ${formatCurrency(maxDiscount)}`
        : `Giảm ${formatCurrency(discountValue)}`;

    const minOrderDisplay = voucher.minOrderAmount && voucher.minOrderAmount > 0
        ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
        : 'Mọi đơn hàng';

    // Determine category from voucherScope or parameter
    const voucherCategory = category ??
        (voucher.voucherScope?.toLowerCase().includes('ship') ? 'SHIPPING' : 'DISCOUNT');

    return {
        id: voucher.code ?? '',
        code: voucher.code ?? '',
        title: voucher.name ?? '',
        description: reason || voucher.description || '',
        discountDisplay,
        minOrderDisplay,
        isApplicable: applicable,
        expiresAt: voucher.endDate ?? null,
        category: voucherCategory,

        // Extended fields
        discountType: isPercentage ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discountValue,
        maxDiscount,
        maxDiscountDisplay,
        maxUsage: voucher.maxUsage ?? null,
        calculatedDiscount: calculatedDiscount ?? null,
        reason: reason ?? null,
    };
};

/**
 * Format discount amount for display.
 */
const formatDiscountDisplay = (amount: number, method: string): string => {
    if (method === 'percentage' || method === 'PERCENTAGE') {
        const roundedPercent = Math.round(amount);
        return `Giảm\u00A0${roundedPercent}%`;
    }
    return `Giảm\u00A0${formatCurrency(amount)}`;
};

// ============================================
// SHOP TRANSFORM
// ============================================

/**
 * Transform shop DTO to CheckoutShopUI.
 * Combines items, shipping, vouchers into single UI object.
 */
export const toCheckoutShopUI = (dto: CheckoutPreviewShopDTO): CheckoutShopUI => {
    const items = (dto.items ?? []).map((item) => ({
        ...toCheckoutItemUI(item),
        shopId: dto.shopId ?? '',
    }));

    // Transform all vouchers from valid and invalid
    const validVouchers = dto.voucher?.valid ?? [];
    const invalidVouchers = dto.voucher?.invalid ?? [];
    const allVouchers = [
        ...validVouchers.map(v => toVoucherUI(v, true)),
        ...invalidVouchers.map(v => toVoucherUI(v, false))
    ];

    // Find first SHOP voucher code for appliedVoucherId
    const firstShopVoucher = validVouchers.find(
        (v: CheckoutVoucherDetailDTO) => v.type === 'SHOP'
    );

    return {
        shopId: dto.shopId ?? '',
        shopName: dto.shopName ?? '',
        shopLogo: dto.logoPath ?? undefined,
        items,
        shippingOptions: toShopShippingOptions(dto.shopId ?? '', dto.shipping.options),
        appliedVoucherId: firstShopVoucher?.code ?? null,
        availableVouchers: allVouchers,  // Contains both SHOP and PLATFORM for UI to filter
        note: '', // Not in API response, managed client-side
        loyaltyPoints: dto.loyaltyInfo?.pointsToRedeem ?? 0,
        loyaltyInfo: dto.loyaltyInfo ? toLoyaltyInfoUI(dto.loyaltyInfo) : null,
    };
};

/**
 * Transform loyalty info DTO to UI type.
 */
const toLoyaltyInfoUI = (dto: CheckoutLoyaltyInfoDTO): CheckoutLoyaltyInfoUI => ({
    availablePoints: dto.availablePoints ?? 0,
    pointsToRedeem: dto.pointsToRedeem ?? 0,
    discountAmount: dto.discountAmount ?? 0,
    maxPointsAllowed: dto.maxPointsAllowed ?? 0,
    maxDiscountPercent: dto.maxDiscountPercent ?? 0,
    expectedPointsEarned: dto.expectedPointsEarned ?? 0,
    canRedeem: dto.canRedeem ?? false,
    message: dto.message ?? '',
});

const toValidationIssueUI = (dto: CheckoutValidationIssueDTO): CheckoutValidationIssueUI => ({
    code: dto.code ?? 0,
    message: dto.message ?? '',
});

const toPlatformLoyaltyAllocationUI = (
    shop: CheckoutPreviewShopDTO,
    dto: CheckoutPlatformLoyaltyInfoDTO
): PlatformLoyaltyAllocationUI => ({
    shopId: shop.shopId ?? '',
    shopName: shop.shopName ?? '',
    pointsToRedeem: dto.pointsToRedeem ?? 0,
    discountAmount: dto.discountAmount ?? 0,
    maxPointsForShop: dto.maxPointsForShop ?? 0,
    canRedeem: dto.canRedeem ?? false,
});

const toPlatformLoyaltyUI = (
    shops: CheckoutPreviewShopDTO[],
    totalDiscountAmount: number
): PlatformLoyaltyUI | null => {
    const allocations = shops
        .filter((shop) => !!shop.platformLoyaltyInfo)
        .map((shop) => toPlatformLoyaltyAllocationUI(shop, shop.platformLoyaltyInfo!));

    if (allocations.length === 0 && totalDiscountAmount <= 0) {
        return null;
    }

    const firstWithRate = shops.find((shop) => (shop.platformLoyaltyInfo?.conversionRate ?? 0) > 0);
    const totalPointsToRedeem = allocations.reduce((sum, allocation) => sum + allocation.pointsToRedeem, 0);
    const hasRedeemableShop = allocations.some(
        (allocation) =>
            allocation.canRedeem ||
            allocation.maxPointsForShop > 0 ||
            allocation.pointsToRedeem > 0 ||
            allocation.discountAmount > 0
    ) || totalDiscountAmount > 0;

    return {
        conversionRate: firstWithRate?.platformLoyaltyInfo?.conversionRate ?? null,
        totalDiscountAmount,
        totalPointsToRedeem,
        hasRedeemableShop,
        allocations,
    };
};

// ============================================
// SUMMARY TRANSFORM
// ============================================

/**
 * Calculate shop voucher discount from voucherResult.valid.
 * Only sum SHOP type vouchers, not PLATFORM.
 */
const calculateShopVoucherDiscount = (voucherResult?: CheckoutVoucherResultDTO | null): number => {
    if (!voucherResult?.valid) return 0;
    return voucherResult.valid
        .filter((v: CheckoutVoucherDetailDTO) => v.type === 'SHOP')
        .reduce((sum, v) => sum + (v.discount || 0), 0);
};

/**
 * Transform shop summary DTO to ShopSubtotal.
 */
export const toShopSubtotal = (
    shopId: string,
    dto: CheckoutShopSummaryDTO,
    voucherResult?: CheckoutVoucherResultDTO | null,
    items?: CheckoutPreviewItemDTO[]
): ShopSubtotal => {
    // Tự tính tổng số lượng món hàng từ danh sách items trả về
    const itemCount = items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;

    return {
        shopId,
        itemsTotal: dto.subtotal ?? 0,
        shippingFee: dto.shippingFee ?? 0,
        // Use calculated shop voucher discount from voucherResult instead of productDiscount
        shopVoucherDiscount: calculateShopVoucherDiscount(voucherResult),
        shopTotal: dto.shopTotal ?? 0,
        itemCount,
    };
};

/**
 * Transform order summary DTO to CheckoutCalculationResult.
 * This is the main calculation result used by UI.
 */
export const toCheckoutCalculation = (
    dto: CheckoutOrderSummaryDTO,
    shops: CheckoutPreviewShopDTO[],
    _isValid: boolean
): CheckoutCalculationResult => {
    // Calculate total shop voucher discount from each shop's voucherResult
    const totalShopVoucherDiscount = shops.reduce(
        (sum, shop) => sum + calculateShopVoucherDiscount(shop.voucher),
        0
    );
    const platformVoucherDiscount = Math.max(0, (dto.discounts.voucherTotal ?? 0) - totalShopVoucherDiscount - (dto.discounts.voucherShipping ?? 0));

    // Determine platform voucher validity
    const invalidPlatform = shops.flatMap(s => s.voucher?.invalid || [])
        .find(v => v.type === 'PLATFORM');

    let platformVoucherValidation: VoucherValidationResult | null = null;
    if (invalidPlatform) {
        platformVoucherValidation = {
            isValid: false,
            invalidReason: invalidPlatform.reason || 'Voucher không hợp lệ cho đơn hàng này',
            discountAmount: 0,
            shouldAutoRemove: true,
        };
    }

    return {
        subtotal: dto.subtotal ?? 0,
        totalShippingFee: dto.totalShippingFee ?? 0,
        totalShopVoucherDiscount,
        platformVoucherDiscount,
        shippingDiscount: dto.discounts.voucherShipping ?? 0,
        appliedPlatformVoucherId: shops.flatMap(s => s.voucher?.valid || [])
            .find(v => v.type === 'PLATFORM' && v.target !== 'SHIP' && v.target !== 'SHIPPING')?.code ?? null,
        appliedShippingVoucherId: shops.flatMap(s => s.voucher?.valid || [])
            .find(v => v.type === 'PLATFORM' && (v.target === 'SHIP' || v.target === 'SHIPPING'))?.code ?? null,
        totalAmount: dto.grandTotal ?? 0,
        taxAmount: dto.totalTaxAmount ?? 0,
        totalSavings: dto.discounts.voucherTotal ?? 0,
        totalItemCount: dto.totalItems ?? 0,
        shopSubtotals: shops.map((shop) => toShopSubtotal(shop.shopId ?? '', shop.pricing, shop.voucher, shop.items)),
        isCalculatingShipping: false,
        platformVoucherValidation,
        loyaltyPoints: shops.reduce((sum, shop) => sum + (shop.loyaltyInfo?.pointsToRedeem ?? 0), 0),
        loyaltyDiscount: dto.discounts.loyaltyDiscount ?? 0,
        platformLoyaltyDiscount: dto.discounts.platformLoyaltyDiscount ?? 0,
    };
};

// ============================================
// FULL RESPONSE TRANSFORM
// ============================================

/**
 * UI-ready checkout preview data.
 * Contains all transformed data ready for components.
 */
export interface CheckoutPreviewUI {
    cartId: string;
    currency: string;
    previewAt: string;
    previewChecksum?: string;
    paymentMethod?: CheckoutApiPaymentMethod;
    addressId: string;
    shops: CheckoutShopUI[];
    calculation: CheckoutCalculationResult;
    platformLoyalty: PlatformLoyaltyUI | null;
    isValid: boolean;
    validationErrors: CheckoutValidationIssueUI[];
    warnings: CheckoutValidationIssueUI[];
}

/**
 * Transform full checkout preview response to UI-ready data.
 * This is the main entry point for the adapter.
 */
export const toCheckoutPreviewUI = (dto: CheckoutPreviewDataDTO): CheckoutPreviewUI => {
    const platformLoyalty = toPlatformLoyaltyUI(
        dto.shops,
        dto.summary.discounts.platformLoyaltyDiscount ?? 0
    );

    return {
        cartId: dto.cartId,
        currency: dto.currency,
        previewAt: dto.previewAt,
        previewChecksum: dto.previewChecksum ?? undefined,
        addressId: dto.buyerAddressData?.buyerAddressId ?? '',
        shops: dto.shops.map(toCheckoutShopUI),
        calculation: toCheckoutCalculation(dto.summary, dto.shops, dto.validation.isValid),
        platformLoyalty,
        isValid: dto.validation.isValid,
        validationErrors: dto.validation.errors.map(toValidationIssueUI),
        warnings: dto.validation.warnings.map(toValidationIssueUI),
    };
};

// ============================================
// HELPER: Chuẩn hóa body gửi lên POST /api/v1/cart/checkout
// ============================================

/**
 * Chuẩn hóa request nội bộ thành body gửi lên POST /api/v1/cart/checkout.
 *
 * Lần đầu (chưa chọn voucher, shipping, payment): chỉ gửi
 * { shops: [{ shopId, items: [{ itemId, quantity }] }], shippingAddress: { addressId } }.
 *
 * Các lần sau (user đã chọn): thêm vouchers, serviceCode, globalVouchers, paymentMethod khi có giá trị.
 * Không gửi: allSelectedItemIds, previewAllSelected, addressChanged,
 * itemIds, shippingFee và mọi field undefined
 */
export function toCheckoutPreviewAPIRequestBody(req: CheckoutPreviewRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (req.buyNow && req.directItem) {
        body.buyNow = true;
        body.directItem = req.directItem;

        // When buyNow is true, shops and directItem are mutually exclusive.
        // We move shop-level configurations to the root level if possible.
        if (req.shops && req.shops.length > 0) {
            const firstShop = req.shops[0];

            // Collect all unique vouchers (shop + global) to root level
            const allVouchers = new Set<string>(req.allDiscountCodes || []);
            if (firstShop.vouchers) firstShop.vouchers.forEach(v => allVouchers.add(v));
            if (firstShop.globalVouchers) firstShop.globalVouchers.forEach(v => allVouchers.add(v));

            if (allVouchers.size > 0) {
                body.allDiscountCodes = Array.from(allVouchers);
            }

            // Move loyalty points to root level
            if (firstShop.loyaltyPoints != null) {
                body.loyaltyPoints = firstShop.loyaltyPoints;
            }
        }
    } else {
        // Standard Checkout flow
        body.shops = req.shops.map((s: CheckoutPreviewShopRequest) => {
            const shop: Record<string, unknown> = {
                shopId: s.shopId,
                items: s.items || [],
            };

            if (s.vouchers && s.vouchers.length > 0) {
                shop.vouchers = s.vouchers;
            }

            if (s.globalVouchers && s.globalVouchers.length > 0) {
                shop.globalVouchers = s.globalVouchers;
            }

            if (s.serviceCode != null) {
                shop.serviceCode = s.serviceCode;
            }

            if (s.loyaltyPoints != null) {
                shop.loyaltyPoints = s.loyaltyPoints;
            }

            if (s.platformLoyaltyPoints != null) {
                shop.platformLoyaltyPoints = s.platformLoyaltyPoints;
            }

            return shop;
        });
    }

    if (req.shippingAddress?.addressId) {
        body.shippingAddress = { addressId: req.shippingAddress.addressId };
    }

    if (req.paymentMethod) {
        body.paymentMethod = req.paymentMethod;
    }

    return body;
}

// ============================================
// HELPER: Build Request from Cart
// ============================================

/**
 * Build minimal checkout preview request from selected cart items.
 * Used for initial preview call when entering checkout.
 */
export const buildInitialPreviewRequest = (
    selectedItemIds: string[],
    itemShopMap: Map<string, string>,
    addressId?: string
) => {
    // Group items by shop
    const shopItemsMap = new Map<string, string[]>();

    for (const itemId of selectedItemIds) {
        const shopId = itemShopMap.get(itemId);
        if (!shopId) continue;

        const items = shopItemsMap.get(shopId) ?? [];
        items.push(itemId);
        shopItemsMap.set(shopId, items);
    }

    // Build request
    return {
        shops: Array.from(shopItemsMap.entries()).map(([shopId, ids]) => ({
            shopId,
            items: ids.map(id => ({ itemId: id, quantity: 1 })),
            vouchers: [],
        })),
        ...(addressId && {
            shippingAddress: { addressId },
        }),
    };
};
