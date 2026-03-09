import { CartTranslation } from '../types';

export const CART_STRINGS: CartTranslation = {
    header: {
        title: 'Cart',
        edit: 'Edit',
        done: 'Done',
        viewShop: 'View shop {{shopName}}',
    },
    empty: {
        title: 'Your cart is empty',
        subtitle: 'Go add some products to your cart!',
        shopNow: 'SHOP NOW',
    },
    authRequired: {
        title: 'Your Shopping Cart is empty',
        login: 'Login Now',
    },
    footer: {
        selectAll: 'All',
        total: 'Total payment',
        checkout: 'Checkout',
        savings: 'Save {{amount}}',
        checkoutWithCount: 'Checkout ({{count}})',
        moveToWishlist: 'Move to Wishlist',
        deleteSelected: 'Delete',
    },
    confirmations: {
        deleteSelected: {
            title: 'Remove items',
            message: 'Are you sure you want to remove {{count}} selected items?',
        },
    },
    item: {
        variation: 'Variation',
        delete: 'Delete',
        outOfStock: 'Out of stock',
        findSimilar: 'Find similar',
        selectVariation: 'Select variation',
        unsupportedRegion: 'Does not support shipping to {{location}}.',
        promoStockWarning: 'Only {{count}} items left at this price',
    },
    status: {
        syncing: 'Updating latest prices...',
        rebuySuccess: 'Rebuy successful',
        rebuySuccessDetail: 'Products have been added to your cart',
        addSuccess: 'Added to cart',
        addFailed: 'Add to cart failed',
    },
    error: {
        loadFailed: 'Could not load cart',
        tryAgainLater: 'Please try again later',
        retryButton: 'Retry',
    },
};
