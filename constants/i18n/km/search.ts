/**
 * ==============================================
 * SEARCH TRANSLATIONS - Khmer
 * ==============================================
 */

import type { SearchTranslation } from '../types';

export const SEARCH_STRINGS: SearchTranslation = {
    header: {
        placeholder: 'តើអ្នកកំពុងស្វែងរកអ្វីថ្ងៃនេះ?',
        placeholderTyping: 'ស្វែងរកផលិតផល, ហាង...',
        cancel: 'បោះបង់',
    },
    recent: {
        title: 'ការស្វែងរកថ្មីៗ',
        clearAll: 'លុបចេញទាំងអស់',
        empty: 'មិនមានប្រវត្តិស្វែងរកទេ',
    },
    hot: {
        title: 'ការស្វែងរកពេញនិយម',
        badge: 'HOT',
    },
    suggestions: {
        searchIn: 'ស្វែងរកក្នុង',
        shopPrefix: 'ហាង',
        categoryPrefix: 'ប្រភេទ',
        noResults: 'រកមិនឃើញលទ្ធផល',
    },
    actions: {
        search: 'ស្វែងរក',
        searchByImage: 'ស្វែងរកដោយរូបភាព',
        searchByVoice: 'ស្វែងរកដោយសំឡេង',
    },
    error: {
        loadFailed: 'បរាជ័យក្នុងការផ្ទុកទិន្នន័យ។ សូមព្យាយាមម្តងទៀត។',
    },
    // Search Results Screen
    results: {
        title: 'លទ្ធផលស្វែងរក',
        count: '{{count}} ផលិតផល',
        countPlural: '{{count}} ផលិតផល',
        filter: 'តម្រង',
        filterCount: 'តម្រង ({{count}})',
    },
    sort: {
        relevance: 'ពាក់ព័ន្ធបំផុត',
        newest: 'ថ្មីបំផុត',
        bestSelling: 'លក់ដាច់បំផុត',
        price: 'តម្លៃ',
        priceAsc: 'តម្លៃទាបទៅខ្ពស់',
        priceDesc: 'តម្លៃខ្ពស់ទៅទាប',
    },
    quickFilter: {
        freeship: 'ដឹកជញ្ជូនឥតគិតថ្លៃ',
        express: 'លឿនរហ័ស',
        rating4Plus: 'ផ្កាយ 4 ឡើង',
        mall: 'Mall',
        voucher: 'មានប័ណ្ណបញ្ចុះតម្លៃ',
    },
    filterModal: {
        title: 'ចម្រោះ',
        reset: 'កំណត់ឡើងវិញ',
        apply: 'អនុវត្ត',
        priceRange: 'ចន្លោះតម្លៃ',
        priceMin: 'តម្លៃទាបបំផុត',
        priceMax: 'តម្លៃខ្ពស់បំផុត',
        rating: 'ការវាយតម្លៃ',
        ratingFrom: 'ចាប់ពីផ្កាយ {{rating}}',
        category: 'ប្រភេទ',
        location: 'ទីតាំង',
        allLocations: 'ទាំងអស់',
    },
    empty: {
        title: 'រកមិនឃើញផលិតផលទេ',
        subtitle: 'គ្មានលទ្ធផលសម្រាប់ "{{keyword}}"',
        suggestion: 'អ្នកអាចនឹងចូលចិត្ត',
        tryAgain: 'សាកល្បងស្វែងរកផ្សេងទៀត',
        adjustFilters: 'ឬកែតម្រូវចម្រោះ',
    },
};
