import { getAnalytics, logEvent, setUserId } from '@react-native-firebase/analytics';
import { logger } from '@/utils/logger';

const analyticsInstance = getAnalytics();

/**
 * Centalized Firebase Analytics Utility for Business & Cohort Tracking
 */
export const analytics = {
    /**
     * Log user ID for analytics tracking (matching identity system ID)
     */
    setUserId: async (id: string | null) => {
        try {
            await setUserId(analyticsInstance, id);
            logger.ui.info(`Firebase Analytics: User ID set to ${id}`);
        } catch (error) {
            logger.ui.error('Firebase Analytics Error: setUserId failed', error);
        }
    },

    /**
     * Log custom or standard business events
     */
    logEvent: async (eventName: string, params?: Record<string, any>) => {
        try {
            await logEvent(analyticsInstance, eventName, params);
            logger.ui.debug(`Firebase Analytics: Logged event "${eventName}"`, params);
        } catch (error) {
            logger.ui.error(`Firebase Analytics Error: logEvent "${eventName}" failed`, error);
        }
    },

    /**
     * Standard E-commerce conversion funnel tracking
     */
    ecommerce: {
        /**
         * Track when a user views a specific product
         */
        trackViewItem: (item: { id: string; name: string; category?: string; price: number }) => {
            analytics.logEvent('view_item', {
                currency: 'VND',
                value: item.price,
                items: [{
                    item_id: item.id,
                    item_name: item.name,
                    item_category: item.category,
                    price: item.price,
                    quantity: 1,
                }],
            });
        },

        /**
         * Track when a user adds a product to their shopping cart
         */
        trackAddToCart: (item: { id: string; name: string; category?: string; price: number; quantity: number }) => {
            analytics.logEvent('add_to_cart', {
                currency: 'VND',
                value: item.price * item.quantity,
                items: [{
                    item_id: item.id,
                    item_name: item.name,
                    item_category: item.category,
                    price: item.price,
                    quantity: item.quantity,
                }],
            });
        },

        /**
         * Track when a user enters the checkout screen
         */
        trackBeginCheckout: (value: number, currency = 'VND') => {
            analytics.logEvent('begin_checkout', {
                value,
                currency,
            });
        },

        /**
         * Track successful payment and order completion
         */
        trackPurchase: (
            transactionId: string,
            value: number,
            items: Array<{ id: string; name: string; price: number; quantity: number }>,
            currency = 'VND'
        ) => {
            analytics.logEvent('purchase', {
                transaction_id: transactionId,
                value,
                currency,
                items: items.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });
        },
    },
};
