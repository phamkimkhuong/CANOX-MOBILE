import type { Href } from 'expo-router';

// ============================================
// ROUTE DEFINITIONS - Type-Safe Navigation
// ============================================
// Centralized route management to avoid:
// 1. Silent fails when changing path
// 2. Scattered hardcoded strings
// 3. Typos not detected by IDE
// ============================================

/**
 * Static routes (no params)
 */
export const ROUTES = {
    // ============ TABS ============
    TABS: {
        HOME: '/(tabs)' as const,
        INDEX: '/(tabs)/' as const,
        WISHLIST: '/(tabs)/wishlist' as const,
        NOTIFY: '/(tabs)/notify' as const,
        ME: '/(tabs)/me' as const,
        CHAT: '/(main)/chat' as const,
    },

    // ============ CATEGORY ============
    CATEGORY: {
        INDEX: '/(main)/category' as const,
    },


    // ============ AUTH ============
    AUTH: {
        LOGIN: '/(auth)/login' as const,
        REGISTER: '/(auth)/register' as const,
        FORGOT_PASSWORD: '/(auth)/forgot-password' as const,
        VERIFY_OTP: '/(auth)/verify-otp' as const,
        RESET_PASSWORD: '/(auth)/reset-password' as const,
    },

    // ============ CART ============
    CART: {
        INDEX: '/cart' as const,
    },

    // ============ CHECKOUT ============
    CHECKOUT: {
        INDEX: '/checkout' as const,
        BUY_NOW: '/checkout' as const, // Same route, different params
    },

    // ============ ADDRESS ============
    ADDRESS: {
        /** List all addresses - mode: 'selection' | 'management' */
        LIST: '/address/list' as const,
        ADD: '/address/add' as const,
        /** Edit existing address (with ?id=xxx param) */
        EDIT: '/address/add' as const,
    },

    // ============ MODAL ============
    MODAL: '/modal' as const,

    // ============ PROFILE SERVICES ============
    PROFILE: {
        WALLET: '/wallet' as const,
        COINS: '/(main)/(user)/coins' as const,
        VOUCHERS: '/voucher' as const,
        INTERNATIONAL_SHIPPING: '/(main)/(user)/international-shipping' as const,
        SUPPORT: '/support' as const,
        SETTINGS_SECURITY: '/settings/security' as const,
    },

    // ============ ORDERS ============
    ORDERS: {
        LIST: '/orders' as const,
        PENDING_PAYMENT: '/orders' as const,
        PROCESSING: '/orders' as const,
        SHIPPING: '/orders' as const,
        REVIEW: '/(main)/(user)/reviews' as const,
        SUCCESS: '/(main)/(order)/order-success' as const,
        PAYMENT_PAYOS: '/(main)/(order)/payment-payos' as const,
    },

    // ============ USER CONTENT ============
    USER: {
        EDIT_PROFILE: '/(main)/(user)/edit-profile' as const,
        FAVORITES: '/favorites' as const,
        RECENT: '/recent' as const,
        FOLLOWED_SHOPS: '/followed-shops' as const,
        REVIEWS: '/(main)/(user)/reviews' as const,
    },

    // ============ WISHLIST ============
    WISHLIST: {
        INDEX: '/(tabs)/wishlist' as const,
    },

    // ============ SETTINGS ============
    SETTINGS: {
        INDEX: '/settings' as const,
        PROFILE: '/settings/profile' as const,
        CHANGE_PASSWORD: '/settings/change-password' as const,
        LINKED_ACCOUNTS: '/settings/linked-accounts' as const,
        BANK_CARDS: '/settings/bank/bank-cards' as const,
        ADD_BANK: '/settings/bank/add-bank' as const,
        EDIT_BANK: '/settings/bank/edit-bank' as const,
        VERIFY_BANK: '/settings/bank/verify-bank' as const,
        NOTIFICATIONS: '/settings/notifications' as const,
        LANGUAGE: '/settings/language' as const,
        LEGAL_POLICIES: '/settings/legal' as const,
        LEGAL_DETAIL: '/settings/legal/[slug]' as const,
        RATE_APP: '/settings/rate-app' as const,
        DELETE_ACCOUNT: '/settings/delete-account' as const,
    },

    // ============ SEARCH ============
    SEARCH: {
        /** Search entry screen (recent + hot keywords) */
        ENTRY: '/(main)/search' as const,
        /** Search results with products */
        RESULTS: '/(main)/search/results' as const,
    },
    // ============ CAMPAIGN ============
    CAMPAIGN: {
        FLASH_SALE: '/(main)/flash-sale' as const,
    },
} as const;

/**
 * Type for all static routes
 */
export type StaticRoute =
    | (typeof ROUTES.TABS)[keyof typeof ROUTES.TABS]
    | (typeof ROUTES.CATEGORY)[keyof typeof ROUTES.CATEGORY]
    | (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]
    | (typeof ROUTES.CART)[keyof typeof ROUTES.CART]
    | (typeof ROUTES.CHECKOUT)[keyof typeof ROUTES.CHECKOUT]
    | (typeof ROUTES.ADDRESS)[keyof typeof ROUTES.ADDRESS]
    | typeof ROUTES.MODAL
    | (typeof ROUTES.PROFILE)[keyof typeof ROUTES.PROFILE]
    | (typeof ROUTES.ORDERS)[keyof typeof ROUTES.ORDERS]
    | (typeof ROUTES.USER)[keyof typeof ROUTES.USER]
    | (typeof ROUTES.WISHLIST)[keyof typeof ROUTES.WISHLIST]
    | (typeof ROUTES.SETTINGS)[keyof typeof ROUTES.SETTINGS]
    | (typeof ROUTES.SEARCH)[keyof typeof ROUTES.SEARCH];

// ============================================
// DYNAMIC ROUTE BUILDERS
// ============================================
// Routes with params, returning Href for type safety
// ============================================

/**
 * Product routes with dynamic ID
 */
export const productRoutes = {
    detail: (id: string, params?: { instantNav?: boolean; action?: 'buy-now' | 'add-to-cart' }): Href => ({
        pathname: '/product/[id]',
        params: {
            id,
            ...(params?.instantNav && { instantNav: 'true' }),
            ...(params?.action && { action: params.action }),
        },
    }),

    /**
     * All reviews screen for a product
     */
    reviews: (productId: string): Href => ({
        pathname: '/product/[id]/reviews',
        params: { id: productId },
    }),
} as const;

/**
 * Chat routes
 */
export const chatRoutes = {
    /**
     * Chat list / Inbox (pushed screen in (main) stack)
     */
    list: (): Href => '/(main)/chat' as Href,

    /**
     * Chat detail/message screen
     */
    detail: (conversationId: string, otherParams?: Record<string, string | number | boolean | undefined | null>): Href => ({
        pathname: '/chat/[conversationId]',
        params: { conversationId, ...otherParams },
    }),

    /**
     * Select product picker page (full screen)
     * Used to pick a product to send as a card in chat
     */
    selectProduct: (params: {
        shopId: string;
        conversationId: string;
        shopName?: string;
    }): Href => ({
        pathname: '/chat/select-product',
        params: {
            shopId: params.shopId,
            conversationId: params.conversationId,
            shopName: params.shopName || 'Shop',
        },
    }),

    /**
     * Select order picker page (full screen)
     * Used to pick an order to send as a card in chat
     */
    selectOrder: (params: {
        shopId: string;
        conversationId: string;
    }): Href => ({
        pathname: '/chat/select-order',
        params: {
            shopId: params.shopId,
            conversationId: params.conversationId,
        },
    }),
} as const;

/**
 * Cart routes
 */
export const cartRoutes = {
    index: (params?: { rebuySuccess?: boolean }): Href => ({
        pathname: '/cart',
        params: {
            ...(params?.rebuySuccess && { rebuySuccess: 'true' }),
        },
    }),
} as const;

/**
 * Checkout routes
 */
export const checkoutRoutes = {
    /** Normal checkout from cart */
    index: (): Href => '/checkout' as Href,
    /** Buy Now: Direct purchase without going through cart */
    buyNow: (variantId: string, quantity: number, shopId: string): Href => ({
        pathname: '/checkout',
        params: {
            mode: 'buy-now',
            variantId,
            quantity: String(quantity),
            shopId,
        },
    } as unknown as Href),
} as const;

/**
 * Order routes with dynamic ID
 * 
 * @param orderId - The order ID to navigate to
 * @param options - Navigation options
 * @param options.instantNav - When 'true', target screen will show skeleton with minimum duration
 *                             Use this for fast taps where prefetch hasn't completed
 */
export const orderRoutes = {
    detail: (orderId: string, options?: { instantNav?: boolean }): Href => ({
        pathname: '/orders/[id]',
        params: {
            id: orderId,
            ...(options?.instantNav && { instantNav: 'true' }),
        },
    }),
    cancel: (orderId: string, params?: Record<string, string | number | boolean | undefined | null>): Href => ({
        pathname: '/cancel/[id]',
        params: { id: orderId, ...params },
    }),
    return: (orderId: string, params?: Record<string, string | number | boolean | undefined | null>): Href => ({
        pathname: '/return/[id]',
        params: { id: orderId, ...params },
    } as unknown as Href),
    payos: (orderId: string, paymentInfo: string): Href => ({
        pathname: '/(main)/(order)/payment-payos',
        params: { id: orderId, paymentInfo },
    } as unknown as Href),
} as const;

export const loyaltyRoutes = {
    shopDetail: (shopId: string, shopName?: string, shopLogo?: string): Href => ({
        pathname: '/(main)/(user)/coins/[shopId]',
        params: { shopId, shopName, shopLogo },
    } as unknown as Href),
} as const;

/**
 * Shop routes with dynamic ID
 */
export const shopRoutes = {
    detail: (shopId: string, params?: { instantNav?: boolean }): Href => ({
        pathname: '/shop/[id]',
        params: {
            id: shopId,
            ...(params?.instantNav && { instantNav: 'true' }),
        },
    }),
    /** Navigate to shop voucher detail */
    voucherDetail: (voucherId: string, voucherData: string, shopName?: string): Href => ({
        pathname: '/(main)/(shop)/voucher/[id]',
        params: { id: voucherId, voucherData, shopName },
    } as unknown as Href),
} as const;

/**
 * Address routes with dynamic ID
 */
export const addressRoutes = {
    detail: (addressId: string): Href => ({
        pathname: '/(main)/address/[id]',
        params: { id: addressId },
    } as unknown as Href),
    /** List addresses with optional mode and success state */
    list: (params?: { mode?: string; success?: string }): Href => ({
        pathname: '/(main)/address/list',
        params: params as Record<string, string>,
    }),
    edit: (addressId: string): Href => ({
        pathname: '/(main)/address/[id]/edit',
        params: { id: addressId },
    } as unknown as Href),
} as const;

/**
 * Auth verify OTP with params
 */
export const authRoutes = {
    verifyOtp: (params: { email: string; type: 'register' | 'forgot-password' }): Href => ({
        pathname: '/(auth)/verify-otp',
        params,
    }),
    resetPassword: (params: { email: string; otpCode: string }): Href => ({
        pathname: '/(auth)/reset-password',
        params,
    }),
} as const;

/**
 * Creator routes
 */
export const creatorRoutes = {
    detail: (id: string): Href => ({
        pathname: '/(main)/(user)/creator/[id]',
        params: { id },
    } as unknown as Href),
} as const;

/**
 * Wishlist routes with dynamic ID
 */
export const wishlistRoutes = {
    /** Navigate to wishlist hub */
    index: (): Href => '/wishlist' as Href,
    /** Navigate to wishlist detail */
    detail: (wishlistId: string): Href => ({
        pathname: '/(main)/(user)/wishlist/[id]',
        params: { id: wishlistId },
    } as unknown as Href),
} as const;

/**
 * Review routes
 */
export const reviewRoutes = {
    /** Navigate to reviews list (tabs) */
    list: (params?: { filterOrderId?: string }): Href => ({
        pathname: '/(main)/(user)/reviews',
        params: params as Record<string, string>,
    }),
    /** Navigate to pending reviews tab */
    pending: (): Href => '/(main)/(user)/reviews/pending' as Href,
    /** Navigate to review history tab */
    history: (): Href => '/(main)/(user)/reviews/history' as Href,
    /** Navigate to write review screen */
    write: (itemId: string, params?: {
        productId?: string;
        productName?: string;
        productImage?: string;
        variantAttributes?: string;
        formattedPrice?: string;
        orderId?: string;
        orderNumber?: string;
        shopName?: string;
        shopLogo?: string;
        mode?: 'create' | 'edit';
        reviewId?: string;
        existingRating?: string;
        existingComment?: string;
    }): Href => ({
        pathname: '/(main)/(user)/reviews/write/[itemId]',
        params: { itemId, ...params },
    } as unknown as Href),
} as const;

export const searchRoutes = {
    entry: (params?: { q?: string }): Href => ({
        pathname: '/(main)/search',
        params: {
            ...(params?.q && { q: params.q }),
        },
    } as unknown as Href),
    results: (params: { q?: string; categoryId?: string; categoryName?: string }): Href => ({
        pathname: '/(main)/search/results',
        params: {
            ...(params.q && { q: params.q }),
            ...(params.categoryId && { categoryId: params.categoryId }),
            ...(params.categoryName && { categoryName: params.categoryName }),
        },
    } as unknown as Href),
} as const;

export const shopSearchRoutes = {
    /**
     * Shop search screen - search within a specific shop
     * @param shopId - Required shop ID
     * @param categoryId - Optional category filter
     * @param categoryName - Optional category name for placeholder display
     */
    search: (params: {
        shopId: string;
        categoryId?: string;
        categoryName?: string;
    }): Href => ({
        pathname: '/(main)/(shop)/shop/search',
        params: {
            shopId: params.shopId,
            ...(params.categoryId && { categoryId: params.categoryId }),
            ...(params.categoryName && { categoryName: params.categoryName }),
        },
    } as unknown as Href),
} as const;

// ============================================
// TYPE-SAFE HREF HELPERS
// ============================================

/**
 * Convert static route string to Href type
 * Helps IDE check if route is valid
 */
export const href = <T extends StaticRoute>(route: T): Href => route as Href;

/**
 * Type guard to check if route exists
 */
export const isValidRoute = (route: string): route is StaticRoute => {
    const allRoutes = [
        ...Object.values(ROUTES.TABS),
        ...Object.values(ROUTES.CATEGORY),
        ...Object.values(ROUTES.AUTH),
        ...Object.values(ROUTES.CART),
        ...Object.values(ROUTES.CHECKOUT),
        ...Object.values(ROUTES.ADDRESS),
        ROUTES.MODAL,
        ...Object.values(ROUTES.PROFILE),
        ...Object.values(ROUTES.ORDERS),
        ...Object.values(ROUTES.USER),
        ...Object.values(ROUTES.WISHLIST),
        ...Object.values(ROUTES.SETTINGS),
        ...Object.values(ROUTES.SEARCH),
    ];
    return allRoutes.includes(route as StaticRoute);
};

// ============================================
// ROUTE MAPPING FOR CONFIGS
// ============================================
// Used in config files to map key -> route
// ============================================

/**
 * Order status route mapping
 */
export const ORDER_STATUS_ROUTES = {
    pendingPayment: ROUTES.ORDERS.PENDING_PAYMENT,
    processing: ROUTES.ORDERS.PROCESSING,
    shipping: ROUTES.ORDERS.SHIPPING,
    completed: ROUTES.ORDERS.LIST,
} as const;

/**
 * Quick stats route mapping
 */
export const QUICK_STATS_ROUTES = {
    orders: ROUTES.ORDERS.LIST,
    favorites: ROUTES.USER.FAVORITES,
    recent: ROUTES.USER.RECENT,
} as const;

/**
 * Service menu route mapping
 */
export const SERVICE_MENU_ROUTES = {
    wallet: ROUTES.PROFILE.WALLET,
    coins: ROUTES.PROFILE.COINS,
    vouchers: ROUTES.PROFILE.VOUCHERS,
    shipping: ROUTES.PROFILE.INTERNATIONAL_SHIPPING,
} as const;

/**
 * Settings menu route mapping
 */
export const SETTINGS_MENU_ROUTES = {
    support: ROUTES.PROFILE.SUPPORT,
    security: ROUTES.SETTINGS.INDEX,
} as const;

// ============================================
// EXPORT TYPE FOR EXTERNAL USE
// ============================================

export type AppRoutes = typeof ROUTES;
export type DynamicRouteBuilders = {
    product: typeof productRoutes;
    chat: typeof chatRoutes;
    order: typeof orderRoutes;
    shop: typeof shopRoutes;
    address: typeof addressRoutes;
    auth: typeof authRoutes;
    cart: typeof cartRoutes;
    wishlist: typeof wishlistRoutes;
    review: typeof reviewRoutes;
    search: typeof searchRoutes;
};
