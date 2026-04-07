import { CheckoutShopMinimal } from '@/store/useCheckoutStore';
import { CheckoutShopUI, PaymentMethodType, toCheckoutApiPaymentMethod } from '@/types/checkout';
import { CheckoutPreviewRequest } from '@/types/checkout/checkoutPreview';
import { CreateOrderRequest } from '@/types/checkout/order';
import { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';

// ============================================
// Params
// ============================================

export interface BuildPreviewParams {
    selectedItemIds: string[];
    checkoutShops: CheckoutShopMinimal[];
    selectedShipping: Map<string, string>;
    selectedShopVouchers: Map<string, string>;
    selectedPlatformDiscountVoucher: string | null;
    selectedPlatformShippingVoucher: string | null;
    selectedLoyaltyRedemptions: Map<string, number>;
    selectedAddressId: string | null;
    paymentMethod: PaymentMethodType;
    isBuyNowMode: boolean;
    quantity?: string;
    variantId?: string;
    effectivePlatformLoyaltyEnabled: boolean;
    previewData: CheckoutPreviewUI | null;
}

export interface BuildOrderParams extends BuildPreviewParams {
    shopNotes: Map<string, string>;
    previewData: CheckoutPreviewUI; // Must not be null for order creation
}

// ============================================
// Helpers
// ============================================

/** Collect user-selected global voucher codes into array for preview request */
function collectGlobalVouchers(discount: string | null, shipping: string | null): string[] {
    const result: string[] = [];
    if (discount) result.push(discount);
    if (shipping) result.push(shipping);
    return result;
}

/** Collect backend-verified global voucher codes from preview data for create order */
function getAppliedGlobalVouchers(previewData: CheckoutPreviewUI): string[] | undefined {
    const result: string[] = [];
    if (previewData.calculation.appliedPlatformVoucherId) result.push(previewData.calculation.appliedPlatformVoucherId);
    if (previewData.calculation.appliedShippingVoucherId) result.push(previewData.calculation.appliedShippingVoucherId);
    return result.length > 0 ? result : undefined;
}

/** Get platform loyalty points for a shop from preview data */
export function getPlatformLoyaltyPointsForShop(
    shopId: string,
    enabled: boolean,
    previewData: CheckoutPreviewUI | null,
): number | undefined {
    if (!enabled || !previewData) return undefined;
    const allocation = previewData.platformLoyalty?.allocations.find(a => a.shopId === shopId);
    if (!allocation) return undefined;
    const points = allocation.pointsToRedeem > 0 ? allocation.pointsToRedeem : allocation.maxPointsForShop;
    return points > 0 ? points : undefined;
}

/** Lookup preview shop by shopId — avoids repeated .find() calls */
function findPreviewShop(previewData: CheckoutPreviewUI | null, shopId: string): CheckoutShopUI | undefined {
    return previewData?.shops.find(s => s.shopId === shopId);
}

/** 
 * Resolve shipping fee for preview request. 
 */
function resolveShippingFee(
    shippingCode: string | undefined,
    previewShop: CheckoutShopUI | undefined
): number | undefined {
    if (!shippingCode || !previewShop) return undefined;
    if (shippingCode === previewShop.shippingOptions.selectedMethodId) {
        return previewShop.shippingOptions.selectedFee;
    }
    return previewShop.shippingOptions.methods.find(m => m.id === shippingCode)?.fee;
}

// ============================================
// Build Preview Request
// ============================================

/**
 * Build checkout preview request.
 * Uses selectedShipping from store.
 */
export function buildCheckoutPreviewRequest(params: BuildPreviewParams): CheckoutPreviewRequest | null {
    const {
        selectedItemIds, checkoutShops, selectedShipping, selectedShopVouchers,
        selectedPlatformDiscountVoucher, selectedPlatformShippingVoucher,
        selectedLoyaltyRedemptions, selectedAddressId, paymentMethod,
        isBuyNowMode, quantity, variantId, effectivePlatformLoyaltyEnabled, previewData,
    } = params;

    if (selectedItemIds.length === 0 || checkoutShops.length === 0) return null;

    const globalVouchers = collectGlobalVouchers(selectedPlatformDiscountVoucher, selectedPlatformShippingVoucher);

    // Build shops array
    const shops = checkoutShops.map(shop => {
        const shippingCode = selectedShipping.get(shop.shopId);
        const previewShop = findPreviewShop(previewData, shop.shopId);
        const serviceCode = shippingCode ? Number(shippingCode) : undefined;
        const shippingFee = resolveShippingFee(shippingCode, previewShop);

        // BuyNow shops array only needs minimal data, options are passed in directItem
        if (isBuyNowMode) {
            return {
                shopId: shop.shopId,
                items: shop.items,
                serviceCode,
                shippingFee,
            };
        }

        // Cart mode requires full data mapping per shop
        const voucherCode = selectedShopVouchers.get(shop.shopId);
        return {
            shopId: shop.shopId,
            items: shop.items,
            vouchers: voucherCode ? [voucherCode] : undefined,
            globalVouchers: globalVouchers.length > 0 ? globalVouchers : undefined,
            serviceCode,
            shippingFee,
            loyaltyPoints: selectedLoyaltyRedemptions.get(shop.shopId) || undefined,
            platformLoyaltyPoints: getPlatformLoyaltyPointsForShop(shop.shopId, effectivePlatformLoyaltyEnabled, previewData),
        };
    });

    // Build Buy Now directItem
    const firstShop = checkoutShops[0];
    const firstShippingCode = firstShop ? selectedShipping.get(firstShop.shopId) : undefined;
    const firstPreviewShop = firstShop ? findPreviewShop(previewData, firstShop.shopId) : undefined;

    return {
        shippingAddress: selectedAddressId ? { addressId: selectedAddressId, addressChanged: false } : undefined,
        shops,
        paymentMethod: toCheckoutApiPaymentMethod(paymentMethod),
        buyNow: isBuyNowMode ? true : undefined,
        directItem: isBuyNowMode ? {
            variantId: variantId!,
            quantity: parseInt(quantity || '1', 10),
            options: {
                loyaltyPoints: firstShop ? (selectedLoyaltyRedemptions.get(firstShop.shopId) || undefined) : undefined,
                platformLoyaltyPoints: firstShop ? getPlatformLoyaltyPointsForShop(firstShop.shopId, effectivePlatformLoyaltyEnabled, previewData) : undefined,
                serviceCode: firstShippingCode ? Number(firstShippingCode) : undefined,
                shippingFee: resolveShippingFee(firstShippingCode, firstPreviewShop),
            },
        } : undefined,
        allDiscountCodes: isBuyNowMode ? [
            ...globalVouchers,
            ...Array.from(selectedShopVouchers.values()),
        ] : undefined,
    };
}

// ============================================
// Build Create Order Request
// ============================================

export function buildCreateOrderRequest(params: BuildOrderParams): CreateOrderRequest | null {
    const {
        paymentMethod, isBuyNowMode, quantity, variantId,
        effectivePlatformLoyaltyEnabled, previewData, shopNotes,
    } = params;

    const validatedGlobalVouchers = getAppliedGlobalVouchers(previewData);

    // Build common options for a shop purely from backend state
    const buildShopOptions = (shop: CheckoutShopUI) => ({
        vouchers: shop.appliedVoucherId ? [shop.appliedVoucherId] : undefined,
        globalVouchers: validatedGlobalVouchers,
        loyaltyPoints: shop.loyaltyPoints || undefined,
        platformLoyaltyPoints: getPlatformLoyaltyPointsForShop(shop.shopId, effectivePlatformLoyaltyEnabled, previewData),
        serviceCode: Number(shop.shippingOptions.selectedMethodId) || undefined,
        shippingFee: shop.shippingOptions.selectedFee,
    });

    const mapItems = (items: CheckoutShopUI['items']) => items.map(item => ({
        itemId: item.id,
        expectedUnitPrice: item.unitPrice,
        quantity: item.quantity,
        promotionId: item.promotionId || undefined,
    }));

    // ---- Buy Now ----
    const buyNowShop = isBuyNowMode ? previewData.shops[0] : null;
    const buyNowOptions = buyNowShop ? buildShopOptions(buyNowShop) : undefined;
    const buyNowShops = buyNowShop ? [{
        shopId: buyNowShop.shopId,
        items: mapItems(buyNowShop.items),
        ...buyNowOptions
    }] : [];

    // ---- Cart ----
    const buildCartShops = () => previewData.shops.map(shop => ({
        shopId: shop.shopId,
        items: mapItems(shop.items),
        ...buildShopOptions(shop)
    }));

    // ---- Assemble request ----
    return {
        shops: isBuyNowMode ? buyNowShops : buildCartShops(),
        buyerAddressData: { buyerAddressId: previewData.addressId },
        paymentMethod: toCheckoutApiPaymentMethod(paymentMethod),
        customerNote: Array.from(shopNotes.values()).filter(Boolean).join('; ') || undefined,
        previewId: previewData.cartId,
        previewChecksum: previewData.previewChecksum,
        previewAt: previewData.previewAt,
        buyNow: isBuyNowMode ? true : undefined,
        directItem: (isBuyNowMode && buyNowOptions) ? {
            variantId: variantId!,
            quantity: parseInt(quantity || '1', 10),
            options: Object.values(buyNowOptions).some(v => Array.isArray(v) ? v.length > 0 : v != null)
                ? buyNowOptions
                : undefined,
        } : undefined,
    };
}
