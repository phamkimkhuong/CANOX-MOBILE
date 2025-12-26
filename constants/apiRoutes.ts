const API_PREFIX = '/api/v1';

export const API_ROUTES = {
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
    PRODUCTS: {
        DETAIL: (id: string | number) => `${API_PREFIX}/products/${id}`,
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
    },
    CHAT: {
        CONVERSATIONS: `${API_PREFIX}/conversations`,
        MESSAGES: (conversationId: string) => `${API_PREFIX}/conversations/${conversationId}/messages`,
    }
} as const; // <--- as const để TS hiểu đây là readonly values