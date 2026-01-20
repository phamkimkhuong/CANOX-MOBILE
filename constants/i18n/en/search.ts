/**
 * ==============================================
 * SEARCH TRANSLATIONS - English
 * ==============================================
 */

import type { SearchTranslation } from '../types';

export const SEARCH_STRINGS: SearchTranslation = {
    header: {
        placeholder: 'What are you looking for today?',
        placeholderTyping: 'Search for products, shops...',
        cancel: 'Cancel',
    },
    recent: {
        title: 'Recent Searches',
        clearAll: 'Clear All',
        empty: 'No search history',
    },
    hot: {
        title: 'Hot Searches',
        badge: 'HOT',
    },
    suggestions: {
        searchIn: 'Search in',
        shopPrefix: 'Shop',
        categoryPrefix: 'Category',
        noResults: 'No suggestions found',
    },
    actions: {
        search: 'Search',
        searchByImage: 'Search by Image',
        searchByVoice: 'Search by Voice',
    },
    error: {
        loadFailed: 'Failed to load data. Please try again.',
    },
    // Search Results Screen
    results: {
        title: 'Search Results',
        count: '{{count}} product',
        countPlural: '{{count}} products',
        filter: 'Filter',
        filterCount: 'Filter ({{count}})',
    },
    sort: {
        relevance: 'Relevance',
        newest: 'Newest',
        bestSelling: 'Best Selling',
        price: 'Price',
        priceAsc: 'Price Low to High',
        priceDesc: 'Price High to Low',
    },
    quickFilter: {
        freeship: 'Free Shipping',
        express: 'Express',
        rating4Plus: '4 Stars+',
        mall: 'Mall',
        voucher: 'Has Voucher',
    },
    filterModal: {
        title: 'Filter',
        reset: 'Reset',
        apply: 'Apply',
        priceRange: 'Price Range',
        priceMin: 'Min Price',
        priceMax: 'Max Price',
        rating: 'Rating',
        ratingFrom: 'From {{rating}} stars',
        category: 'Category',
        location: 'Location',
        allLocations: 'All',
    },
    empty: {
        title: 'No products found',
        subtitle: 'No results for "{{keyword}}"',
        suggestion: 'You might like',
        tryAgain: 'Try another search',
        adjustFilters: 'Or adjust filters',
    },
};
