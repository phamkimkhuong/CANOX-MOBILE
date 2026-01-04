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
} from '@/types/checkout/checkoutPreview';
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
    variantId: dto.variantId,
    productName: dto.productName,
    variantAttributes: dto.variantAttributes || '',
    imageUrl: toSizedImageUrl(dto.basePath, dto.extension) ?? DEFAULT_IMAGE,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    shopId: '', // Will be set by parent
});

// ============================================
// SHIPPING TRANSFORM
// ============================================

/**
 * Transform shipping option DTO to ShippingMethod UI type.
 * Maps serviceCode to id and serviceType to type.
 */
export const toShippingMethod = (dto: CheckoutShippingOptionDTO): ShippingMethod => ({
    id: String(dto.serviceCode),
    type: dto.serviceType as 'standard' | 'fast' | 'express',
    name: dto.displayName,
    description: dto.estimatedDeliveryTime,
    estimatedDays: parseEstimatedDays(dto.estimatedDeliveryTime),
    fee: dto.fee,
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
    id: dto.voucherCode,
    code: dto.voucherCode,
    title: dto.voucherType,
    description: dto.reason,
    discountDisplay: formatDiscountDisplay(dto.discountAmount, dto.discountMethod),
    minOrderDisplay: '', // Not available in DTO
    isApplicable: dto.valid,
    expiresAt: null,
});

/**
 * Format discount amount for display.
 */
const formatDiscountDisplay = (amount: number, method: string): string => {
    if (method === 'percentage') {
        return `Giảm ${amount}%`;
    }
    if (amount >= 1000) {
        return `Giảm ${Math.round(amount / 1000)}k`;
    }
    return `Giảm ${amount}đ`;
};

// ============================================
// SHOP TRANSFORM
// ============================================

/**
 * Transform shop DTO to CheckoutShopUI.
 * Combines items, shipping, vouchers into single UI object.
 */
export const toCheckoutShopUI = (dto: CheckoutPreviewShopDTO): CheckoutShopUI => {
    const items = dto.items.map((item) => ({
        ...toCheckoutItemUI(item),
        shopId: dto.shopId,
    }));

    return {
        shopId: dto.shopId,
        shopName: dto.shopName,
        items,
        shippingOptions: toShopShippingOptions(
            dto.shopId,
            dto.availableShippingOptions,
            dto.selectedShippingMethod
        ),
        appliedVoucherId: dto.voucherResult.validVouchers[0] ?? null,
        availableVouchers: dto.voucherResult.discountDetails.map(toVoucherUI),
        note: '', // Not in API response, managed client-side
    };
};

// ============================================
// SUMMARY TRANSFORM
// ============================================

/**
 * Transform shop summary DTO to ShopSubtotal.
 */
export const toShopSubtotal = (
    shopId: string,
    dto: CheckoutShopSummaryDTO
): ShopSubtotal => ({
    shopId,
    itemsTotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    shopVoucherDiscount: dto.productDiscount,
    shopTotal: dto.shopTotal,
    itemCount: dto.itemCount,
});

/**
 * Transform order summary DTO to CheckoutCalculationResult.
 * This is the main calculation result used by UI.
 */
export const toCheckoutCalculation = (
    dto: CheckoutOrderSummaryDTO,
    shops: CheckoutPreviewShopDTO[],
    isValid: boolean
): CheckoutCalculationResult => ({
    subtotal: dto.subtotal,
    totalShippingFee: dto.totalShippingFee,
    totalShopVoucherDiscount: dto.productDiscount,
    platformVoucherDiscount: dto.totalDiscount - dto.productDiscount - dto.shippingDiscount,
    shippingDiscount: dto.shippingDiscount,
    totalAmount: dto.grandTotal,
    totalSavings: dto.totalDiscount,
    totalItemCount: dto.totalItems,
    shopSubtotals: shops.map((shop) => toShopSubtotal(shop.shopId, shop.summary)),
    isCalculatingShipping: false,
    platformVoucherValidation: null, // Will be set from validation errors if needed
});

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
    addressId: string;
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
export const toCheckoutPreviewUI = (dto: CheckoutPreviewDataDTO): CheckoutPreviewUI => ({
    cartId: dto.cartId,
    currency: dto.currency,
    previewAt: dto.previewAt,
    addressId: dto.buyerAddressData.addressId,
    shops: dto.shops.map(toCheckoutShopUI),
    calculation: toCheckoutCalculation(dto.summary, dto.shops, dto.isValid),
    isValid: dto.isValid,
    validationErrors: dto.validationErrors,
    warnings: dto.warnings,
});

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
