import { ProductTranslation } from '../types';

export const PRODUCT_STRINGS: ProductTranslation = {
    // === Product Description ===
    description: {
        title: 'ការពិពណ៌នាអំពីផលិតផល',
        empty: 'មិនទាន់មានការពិពណ៌នាទេ',
        viewMore: 'មើលបន្ថែម',
        collapse: 'បង្រួម',
    },

    // === Product Specs ===
    specs: {
        title: 'លក្ខណៈបច្ចេកទេស',
        viewMore: 'មើលព័ត៌មានលម្អិត',
        collapse: 'បង្រួម',
    },

    // === Variant Selector ===
    variant: {
        label: 'ជម្រើសទំនិញ',
        placeholder: 'ជ្រើសរើសជម្រើសទំនិញ',
        confirm: 'បញ្ជាក់',
        addToCart: 'បន្ថែមទៅកន្ត្រក',
        buyNow: 'ទិញឥឡូវនេះ',
        stock: 'ក្នុងស្តុក',
        quantity: 'បរិមាណ',
        flashSaleBadge: 'Flash Sale',
        flashSaleCandidateBadge: 'មាន flash sale',
        promoBadge: 'កំពុងផ្តល់ជូន',
        promoCandidateBadge: 'មានការផ្តល់ជូន',
    },

    // === Sticky Bottom Bar ===
    bottomBar: {
        chat: 'ឆាត',
        shop: 'ហាង',
        addToCart: 'បន្ថែមទៅកន្ត្រក',
        buyNow: 'ទិញឥឡូវនេះ',
        outOfStock: 'អស់ពីស្តុក',
        selectVariant: 'ជ្រើសរើសជម្រើសទំនិញ',
    },

    // === Shop Info ===
    shop: {
        rating: 'ការវាយតម្លៃ',
        responseRate: 'អត្រាឆ្លើយតប',
        responseTime: 'ពេលវេលាឆ្លើយតប',
        products: 'ផលិតផល',
        viewShop: 'មើលហាង',
        defaultResponseTime: 'ប៉ុន្មាននាទី',
        online: 'កំពុងអនឡាញ',
    },

    // === Product Info ===
    info: {
        reviews: 'ការវាយតម្លៃអតិថិជន',
        sold: 'លក់បាន',
        discount: 'បញ្ចុះតម្លៃ',
        soldCountTemplate: 'លក់បាន {{soldCount}}',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'FLASH SALE',
        soldOut: 'ជិតអស់ហើយ',
        selling: 'លក់លឿន',
        soldPrefix: 'លក់បាន',
        variantScopeHint: 'Flash Sale អនុវត្តចំពោះតែជម្រើសទំនិញដែលបានជ្រើសរើសប៉ុណ្ណោះ',
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
        title: 'ការវាយតម្លៃផលិតផល',
        viewAll: 'មើលទាំងអស់',
        noReviews: 'មិនទាន់មានការវាយតម្លៃទេ',
        beFirst: 'ក្លាយជាអ្នកដំបូងដែលវាយតម្លៃផលិតផលនេះ',
        reviewCount: 'ការវាយតម្លៃ',
        filterAll: 'ទាំងអស់',
        filter5Star: 'ផ្កាយ 5',
        filterWithMedia: 'មានមេឌៀ',
        newest: 'ថ្មីបំផុត',
        viewAllReviews: 'មើលការវាយតម្លៃទាំងអស់សម្រាប់ព័ត៌មានលម្អិតបន្ថែមអំពីផលិតផល',
        loading: 'កំពុងផ្ទុកការវាយតម្លៃ...',
    },

    // === Gallery ===
    gallery: {
        noImages: 'មិនមានរូបភាពទេ',
    },

    // === Error States ===
    error: {
        loadFailed: 'បរាជ័យក្នុងការផ្ទុកផលិតផល',
        generic: 'មានកំហុសមួយបានកើតឡើង',
        retry: 'ព្យាយាមម្តងទៀត',
        notFound: 'រកមិនឃើញផលិតផល',
        notFoundDetail: 'ផលិតផលនេះបច្ចុប្បន្នមិនមាន ឬត្រូវបានដកចេញ។',
        home: 'ទំព័រដើម',
        authRequiredTitle: 'ត្រូវការចូលគណនី',
        authRequiredChat: 'សូមចូលគណនីដើម្បីចាប់ផ្តើមឆាត',
        authRequiredCart: 'សូមចូលគណនីដើម្បីបន្ថែមផលិតផលនេះទៅកន្ត្រក',
        authRequiredBuyNow: 'សូមចូលគណនីដើម្បីបន្តការទិញ',
        authRequiredGeneric: 'សូមចូលគណនីដើម្បីអនុវត្តសកម្មភាពនេះ',
    },

    // === Navigation ===
    navigation: {
        title: 'ព័ត៌មានលម្អិតផលិតផល',
    },
    related: {
        title: 'អ្នកក៏អាចចូលចិត្តផងដែរ',
    },

    // === Badges ===
    badges: {
        mall: 'Mall',
        international: 'អន្តរជាតិ',
    },
    shipping: {
        title: 'អាសយដ្ឋានដឹកជញ្ជូន',
        addressRequired: 'ជ្រើសរើសអាសយដ្ឋានដើម្បីពិនិត្យភាពឆបគ្នានៃការដឹកជញ្ជូន',
        internationalOnly: 'ផលិតផលនេះគាំទ្រតែការដឹកជញ្ជូនអន្តរជាតិប៉ុណ្ណោះ។ ប្តូរទៅអាសយដ្ឋានអន្តរជាតិ។',
        domesticOnly: 'ផលិតផលនេះគាំទ្រតែការដឹកជញ្ជូនក្នុងស្រុកប៉ុណ្ណោះ។ ប្តូរទៅអាសយដ្ឋានក្នុងស្រុក។',
    },
    share: {
        msgTemplate: 'ពិនិត្យផលិតផលនេះនៅលើ Calatha៖ {{name}}\n{{url}}',
    },
    report: {
        title: 'រាយការណ៍ពីផលិតផល',
        success: 'សូមអរគុណចំពោះការរាយការណ៍របស់អ្នក។ យើងនឹងពិនិត្យផលិតផលនេះឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន។',
        reasons: {
            fake: 'ទំនិញក្លែងក្លាយ',
            prohibited: 'ទំនិញហាមឃាត់',
            offensive: 'មាតិកាមិនសមរម្យ',
            scam: 'Spam ឬ​ Scam',
            misleading: 'ព័ត៌មានបំភាន់',
            other: 'មូលហេតុផ្សេងៗ',
        },
    },
    priceBreakdown: {
        title: 'ព័ត៌មានលម្អិតអំពីតម្លៃ',
        basePrice: 'តម្លៃផលិតផល',
        productDiscount: 'ការបញ្ចុះតម្លៃផលិតផល',
        shopVoucher: 'ប័ណ្ណបញ្ចុះតម្លៃរហាង',
        platformVoucher: 'ប័ណ្ណបញ្ចុះតម្លៃ CanoX',
        finalSubtotal: 'សរុប',
        legalNote: '* តម្លៃចុងក្រោយអាចប្រែប្រួលអាស្រ័យលើថ្លៃដឹកជញ្ជូន និងការផ្តល់ជូនផ្សេងៗនៅពេលទូទាត់ប្រាក់។',
        afterVoucher: 'តម្លៃបន្ទាប់ពីប័ណ្ណបញ្ចុះតម្លៃ',
    },
    // === Wishlist Notices in Card ===
    wishlist: {
        targetPrice: 'តម្លៃគោលដៅ',
        setupTargetPrice: 'កំណត់តម្លៃគោលដៅ (សង្កត់)',
        hasNotes: 'មានចំណាំ',
    },
    // === Packaging Info ===
    packaging: {
        title: 'ការវេចខ្ចប់',
        dimensions: 'វិមាត្រ',
        weight: 'ទម្ងន់',
    },
};
