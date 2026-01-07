/**
 * ==============================================
 * ORDER STATUS MAPPER - UI Display Logic
 * ==============================================
 * Chuyển đổi status từ API sang text + màu sắc hiển thị
 */

import { OrderStatus, OrderTabStatus } from '@/types/order/order';

export interface StatusDisplay {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}

/**
 * Map trạng thái đơn hàng sang hiển thị UI
 * - label: Text tiếng Việt
 * - color: Màu chữ/icon
 * - bgColor: Màu nền badge
 * - icon: MaterialCommunityIcons name
 */
export const ORDER_STATUS_MAP: Record<OrderStatus, StatusDisplay> = {
    CREATED: {
        label: 'Chờ xác nhận',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'time',
    },
    AWAITING_PAYMENT: {
        label: 'Chờ thanh toán',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'card',
    },
    PAID: {
        label: 'Đã thanh toán',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'check-circle',
    },
    REJECTED: {
        label: 'Bị từ chối',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'close-circle',
    },
    FULFILLING: {
        label: 'Đang xử lý',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'cube',
    },
    READY_FOR_PICKUP: {
        label: 'Sẵn sàng lấy',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'store',
    },
    SHIPPED: {
        label: 'Đã gửi hàng',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'truck-step',
    },
    OUT_FOR_DELIVERY: {
        label: 'Đang giao',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'truck-fast',
    },
    DELIVERED: {
        label: 'Đã giao',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'cube',
    },
    COMPLETED: {
        label: 'Hoàn thành',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'checkmark-done',
    },
    DELIVERY_FAILED: {
        label: 'Giao thất bại',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'warning',
    },
    RETURNING_TO_SENDER: {
        label: 'Đang hoàn',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'truck-step',
    },
    RETURNED_TO_SENDER: {
        label: 'Đã hoàn',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'cube',
    },
    RETURN_REQUESTED: {
        label: 'Yêu cầu trả',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'cube',
    },
    RETURN_APPROVED: {
        label: 'Đã duyệt trả',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'cube',
    },
    RETURN_REJECTED: {
        label: 'Từ chối trả',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'cube',
    },
    RETURNING: {
        label: 'Đang trả hàng',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'truck-step',
    },
    RETURNED: {
        label: 'Đã trả hàng',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'cube',
    },
    CANCELLED: {
        label: 'Đã hủy',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'close-circle',
    },
};

/**
 * Lấy thông tin hiển thị cho status
 */
export const getStatusDisplay = (status: OrderStatus): StatusDisplay => {
    return ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.CREATED;
};

/**
 * Tab configuration cho Order History screen
 * - Không có tab "All" theo yêu cầu
 */
export const ORDER_TABS: Array<{
    key: OrderTabStatus;
    label: string;
    apiStatus: string;
}> = [
        { key: 'AWAITING_PAYMENT', label: 'Chờ thanh toán', apiStatus: 'AWAITING_PAYMENT' },
        { key: 'CREATED', label: 'Chờ xác nhận', apiStatus: 'CREATED' },
        { key: 'FULFILLING', label: 'Đang giao', apiStatus: 'FULFILLING' },
        { key: 'DELIVERED', label: 'Đã giao', apiStatus: 'DELIVERED' },
        { key: 'COMPLETED', label: 'Hoàn thành', apiStatus: 'COMPLETED' },
        { key: 'CANCELLED', label: 'Đã hủy', apiStatus: 'CANCELLED' },
    ];

/**
 * Lấy màu cho indicator của Tab
 */
export const getTabColor = (status: OrderTabStatus): string => {
    const colorMap: Record<OrderTabStatus, string> = {
        AWAITING_PAYMENT: '#f59e0b', // Orange (Urgent)
        CREATED: '#f59e0b',    // Orange
        FULFILLING: '#0088cc', // Blue
        DELIVERED: '#10b981',  // Green
        COMPLETED: '#6b7280',  // Gray
        CANCELLED: '#ef4444',  // Red
    };
    return colorMap[status];
};
