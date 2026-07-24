import { NotificationTranslation } from '../types';

export const NOTIFICATION_STRINGS: NotificationTranslation = {
    header: {
        title: 'Notifications',
        markAllRead: 'Mark all as read',
    },
    filters: {
        all: 'All',
        order: 'Orders',
        promo: 'Promotions',
        product: 'Products',
        shipping: 'Shipping',
        wallet: 'Wallet & Services',
        system: 'System',
    },
    empty: {
        title: 'No notifications yet',
        subtitle: 'You will receive updates about your orders and promotions here',
        subtitleWithFilter: 'You have no notifications in "{{filter}}"',
    },
    sections: {
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This week',
        earlier: 'Earlier',
    },
    errors: {
        markAllAsReadFailed: 'Failed to mark all as read',
        tryAgain: 'Please try again.',
    },
    actions: {
        markAllAsReadTitle: 'Mark all as read',
        markAllAsReadMessage: 'Do you want to mark all notifications as read?',
    },
    settings: {
        title: 'Notification Settings',
        systemDisabled: {
            title: 'Notifications are disabled',
            description: 'You need to enable notifications in phone settings to receive order updates.',
            action: 'Open Phone Settings',
        },
        groups: {
            transaction: {
                title: 'Transactions & Personal',
                order: {
                    title: 'Order Updates',
                    description: 'Notifications when order status changes or shipper starts delivery.',
                },
                chat: {
                    title: 'New Messages',
                    description: 'Receive notifications for messages from Shops or customer support.',
                },
            },
            promotion: {
                title: 'Promotions & News',
                deals: {
                    title: 'Promotions & Offers',
                    description: 'Flash Sales, exclusive Vouchers, and daily gifts.',
                },
                news: {
                    title: 'TCano News',
                    description: 'Discover new features, shopping tips, and community updates from TCano.',
                },
            },
            advanced: {
                title: 'Advanced',
                systemSettings: 'Phone Notification Settings',
            },
        },
        messages: {
            enableSuccess: 'Enabled {{topic}} notifications',
            disableSuccess: 'Disabled {{topic}} notifications',
            updateError: 'Failed to update settings',
            featureDeveloping: 'Feature in development',
        },
    },
    softAsk: {
        title: 'Track Your Orders',
        description: 'Would you like to receive notifications as soon as your order status changes and when the shipper starts delivery?',
        accept: 'Agree',
        later: 'Later',
    },
    authRequired: {
        title: 'Login to view notifications',
        login: 'Login Now',
    },
};
