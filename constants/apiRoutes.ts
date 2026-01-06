const API_PREFIX = '/api/v1';
const API_PREFIX_V2 = '/api/v2';

export const API_ROUTES = {
    VOUCHERS: {
        RECOMMEND_PLATFORM: `${API_PREFIX_V2}/vouchers/recommend/by-platform`,
        RECOMMEND_SHOP: `${API_PREFIX_V2}/vouchers/recommend/by-shop`,
    },
    AUTH: {
        LOGIN: `${API_PREFIX}/auth/login/buyer/mobile`,
        REGISTER: `${API_PREFIX}/auth/register`,
        REFRESH_TOKEN: `${API_PREFIX}/auth/refresh`,
        LOGOUT: `${API_PREFIX}/auth/logout`,
        ME: `${API_PREFIX}/auth/me`,
        VERIFY_OTP: `${API_PREFIX}/auth/otp/verify`,
        RESEND_OTP: `${API_PREFIX}/auth/otp/resend`,
    },
    USERS: {
        CREATE_ACCOUNT: `${API_PREFIX}/users/buyer`,
    },
    PROFILE: {
        USER_ME: `${API_PREFIX}/users/me`,
        ORDER_STATS: `${API_PREFIX}/buyer/orders/count-by-status`,
    },
    PRODUCTS: {
        DETAIL: (id: string | number) => `${API_PREFIX}/public/products/${id}`,
        REVIEWS: (id: string | number) => `${API_PREFIX}/products/${id}/reviews`,
    },
    CATEGORIES: {
        GETALL: `${API_PREFIX}/categories/tree`,
    },
    PUBLIC_PRODUCTS: {
        PROMOTED: `${API_PREFIX}/public/products/promoted`,
        SALE: `${API_PREFIX}/public/products/sale`,
        NEW: `${API_PREFIX}/public/products/new`,
        FEATURED: `${API_PREFIX}/public/products/featured`,
        SEARCH: `${API_PREFIX}/public/products/search`,
        SHOP_BY_ID: (shopId: string | number) => `${API_PREFIX}/public/products/shop/${shopId}`,
        SLUG: (slug: string) => `${API_PREFIX}/public/products/slug/${slug}`,
        RELATED: (productId: string | number) => `${API_PREFIX}/public/products/${productId}/related`,
        CATEGORY: (categoryId: string | number) => `${API_PREFIX}/public/products/category/${categoryId}`,
        CATEGORY_SLUG: (categorySlug: string) => `${API_PREFIX}/public/products/category/slug/${categorySlug}`,
        VARIANT_ID: (variantId: string | number) => `${API_PREFIX}/public/products/by-variant/${variantId}`,
    },
    CART: {
        GET: `${API_PREFIX}/cart`,
        ADD: `${API_PREFIX}/cart/items`,
        UPDATE: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
        REMOVE: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
        CLEAR: `${API_PREFIX}/cart`,
        CHECKOUT_PREVIEW: `${API_PREFIX}/cart/checkout`,
    },
    CHAT: {
        CONVERSATIONS: `${API_PREFIX}/chat/conversations`,
        MESSAGES: (conversationId: string) => `${API_PREFIX}/chat/conversations/${conversationId}/messages`,
        CONVERSATION_MESSAGES: (conversationId: string) => `${API_PREFIX}/chat/messages/conversation/${conversationId}`,
        SEND_MESSAGE: `${API_PREFIX}/chat/messages`,
        MARK_AS_READ: (conversationId: string) => `${API_PREFIX}/chat/messages/conversation/${conversationId}/read`,
        PIN: (conversationId: string) => `${API_PREFIX}/chat/conversations/${conversationId}/pin`,
        MUTE: (conversationId: string) => `${API_PREFIX}/chat/conversations/${conversationId}/mute`,
        UNREAD_COUNT: `${API_PREFIX}/chat/conversations/unread/messages/count`,
    },
    NOTIFICATIONS: {
        GET: `${API_PREFIX}/notifications`,
        MARK_AS_READ: (notificationId: string) => `${API_PREFIX}/notifications/${notificationId}/read`,
        COUNT_UNREAD: `${API_PREFIX}/notifications/count-unread`,
        MARK_ALL_AS_READ: `${API_PREFIX}/notifications/read-all`,
        CHECK_NEW: `${API_PREFIX}/notifications/check-new`,
    },
    ADDRESS: {
        COUNTRY: `${API_PREFIX}/address/country`,
        PROVINCES: `${API_PREFIX}/address/provinces`,
        WARDS_BY_PROVINCE: (provinceCode: string) => `${API_PREFIX}/address/provinces/${provinceCode}/wards`,
        WARD_DETAIL: (wardCode: string) => `${API_PREFIX}/address/wards/${wardCode}`,
    },
    BUYER_ADDRESS: {
        LIST: (buyerId: string) => `${API_PREFIX}/buyers/${buyerId}/address`,
        CREATE: (buyerId: string) => `${API_PREFIX}/buyers/${buyerId}/address`,
        UPDATE: (buyerId: string, addressId: string) => `${API_PREFIX}/buyers/${buyerId}/address/${addressId}`,
        DELETE: (buyerId: string, addressId: string) => `${API_PREFIX}/buyers/${buyerId}/address/${addressId}`,
        SET_DEFAULT: (buyerId: string, addressId: string) => `${API_PREFIX}/buyers/${buyerId}/address/${addressId}/default`,
    },
    ORDERS: {
        LIST: `${API_PREFIX}/buyer/orders`,
        DETAIL: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}`,
        CANCEL: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}/cancel`,
        CONFIRM_RECEIVED: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}/confirm-received`,
    },
    BUYERS_INFORMATION: {
        UPDATE: (buyerId: string) => `${API_PREFIX}/buyers/${buyerId}`,
    },
} as const;  // <--- as const for TS to understand these are readonly values