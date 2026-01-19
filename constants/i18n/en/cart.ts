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
    footer: {
        selectAll: 'All',
        total: 'Total payment',
        checkout: 'Checkout',
        savings: 'Save {{amount}}',
        checkoutWithCount: 'Checkout ({{count}})',
    },
    item: {
        variation: 'Variation',
        delete: 'Delete',
        outOfStock: 'Out of stock',
        findSimilar: 'Find similar',
        selectVariation: 'Select variation',
    },
    status: {
        syncing: 'Updating latest prices...',
        rebuySuccess: 'Rebuy successful',
        rebuySuccessDetail: 'Products have been added to your cart',
    },
    error: {
        loadFailed: 'Could not load cart',
        tryAgainLater: 'Please try again later',
        retryButton: 'Retry',
    },
};
