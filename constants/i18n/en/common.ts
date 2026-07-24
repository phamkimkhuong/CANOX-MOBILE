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
        support: '@TCANO E-Commerce Support',
    },
    update: {
        forceTitle: 'App Update Required',
        forceDescription: 'Your current version is no longer supported. Please update to continue using the app.',
        softTitle: 'New version available!',
        softDescription: 'Update now to enjoy new features and improved performance.',
        updateNow: 'Update Now',
        later: 'Maybe Later',
    },
    crash: {
        debugTitle: 'Debug details',
        scope: {
            app: 'App',
            group: 'Area',
            screen: 'Screen',
            section: 'Content',
        },
        app: {
            title: 'The app is temporarily unavailable',
            message: 'The app UI could not be rendered right now. Please try again to re-render the application.',
        },
        tabs: {
            title: 'The tab area is temporarily unavailable',
            message: 'The main tab area cannot be displayed right now. Please try again.',
        },
        main: {
            title: 'The navigation area is temporarily unavailable',
            message: 'The screen you opened cannot be displayed right now. Please try again to recover this area.',
        },
        auth: {
            title: 'The sign-in area is temporarily unavailable',
            message: 'The authentication screen cannot be displayed right now. Please try again in a few seconds.',
        },
        home: {
            title: 'Home is temporarily unavailable',
            message: 'Home content cannot be displayed right now. Please try again to re-render this screen.',
        },
        cart: {
            title: 'Cart is temporarily unavailable',
            message: 'Your cart cannot be displayed right now. Please try again to recover this screen.',
        },
        checkout: {
            title: 'Checkout is temporarily unavailable',
            message: 'The checkout screen cannot be displayed right now. Please try again to recover this checkout session.',
        },
        productDetail: {
            title: 'Product details are temporarily unavailable',
            message: 'Product details cannot be displayed right now. Please try again to re-render this screen.',
        },
        orderDetail: {
            title: 'Order details are temporarily unavailable',
            message: 'Order details cannot be displayed right now. Please try again to re-render this screen.',
        },
        chatDetail: {
            title: 'Chat is temporarily unavailable',
            message: 'This conversation cannot be displayed right now. Please try again to recover this screen.',
        },
        section: {
            title: 'Display error',
            message: 'An error occurred while rendering this content. Please try again.',
        },
    },
    sectionState: {
        secondaryDataError: {
            title: 'This section could not be loaded',
            message: 'Supplementary data is temporarily unavailable. The main content remains usable.',
            actionLabel: 'Reload',
        },
        backgroundError: {
            title: 'Showing the latest available data',
            message: 'The newest update did not finish successfully. You can continue with the current data.',
            actionLabel: 'Update again',
        },
        businessGuidance: {
            title: 'Not ready yet',
            message: 'The current state does not meet the conditions required for this action.',
            actionLabel: 'View guidance',
        },
        empty: {
            title: 'No content yet',
            message: 'There is no data to show in this section right now.',
            actionLabel: 'Reload',
        },
        unavailable: {
            title: 'Temporarily unavailable',
            message: 'This section cannot be displayed right now. Other content is still available.',
            actionLabel: 'Try again',
        },
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
