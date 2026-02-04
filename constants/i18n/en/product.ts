import { ProductTranslation } from '../types';

export const PRODUCT_STRINGS: ProductTranslation = {
    // === Product Description ===
    description: {
        title: 'Product Description',
        empty: 'No description yet',
        viewMore: 'View more',
        collapse: 'Collapse',
    },

    // === Product Specs ===
    specs: {
        title: 'Specifications',
        viewMore: 'View details',
        collapse: 'Collapse',
    },

    // === Variant Selector ===
    variant: {
        label: 'Variation',
        placeholder: 'Select variation',
        confirm: 'Confirm',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        stock: 'Stock',
        quantity: 'Quantity',
    },

    // === Sticky Bottom Bar ===
    bottomBar: {
        chat: 'Chat',
        shop: 'Shop',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        outOfStock: 'Out of Stock',
        selectVariant: 'Select variation',
    },

    // === Shop Info ===
    shop: {
        rating: 'Rating',
        responseRate: 'Response Rate',
        responseTime: 'Response Time',
        products: 'Products',
        viewShop: 'View Shop',
        defaultResponseTime: 'A few minutes',
        online: 'Online',
    },

    // === Product Info ===
    info: {
        reviews: 'Reviews',
        sold: 'Sold',
        discount: 'Off',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'FLASH SALE',
        soldOut: 'Almost sold out',
        selling: 'Selling fast',
        soldPrefix: 'Sold',
        campaigns: {
            flashSale: 'FLASH SALE',
            megaSale: 'MEGA SALE',
            dailyDeal: '🎁 DAILY DEAL',
            shopSale: 'SHOP SALE',
            shopPromotion: 'SHOP PROMOTION',
        },
    },

    // === Reviews ===
    reviews: {
        title: 'Product Ratings',
        viewAll: 'View all',
        noReviews: 'No ratings yet',
        beFirst: 'Be the first to rate this product',
        reviewCount: 'ratings',
        filterAll: 'All',
        filter5Star: '5 Stars',
        filterWithMedia: 'With Media',
        newest: 'Newest',
        viewAllReviews: 'View all reviews for more details about the product',
        loading: 'Loading reviews...',
    },

    // === Gallery ===
    gallery: {
        noImages: 'No images available',
    },

    // === Error States ===
    error: {
        loadFailed: 'Failed to load product',
        generic: 'An error occurred',
        retry: 'Retry',
        notFound: 'Product not found',
        notFoundDetail: 'This product is currently unavailable or has been removed.',
        home: 'Home',
        authRequiredTitle: 'Login Required',
        authRequiredChat: 'Please login to start chatting',
        authRequiredCart: 'Please login to add this product to your cart',
        authRequiredBuyNow: 'Please login to proceed with purchase',
        authRequiredGeneric: 'Please login to perform this action',
    },

    // === Navigation ===
    navigation: {
        title: 'Product Details',
    },
    related: {
        title: 'You may also like',
    },

    // === Badges ===
    badges: {
        mall: 'Mall',
        international: 'International',
    },
    share: {
        msgTemplate: 'Check out this product on Calatha: {{name}}\n{{url}}',
    },
    report: {
        title: 'Report Product',
        success: 'Thank you for your report. We will review this product as soon as possible.',
        reasons: {
            fake: 'Counterfeit/Fake item',
            prohibited: 'Prohibited item',
            offensive: 'Offensive content',
            scam: 'Spam or Scam',
            misleading: 'Misleading information',
            other: 'Other reasons',
        },
    },
    priceBreakdown: {
        title: 'Price Details',
        basePrice: 'Product Price',
        productDiscount: 'Product Discount',
        shopVoucher: 'Shop Voucher',
        platformVoucher: 'CanoX Voucher',
        finalSubtotal: 'Subtotal',
        legalNote: '* Final price may vary depending on shipping fees and other offers at checkout.',
        afterVoucher: 'Price after voucher',
    },
};
