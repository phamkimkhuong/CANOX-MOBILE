import i18n from '@/constants/i18n';
import { OrderStatus, OrderTabStatus } from '@/types/order/order';

export interface StatusDisplay {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}

/**
 * Map trạng thái đơn hàng sang hiển thị UI
 * - labelKey: Key trong i18n
 */
export const ORDER_STATUS_MAP: Record<OrderStatus, Omit<StatusDisplay, 'label'> & { labelKey: string }> = {
    CREATED: {
        labelKey: 'order:statusLabel.created',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'time',
    },
    AWAITING_PAYMENT: {
        labelKey: 'order:statusLabel.awaitingPayment',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'card',
    },
    PAID: {
        labelKey: 'order:statusLabel.paid',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'check-circle',
    },
    REJECTED: {
        labelKey: 'order:statusLabel.rejected',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'close-circle',
    },
    FULFILLING: {
        labelKey: 'order:statusLabel.fulfilling',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'cube',
    },
    READY_FOR_PICKUP: {
        labelKey: 'order:statusLabel.readyForPickup',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'store',
    },
    SHIPPED: {
        labelKey: 'order:statusLabel.shipped',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'truck-step',
    },
    OUT_FOR_DELIVERY: {
        labelKey: 'order:statusLabel.outForDelivery',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'truck-fast',
    },
    DELIVERED: {
        labelKey: 'order:statusLabel.delivered',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'cube',
    },
    COMPLETED: {
        labelKey: 'order:statusLabel.completed',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'checkmark-done',
    },
    FINALIZED: {
        labelKey: 'order:statusLabel.completed',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'checkmark-done',
    },
    DELIVERY_FAILED: {
        labelKey: 'order:statusLabel.deliveryFailed',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'warning',
    },
    RETURNING_TO_SENDER: {
        labelKey: 'order:statusLabel.returningToSender',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'truck-step',
    },
    RETURNED_TO_SENDER: {
        labelKey: 'order:statusLabel.returnedToSender',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'cube',
    },
    RETURN_REQUESTED: {
        labelKey: 'order:statusLabel.returnRequested',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: 'time',
    },
    RETURN_APPROVED: {
        labelKey: 'order:statusLabel.returnApproved',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'check-circle',
    },
    RETURN_REJECTED: {
        labelKey: 'order:statusLabel.returnRejected',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'close-circle',
    },
    RETURNING: {
        labelKey: 'order:statusLabel.returning',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'truck-step',
    },
    RETURNED: {
        labelKey: 'order:statusLabel.returned',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'cube',
    },
    RETURN_DISPUTED: {
        labelKey: 'order:statusLabel.returnDisputed',
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        icon: 'warning',
    },
    REFUND_PENDING: {
        labelKey: 'order:statusLabel.refundPending',
        color: '#0088cc',
        bgColor: 'rgba(0, 136, 204, 0.1)',
        icon: 'wallet',
    },
    REFUNDED: {
        labelKey: 'order:statusLabel.refunded',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: 'wallet',
    },
    CANCELLED: {
        labelKey: 'order:statusLabel.cancelled',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: 'close-circle',
    },
    UNKNOWN_STATUS: {
        labelKey: 'order:statusLabel.unknown',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: 'warning',
    },
};

/**
 * Lấy thông tin hiển thị cho status
 */
export const getStatusDisplay = (status: OrderStatus, statusRaw?: string): StatusDisplay => {
    const config = ORDER_STATUS_MAP[status] ?? ORDER_STATUS_MAP.UNKNOWN_STATUS;
    return {
        ...config,
        label: i18n.t(
            config.labelKey as never,
            status === 'UNKNOWN_STATUS'
                ? { status: statusRaw || 'UNKNOWN_STATUS' }
                : undefined
        ),
    };
};

/**
 * Tab configuration cho Order History screen
 */
export const ORDER_TABS: Array<{
    key: OrderTabStatus;
    labelKey: string;
    apiStatus: string;
}> = [
    { key: 'ALL', labelKey: 'order:tabs.all', apiStatus: 'ALL' },
    { key: 'AWAITING_PAYMENT', labelKey: 'order:tabs.awaitingPayment', apiStatus: 'AWAITING_PAYMENT' },
    { key: 'CREATED', labelKey: 'order:tabs.created', apiStatus: 'CREATED' },
    { key: 'FULFILLING', labelKey: 'order:tabs.processing', apiStatus: 'FULFILLING' },
    { key: 'POST_DELIVERY', labelKey: 'order:tabs.delivered', apiStatus: 'UI_COMPLETED' },
    { key: 'RETURN_REFUND', labelKey: 'order:tabs.returned', apiStatus: 'RETURN_REFUND' },
    { key: 'CANCELLED', labelKey: 'order:tabs.cancelled', apiStatus: 'CANCELLED' },
];

/**
 * Lấy màu cho indicator của Tab
 */
export const getTabColor = (status: OrderTabStatus): string => {
    const colorMap: Record<OrderTabStatus, string> = {
        ALL: '#6b7280', // Neutral
        AWAITING_PAYMENT: '#f59e0b', // Orange (Urgent)
        CREATED: '#f59e0b',    // Orange
        FULFILLING: '#0088cc', // Blue
        POST_DELIVERY: '#6b7280',  // Gray
        RETURN_REFUND: '#f97316', // Orange
        CANCELLED: '#ef4444',  // Red
    };
    return colorMap[status];
};
