/**
 * Checkout Preview Adapter
 *
 * Transform Checkout Preview API response (DTO) to UI types.
 * Reuses existing UI types from checkout.ts and cart.ts.
 */

import type { VoucherUI } from '@/types/cart';
import type {
    CheckoutCalculationResult,
    CheckoutItemUI,
    CheckoutShopUI,
    ShippingMethod,
    ShopShippingOptions,
    ShopSubtotal,
} from '@/types/checkout';
import type {
    CheckoutOrderSummaryDTO,
    CheckoutPreviewDataDTO,
    CheckoutPreviewItemDTO,
    CheckoutPreviewShopDTO,
    CheckoutShippingOptionDTO,
    CheckoutShopSummaryDTO,
    CheckoutVoucherDetailDTO,
    CheckoutVoucherResultDTO,
} from '@/types/checkout/checkoutPreview';
import type { RecommendedVoucherDetailDTO } from '@/types/checkout/platformVoucherRecommendation';
import { formatCurrency } from '../format';
import { toSizedImageUrl } from '../url';

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
    imageUrl: toSizedImageUrl(dto.basePath, dto.extension) ?? DEFAULT_IMAGE,
    unitPrice: dto.unitPrice ?? 0,
    quantity: dto.quantity ?? 1,
    lineTotal: dto.lineTotal ?? 0,
    shopId: '', // Will be set by parent
    promotionId: dto.promotion?.promotionId ?? null,
});

// ============================================
// SHIPPING TRANSFORM
// ============================================

/**
 * Transform shipping option DTO to ShippingMethod UI type.
 * Maps serviceCode to id and serviceType to type.
 */
export const toShippingMethod = (dto: CheckoutShippingOptionDTO): ShippingMethod => ({
    id: String(dto.serviceCode ?? ''),
    type: (dto.serviceType ?? 'standard') as 'standard' | 'fast' | 'express',
    name: dto.displayName ?? '',
    description: dto.estimatedDeliveryTime ?? '',
    estimatedDays: parseEstimatedDays(dto.estimatedDeliveryTime ?? ''),
    fee: dto.fee ?? 0,
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
    options: CheckoutShippingOptionDTO[] | null | undefined,
    selectedMethod: string | null | undefined
): ShopShippingOptions => {
    const safeOptions = options ?? [];
    const safeSelectedMethod = selectedMethod ?? '';

    return {
        shopId,
        methods: safeOptions.map(toShippingMethod),
        selectedMethodId: safeSelectedMethod || (safeOptions[0] ? String(safeOptions[0].serviceCode) : ''),
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
export const toVoucherUI = (dto: CheckoutVoucherDetailDTO): VoucherUI => ({
    id: dto.voucherCode ?? '',
    code: dto.voucherCode ?? '',
    title: dto.voucherType ?? '',  // "SHOP" or "PLATFORM"
    description: dto.reason ?? '',
    discountDisplay: formatDiscountDisplay(dto.discountAmount ?? 0, dto.discountMethod ?? 'FIXED_AMOUNT'),
    minOrderDisplay: '', // Not available in DTO
    isApplicable: dto.valid ?? false,
    expiresAt: null,
    // Map discountTarget to category for UI filtering
    category: dto.discountTarget === 'SHIP' ? 'SHIPPING' : 'DISCOUNT',
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
    if (method === 'percentage') {
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

    // Transform all vouchers from discountDetails (with null safety)
    const discountDetails = dto.voucherResult?.discountDetails ?? [];
    const allVouchers = discountDetails.map(toVoucherUI);

    // Find first SHOP voucher code for appliedVoucherId
    const firstShopVoucher = discountDetails.find(
        v => v.voucherType === 'SHOP' && v.valid
    );

    return {
        shopId: dto.shopId ?? '',
        shopName: dto.shopName ?? '',
        shopLogo: dto.logoUrl ?? undefined,
        items,
        shippingOptions: toShopShippingOptions(
            dto.shopId ?? '',
            dto.availableShippingOptions,
            dto.selectedShippingMethod
        ),
        appliedVoucherId: firstShopVoucher?.voucherCode ?? null,
        availableVouchers: allVouchers,  // Contains both SHOP and PLATFORM for UI to filter
        note: '', // Not in API response, managed client-side
        loyaltyPoints: dto.loyaltyInfo?.pointsToRedeem ?? 0,
    };
};

// ============================================
// SUMMARY TRANSFORM
// ============================================

/**
 * Calculate shop voucher discount from voucherResult.discountDetails.
 * Only sum SHOP type vouchers, not PLATFORM.
 */
const calculateShopVoucherDiscount = (voucherResult?: CheckoutVoucherResultDTO): number => {
    if (!voucherResult?.discountDetails) return 0;
    return voucherResult.discountDetails
        .filter(v => v.voucherType === 'SHOP' && v.valid)
        .reduce((sum, v) => sum + (v.discountAmount || 0), 0);
};

/**
 * Transform shop summary DTO to ShopSubtotal.
 */
export const toShopSubtotal = (
    shopId: string,
    dto: CheckoutShopSummaryDTO,
    voucherResult?: CheckoutVoucherResultDTO
): ShopSubtotal => ({
    shopId,
    itemsTotal: dto.subtotal ?? 0,
    shippingFee: dto.shippingFee ?? 0,
    // Use calculated shop voucher discount from voucherResult instead of productDiscount
    shopVoucherDiscount: calculateShopVoucherDiscount(voucherResult),
    shopTotal: dto.shopTotal ?? 0,
    itemCount: dto.itemCount ?? 0,
});

/**
 * Transform order summary DTO to CheckoutCalculationResult.
 * This is the main calculation result used by UI.
 */
export const toCheckoutCalculation = (
    dto: CheckoutOrderSummaryDTO,
    shops: CheckoutPreviewShopDTO[],
    isValid: boolean
): CheckoutCalculationResult => {
    // Calculate total shop voucher discount from each shop's voucherResult
    const totalShopVoucherDiscount = shops.reduce(
        (sum, shop) => sum + calculateShopVoucherDiscount(shop.voucherResult),
        0
    );
    const platformVoucherDiscount = Math.max(0, (dto.totalDiscount ?? 0) - totalShopVoucherDiscount - (dto.shippingDiscount ?? 0));

    return {
        subtotal: dto.subtotal ?? 0,
        totalShippingFee: dto.totalShippingFee ?? 0,
        totalShopVoucherDiscount,
        platformVoucherDiscount,
        shippingDiscount: dto.shippingDiscount ?? 0,
        appliedPlatformVoucherId: shops.flatMap(s => s.voucherResult?.discountDetails || [])
            .find(v => v.voucherType === 'PLATFORM' && v.discountTarget !== 'SHIP' && v.valid)?.voucherCode ?? null,
        appliedShippingVoucherId: shops.flatMap(s => s.voucherResult?.discountDetails || [])
            .find(v => v.voucherType === 'PLATFORM' && v.discountTarget === 'SHIP' && v.valid)?.voucherCode ?? null,
        totalAmount: dto.grandTotal ?? 0,
        taxAmount: dto.totalTaxAmount ?? 0,
        totalSavings: dto.totalDiscount ?? 0,
        totalItemCount: dto.totalItems ?? 0,
        shopSubtotals: shops.map((shop) => toShopSubtotal(shop.shopId ?? '', shop.summary, shop.voucherResult)),
        isCalculatingShipping: false,
        platformVoucherValidation: null,
        loyaltyPoints: shops.reduce((sum, shop) => sum + (shop.loyaltyInfo?.pointsToRedeem ?? 0), 0),
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
    previewId?: string;
    cartId: string;
    currency: string;
    previewAt: string;
    addressId: string;
    addressType: number | null;
    taxAddress: string | null;
    shops: CheckoutShopUI[];
    calculation: CheckoutCalculationResult;
    isValid: boolean;
    validationErrors: string[];
    warnings: string[];
}

/**
 * Transform full checkout preview response to UI-ready data.
 * This is the main entry point for the adapter.
 */
export const toCheckoutPreviewUI = (dto: CheckoutPreviewDataDTO): CheckoutPreviewUI => {
    return {
        previewId: dto.cartId,
        cartId: dto.cartId,
        currency: dto.currency,
        previewAt: dto.previewAt,
        addressId: dto.buyerAddressData?.addressId ?? '',
        addressType: dto.buyerAddressData?.addressType ?? null,
        taxAddress: dto.buyerAddressData?.taxAddress ?? null,
        shops: dto.shops.map(toCheckoutShopUI),
        calculation: toCheckoutCalculation(dto.summary, dto.shops, dto.isValid),
        isValid: dto.isValid,
        validationErrors: dto.validationErrors,
        warnings: dto.warnings,
    };
};

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
        shops: Array.from(shopItemsMap.entries()).map(([shopId, itemIds]) => ({
            shopId,
            itemIds,
            vouchers: [],
        })),
        ...(addressId && {
            shippingAddress: { addressId },
            usingSavedAddress: true,
        }),
        allSelectedItemIds: selectedItemIds,
    };
};
