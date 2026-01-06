/**
 * useCheckoutStore - Zustand store for Checkout Session
 */

import type { CheckoutShopUI, PaymentMethodType } from '@/types/checkout';
import type { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { useMemo } from 'react';
import { create } from 'zustand';

interface CheckoutShopMinimal {
    shopId: string;
    itemIds: string[];
}

interface CheckoutState {
    isInitialized: boolean;
    /** Preview response from server - contains shops, calculation, validation */
    previewData: CheckoutPreviewUI | null;
    isLoadingPreview: boolean;
    /** Items selected from Cart for checkout */
    selectedItemIds: string[];
    /** Shop-Item mapping for building request without re-fetching cart */
    checkoutShops: CheckoutShopMinimal[];
    /** Selected shipping method per shop: Map<shopId, serviceCode> */
    selectedShipping: Map<string, string>;
    /** Selected shop voucher per shop: Map<shopId, voucherCode> */
    selectedShopVouchers: Map<string, string>;
    selectedPlatformDiscountVoucher: string | null;
    selectedPlatformShippingVoucher: string | null;
    shopNotes: Map<string, string>;
    paymentMethod: PaymentMethodType;
    /** Submitting order */
    isSubmitting: boolean;

    initSession: (selectedItemIds: string[], shops: CheckoutShopMinimal[]) => void;
    /** Reset session when leaving checkout */
    resetSession: () => void;
    setPreviewData: (data: CheckoutPreviewUI | null) => void;
    /** Set loading state for preview */
    setLoadingPreview: (isLoading: boolean) => void;

    // ========================================
    // Actions - User Selections
    // ========================================
    selectShippingMethod: (shopId: string, serviceCode: string) => void;
    applyShopVoucher: (shopId: string, voucherCode: string | null) => void;
    applyPlatformVoucher: (voucherCode: string | null, category: 'SHIPPING' | 'DISCOUNT') => void;
    applyBulkPlatformVouchers: (discountVoucherCode: string | null, shippingVoucherCode: string | null) => void;
    setShopNote: (shopId: string, note: string) => void;
    setPaymentMethod: (method: PaymentMethodType) => void;

    // ========================================
    // Actions - UI State
    // ========================================
    /** Set submitting state */
    setSubmitting: (isSubmitting: boolean) => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    // Session
    isInitialized: false,

    // Server Data
    previewData: null as CheckoutPreviewUI | null,
    isLoadingPreview: false,

    // Checkout Items
    selectedItemIds: [] as string[],
    checkoutShops: [] as CheckoutShopMinimal[],

    // User Selections
    selectedShipping: new Map<string, string>(),
    selectedShopVouchers: new Map<string, string>(),
    selectedPlatformDiscountVoucher: null as string | null,
    selectedPlatformShippingVoucher: null as string | null,
    shopNotes: new Map<string, string>(),
    paymentMethod: 'cod' as PaymentMethodType,

    // UI State
    isSubmitting: false,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
    ...initialState,

    // ========================================
    // Session Actions
    // ========================================

    /**
     * Initialize checkout session with selected items from Cart.
     * Cart calls this BEFORE navigating, data is ready immediately.
     */
    initSession: (selectedItemIds, shops) => {
        set({
            isInitialized: true,
            selectedItemIds: [...selectedItemIds],
            checkoutShops: [...shops],
            // Reset selections
            selectedShipping: new Map(),
            selectedShopVouchers: new Map(),
            selectedPlatformDiscountVoucher: null,
            selectedPlatformShippingVoucher: null,
            shopNotes: new Map(),
            paymentMethod: 'cod',
            // Reset preview
            previewData: null,
            isLoadingPreview: false,
            isSubmitting: false,
        });
    },

    resetSession: () => {
        set(initialState);
    },

    /**
     * Update preview data from API response.
     * Server returned selectedShippingMethod in each shop.
     * DO NOT sync selectedShipping from server anymore - avoid trigger re-render loop.
     */
    setPreviewData: (data) => {
        const state = get();
        const newShopVouchers = new Map(state.selectedShopVouchers);
        let newPlatformDiscount = state.selectedPlatformDiscountVoucher;
        let newPlatformShipping = state.selectedPlatformShippingVoucher;

        // Only sync if store is empty (first load or after reset)
        const isFirstSync = newShopVouchers.size === 0 &&
            newPlatformDiscount === null &&
            newPlatformShipping === null;

        if (isFirstSync && data) {
            // Sync vouchers from each shop's voucherResult (availableVouchers contains discountDetails)
            for (const shop of data.shops) {
                for (const voucher of shop.availableVouchers) {
                    if (!voucher.isApplicable) continue;

                    if (voucher.title === 'SHOP') {
                        if (!newShopVouchers.has(shop.shopId)) {
                            newShopVouchers.set(shop.shopId, voucher.code);
                        }
                    } else if (voucher.title === 'PLATFORM') {
                        // Platform voucher - use category to differentiate
                        if (voucher.category === 'SHIPPING') {
                            // Only set first shipping voucher
                            if (!newPlatformShipping) {
                                newPlatformShipping = voucher.code;
                            }
                        } else {
                            // DISCOUNT category
                            if (!newPlatformDiscount) {
                                newPlatformDiscount = voucher.code;
                            }
                        }
                    }
                }
            }
        }

        set({
            previewData: data,
            selectedShopVouchers: newShopVouchers,
            selectedPlatformDiscountVoucher: newPlatformDiscount,
            selectedPlatformShippingVoucher: newPlatformShipping,
        });
    },

    setLoadingPreview: (isLoading) => {
        set({ isLoadingPreview: isLoading });
    },

    // ========================================
    // User Selection Actions
    // ========================================

    selectShippingMethod: (shopId, serviceCode) => {
        const newMap = new Map(get().selectedShipping);
        newMap.set(shopId, serviceCode);
        set({ selectedShipping: newMap });
    },

    applyShopVoucher: (shopId, voucherCode) => {
        const newMap = new Map(get().selectedShopVouchers);
        if (voucherCode === null) {
            newMap.delete(shopId);
        } else {
            newMap.set(shopId, voucherCode);
        }
        set({ selectedShopVouchers: newMap });
    },

    applyPlatformVoucher: (voucherCode, category) => {
        if (category === 'SHIPPING') {
            set({ selectedPlatformShippingVoucher: voucherCode });
        } else {
            set({ selectedPlatformDiscountVoucher: voucherCode });
        }
    },

    applyBulkPlatformVouchers: (discountVoucherCode, shippingVoucherCode) => {
        set({
            selectedPlatformDiscountVoucher: discountVoucherCode,
            selectedPlatformShippingVoucher: shippingVoucherCode,
        });
    },

    setShopNote: (shopId, note) => {
        const newMap = new Map(get().shopNotes);
        newMap.set(shopId, note);
        set({ shopNotes: newMap });
    },

    setPaymentMethod: (method) => {
        set({ paymentMethod: method });
    },

    // ========================================
    // UI State Actions
    // ========================================

    setSubmitting: (isSubmitting) => {
        set({ isSubmitting });
    },
}));

// ============================================
// SELECTOR HOOKS (for optimized re-renders)
// ============================================

// Empty array constant to avoid creating new array every time
const EMPTY_SHOPS: CheckoutShopUI[] = [];

/** Get itemIds selected for checkout */
export const useSelectedCheckoutItemIds = () => {
    return useCheckoutStore((s) => s.selectedItemIds);
};

/**
 * Get shops from preview data.
 * Returns stable empty array if no preview data yet.
 */
export const useCheckoutShops = () => {
    return useCheckoutStore((s) => s.previewData?.shops ?? EMPTY_SHOPS);
};

/**
 * Get selected shipping method ID for a shop.
 * Falls back to server default if no user selection.
 */
export const useSelectedShippingMethod = (shopId: string) => {
    return useCheckoutStore((s) => {
        const userSelection = s.selectedShipping.get(shopId);
        if (userSelection) return userSelection;

        const shop = s.previewData?.shops.find((sh) => sh.shopId === shopId);
        return shop?.shippingOptions.selectedMethodId ?? null;
    });
};

/**
 * Get shipping data for a shop.
 * Returns null if shop not found.
 */
export const useShopShipping = (shopId: string) => {
    const methods = useCheckoutStore(
        (s) => s.previewData?.shops.find((sh) => sh.shopId === shopId)?.shippingOptions.methods ?? null
    );
    const serverDefault = useCheckoutStore(
        (s) => s.previewData?.shops.find((sh) => sh.shopId === shopId)?.shippingOptions.selectedMethodId ?? null
    );
    const userSelection = useCheckoutStore((s) => s.selectedShipping.get(shopId) ?? null);
    const isLoading = useCheckoutStore((s) => s.isLoadingPreview);

    if (!methods) return null;

    const selectedId = userSelection ?? serverDefault ?? '';
    const selectedMethod = methods.find((m) => m.id === selectedId) ?? null;

    return {
        methods,
        selectedMethodId: selectedId,
        selectedMethod,
        isLoading,
    };
};

export const useShopNote = (shopId: string) => {
    return useCheckoutStore((s) => s.shopNotes.get(shopId) ?? '');
};

export const useSelectedShopVoucher = (shopId: string) => {
    return useCheckoutStore((s) => s.selectedShopVouchers.get(shopId) ?? null);
};

export const useIsCheckoutLoading = () => {
    return useCheckoutStore((s) => s.isLoadingPreview || s.isSubmitting);
};

// ============================================
// CALCULATION & VALIDATION SELECTORS
// ============================================

export const useCheckoutCalculation = () => {
    const baseCalculation = useCheckoutStore((s) => s.previewData?.calculation);
    const selectedShipping = useCheckoutStore((s) => s.selectedShipping);
    const shops = useCheckoutStore((s) => s.previewData?.shops);

    return useMemo(() => {
        if (!baseCalculation) return null;

        // Create a copy to adjust
        const adjustedCalc = { ...baseCalculation };
        let totalShippingFee = 0;
        const adjustedShopSubtotals = baseCalculation.shopSubtotals.map((shopSub) => {
            const userSelection = selectedShipping.get(shopSub.shopId);
            if (!userSelection) {
                totalShippingFee += shopSub.shippingFee;
                return shopSub;
            }

            // Find the fee for the selected method
            const shopPreview = shops?.find((sh) => sh.shopId === shopSub.shopId);
            const selectedMethod = shopPreview?.shippingOptions.methods.find((m) => m.id === userSelection);
            const newFee = selectedMethod?.fee ?? shopSub.shippingFee;

            totalShippingFee += newFee;

            return {
                ...shopSub,
                shippingFee: newFee,
                shopTotal: shopSub.itemsTotal + newFee - shopSub.shopVoucherDiscount,
            };
        });

        adjustedCalc.shopSubtotals = adjustedShopSubtotals;
        adjustedCalc.totalShippingFee = totalShippingFee;

        // Recalculate grand total
        // Total = subtotal + shippingFee - platformDiscount - shippingDiscount + tax
        adjustedCalc.totalAmount =
            adjustedCalc.subtotal +
            totalShippingFee -
            adjustedCalc.platformVoucherDiscount -
            adjustedCalc.shippingDiscount +
            adjustedCalc.taxAmount;
        return adjustedCalc;
    }, [baseCalculation, selectedShipping, shops]);
};

/** Get shop subtotal by shopId */
export const useShopSubtotal = (shopId: string) => {
    const calculation = useCheckoutCalculation();
    return calculation?.shopSubtotals.find((sub) => sub.shopId === shopId) ?? null;
};

/** Check if order can be placed */
export const useCanPlaceOrder = () => {
    return useCheckoutStore((s) => {
        if (!s.previewData) return false;
        if (s.isLoadingPreview) return false;
        if (!s.previewData.isValid) return false;
        if (!s.previewData.addressId) return false;

        // Check if all shops have shipping available
        const hasShippingUnavailable = s.previewData.shops.some(
            (shop) => shop.shippingOptions.methods.length === 0
        );
        if (hasShippingUnavailable) return false;

        return true;
    });
};

// Constant arrays for stable references - CRITICAL to avoid infinite loops
const EMPTY_REASONS: string[] = [];
const LOADING_REASONS: string[] = ['Đang tính toán...'];
const PENDING_REASONS: string[] = ['Đang tải dữ liệu...'];
const NO_ADDRESS_REASONS: string[] = ['Chưa có địa chỉ giao hàng'];
const NO_SHIPPING_REASONS: string[] = ['Không hỗ trợ giao đến địa chỉ này'];
const EMPTY_WARNINGS: string[] = [];

/** Get reasons why order cannot be placed */
export const useOrderBlockReasons = () => {
    return useCheckoutStore((s) => {
        if (s.isLoadingPreview) return LOADING_REASONS;
        if (!s.previewData) return PENDING_REASONS;
        if (s.previewData.validationErrors.length > 0) {
            return s.previewData.validationErrors;
        }
        if (!s.previewData.addressId) {
            return NO_ADDRESS_REASONS;
        }
        // Check if all shops have shipping available
        const hasShippingUnavailable = s.previewData.shops.some(
            (shop) => shop.shippingOptions.methods.length === 0
        );
        if (hasShippingUnavailable) {
            return NO_SHIPPING_REASONS;
        }
        return EMPTY_REASONS;
    });
};

/** Check if preview data is valid */
export const useIsPreviewValid = () => {
    return useCheckoutStore((s) => s.previewData?.isValid ?? false);
};

/** Get warnings from preview */
export const usePreviewWarnings = () => {
    return useCheckoutStore((s) => s.previewData?.warnings ?? EMPTY_WARNINGS);
};

