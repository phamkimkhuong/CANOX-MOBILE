/**
 * ==============================================
 * ORDER ACTIONS - Button Logic Strategy
 * ==============================================
 * Xác định nút bấm nào hiển thị dựa trên trạng thái đơn hàng
 * Sử dụng Strategy Pattern để tránh if-else lồng nhau trong View
 */

import { Order, OrderAction, OrderStatus } from '@/types/order/order';

/**
 * Ma trận trạng thái - nút bấm
 * Mỗi status có danh sách actions tương ứng
 * 
 * Visual Hierarchy:
 * - primary: Nút nổi bật nhất (có màu nền)
 * - secondary: Nút phụ (có viền)
 * - danger: Nút hủy/nguy hiểm (màu đỏ)
 */
const ACTION_MATRIX: Record<OrderStatus, OrderAction[]> = {
    // Chờ xác nhận - Có thể hủy đơn
    CREATED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle-outline' },
    ],
    // Chờ thanh toán
    AWAITING_PAYMENT: [
        { label: 'Thanh toán ngay', type: 'primary', action: 'pay', icon: 'credit-card-outline' },
        { label: 'Hủy đơn', type: 'danger', action: 'cancel', icon: 'close-circle-outline' },
    ],
    // Đã thanh toán
    PAID: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    // Bị từ chối
    REJECTED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Đang xử lý/đóng gói
    FULFILLING: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
    ],
    // Sẵn sàng lấy hàng
    READY_FOR_PICKUP: [
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'package-variant-closed-check' },
    ],
    // Đã vận chuyển
    SHIPPED: [
        { label: 'Theo dõi', type: 'primary', action: 'track', icon: 'truck-fast' },
    ],
    // Đang giao
    OUT_FOR_DELIVERY: [
        { label: 'Theo dõi', type: 'secondary', action: 'track', icon: 'truck-fast' },
        { label: 'Đã nhận hàng', type: 'primary', action: 'received', icon: 'package-variant-closed-check' },
    ],
    // Đã giao - Quan trọng nhất: Đánh giá + Mua lại + Trả hàng
    DELIVERED: [
        { label: 'Yêu cầu trả hàng', type: 'secondary', action: 'return', icon: 'package-variant-minus' },
        { label: 'Đánh giá', type: 'primary', action: 'review', icon: 'star-outline' },
    ],
    // Hoàn thành
    COMPLETED: [
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Giao thất bại
    DELIVERY_FAILED: [
        { label: 'Liên hệ Shop', type: 'secondary', action: 'contact', icon: 'chatbubble-ellipses-outline' },
        { label: 'Mua lại', type: 'primary', action: 'rebuy', icon: 'cart-plus' },
    ],
    // Các trạng thái hoàn hàng
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
    // Đã hủy
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
