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
        CATEGORY: '/(tabs)/category' as const,
        CHAT: '/(tabs)/chat' as const,
        NOTIFY: '/(tabs)/notify' as const,
        ME: '/(tabs)/me' as const,
    },

    // ============ AUTH ============
    AUTH: {
        LOGIN: '/(auth)/login' as const,
        REGISTER: '/(auth)/register' as const,
        FORGOT_PASSWORD: '/(auth)/forgot-password' as const,
        VERIFY_OTP: '/(auth)/verify-otp' as const,
    },

    // ============ CART ============
    CART: {
        INDEX: '/cart' as const,
    },

    // ============ CHECKOUT ============
    CHECKOUT: {
        INDEX: '/checkout' as const,
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
        COINS: '/coins' as const,
        VOUCHERS: '/voucher' as const,
        INTERNATIONAL_SHIPPING: '/international-shipping' as const,
        SUPPORT: '/support' as const,
        SETTINGS_SECURITY: '/settings/security' as const,
    },

    // ============ ORDERS ============
    ORDERS: {
        LIST: '/orders' as const,
        PENDING_PAYMENT: '/orders' as const,
        PROCESSING: '/orders' as const,
        SHIPPING: '/orders' as const,
        REVIEW: '/orders' as const,
        SUCCESS: '/(main)/(order)/order-success' as const,
    },

    // ============ USER CONTENT ============
    USER: {
        EDIT_PROFILE: '/(main)/(user)/edit-profile' as const,
        FAVORITES: '/favorites' as const,
        RECENT: '/recent' as const,
        FOLLOWED_SHOPS: '/followed-shops' as const,
    },

    // ============ SETTINGS ============
    SETTINGS: {
        INDEX: '/settings' as const,
        PROFILE: '/settings/profile' as const,
        CHANGE_PASSWORD: '/settings/change-password' as const,
        LINKED_ACCOUNTS: '/settings/linked-accounts' as const,
        BANK_CARDS: '/settings/bank-cards' as const,
        NOTIFICATIONS: '/settings/notifications' as const,
        LANGUAGE: '/settings/language' as const,
        PRIVACY_POLICY: '/settings/privacy-policy' as const,
        TERMS: '/settings/terms' as const,
        RATE_APP: '/settings/rate-app' as const,
        DELETE_ACCOUNT: '/settings/delete-account' as const,
    },
} as const;

/**
 * Type for all static routes
 */
export type StaticRoute =
    | (typeof ROUTES.TABS)[keyof typeof ROUTES.TABS]
    | (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]
    | (typeof ROUTES.CART)[keyof typeof ROUTES.CART]
    | (typeof ROUTES.CHECKOUT)[keyof typeof ROUTES.CHECKOUT]
    | (typeof ROUTES.ADDRESS)[keyof typeof ROUTES.ADDRESS]
    | typeof ROUTES.MODAL
    | (typeof ROUTES.PROFILE)[keyof typeof ROUTES.PROFILE]
    | (typeof ROUTES.ORDERS)[keyof typeof ROUTES.ORDERS]
    | (typeof ROUTES.USER)[keyof typeof ROUTES.USER]
    | (typeof ROUTES.SETTINGS)[keyof typeof ROUTES.SETTINGS];

// ============================================
// DYNAMIC ROUTE BUILDERS
// ============================================
// Routes with params, returning Href for type safety
// ============================================

/**
 * Product routes with dynamic ID
 */
export const productRoutes = {
    detail: (id: string, params?: { instantNav?: boolean }): Href => ({
        pathname: '/product/[id]',
        params: {
            id,
            ...(params?.instantNav && { instantNav: 'true' }),
        },
    }),
} as const;

/**
 * Chat routes
 */
export const chatRoutes = {
    /**
     * Chat detail/message screen
     */
    detail: (conversationId: string, otherParams?: Record<string, any>): Href => ({
        pathname: '/chat/[conversationId]',
        params: { conversationId, ...otherParams },
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
    cancel: (orderId: string, params?: Record<string, any>): Href => ({
        pathname: '/cancel/[id]',
        params: { id: orderId, ...params },
    }),
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
} as const;

/**
 * Address routes with dynamic ID
 */
export const addressRoutes = {
    detail: (addressId: string): Href => ({
        pathname: '/(main)/address/[id]',
        params: { id: addressId },
    } as unknown as Href),
    edit: (addressId: string): Href => ({
        pathname: '/(main)/address/[id]/edit',
        params: { id: addressId },
    } as unknown as Href),
} as const;

/**
 * Auth verify OTP with params
 */
export const authRoutes = {
    verifyOtp: (params: { phone: string; type: 'register' | 'forgot-password' }): Href => ({
        pathname: '/(auth)/verify-otp',
        params,
    }),
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
        ...Object.values(ROUTES.AUTH),
        ...Object.values(ROUTES.CART),
        ...Object.values(ROUTES.CHECKOUT),
        ...Object.values(ROUTES.ADDRESS),
        ROUTES.MODAL,
        ...Object.values(ROUTES.PROFILE),
        ...Object.values(ROUTES.ORDERS),
        ...Object.values(ROUTES.USER),
        ...Object.values(ROUTES.SETTINGS),
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
    review: ROUTES.ORDERS.REVIEW,
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
    security: ROUTES.PROFILE.SETTINGS_SECURITY,
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
};
