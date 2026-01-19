/**
 * Định nghĩa cấu trúc chuẩn cho i18n
 * Giúp đảm bảo tất cả các ngôn ngữ đều phải có đầy đủ các keys
 */

export interface ProductTranslation {
    description: {
        title: string;
        empty: string;
        viewMore: string;
        collapse: string;
    };
    specs: {
        title: string;
        viewMore: string;
        collapse: string;
    };
    variant: {
        label: string;
        placeholder: string;
        confirm: string;
        addToCart: string;
        buyNow: string;
        stock: string;
        quantity: string;
    };
    bottomBar: {
        chat: string;
        shop: string;
        addToCart: string;
        buyNow: string;
        outOfStock: string;
        selectVariant: string;
    };
    shop: {
        rating: string;
        responseRate: string;
        responseTime: string;
        products: string;
        viewShop: string;
        defaultResponseTime: string;
        online: string;
    };
    info: {
        reviews: string;
        sold: string;
        discount: string;
    };
    flashSale: {
        title: string;
        endsIn: string;
        soldOut: string;
        selling: string;
        soldPrefix: string;
    };
    reviews: {
        title: string;
        viewAll: string;
        noReviews: string;
        beFirst: string;
        reviewCount: string;
        filterAll: string;
        filter5Star: string;
        filterWithMedia: string;
        qna: string;
        askQuestion: string;
        questions: string;
        newest: string;
        viewAllReviews: string;
    };
    gallery: {
        noImages: string;
    };
    error: {
        loadFailed: string;
        generic: string;
        retry: string;
        notFound: string;
        notFoundDetail: string;
        home: string;
    };
    navigation: {
        title: string;
    };
    related: {
        title: string;
    };
    badges: {
        mall: string;
        international: string;
    };
}

/**
 * Home module translations
 */
export interface HomeTranslation {
    search: {
        placeholder: string;
        allReady: string;
    };
    flashSale: {
        title: string;
        seeAll: string;
        soldCount: string;
        sellingFast: string;
    };
    featured: {
        title: string;
        subtitle: string;
    };
    tabs: {
        new: string;
        popular: string;
        sale: string;
        featured: string;
    };
    feed: {
        loadingMore: string;
        noMore: string;
    };
}

/**
 * Category module translations
 */
export interface CategoryTranslation {
    search: {
        placeholder: string;
    };
    content: {
        featuredBrands: string;
        seeAll: string;
        selectPrompt: string;
        loading: string;
    };
}

/**
 * Voucher module translations
 */
export interface VoucherTranslation {
    header: {
        title: string;
        myVouchers: string;
        searchPlaceholder: string;
    };
    filters: {
        all: string;
        shipping: string;
        cashback: string;
        international: string;
        shopMall: string;
        discount: string;
        live: string;
    };
    sort: {
        label: string;
        popular: string;
        newest: string;
        expiring: string;
    };
    card: {
        minOrder: string;
        maxDiscount: string;
        expiry: string;
        expiryToday: string;
        expiringSoon: string;
        almostGone: string;
        used: string;
        conditions: string;
        freeShipping: string;
        discount: string;
        discountUpTo: string;
        cashback: string;
        coins: string;
    };
    actions: {
        collect: string;
        use: string;
        collected: string;
        expired: string;
        soldout: string;
        reminder: string;
    };
    featured: {
        title: string;
        aiPick: string;
    };
    list: {
        title: string;
        empty: string;
        emptyDescription: string;
        loadMore: string;
        loading: string;
    };
    badges: {
        hot: string;
        new: string;
        limited: string;
        extra: string;
        xtra: string;
        exclusive: string;
    };
    progress: {
        used: string;
    };
    error: {
        loadFailed: string;
        collectFailed: string;
        retry: string;
    };
    success: {
        collected: string;
        reminderSet: string;
    };
    live: {
        startingAt: string;
        liveNow: string;
    };
    types: {
        shipping: string;
        discount: string;
        cashback: string;
        international: string;
        live: string;
        shop: string;
    };
}

/**
 * Common translations used across the app
 */
export interface CommonTranslation {
    actions: {
        cancel: string;
        confirm: string;
        back: string;
        save: string;
        delete: string;
        edit: string;
        done: string;
        next: string;
        retry: string;
        copy: string;
        viewNow: string;
    };
    status: {
        loading: string;
        success: string;
        error: string;
        empty: string;
        verified: string;
        unverified: string;
    };
    bottomTab: {
        home: string;
        category: string;
        chat: string;
        notify: string;
        me: string;
    };
}

/**
 * Auth module translations
 */
export interface AuthTranslation {
    login: {
        title: string;
        welcome: string;
        subtitle: string;
        usernameLabel: string;
        passwordLabel: string;
        usernamePlaceholder: string;
        passwordPlaceholder: string;
        forgotPassword: string;
        loginButton: string;
        noAccount: string;
        registerNow: string;
        socialLogin: string;
    };
    register: {
        title: string;
        welcome: string;
        subtitle: string;
        usernameLabel: string;
        emailLabel: string;
        passwordLabel: string;
        confirmPasswordLabel: string;
        usernamePlaceholder: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        confirmPasswordPlaceholder: string;
        registerButton: string;
        agreeTermsPrefix: string;
        termsLink: string;
        agreeTermsAnd: string;
        privacyLink: string;
        socialLogin: string;
        hasAccount: string;
        loginNow: string;
    };
    forgotPassword: {
        title: string;
        subtitle: string;
        emailLabel: string;
        sendButton: string;
    };
}

/**
 * Cart module translations
 */
export interface CartTranslation {
    header: {
        title: string;
        edit: string;
        done: string;
        viewShop: string;
    };
    empty: {
        title: string;
        subtitle: string;
        shopNow: string;
    };
    footer: {
        selectAll: string;
        total: string;
        checkout: string;
        savings: string;
        checkoutWithCount: string;
    };
    item: {
        variation: string;
        delete: string;
        outOfStock: string;
        findSimilar: string;
        selectVariation: string;
    };
    status: {
        syncing: string;
        rebuySuccess: string;
        rebuySuccessDetail: string;
    };
    error: {
        loadFailed: string;
        tryAgainLater: string;
        retryButton: string;
    };
}

/**
 * Checkout module translations
 */
export interface CheckoutTranslation {
    header: {
        title: string;
        back: string;
    };
    address: {
        title: string;
        deliverTo: string;
        defaultBadge: string;
        changeAddress: string;
        addAddress: string;
        noAddress: string;
    };
    shopGroup: {
        totalItems: string;
        viewShop: string;
    };
    item: {
        productImage: string;
        variation: string;
    };
    voucher: {
        shopTitle: string;
        platformTitle: string;
        selectShopVoucher: string;
        selectPlatformVoucher: string;
        noVouchers: string;
        placeholder: string;
        applyButton: string;
        noUsing: string;
        expiry: string;
        bestApplied: string;
        bestAppliedDetail: string;
        manualInputPlaceholder: string;
        findingBest: string;
        shippingVoucherTitle: string;
        noShippingVoucher: string;
        discountVoucherTitle: string;
        noDiscountVoucher: string;
    };
    shipping: {
        title: string;
        select: string;
        notSupported: string;
        free: string;
        calculating: string;
    };
    note: {
        title: string;
        placeholder: string;
        addNote: string;
        suggestionsTitle: string;
        suggestions: {
            callBeforeSelection: string;
            officeHours: string;
            packCarefully: string;
            inspectBefore: string;
        };
    };
    payment: {
        title: string;
        select: string;
        cod: {
            name: string;
            description: string;
        };
        bankTransfer: {
            name: string;
            description: string;
        };
        expired: string;
        payBefore: string;
    };
    summary: {
        title: string;
        subtotal: string;
        shipping: string;
        shopVoucher: string;
        platformVoucher: string;
        shippingDiscount: string;
        tax: string;
    };
    footer: {
        total: string;
        savings: string;
        placeOrder: string;
        placeOrderWithCount: string;
        accessibilityPlaceOrder: string;
    };
    actions: {
        cancelTitle: string;
        cancelMessage: string;
        cancelConfirm: string;
        cancelStay: string;
        done: string;
        confirm: string;
    };
    status: {
        placingOrder: string;
        orderSuccess: string;
        orderFailed: string;
        orderFailedDetail: string;
    };
}

/**
 * Order module translations
 */
export interface OrderTranslation {
    tabs: {
        all: string;
        awaitingPayment: string;
        processing: string;
        shipping: string;
        delivered: string;
        completed: string;
        cancelled: string;
        returned: string;
    };
    detail: {
        title: string;
        orderNumber: string;
        copyOrderNumber: string;
        status: string;
        shippingAddress: string;
        paymentMethod: string;
        paymentSummary: string;
        tracking: string;
        summary: {
            subtotal: string;
            shipping: string;
            shopDiscount: string;
            platformDiscount: string;
            shippingDiscount: string;
            tax: string;
            total: string;
            savings: string;
        };
    };
    timeline: {
        created: string;
        processing: string;
        shipping: string;
        completed: string;
        abnormal: {
            cancelled: string;
            rejected: string;
            returnedToSender: string;
            returned: string;
            deliveryFailed: string;
        };
    };
    actions: {
        rebuy: string;
        review: string;
        cancel: string;
        contact: string;
        track: string;
        received: string;
        pay: string;
        return: string;
    };
}

/**
 * Chat module translations
 */
export interface ChatTranslation {
    list: {
        title: string;
        search: string;
        empty: string;
    };
    detail: {
        loadingMessages: string;
        cannotLoadMessages: string;
        emptyMessages: string;
        emptySubtext: string;
        sendPlaceholder: string;
        ghostHeader: string;
    };
    error: {
        startChatFailed: string;
        tryAgainLater: string;
        missingShopInfo: string;
        chatWithSelf: string;
    };
}

/**
 * Profile & Settings translations
 */
export interface ProfileTranslation {
    header: {
        login: string;
        register: string;
        guestName: string;
    };
    stats: {
        favorites: string;
        followed: string;
        recent: string;
        coins: string;
        vouchers: string;
        orders: string;
        units: {
            vouchers: string;
            reviews: string;
            collect: string;
            pending: string;
            buyNow: string;
        };
    };
    orders: {
        title: string;
        viewAll: string;
    };
    memberLevel: {
        BRONZE: string;
        SILVER: string;
        GOLD: string;
        PLATINUM: string;
        DIAMOND: string;
    };
    orderStatus: {
        pendingPayment: string;
        processing: string;
        shipping: string;
        completed: string;
        cancelled: string;
        returned: string;
        review: string;
        total: string;
    };
    menu: {
        wallet: string;
        rewards: string;
        affiliate: string;
        support: string;
        settings: string;
        coins: string;
        vouchers: string;
        reviews: string;
        shipping: string;
        security: string;
    };
    guestState: {
        title: string;
        subtitle: string;
        login: string;
        register: string;
        benefitsTitle: string;
        benefits: {
            exclusive: string;
            shipping: string;
            coins: string;
        };
    };
    settings: {
        title: string;
        sections: {
            account: string;
            payment: string;
            app: string;
            legal: string;
        };
        items: {
            profile: string;
            'change-password': string;
            'linked-accounts': string;
            biometrics: string;
            'bank-cards': string;
            notifications: string;
            language: string;
            'dark-mode': string;
            cache: string;
            privacy: string;
            terms: string;
            'rate-app': string;
        };
        actions: {
            logout: string;
            deleteAccount: string;
            deleteAccountConfirm: string;
            confirmClearCache: string;
            cacheCleared: string;
        };
    };
}

/**
 * Search module translations
 */
export interface SearchTranslation {
    header: {
        placeholder: string;
        placeholderTyping: string;
        cancel: string;
    };
    recent: {
        title: string;
        clearAll: string;
        empty: string;
    };
    hot: {
        title: string;
        badge: string;
    };
    suggestions: {
        searchIn: string;
        shopPrefix: string;
        categoryPrefix: string;
        noResults: string;
    };
    actions: {
        search: string;
        searchByImage: string;
        searchByVoice: string;
    };
    error: {
        loadFailed: string;
    };
}

/**
 * Notification module translations
 */
export interface NotificationTranslation {
    header: {
        title: string;
        markAllRead: string;
    };
    filters: {
        all: string;
        order: string;
        promo: string;
        product: string;
        shipping: string;
        wallet: string;
        system: string;
    };
    empty: {
        title: string;
        subtitle: string;
        subtitleWithFilter: string;
    };
    sections: {
        today: string;
        yesterday: string;
        thisWeek: string;
        earlier: string;
    };
    errors: {
        markAllAsReadFailed: string;
        tryAgain: string;
    };
    actions: {
        markAllAsReadTitle: string;
        markAllAsReadMessage: string;
    };
}

/**
 * Global I18n Resources
 */
export interface I18nResources {
    common: CommonTranslation;
    auth: AuthTranslation;
    product: ProductTranslation;
    voucher: VoucherTranslation;
    cart: CartTranslation;
    order: OrderTranslation;
    chat: ChatTranslation;
    profile: ProfileTranslation;
    home: HomeTranslation;
    category: CategoryTranslation;
    search: SearchTranslation;
    notification: NotificationTranslation;
    checkout: CheckoutTranslation;
}
