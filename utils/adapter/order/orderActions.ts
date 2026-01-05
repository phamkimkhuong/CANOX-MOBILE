/**
 * ==============================================
 * ORDER ACTIONS - Button Logic Strategy
 * ==============================================
 * Determine which buttons to display based on order status
 * Use Strategy Pattern to avoid nested if-else in View
 */

import { Order, OrderAction, OrderStatus } from '@/types/order/order';

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
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle-outline' },
    ],
    // Awaiting Payment
    AWAITING_PAYMENT: [
        { label: 'Thanh toán ngay', type: 'primary', action: 'pay', icon: 'credit-card-outline' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle-outline' },
    ],
    // Paid
    PAID: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    // Rejected
    REJECTED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Processing/Packing
    FULFILLING: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    // Ready for pickup
    READY_FOR_PICKUP: [
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'package-variant-closed-check' },
    ],
    // Shipped
    SHIPPED: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-fast' },
    ],
    // Out for delivery
    OUT_FOR_DELIVERY: [
        { label: 'Theo dõi', type: 'secondary', action: 'track', icon: 'truck-fast' },
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'package-variant-closed-check' },
    ],
    // Delivered - Most important: Review + Rebuy + Return
    DELIVERED: [
        { label: 'Yêu cầu trả hàng', type: 'secondary', action: 'return', icon: 'package-variant-minus' },
        { label: 'Đánh giá', type: 'primary', action: 'review', icon: 'star-outline' },
    ],
    // Completed
    COMPLETED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Delivery failed
    DELIVERY_FAILED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Return statuses
    RETURNING_TO_SENDER: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-delivery-outline' },
    ],
    RETURNED_TO_SENDER: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    RETURN_REQUESTED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    RETURN_APPROVED: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-delivery-outline' },
    ],
    RETURN_REJECTED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    RETURNING: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-delivery-outline' },
    ],
    RETURNED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Cancelled
    CANCELLED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
};

/**
 * Get order actions based on status
 * Consider special conditions (e.g., whether reviewed, etc.)
 */
export const getOrderActions = (order: Order): OrderAction[] => {
    const baseActions = ACTION_MATRIX[order.status] || [];

    // If delivered, check if all items are reviewed to possibly remove 'review' action
    if (order.status === 'DELIVERED') {
        const allReviewed = order.items.every((item) => item.reviewed);
        if (allReviewed) {
            return [
                ...baseActions.filter((a) => a.action !== 'review'),
                { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
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
export const hasTracking = (order: Order): boolean => {
    return Boolean(order.trackingNumber && order.carrier);
};
