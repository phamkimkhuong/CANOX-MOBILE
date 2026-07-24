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
        brandName: 'Brand',
        origin: 'Origin',
        manufacturers: 'Manufacturers',
        productType: 'Product Type',
        madeToOrder: 'Pre-order',
        inStock: 'In Stock',
        warrantyTitle: 'Warranty & Inspection Policy',
        warrantyType: 'Warranty Type',
        warrantyDuration: 'Warranty Duration',
        warrantyActivation: 'Activation Method',
        warrantyInspection: 'Inspection on Delivery',
        inspectionAllowed: 'Inspection allowed',
        inspectionNotAllowed: 'Inspection not allowed',
        conditionsTitle: 'Warranty & Return Conditions',
        typeManufacturer: 'Manufacturer Warranty',
        typeShop: 'Shop Warranty',
        typeNone: 'No Warranty',
        typeDefault: 'Standard Warranty',
        activationInvoice: 'Via purchase invoice',
        activationElectronic: 'Electronic warranty',
        activationDefault: 'Contact shop',
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
        flashSaleBadge: 'Flash Sale',
        flashSaleCandidateBadge: 'Has flash sale',
        promoBadge: 'On offer',
        promoCandidateBadge: 'Has offer',
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
        completedOrders: 'Completed Orders',
        joined: 'Joined',
        notAvailable: 'Not yet',
        products: 'Products',
        viewShop: 'View Shop',
        defaultResponseTime: 'A few minutes',
        durationDays: '{{count}}d',
        durationMonths: '{{count}}mo',
        durationYears: '{{count}}y',
        online: 'Online',
    },

    // === Product Info ===
    info: {
        reviews: 'Reviews',
        sold: 'Sold',
        discount: 'Off',
        soldCountTemplate: 'Sold {{soldCount}}',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'FLASH SALE',
        soldOut: 'Almost sold out',
        selling: 'Selling fast',
        soldPrefix: 'Sold',
        variantScopeHint: 'Flash Sale applies to selected variations only',
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

    // === Order Protection ===
    orderProtection: {
        cardTitle: 'TCano order protection policy',
        cardSubtitle: 'Orders are protected when paid and processed through the TCano platform',
        sheetTitle: 'Order protection',
        sheetHeading: 'TCano order protection policy',
        sheetIntro: 'TCano helps protect orders when the transaction is paid and processed through the platform.',
        learnMore: 'Learn more',
        items: {
            payment: {
                summaryTitle: 'Secure payment',
                title: 'Secure payment',
                description: 'Choose local payment methods, credit/debit cards, bank transfers, or e-wallets.\nAll transactions through TCano are protected by SSL encryption and strict PCI DSS data security protocols.',
                policyTitle: 'Payment Policy',
            },
            shipping: {
                summaryTitle: 'Delivery tracking',
                title: 'Delivery tracking',
                description: 'TCano helps track order status from placement until successful delivery.',
                policyTitle: 'Shipping Policy',
            },
            return: {
                summaryTitle: 'Return & Refund',
                title: 'Returns by policy',
                description: 'Submit a return/refund request if the order has issues, is incorrect, or incurs damage upon arrival.',
                policyTitle: 'Return & Refund Policy',
            },
            support: {
                summaryTitle: '24/7 Support',
                title: '24/7 Claim support',
                description: 'Access TCano\'s 24/7 online help center or connect with support staff for assistance and resolution of any order-related issues.',
                policyTitle: 'Help Center',
            },
        },
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
    shipping: {
        title: 'Delivery address',
        addressRequired: 'Choose an address to check shipping compatibility',
        internationalOnly: 'This product supports international shipping only. Switch to an international address.',
        domesticOnly: 'This product supports domestic shipping only. Switch to a domestic address.',
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
        platformVoucher: 'TCano Voucher',
        finalSubtotal: 'Subtotal',
        legalNote: '* Final price may vary depending on shipping fees and other offers at checkout.',
        afterVoucher: 'Price after voucher',
    },
    // === Wishlist Notices in Card ===
    wishlist: {
        targetPrice: 'Target Price',
        setupTargetPrice: 'Set a Target Price (Hold)',
        hasNotes: 'Has Notes',
    },
    // === Packaging Info ===
    packaging: {
        title: 'Packaging',
        dimensions: 'Dimensions',
        weight: 'Weight',
    },
};
