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
        endsIn: 'Ends in',
        soldOut: 'Almost sold out',
        selling: 'Selling fast',
        soldPrefix: 'Sold',
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
};
