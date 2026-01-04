/**
 * useCheckoutStore - Zustand store for Checkout Session
 */

import type { CheckoutShopUI, PaymentMethodType, ShippingAddress } from '@/types/checkout';
import type { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { create } from 'zustand';

// ============================================
// STORE STATE TYPE
// ============================================

interface CheckoutState {
    isInitialized: boolean;
    /** Preview response từ server - chứa shops, calculation, validation */
    previewData: CheckoutPreviewUI | null;
    isLoadingPreview: boolean;
    /** Items được chọn từ Cart để checkout */
    selectedItemIds: Set<string>;
    /** Selected shipping method per shop: Map<shopId, serviceCode> */
    selectedShipping: Map<string, string>;
    /** Selected shop voucher per shop: Map<shopId, voucherCode> */
    selectedShopVouchers: Map<string, string>;
    selectedPlatformVoucher: string | null;
    shopNotes: Map<string, string>;
    paymentMethod: PaymentMethodType;
    /** Selected delivery address */
    deliveryAddress: ShippingAddress | null;
    /** Đang submit order */
    isSubmitting: boolean;

    initSession: (selectedItemIds: Set<string>, address: ShippingAddress | null) => void;
    /** Reset session khi rời checkout */
    resetSession: () => void;
    setPreviewData: (data: CheckoutPreviewUI | null) => void;
    /** Set loading state for preview */
    setLoadingPreview: (isLoading: boolean) => void;

    // ========================================
    // Actions - User Selections
    // ========================================
    selectShippingMethod: (shopId: string, serviceCode: string) => void;
    applyShopVoucher: (shopId: string, voucherCode: string | null) => void;
    applyPlatformVoucher: (voucherCode: string | null) => void;
    setShopNote: (shopId: string, note: string) => void;
    setPaymentMethod: (method: PaymentMethodType) => void;
    setDeliveryAddress: (address: ShippingAddress) => void;

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
    selectedItemIds: new Set<string>(),

    // User Selections
    selectedShipping: new Map<string, string>(),
    selectedShopVouchers: new Map<string, string>(),
    selectedPlatformVoucher: null as string | null,
    shopNotes: new Map<string, string>(),
    paymentMethod: 'cod' as PaymentMethodType,
    deliveryAddress: null as ShippingAddress | null,

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
     * Initialize checkout session với selected items từ Cart.
     * Cart gọi hàm này TRƯỚC khi navigate, data sẵn sàng ngay.
     */
    initSession: (selectedItemIds, address) => {
        set({
            isInitialized: true,
            selectedItemIds: new Set(selectedItemIds),
            deliveryAddress: address,
            // Reset selections
            selectedShipping: new Map(),
            selectedShopVouchers: new Map(),
            selectedPlatformVoucher: null,
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
     * Server đã trả về selectedShippingMethod trong mỗi shop.
     * KHÔNG sync selectedShipping từ server nữa - tránh trigger re-render loop.
     */
    setPreviewData: (data) => {
        set({ previewData: data });
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

    applyPlatformVoucher: (voucherCode) => {
        set({ selectedPlatformVoucher: voucherCode });
    },

    setShopNote: (shopId, note) => {
        const newMap = new Map(get().shopNotes);
        newMap.set(shopId, note);
        set({ shopNotes: newMap });
    },

    setPaymentMethod: (method) => {
        set({ paymentMethod: method });
    },

    setDeliveryAddress: (address) => {
        set({ deliveryAddress: address });
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

// Empty array constant để tránh tạo array mới mỗi lần
const EMPTY_SHOPS: CheckoutShopUI[] = [];

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

/** Get calculation from preview data - server-side calculated */
export const useCheckoutCalculation = () => {
    return useCheckoutStore((s) => s.previewData?.calculation ?? null);
};

/** Get shop subtotal by shopId */
export const useShopSubtotal = (shopId: string) => {
    return useCheckoutStore((s) =>
        s.previewData?.calculation.shopSubtotals.find((sub) => sub.shopId === shopId) ?? null
    );
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

