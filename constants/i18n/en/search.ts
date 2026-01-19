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
};
