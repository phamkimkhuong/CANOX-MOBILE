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
        LIST: `${API_PREFIX}/products`,
        // Dùng hàm để đảm bảo type safety cho params
        DETAIL: (id: string | number) => `${API_PREFIX}/products/${id}`,
        REVIEWS: (id: string | number) => `${API_PREFIX}/products/${id}/reviews`,
        SEARCH: `${API_PREFIX}/products/search`,
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