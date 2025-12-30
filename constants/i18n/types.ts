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
