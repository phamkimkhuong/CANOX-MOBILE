import { WishlistTranslation } from '../types';

export const WISHLIST_STRINGS: WishlistTranslation = {
    title: 'Wishlist',
    productCount: 'items',
    targetPriceMet: 'Target reached!',
    targetPriceGoal: 'Goal: {{price}}',
    isPublic: 'Public',
    empty: {
        title: 'No items yet',
        subtitle: 'Discover and add your favorite items to this collection!',
        collectionEmpty: 'Collection is empty',
        addProduct: 'Add items',
        productTitle: 'is empty',
    },
    error: {
        loadFailed: 'Failed to load collection',
        retry: 'Retry',
        loading: 'Loading...',
        errorTitle: 'Error',
    },
    filter: {
        all: 'All',
        urgent: 'High priority',
        priceMet: 'Goal met',
    },
    share: {
        message: 'Check out my wishlist "{{name}}": {{url}}',
        error: 'Cannot share wishlist',
    },
    cart: {
        addSuccess: 'Added to cart',
    },
    snackbar: {
        removed: 'Removed "{{name}}"',
        undo: 'Undo',
    },
};
