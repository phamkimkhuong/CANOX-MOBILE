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
};
