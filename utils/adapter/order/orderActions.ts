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
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle' },
    ],
    // Awaiting Payment
    AWAITING_PAYMENT: [
        { label: 'Thanh toán ngay', type: 'primary', action: 'pay', icon: 'card' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle' },
    ],
    // Paid
    PAID: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    // Rejected
    REJECTED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Processing/Packing
    FULFILLING: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    // Ready for pickup
    READY_FOR_PICKUP: [
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Shipped
    SHIPPED: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-fast' },
    ],
    // Out for delivery
    OUT_FOR_DELIVERY: [
        { label: 'Theo dõi', type: 'secondary', action: 'track', icon: 'truck-fast' },
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Delivered - Physics delivered, but user needs to confirm or request return
    DELIVERED: [
        { label: 'Trả hàng/Hoàn tiền', type: 'secondary', action: 'return', icon: 'cube' },
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'cube' },
    ],
    // Completed - Transaction final
    COMPLETED: [
        { label: 'Mua lại', type: 'secondary', action: 'rebuy', icon: 'cart' },
        { label: 'Đánh giá', type: 'primary', action: 'review', icon: 'star-outline' },
    ],
    // Delivery failed
    DELIVERY_FAILED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Return statuses
    RETURNING_TO_SENDER: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURNED_TO_SENDER: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    RETURN_REQUESTED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    RETURN_APPROVED: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURN_REJECTED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chat-dots' },
    ],
    RETURNING: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-step' },
    ],
    RETURNED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
    ],
    // Cancelled
    CANCELLED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
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

    // If we have the UI object and it's COMPLETED, check if all items are reviewed
    if (!isStatusString && status === 'COMPLETED') {
        const allReviewed = orderOrStatus.items.every((item) => item.reviewed);
        if (allReviewed) {
            // If all reviewed, remove review button and make Rebuy primary
            return [
                { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart' },
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
