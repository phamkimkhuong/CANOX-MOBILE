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
        stock: string;
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