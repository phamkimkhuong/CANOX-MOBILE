const API_PREFIX = '/api/v1';
const API_PREFIX_V2 = '/api/v2';

export const API_ROUTES = {
    VOUCHERS: {
        RECOMMEND_PLATFORM: `${API_PREFIX_V2}/vouchers/recommend/by-platform`,
        RECOMMEND_SHOP: `${API_PREFIX_V2}/vouchers/recommend/by-shop`,
    },
    AUTH: {
        LOGIN: `${API_PREFIX}/auth/login/buyer/mobile`,
        GOOGLE: `${API_PREFIX}/auth/login/social/callback/mobile`,
        REGISTER: `${API_PREFIX}/auth/register`,
        REFRESH_TOKEN: `${API_PREFIX}/auth/refresh/mobile`,
        LOGOUT: `${API_PREFIX}/auth/logout`,
        ME: `${API_PREFIX}/auth/me`,
        VERIFY_OTP: `${API_PREFIX}/auth/otp/verify`,
        RESEND_OTP: `${API_PREFIX}/auth/otp/resend`,
        // Forgot Password Flow
        FORGOT_PASSWORD: `${API_PREFIX}/auth/password/forgot`,
        RESET_PASSWORD: `${API_PREFIX}/auth/password/reset`,
        VERIFY_FORGOT_PASSWORD_OTP: `${API_PREFIX}/auth/password/verify`,
    },
    USERS: {
        CREATE_ACCOUNT: `${API_PREFIX}/users/buyer`,
        CHANGE_PASSWORD: (userId: string) => `${API_PREFIX}/users/${userId}/password`,
        CHECK_EMAIL_EXISTS: (email: string) => `${API_PREFIX}/users/exists/email?email=${encodeURIComponent(email)}`,
        UPDATE_CLIENT: (userId: string) => `${API_PREFIX}/users/${userId}/client`,
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
        BATCH_REMOVE: `${API_PREFIX}/cart/items/batch`,
        CHECKOUT_PREVIEW: `${API_PREFIX}/cart/checkout`,
    },
    CHAT: {
        CONVERSATIONS: `${API_PREFIX}/chat/conversations`,
        MESSAGES: (conversationId: string) => `${API_PREFIX}/chat/conversations/${conversationId}/messages`,
        CONVERSATION_MESSAGES: (conversationId: string) => `${API_PREFIX}/chat/messages/conversation/${conversationId}`,
        SEND_MESSAGE: `${API_PREFIX}/chat/messages`,
        SEND_PRODUCT_CARD: `${API_PREFIX}/chat/messages/product-card`,
        SEND_ORDER_CARD: `${API_PREFIX}/chat/messages/order-card`,
        DELETE_MESSAGE: (messageId: string) => `${API_PREFIX}/chat/messages/${messageId}`,
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
        DEVICE_TOKENS: `${API_PREFIX}/notifications/device-tokens`,
        UNREGISTER_DEVICE_TOKEN: (token: string) => `${API_PREFIX}/notifications/device-tokens/${token}`,
    },
    ADDRESS: {
        COUNTRY: `${API_PREFIX}/address/country`,
        PROVINCES: `${API_PREFIX}/address/provinces`,
        PROVINCE_DETAIL: (code: string) => `${API_PREFIX}/address/provinces/${code}`,
        WARDS_BY_PROVINCE: (provinceCode: string) => `${API_PREFIX}/address/provinces/${provinceCode}/wards`,
        WARD_DETAIL: (wardCode: string) => `${API_PREFIX}/address/wards/${wardCode}`,
    },
    BUYER_ADDRESS: {
        LIST: `${API_PREFIX}/buyer/addresses`,
        CREATE: `${API_PREFIX}/buyer/addresses`,
        UPDATE: (addressId: string) => `${API_PREFIX}/buyer/addresses/${addressId}`,
        DELETE: (addressId: string) => `${API_PREFIX}/buyer/addresses/${addressId}`,
        SET_DEFAULT: (addressId: string) => `${API_PREFIX}/buyer/addresses/${addressId}/default`,
        DETAIL: (addressId: string) => `${API_PREFIX}/buyer/addresses/${addressId}`,
    },
    SHOPS: {
        DETAIL: (shopId: string) => `${API_PREFIX}/public/shops/${shopId}`,
        PRODUCTS: (shopId: string) => `${API_PREFIX}/public/products/shop/${shopId}`,
        VOUCHERS: (shopId: string) => `${API_PREFIX}/public/shops/${shopId}/vouchers`,
        CATEGORIES: (shopId: string) => `${API_PREFIX}/public/products/shop/${shopId}/categories`,
    },
    ORDERS: {
        LIST: `${API_PREFIX}/buyer/orders`,
        BY_SHOP: (shopId: string) => `${API_PREFIX}/buyer/orders/shop/${shopId}`,
        DETAIL: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}`,
        CANCEL: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}/cancel`,
        CONFIRM_RECEIVED: (orderId: string) => `${API_PREFIX}/buyer/orders/${orderId}/confirm-received`,
    },
    REVIEWS: {
        LIST: (type: string, id: string | number) => `${API_PREFIX}/reviews/${type}/${id}`,
        STATISTICS: (type: string, id: string | number) => `${API_PREFIX}/reviews/${type}/${id}/statistics`,
        CREATE: `${API_PREFIX}/reviews`,
        MY_REVIEWS: `${API_PREFIX}/reviews/my-reviews`,
        UPDATE: (reviewId: string) => `${API_PREFIX}/reviews/${reviewId}`,
        DELETE: (reviewId: string) => `${API_PREFIX}/reviews/${reviewId}`,
        HELPFUL: (reviewId: string) => `${API_PREFIX}/reviews/${reviewId}/helpful`,
    },
    BUYERS_INFORMATION: {
        UPDATE: (buyerId: string) => `${API_PREFIX}/buyers/${buyerId}`,
    },
    WISHLISTS: {
        LIST: `${API_PREFIX}/wishlists`,
        DETAIL: (wishlistId: string) => `${API_PREFIX}/wishlists/${wishlistId}`,
        /** GET - Get items in a wishlist */
        ITEMS: (wishlistId: string) => `${API_PREFIX}/wishlists/${wishlistId}/items`,
        CREATE: `${API_PREFIX}/wishlists`,
        UPDATE: (wishlistId: string) => `${API_PREFIX}/wishlists/${wishlistId}`,
        DELETE: (wishlistId: string) => `${API_PREFIX}/wishlists/${wishlistId}`,
        /** GET - Get default wishlist */
        DEFAULT: `${API_PREFIX}/wishlists/default`,
        POPULAR: `${API_PREFIX}/wishlists/popular`,
        LATEST: `${API_PREFIX}/wishlists/latest`,
        SEARCH: `${API_PREFIX}/wishlists/public/search`,
        /** GET - Items that met price target */
        PRICE_TARGET_MET: `${API_PREFIX}/wishlists/price-target-met`,
        ADD_ITEM: (wishlistId: string) => `${API_PREFIX}/wishlists/${wishlistId}/items`,
        UPDATE_ITEM: (wishlistId: string, itemId: string) => `${API_PREFIX}/wishlists/${wishlistId}/items/${itemId}`,
        REMOVE_ITEM: (wishlistId: string, itemId: string) => `${API_PREFIX}/wishlists/${wishlistId}/items/${itemId}`,
    },
    STORAGE: {
        PRESIGN_UPLOAD: `${API_PREFIX}/storage/presign-upload`,
        STATUS: `${API_PREFIX}/storage/status`,
        PRE_CHECK_IMAGES: `${API_PREFIX}/storage/pre-check-images`,
        PRE_CHECK_VIDEOS: `${API_PREFIX}/storage/pre-check-videos`,
    },
    BUYERS: {
        UPDATE_AVATAR: (buyerId: string) => `${API_PREFIX}/buyers/${buyerId}/avatar`,
    },
    SEARCH: {
        HOT: `${API_PREFIX}/search/hot`,
        SUGGESTIONS: `${API_PREFIX}/search/suggestions`,
        TRACK: `${API_PREFIX}/search/track`,
    },
    CAMPAIGNS: {
        ACTIVE_SLOTS: `${API_PREFIX}/campaigns/slots/active`,
        SLOT_PRODUCTS: (slotId: string) => `${API_PREFIX}/campaigns/slots/${slotId}/products`,
        ACTIVE: `${API_PREFIX}/campaigns/active`,
        UPCOMING: `${API_PREFIX}/campaigns/upcoming`,
        FEATURED: `${API_PREFIX}/campaigns/featured`,
    },
    BANNERS: {
        /** GET - Get banner active with filters (categoryId, displayLocation, device) */
        ACTIVE: `${API_PREFIX}/homepage/banners/active`,
        /** GET - Get banner by page prefix (HOMEPAGE, CATEGORY_PAGE, etc.) */
        BY_PAGE: `${API_PREFIX}/homepage/banners/page`,
        /** GET - Get banner detail by ID */
        DETAIL: (bannerId: string) => `${API_PREFIX}/homepage/banners/${bannerId}`,
    },
} as const;  // <--- as const for TS to understand these are readonly values
