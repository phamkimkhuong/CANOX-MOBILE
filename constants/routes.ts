import type { Href } from 'expo-router';

// ============================================
// ROUTE DEFINITIONS - Type-Safe Navigation
// ============================================
// Centralized route management để tránh:
// 1. Silent fails khi đổi path
// 2. Hardcoded strings rải rác
// 3. Typo không được IDE phát hiện
// ============================================

/**
 * Static routes (không có params)
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
        LIST: '/(main)/address/list' as const,
        ADD: '/(main)/address/add' as const,
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
        PENDING_PAYMENT: '/orders?status=pending_payment' as const,
        PROCESSING: '/orders?status=processing' as const,
        SHIPPING: '/orders?status=shipping' as const,
        REVIEW: '/orders?status=review' as const,
    },

    // ============ USER CONTENT ============
    USER: {
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
 * Type cho tất cả static routes
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
// Các route có params, trả về Href để type-safe
// ============================================

/**
 * Product routes với dynamic ID
 */
export const productRoutes = {
    detail: (id: string): Href => ({
        pathname: '/product/[id]',
        params: { id },
    }),
} as const;

/**
 * Chat routes - Disabled until /chat/[id] is implemented
 */
// export const chatRoutes = {
//     conversation: (conversationId: string): Href => ({
//         pathname: '/chat/[id]',
//         params: { id: conversationId },
//     }),
// } as const;

/**
 * Order routes với dynamic ID
 */
export const orderRoutes = {
    detail: (orderId: string): Href => ({
        pathname: '/order/[id]',
        params: { id: orderId },
    }),
} as const;

/**
 * Shop routes với dynamic ID
 */
export const shopRoutes = {
    detail: (shopId: string): Href => ({
        pathname: '/shop/[id]',
        params: { id: shopId },
    }),
} as const;

/**
 * Address routes với dynamic ID
 * Note: Cast through unknown vì routes này chưa implement trong file system
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
 * Auth verify OTP với params
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
 * Giúp IDE check được route có hợp lệ không
 */
export const href = <T extends StaticRoute>(route: T): Href => route as Href;

/**
 * Type guard để kiểm tra route có tồn tại
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
// Dùng trong các config files để map key -> route
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
    order: typeof orderRoutes;
    shop: typeof shopRoutes;
    address: typeof addressRoutes;
    auth: typeof authRoutes;
};
