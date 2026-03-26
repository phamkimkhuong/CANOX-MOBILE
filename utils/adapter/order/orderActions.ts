/**
 * ==============================================
 * ORDER ACTIONS - Button Logic Strategy
 * ==============================================
 * Determine which buttons to display based on order status
 * Use Strategy Pattern to avoid nested if-else in View
 */

import { OrderAction, OrderStatus, OrderUI } from '@/types/order/order';

/**
 * Status - Button Matrix
 * Each status has corresponding actions list
 * 
 * Visual Hierarchy:
 * - primary: Most prominent button (with background color)
 * - secondary: Secondary button (bordered)
 * - danger: Cancel/Danger button (red)
 */
const ACTION_MATRIX: Record<OrderStatus, OrderAction[]> = {
    // Created - Can cancel
    CREATED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
        { labelKey: 'order:actions.cancel', type: 'danger', action: 'cancel', icon: 'close-circle' },
    ],
    // Awaiting Payment
    AWAITING_PAYMENT: [
        { labelKey: 'order:actions.pay', type: 'primary', action: 'pay', icon: 'card' },
        { labelKey: 'order:actions.cancel', type: 'danger', action: 'cancel', icon: 'close-circle' },
    ],
    // Paid
    PAID: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    // Rejected
    REJECTED: [
        { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Processing/Packing
    FULFILLING: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    // Ready for pickup
    READY_FOR_PICKUP: [
        { labelKey: 'order:actions.received', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Shipped
    SHIPPED: [
        { labelKey: 'order:actions.track', type: 'primary', action: 'track', icon: 'truck-fast' },
    ],
    // Out for delivery
    OUT_FOR_DELIVERY: [
        { labelKey: 'order:actions.track', type: 'secondary', action: 'track', icon: 'truck-fast' },
        { labelKey: 'order:actions.received', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Delivered - Physics delivered, but user needs to confirm or request return
    DELIVERED: [
        { labelKey: 'order:actions.return', type: 'secondary', action: 'return', icon: 'cube' },
        { labelKey: 'order:actions.received', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Completed - Transaction final
    COMPLETED: [
        { labelKey: 'order:actions.rebuy', type: 'secondary', action: 'rebuy', icon: 'cart' },
        { labelKey: 'order:actions.review', type: 'primary', action: 'review', icon: 'star-outline' },
    ],
    FINALIZED: [
        { labelKey: 'order:actions.rebuy', type: 'secondary', action: 'rebuy', icon: 'cart' },
        { labelKey: 'order:actions.review', type: 'primary', action: 'review', icon: 'star-outline' },
    ],
    // Delivery failed
    DELIVERY_FAILED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
        { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Return statuses
    RETURNING_TO_SENDER: [
        { labelKey: 'order:actions.track', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURNED_TO_SENDER: [
        { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    RETURN_REQUESTED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    RETURN_APPROVED: [
        { labelKey: 'order:actions.track', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURN_REJECTED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    RETURNING: [
        { labelKey: 'order:actions.track', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURNED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    RETURN_DISPUTED: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    REFUND_PENDING: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    REFUNDED: [
        { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Cancelled
    CANCELLED: [
        { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Unknown status - only allow safe, non-destructive action
    UNKNOWN_STATUS: [
        { labelKey: 'order:actions.contact', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
};

/**
 * Get order actions based on status
 * Consider special conditions (e.g., whether reviewed, etc.)
 */
export const getOrderActions = (orderOrStatus: OrderUI | OrderStatus): OrderAction[] => {
    const isStatusString = typeof orderOrStatus === 'string';
    const status = isStatusString ? orderOrStatus : orderOrStatus.status;
    const baseActions = ACTION_MATRIX[status] || [];

    // If we have the UI object and it's COMPLETED/FINALIZED, check if all items are reviewed
    if (!isStatusString && (status === 'COMPLETED' || status === 'FINALIZED')) {
        const allReviewed = orderOrStatus.items.every((item) => item.reviewed);
        if (allReviewed) {
            // If all reviewed, remove review button and make Rebuy primary
            return [
                { labelKey: 'order:actions.rebuy', type: 'primary', action: 'rebuy', icon: 'cart' },
            ];
        }
    }

    return baseActions;
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
    const cancelableStatuses: OrderStatus[] = ['CREATED', 'AWAITING_PAYMENT'];
    return cancelableStatuses.includes(status);
};

/**
 * Check if order can request return
 */
export const canRequestReturn = (status: OrderStatus): boolean => {
    return status === 'DELIVERED';
};

/**
 * Check if order has tracking info
 */
export const hasTracking = (order: OrderUI): boolean => {
    return Boolean(order.trackingNumber && order.carrier);
};
