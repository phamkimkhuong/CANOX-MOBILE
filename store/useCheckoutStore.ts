/**
 * useCheckoutStore - Zustand store for Checkout Session
 * 
 * KEY PRINCIPLE: This is a TEMPORARY session store.
 * - Created when user enters Checkout from Cart
 * - Destroyed when order is placed or user leaves
 * - NOT persisted to storage
 * 
 * State Categories:
 * 1. Session Data: Items grouped by shop (derived from Cart selection)
 * 2. User Choices: Shipping method, notes, vouchers, payment method
 * 3. UI State: Loading states, validation errors
 */

import type { CartShopUI, VoucherUI } from '@/types/cart';
import type {
    CheckoutShopUI,
    PaymentMethodType,
    ShippingAddress,
    ShippingMethod,
} from '@/types/checkout';
import { toCheckoutItem } from '@/types/checkout';
import { create } from 'zustand';

// ============================================
// STORE STATE TYPE
// ============================================

interface CheckoutState {
    isInitialized: boolean;
    shops: CheckoutShopUI[];
    deliveryAddress: ShippingAddress | null;
    platformVouchers: VoucherUI[];
    shippingMethodMap: Map<string, string>;
    shopNotes: Map<string, string>;
    shopVouchers: Map<string, string>;
    platformVoucherId: string | null;
    paymentMethod: PaymentMethodType;

    // ========================================
    // UI State
    // ========================================
    /** Đang load shipping options */
    isLoadingShipping: Map<string, boolean>;
    /** Đang submit order */
    isSubmitting: boolean;
    /** Validation errors */
    validationErrors: Map<string, string>;

    // ========================================
    // Actions - Session Management
    // ========================================
    /**
     * Initialize checkout session từ Cart selection
     * @param cartShops - Shops từ Cart với selected items
     * @param selectedIds - Set of selected item IDs
     * @param address - User's delivery address
     */
    initSession: (
        cartShops: CartShopUI[],
        selectedIds: Set<string>,
        address: ShippingAddress | null,
        platformVouchers: VoucherUI[]
    ) => void;

    /** Reset/Clear session */
    resetSession: () => void;

    // ========================================
    // Actions - Shipping
    // ========================================
    /** Set shipping options for a shop */
    setShopShippingOptions: (shopId: string, methods: ShippingMethod[]) => void;
    /** Select shipping method for a shop */
    selectShippingMethod: (shopId: string, methodId: string) => void;
    /** Set loading state for shipping */
    setShippingLoading: (shopId: string, isLoading: boolean) => void;

    // ========================================
    // Actions - Notes
    // ========================================
    /** Update note for a shop */
    setShopNote: (shopId: string, note: string) => void;

    // ========================================
    // Actions - Vouchers
    // ========================================
    /** Apply shop voucher */
    applyShopVoucher: (shopId: string, voucherId: string | null) => void;
    /** Apply platform voucher */
    applyPlatformVoucher: (voucherId: string | null) => void;

    // ========================================
    // Actions - Payment
    // ========================================
    /** Set payment method */
    setPaymentMethod: (method: PaymentMethodType) => void;

    // ========================================
    // Actions - Address
    // ========================================
    /** Update delivery address */
    setDeliveryAddress: (address: ShippingAddress) => void;

    // ========================================
    // Actions - Submission
    // ========================================
    /** Set submitting state */
    setSubmitting: (isSubmitting: boolean) => void;
    /** Set validation error */
    setValidationError: (key: string, message: string | null) => void;
    /** Clear all validation errors */
    clearValidationErrors: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    isInitialized: false,
    shops: [],
    deliveryAddress: null,
    platformVouchers: [],
    shippingMethodMap: new Map<string, string>(),
    shopNotes: new Map<string, string>(),
    shopVouchers: new Map<string, string>(),
    platformVoucherId: null,
    paymentMethod: 'cod' as PaymentMethodType,
    isLoadingShipping: new Map<string, boolean>(),
    isSubmitting: false,
    validationErrors: new Map<string, string>(),
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
    ...initialState,

    // ========================================
    // Session Management
    // ========================================
    initSession: (cartShops, selectedIds, address, platformVouchers) => {
        // Filter và transform cart items thành checkout items
        const checkoutShops: CheckoutShopUI[] = cartShops
            .map((shop) => {
                // Chỉ lấy items đã được select và không out of stock
                const selectedItems = shop.items
                    .filter((item) => selectedIds.has(item.id) && !item.isOutOfStock)
                    .map(toCheckoutItem);

                if (selectedItems.length === 0) return null;

                return {
                    shopId: shop.shopId,
                    shopName: shop.shopName,
                    isMall: shop.isMall,
                    items: selectedItems,
                    shippingOptions: {
                        shopId: shop.shopId,
                        methods: [], // Will be loaded separately
                        selectedMethodId: '',
                        isLoading: true,
                    },
                    appliedVoucherId: shop.appliedVoucherId,
                    availableVouchers: shop.availableVouchers,
                    note: '',
                } as CheckoutShopUI;
            })
            .filter((shop): shop is CheckoutShopUI => shop !== null);

        // Initialize maps
        const shippingMethodMap = new Map<string, string>();
        const shopNotes = new Map<string, string>();
        const shopVouchers = new Map<string, string>();
        const isLoadingShipping = new Map<string, boolean>();

        checkoutShops.forEach((shop) => {
            shopNotes.set(shop.shopId, '');
            isLoadingShipping.set(shop.shopId, true);
            if (shop.appliedVoucherId) {
                shopVouchers.set(shop.shopId, shop.appliedVoucherId);
            }
        });

        set({
            isInitialized: true,
            shops: checkoutShops,
            deliveryAddress: address,
            platformVouchers,
            shippingMethodMap,
            shopNotes,
            shopVouchers,
            isLoadingShipping,
            platformVoucherId: null,
            paymentMethod: 'cod',
            isSubmitting: false,
            validationErrors: new Map(),
        });
    },

    resetSession: () => {
        set(initialState);
    },

    // ========================================
    // Shipping
    // ========================================
    setShopShippingOptions: (shopId, methods) => {
        const { shops, shippingMethodMap } = get();

        // Update shop với shipping options
        const updatedShops = shops.map((shop) => {
            if (shop.shopId !== shopId) return shop;

            // Auto-select first method if none selected
            const selectedMethodId = shippingMethodMap.get(shopId) || methods[0]?.id || '';

            return {
                ...shop,
                shippingOptions: {
                    ...shop.shippingOptions,
                    methods,
                    selectedMethodId,
                    isLoading: false,
                },
            };
        });

        // Update shipping method map
        const newShippingMap = new Map(shippingMethodMap);
        if (!newShippingMap.has(shopId) && methods.length > 0) {
            newShippingMap.set(shopId, methods[0].id);
        }

        // Update loading state
        const newLoadingMap = new Map(get().isLoadingShipping);
        newLoadingMap.set(shopId, false);

        set({
            shops: updatedShops,
            shippingMethodMap: newShippingMap,
            isLoadingShipping: newLoadingMap,
        });
    },

    selectShippingMethod: (shopId, methodId) => {
        const { shops, shippingMethodMap } = get();

        // Update shop
        const updatedShops = shops.map((shop) => {
            if (shop.shopId !== shopId) return shop;
            return {
                ...shop,
                shippingOptions: {
                    ...shop.shippingOptions,
                    selectedMethodId: methodId,
                },
            };
        });

        // Update map
        const newMap = new Map(shippingMethodMap);
        newMap.set(shopId, methodId);

        set({
            shops: updatedShops,
            shippingMethodMap: newMap,
        });
    },

    setShippingLoading: (shopId, isLoading) => {
        const newMap = new Map(get().isLoadingShipping);
        newMap.set(shopId, isLoading);
        set({ isLoadingShipping: newMap });
    },

    // ========================================
    // Notes
    // ========================================
    setShopNote: (shopId, note) => {
        const { shops, shopNotes } = get();

        // Update shop
        const updatedShops = shops.map((shop) => {
            if (shop.shopId !== shopId) return shop;
            return { ...shop, note };
        });

        // Update map
        const newMap = new Map(shopNotes);
        newMap.set(shopId, note);

        set({
            shops: updatedShops,
            shopNotes: newMap,
        });
    },

    // ========================================
    // Vouchers
    // ========================================
    applyShopVoucher: (shopId, voucherId) => {
        const { shops, shopVouchers } = get();

        // Update shop
        const updatedShops = shops.map((shop) => {
            if (shop.shopId !== shopId) return shop;
            return { ...shop, appliedVoucherId: voucherId };
        });

        // Update map
        const newMap = new Map(shopVouchers);
        if (voucherId === null) {
            newMap.delete(shopId);
        } else {
            newMap.set(shopId, voucherId);
        }

        set({
            shops: updatedShops,
            shopVouchers: newMap,
        });
    },

    applyPlatformVoucher: (voucherId) => {
        set({ platformVoucherId: voucherId });
    },

    // ========================================
    // Payment
    // ========================================
    setPaymentMethod: (method) => {
        set({ paymentMethod: method });
    },

    // ========================================
    // Address
    // ========================================
    setDeliveryAddress: (address) => {
        set({ deliveryAddress: address });
    },

    // ========================================
    // Submission
    // ========================================
    setSubmitting: (isSubmitting) => {
        set({ isSubmitting });
    },

    setValidationError: (key, message) => {
        const newMap = new Map(get().validationErrors);
        if (message === null) {
            newMap.delete(key);
        } else {
            newMap.set(key, message);
        }
        set({ validationErrors: newMap });
    },

    clearValidationErrors: () => {
        set({ validationErrors: new Map() });
    },
}));

// ============================================
// SELECTOR HOOKS (for optimized re-renders)
// ============================================

/**
 * Select specific shop data
 */
export const useCheckoutShop = (shopId: string) => {
    return useCheckoutStore((state) => state.shops.find((s) => s.shopId === shopId));
};

/**
 * Select shipping method for a shop
 */
export const useShopShippingMethod = (shopId: string) => {
    return useCheckoutStore((state) => {
        const shop = state.shops.find((s) => s.shopId === shopId);
        if (!shop) return null;
        return shop.shippingOptions.methods.find(
            (m) => m.id === shop.shippingOptions.selectedMethodId
        ) ?? null;
    });
};

/**
 * Check if any shipping is still loading
 */
export const useIsAnyShippingLoading = () => {
    return useCheckoutStore((state) => {
        for (const isLoading of state.isLoadingShipping.values()) {
            if (isLoading) return true;
        }
        return false;
    });
};
