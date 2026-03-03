import { CommonTranslation } from '../types';

export const COMMON_STRINGS: CommonTranslation = {
    actions: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        back: 'Back',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        done: 'Done',
        next: 'Next',
        retry: 'Retry',
        copy: 'Copy',
        viewNow: 'View Now',
        seeAll: 'See All',
        seeMore: 'See More',
        yes: 'Yes',
        no: 'No',
        quantityTemplate: 'x{{count}}'
    },
    status: {
        loading: 'Loading...',
        success: 'Success',
        error: 'Error occurred',
        empty: 'No data',
        verified: 'Verified',
        unverified: 'Unverified',
    },
    bottomTab: {
        home: 'Home',
        wishlist: 'Wishlist',
        category: 'Category',
        video: 'Video',
        chat: 'Chat',
        notify: 'Notice',
        me: 'Me',
    },
    popup: {
        skipToday: "Don't show again today",
    },
    maintenance: {
        title: 'System Under Maintenance',
        description: 'We are currently upgrading our system to provide you with the best experience. Please come back in a few minutes.',
        retryButton: 'Try Again Now',
        contactSupport: 'Contact Support',
        support: '@CANOX E-Commerce Support',
    },
    update: {
        forceTitle: 'App Update Required',
        forceDescription: 'Your current version is no longer supported. Please update to continue using the app.',
        softTitle: 'New version available!',
        softDescription: 'Update now to enjoy new features and improved performance.',
        updateNow: 'Update Now',
        later: 'Maybe Later',
    },
    stateView: {
        network: {
            title: 'No connection',
            message: 'Please check your internet connection and try again.',
            actionLabel: 'Retry',
        },
        server: {
            title: 'System Error',
            message: 'An error occurred, we are fixing it. Please try again later.',
            actionLabel: 'Retry',
        },
        notFound: {
            title: 'Not found',
            message: 'Data does not exist or has been deleted.',
            actionLabel: 'Go back',
        },
        empty: {
            title: 'No data',
            message: 'The list is empty.',
            actionLabel: 'Reload',
        },
        forbidden: {
            title: 'Access Denied',
            message: 'You do not have permission to view this content.',
            actionLabel: 'Go back',
        },
        actions: {
            home: 'Go back home',
            errorCode: 'Error code: {{code}}',
        },
    },
};
