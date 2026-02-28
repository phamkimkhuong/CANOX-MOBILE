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
        soldCountTemplate: string;
    };
    flashSale: {
        title: string;
        soldOut: string;
        selling: string;
        soldPrefix: string;
        campaigns: {
            flashSale: string;
            megaSale: string;
            dailyDeal: string;
            shopSale: string;
            shopPromotion: string;
        };
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
        newest: string;
        viewAllReviews: string;
        loading: string;
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
        authRequiredTitle: string;
        authRequiredChat: string;
        authRequiredCart: string;
        authRequiredBuyNow: string;
        authRequiredGeneric: string;
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
    share: {
        msgTemplate: string;
    };
    report: {
        title: string;
        success: string;
        reasons: {
            fake: string;
            prohibited: string;
            offensive: string;
            scam: string;
            misleading: string;
            other: string;
        };
    };
    priceBreakdown: {
        title: string;
        basePrice: string;
        productDiscount: string;
        shopVoucher: string;
        platformVoucher: string;
        finalSubtotal: string;
        legalNote: string;
        afterVoucher: string;
    };
    wishlist: {
        targetPrice: string;
        setupTargetPrice: string;
        hasNotes: string;
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
        soldOut: string;
        urgentStock: string;
        recentlyLaunched: string;
        endingIn: string;
        startingIn: string;
        statusLive: string;
        statusUpcoming: string;
        remindMe: string;
        buyNow: string;
        almostGone: string;
        sold: string;
        onlyLeft: string;
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
    categories: {
        flashSale: string;
        allCategories: string;
        coins: string;
        global: string;
        vouchers: string;
        freeShip: string;
        fashion: string;
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
        add: string;
        done: string;
        next: string;
        retry: string;
        copy: string;
        viewNow: string;
        seeAll: string;
        seeMore: string;
        yes: string;
        no: string;
        quantityTemplate: string;
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
        wishlist: string;
        category: string;
        video: string;
        chat: string;
        notify: string;
        me: string;
    };
    popup: {
        skipToday: string;
    };
    maintenance: {
        title: string;
        description: string;
        retryButton: string;
        contactSupport: string;
        support: string;
    };
    update: {
        forceTitle: string;
        forceDescription: string;
        softTitle: string;
        softDescription: string;
        updateNow: string;
        later: string;
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
        headerTitle: string;
        title: string;
        subtitle: string;
        emailLabel: string;
        emailPlaceholder: string;
        infoBox: string;
        sendButton: string;
        sendingButton: string;
        successToast: string;
        successToastDetail: string;
        errorToast: string;
        errorToastDetail: string;
        rememberedPassword: string;
        loginLink: string;
    };
    resetPassword: {
        headerTitle: string;
        title: string;
        subtitle: string;
        passwordLabel: string;
        confirmPasswordLabel: string;
        passwordPlaceholder: string;
        confirmPasswordPlaceholder: string;
        requirementsTitle: string;
        requirementLength: string;
        requirementUppercase: string;
        requirementLowercase: string;
        requirementNumber: string;
        submitButton: string;
        submittingButton: string;
        successToast: string;
        successToastDetail: string;
        errorToast: string;
        errorToastDetail: string;
        rememberedPassword: string;
        loginLink: string;
        missingInfoToast: string;
        missingInfoDetail: string;
    };
    validation: {
        emailRequired: string;
        emailInvalid: string;
        passwordRequired: string;
        passwordTooShort: string;
        passwordMismatch: string;
        usernameRequired: string;
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
    authRequired: {
        title: string;
        login: string;
    };
    footer: {
        selectAll: string;
        total: string;
        checkout: string;
        savings: string;
        checkoutWithCount: string;
        moveToWishlist: string;
        deleteSelected: string;
    };
    confirmations: {
        deleteSelected: {
            title: string;
            message: string;
        };
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
        addSuccess: string;
        addFailed: string;
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
        platformManualInputPlaceholder: string;
        findingBest: string;
        shippingVoucherTitle: string;
        noShippingVoucher: string;
        discountVoucherTitle: string;
        noDiscountVoucher: string;
        noApplicableVouchers: string;
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
    paymentMethods: {
        COD: string;
        PAYOS: string;
        STRIPE: string;
        BANK_TRANSFER: string;
    };
    myOrders: string;
    tabs: {
        all: string;
        awaitingPayment: string;
        created: string;
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
        customerNote: string;
        cancellationReason: string;
        copyTrackingSuccess: string;
        noTrackingTitle: string;
        noTrackingMessage: string;
        missingShopInfo: string;
        missingPaymentUrlTitle: string;
        missingPaymentUrlMessage: string;
        confirmReceivedTitle: string;
        confirmReceivedMessage: string;
        confirmReceivedSuccess: string;
        confirmReceivedError: string;
        returnRequestTitle: string;
        returnRequestMessage: string;
        carrierTitle: string;
        trackingID: string;
        estimatedDelivery: string;
        trackOrder: string;
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
    cancel: {
        title: string;
        selectReason: string;
        otherReasonPlaceholder: string;
        otherReasonError: string;
        otherReasonMinChars: string;
        confirmTitle: string;
        confirmMessage: string;
        confirmMessageVoucher: string;
        submit: string;
        loading: string;
        notFound: string;
        notFoundDetail: string;
        success: string;
        reasons: {
            CHANGE_ADDRESS: string;
            CHANGE_PRODUCT: string;
            FOUND_CHEAPER: string;
            DELIVERY_TOO_LONG: string;
            DONT_WANT: string;
            OTHER: string;
        };
        refund: {
            notPaid: string;
            refundInfo: string;
            voucherWarning: string;
        };
    };
    review: {
        reviewed: string;
        pending: string;
        notReviewed: string;
    };
    list: {
        totalLabel: string;
        itemCount: string;
        viewMore: string;
        emptyState: {
            awaitingPayment: { title: string; description: string };
            created: { title: string; description: string };
            fulfilling: { title: string; description: string };
            delivered: { title: string; description: string };
            completed: { title: string; description: string };
            cancelled: { title: string; description: string };
            shopNow: string;
        };
    };
    statusLabel: {
        created: string;
        awaitingPayment: string;
        paid: string;
        rejected: string;
        fulfilling: string;
        readyForPickup: string;
        shipped: string;
        outForDelivery: string;
        delivered: string;
        completed: string;
        deliveryFailed: string;
        returningToSender: string;
        returnedToSender: string;
        returnRequested: string;
        returnApproved: string;
        returnRejected: string;
        returning: string;
        returned: string;
        cancelled: string;
    };
    success: {
        title: string;
        subtitle: string;
        orderTitle: string;
        orderNumberLabel: string;
        paymentLabel: string;
        timeLabel: string;
        itemCountLabel: string;
        totalLabel: string;
        copySuccess: string;
        actions: {
            continue: string;
            viewHistory: string;
            home: string;
        };
        multiOrders: {
            title: string;
            orderItemTitle: string;
            viewDetail: string;
            fallback: string;
        };
        toast: {
            copySuccess: string;
            pushEnabled: string;
        };
    };
}

/**
 * Chat module translations
 */
export interface ChatTranslation {
    list: {
        title: string;
        search: string;
        emptyTitle: string;
        emptySubtitle: string;
        filterAll: string;
        filterUnread: string;
        filterShop: string;
        filterSupport: string;
        actionPin: string;
        actionUnpin: string;
        actionMute: string;
        actionUnmute: string;
        messageYou: string;
        messageSentImage: string;
        messageProduct: string;
        responseRate: string;
    };
    promo: {
        title: string;
        subtitle: string;
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
    authRequired: {
        title: string;
        login: string;
    };
}

/**
 * Profile & Settings translations
 */
export interface ProfileTranslation {
    title: string;
    smartInsight: {
        urgentCoin: {
            message: string;
            action: string;
        };
        profileIncomplete: {
            message: string;
            action: string;
        };
        pendingReview: {
            message: string;
            action: string;
        };
        idleCoin: {
            message: string;
            action: string;
        };
    };
    header: {
        login: string;
        register: string;
        guestName: string;
        searchAccessibility: string;
        notificationAccessibility: string;
        settingsAccessibility: string;
    };
    stats: {
        favorites: string;
        followed: string;
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
        favorites: string;
        support: string;
        settings: string;
        coins: string;
        vouchers: string;
        reviews: string;
        shipping: string;
        security: string;
        legal_tos: string;
        legal_privacy: string;
        legal_payment: string;
        legal_shipping: string;
        legal_return: string;
        legal_prohibited: string;
        legal_warranty: string;
        legal_regulations: string;
        legal_seller: string;
        legal_policies: string;
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
    editProfile: {
        title: string;
        save: string;
        saving: string;
        avatar: {
            change: string;
            chooseSource: string;
            camera: string;
            gallery: string;
            helper: string;
            uploading: string;
        };
        form: {
            fullName: string;
            fullNamePlaceholder: string;
            gender: string;
            genderMale: string;
            genderFemale: string;
            genderOther: string;
            birthday: string;
            birthdayPlaceholder: string;
            phone: string;
            phonePlaceholder: string;
            email: string;
            verified: string;
            emailLockNotice: string;
        };
        messages: {
            loading: string;
            updateSuccess: string;
            updateError: string;
            uploadSuccess: string;
            uploadError: string;
            unsavedChangesTitle: string;
            unsavedChangesMessage: string;
            stay: string;
            exit: string;
        };
    };
    changePassword: {
        title: string;
        subtitle: string;
        description: string;
        currentPassword: string;
        currentPasswordPlaceholder: string;
        newPassword: string;
        newPasswordPlaceholder: string;
        confirmPassword: string;
        confirmPasswordPlaceholder: string;
        submitButton: string;
        successTitle: string;
        successSubtitle: string;
        successToast: string;
        successToastDetail: string;
        errorToast: string;
        errorWrongPassword: string;
        tips: {
            title: string;
            item1: string;
            item2: string;
            item3: string;
        };
    };
    deleteAccount: {
        title: string;
        subtitle: string;
        description: string;
        warningTitle: string;
        warningItem1: string;
        warningItem2: string;
        warningItem3: string;
        warningItem4: string;
        confirmCheckbox: string;
        confirmInputLabel: string;
        confirmInputPlaceholder: string;
        confirmInputError: string;
        submitButton: string;
        cancelButton: string;
        successTitle: string;
        successSubtitle: string;
    };
    settings: {
        title: string;
        header: {
            help: string;
            back: string;
        };
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
            'bank-cards': string;
            notifications: string;
            language: string;
            'dark-mode': string;
            cache: string;
            privacy: string;
            terms: string;
            'rate-app': string;
            'app-version': string;
            support: string;
            'legal-policies': string;
        };
        actions: {
            logout: string;
            deleteAccount: string;
            deleteAccountConfirm: string;
            confirmClearCache: string;
            cacheCleared: string;
        };
        version: {
            upToDateTitle: string;
            upToDateMessage: string;
        };
        footer: {
            version: string;
            copyright: string;
            deleteAccountHint: string;
            deleteAccountAccessibility: string;
        };
        helpTitle: string;
        helpMessage: string;
    };
    legalWebView: {
        back: string;
        errorTitle: string;
        errorSubtitle: string;
        retry: string;
        loading: string;
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
    // Search Results Screen
    results: {
        title: string;
        count: string;
        countPlural: string;
        filter: string;
        filterCount: string;
    };
    sort: {
        relevance: string;
        newest: string;
        bestSelling: string;
        price: string;
        priceAsc: string;
        priceDesc: string;
    };
    quickFilter: {
        freeship: string;
        express: string;
        rating4Plus: string;
        mall: string;
        voucher: string;
    };
    filterModal: {
        title: string;
        reset: string;
        apply: string;
        priceRange: string;
        priceMin: string;
        priceMax: string;
        rating: string;
        ratingFrom: string;
        category: string;
        location: string;
        allLocations: string;
    };
    empty: {
        title: string;
        subtitle: string;
        suggestion: string;
        tryAgain: string;
        adjustFilters: string;
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
    settings: {
        title: string;
        systemDisabled: {
            title: string;
            description: string;
            action: string;
        };
        groups: {
            transaction: {
                title: string;
                order: {
                    title: string;
                    description: string;
                };
                chat: {
                    title: string;
                    description: string;
                };
            };
            promotion: {
                title: string;
                deals: {
                    title: string;
                    description: string;
                };
                news: {
                    title: string;
                    description: string;
                };
            };
            advanced: {
                title: string;
                systemSettings: string;
            };
        };
        messages: {
            enableSuccess: string;
            disableSuccess: string;
            updateError: string;
            featureDeveloping: string;
        };
    };
    softAsk: {
        title: string;
        description: string;
        accept: string;
        later: string;
    };
    authRequired: {
        title: string;
        login: string;
    };
}

/**
 * My Reviews module translations
 */
export interface MyReviewTranslation {
    title: string;
    tabs: {
        pending: string;
        history: string;
    };
    filter: {
        all: string;
        rating: string;
        withMedia: string;
        withResponse: string;
        viewingOrder: string;
        viewAll: string;
    };
    empty: {
        pendingTitle: string;
        pendingDesc: string;
        pendingBtn: string;
        historyTitle: string;
        historyDesc: string;
        historyBtn: string;
        refresh: string;
    };
    card: {
        orderNumber: string;
        productCount: string;
        rewardHint: string;
        rewardCoins: string;
        writeReview: string;
        editReview: string;
        productSnapshot: string;
    };
    form: {
        createTitle: string;
        editTitle: string;
        productQuality: string;
        tagHint: string;
        commentPlaceholder: string;
        mediaTitle: string;
        mediaHint: string;
        anonymousTitle: string;
        anonymousMasked: string;
        anonymousVisible: string;
        submit: string;
        updating: string;
        submitting: string;
    };
    incentive: {
        maxRewardSuccess: string;
        rewardTitle: string;
        totalReward: string;
        photoBonus: string;
        videoBonus: string;
    };
    alerts: {
        cancelTitle: string;
        cancelMessage: string;
        cancelConfirm: string;
        cancelStay: string;
        addPhoto: string;
        addPhotoSource: string;
        takePhoto: string;
        chooseGallery: string;
        addVideo: string;
        addVideoSource: string;
        takeVideo: string;
        uploading: string;
        uploadWait: string;
        cancel: string;
    };
    toast: {
        updateSuccess: string;
        updateSuccessDetail: string;
        createSuccess: string;
        createSuccessDetail: string;
        error: string;
        submitError: string;
    };
    tags: {
        fast_delivery: string;
        good_packaging: string;
        great_quality: string;
        true_to_description: string;
        good_value: string;
        friendly_seller: string;
        will_rebuy: string;
        wrong_color: string;
        defective: string;
        slow_delivery: string;
        bad_packaging: string;
        not_as_described: string;
        wrong_size: string;
        poor_quality: string;
        no_response: string;
        average: string;
        ok_quality: string;
        acceptable: string;
    };
    ratingLabels: {
        none: string;
        rating_1: string;
        rating_2: string;
        rating_3: string;
        rating_4: string;
        rating_5: string;
    };
}

export interface BankTranslation {
    cards: {
        title: string;
        subtitle: string;
        addAccount: string;
        emptyTitle: string;
        emptySubtitle: string;
        defaultBadge: string;
        securityHint: string;
        updateSuccess: string;
        deleteTitle: string;
        deleteConfirm: string;
        deleteSuccess: string;
        helpTitle: string;
        helpMessage: string;
    };
    edit: {
        title: string;
        helpTitle: string;
        helpMessage: string;
    };
    add: {
        title: string;
        step1: string;
        step2: string;
        bankLabel: string;
        bankPlaceholder: string;
        holderLabel: string;
        holderPlaceholder: string;
        accountLabel: string;
        accountPlaceholder: string;
        defaultLabel: string;
        infoTitle: string;
        infoMessage: string;
        submit: string;
        helpTitle: string;
        helpMessage: string;
    };
    verify: {
        title: string;
        subtitle: string;
        message: string;
        otpPlaceholder: string;
        resendLabel: string;
        resendCountdown: string;
        submit: string;
        errorInvalid: string;
        errorExpired: string;
        footerInfo: string;
    };
    modal: {
        title: string;
        searchPlaceholder: string;
        emptyResults: string;
    };
    validation: {
        accountMin: string;
        accountNumbersOnly: string;
        holderMin: string;
        holderUppercase: string;
    };
    status: {
        initVerifyFailed: string;
        addSuccess: string;
        addFailed: string;
        setDefaultSuccess: string;
        setDefaultFailed: string;
        updateSuccess: string;
        updateFailed: string;
        deleteSuccess: string;
        deleteFailed: string;
    };
}

/**
 * Address module translations
 */
export interface AddressTranslation {
    list: {
        title: string;
        titleSelection: string;
        addTitle: string;
        emptyTitle: string;
        emptySubtitle: string;
        deleteSuccess: string;
        addSuccess: string;
        updateSuccess: string;
        limitError: string;
        defaultBadge: string;
        cannotDeleteDefault: string;
    };
    form: {
        addTitle: string;
        editTitle: string;
        country: {
            label: string;
            placeholder: string;
            error: string;
        };
        recipientName: {
            label: string;
            placeholder: string;
            error: string;
        };
        phone: {
            label: string;
            placeholder: string;
            error: string;
        };
        province: {
            label: string;
            placeholder: string;
            error: string;
        };
        district: {
            label: string;
            placeholder: string;
            error: string;
        };
        ward: {
            label: string;
            placeholder: string;
            error: string;
            hint: string;
        };
        streetAddress: {
            label: string;
            placeholder: string;
            error: string;
        };
        label: {
            title: string;
            home: string;
            work: string;
            other: string;
        };
        isDefault: {
            label: string;
            description: string;
        };
        messages: {
            loading: string;
            updateSuccess: string;
            updateError: string;
            addError: string;
            addSuccess: string;
            uploadSuccess: string;
            uploadError: string;
            unsavedChangesTitle: string;
            unsavedChangesMessage: string;
            stay: string;
            exit: string;
        };
        actions: {
            submitAdd: string;
            submitUpdate: string;
            submitting: string;
            delete: string;
            deleting: string;
        };
        search: {
            label: string;
            placeholder: string;
            searching: string;
            noResults: string;
        };
    };
    picker: {
        locationTitle: string;
        provinceTitle: string;
        districtTitle: string;
        wardTitle: string;
        countryTitle: string;
        provincePlaceholder: string;
        districtPlaceholder: string;
        wardPlaceholder: string;
        results: string;
        emptyText: string;
        notFound: string;
    };
    deleteAlert: {
        title: string;
        message: string;
        confirm: string;
        cancel: string;
        error: string;
    };
}

/**
 * Shop module translations
 */
export interface ShopTranslation {
    vouchers: {
        title: string;
        expiryLabel: string;
        collect: string;
    };
    categories: {
        empty: string;
    };
}

/**
 * Video module translations
 */
export interface VideoTranslation {
    loadError: string;
    reviewProduct: string;
    following: string;
    forYou: string;
    priceTemplate: string;
}

/**
 * Wishlist module translations
 */
export interface WishlistTranslation {
    title: string;
    productCount: string;
    targetPriceMet: string;
    targetPriceGoal: string;
    isPublic: string;
    tabs: {
        priceTarget: string;
        private: string;
        public: string;
    };
    empty: {
        title: string;
        subtitle: string;
        collectionEmpty: string;
        addProduct: string;
        productTitle: string;
    };
    error: {
        loadFailed: string;
        retry: string;
        loading: string;
        errorTitle: string;
        limitReached: string;
    };
    filter: {
        all: string;
        urgent: string;
        priceMet: string;
    };
    share: {
        message: string;
        error: string;
    };
    cart: {
        addSuccess: string;
    };
    snackbar: {
        removed: string;
        undo: string;
    };
    create: {
        title: string;
        nameLabel: string;
        namePlaceholder: string;
        publicLabel: string;
        publicHint: string;
        cancel: string;
        submit: string;
        creating: string;
        success: string;
        newButton: string;
    };
    manage: {
        rename: string;
        makePublic: string;
        makePrivate: string;
        publicHint: string;
        privateHint: string;
        share: string;
        delete: string;
        cancel: string;
        deleteConfirmTitle: string;
        deleteConfirmMessage: string;
        deleteSuccess: string;
        renameConfirm: string;
        renameSuccess: string;
        makePublicSuccess: string;
        makePrivateSuccess: string;
    };
    editItem: {
        title: string;
        currentPriceLabel: string;
        desiredPriceLabel: string;
        desiredPricePlaceholder: string;
        notesLabel: string;
        notesPlaceholder: string;
        priorityLabel: string;
        priorityNormal: string;
        priorityNormalDesc: string;
        priorityUrgent: string;
        priorityUrgentDesc: string;
        wishlistLabel: string;
        save: string;
        saving: string;
        cancel: string;
        success: string;
        clearPrice: string;
    };
    publicTab: {
        searchPlaceholder: string;
        emptySearch: string;
        popularTitle: string;
        latestTitle: string;
    };
    priceTargetTab: {
        emptyTitle: string;
        emptySubtitle: string;
        manageButton: string;
        successMessage: string;
        deepDiscountBadge: string;
    };
}

/**
 * Loyalty module translations
 */
export interface LoyaltyTranslation {
    title: string;
    hero: {
        totalCoinsLabel: string;
        unit: string;
        shopCountLabel: string;
        expiringLabel: string;
    };
    shopSection: {
        title: string;
    };
    emptyState: {
        title: string;
        message: string;
        shopNowBtn: string;
    };
    howItWorks: {
        title: string;
        steps: {
            buy: { title: string; desc: string };
            accumulate: { title: string; desc: string };
            use: { title: string; desc: string };
        };
    };
    shopDetail: {
        title: string;
        tabs: {
            batches: string;
            history: string;
        };
        hero: {
            availableCoins: string;
            equivalent: string;
            warningMsg: string;
            urgentText: string;
            buyNow: string;
            defaultShopName: string;
        };
        batchesTab: {
            empty: string;
            available: string;
            unit: string;
        };
        historyTab: {
            expired: string;
            empty: string;
        };
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
    myReviews: MyReviewTranslation;
    bank: BankTranslation;
    address: AddressTranslation;
    video: VideoTranslation;
    wishlist: WishlistTranslation;
    shop: ShopTranslation;
    loyalty: LoyaltyTranslation;
}
