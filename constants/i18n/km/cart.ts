import { CartTranslation } from '../types';

export const CART_STRINGS: CartTranslation = {
    header: {
        title: 'កន្ត្រក',
        edit: 'កែប្រែ',
        done: 'រួចរាល់',
        viewShop: 'មើលហាង {{shopName}}',
    },
    empty: {
        title: 'កន្ត្រករបស់អ្នកទទេ',
        subtitle: 'ទៅបន្ថែមផលិតផលខ្លះទៅក្នុងកន្ត្រករបស់អ្នក!',
        shopNow: 'ទិញឥឡូវនេះ',
    },
    authRequired: {
        title: 'កន្ត្រកទិញទំនិញរបស់អ្នកទទេ',
        login: 'ចូលគណនីឥឡូវនេះ',
    },
    footer: {
        selectAll: 'ទាំងអស់',
        total: 'ការទូទាត់សរុប',
        checkout: 'ទូទាត់ប្រាក់',
        savings: 'សន្សំ {{amount}}',
        checkoutWithCount: 'ទូទាត់ប្រាក់ ({{count}})',
        moveToWishlist: 'ផ្លាស់ទីទៅបញ្ជីចំណូលចិត្ត',
        deleteSelected: 'លុប',
    },
    confirmations: {
        deleteSelected: {
            title: 'ដកទំនិញចេញ',
            message: 'តើអ្នកប្រាកដជាចង់ដកទំនិញដែលបានជ្រើសរើសចំនួន {{count}} ចេញមែនទេ?',
        },
    },
    item: {
        variation: 'ជម្រើស',
        delete: 'លុប',
        outOfStock: 'អស់ពីស្តុក',
        findSimilar: 'ស្វែងរកស្រដៀងគ្នា',
        selectVariation: 'ជ្រើសរើសជម្រើស',
        unsupportedRegion: 'មិនគាំទ្រការដឹកជញ្ជូនទៅកាន់ {{location}} ទេ។',
        promoStockWarning: 'សល់តែ {{count}} មុខប៉ុណ្ណោះក្នុងតម្លៃនេះ',
    },
    status: {
        syncing: 'កំពុងធ្វើបច្ចុប្បន្នភាពតម្លៃចុងក្រោយ...',
        promotionSyncing: 'កំពុងធ្វើបច្ចុប្បន្នភាពតម្លៃ...',
        rebuySuccess: 'ទិញឡើងវិញបានជោគជ័យ',
        rebuySuccessDetail: 'ផលិតផលត្រូវបានបន្ថែមទៅកន្ត្រករបស់អ្នក',
        addSuccess: 'បានបន្ថែមទៅកន្ត្រក',
        addFailed: 'បរាជ័យក្នុងការបន្ថែមទៅកន្ត្រក',
    },
    error: {
        loadFailed: 'មិនអាចផ្ទុកកន្ត្រកបានទេ',
        tryAgainLater: 'សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ',
        retryButton: 'ព្យាយាមម្តងទៀត',
    },
};
