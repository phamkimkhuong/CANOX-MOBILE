/**
 * ==============================================
 * ORDER TIMELINE - Static Timeline Logic
 * ==============================================
 * Strategy: Frontend-Driven State (Static Logic)
 * 
 * API chưa trả về statusHistory, tự map trạng thái hiện tại
 * Khi API update có field timeline, chỉ cần sửa file này.
 */

import i18n from '@/constants/i18n';
import type { OrderStatus } from '@/types/order/order';

/**
 * Timeline Step Interface
 */
export interface TimelineStep {
    key: string;
    label: string;
    description?: string;
    time?: string | null;
    isCompleted: boolean;
    isActive: boolean;
}

/**
 * Map OrderStatus -> Step Index
 * Determines which step is currently active
 */
const STATUS_TO_STEP_INDEX: Record<OrderStatus, number> = {
    // Step 0: Đặt hàng
    CREATED: 0,
    AWAITING_PAYMENT: 0,

    // Step 1: Đang xử lý
    PAID: 1,
    FULFILLING: 1,
    READY_FOR_PICKUP: 1,

    // Step 2: Đang giao
    SHIPPED: 2,
    OUT_FOR_DELIVERY: 2,

    // Step 3: Hoàn thành
    DELIVERED: 3,
    COMPLETED: 3,
    FINALIZED: 3,

    // Special cases - không thuộc flow chính
    REJECTED: -1,
    DELIVERY_FAILED: 2,
    RETURNING_TO_SENDER: 2,
    RETURNED_TO_SENDER: -1,
    RETURN_REQUESTED: 3,
    RETURN_APPROVED: 3,
    RETURN_REJECTED: 3,
    RETURNING: 3,
    RETURNED: -1,
    CANCELLED: -1,
};

/**
 * Statuses that break the normal timeline flow
 */
const ABNORMAL_STATUSES: OrderStatus[] = [
    'REJECTED',
    'CANCELLED',
    'RETURNED_TO_SENDER',
    'RETURNED',
];

/**
 * Get current step index from order status
 * @returns -1 if status is abnormal (cancelled, rejected, etc.)
 */
export const getCurrentStepIndex = (status: OrderStatus): number => {
    return STATUS_TO_STEP_INDEX[status] ?? 0;
};

/**
 * Check if order has abnormal status (timeline should be hidden)
 */
export const isAbnormalStatus = (status: OrderStatus): boolean => {
    return ABNORMAL_STATUSES.includes(status);
};

/**
 * Generate timeline steps based on current order status
 * 
 * @param status - Current order status from API
 * @param createdAt - Order creation timestamp (optional, for first step)
 * @returns Array of TimelineStep with completed/active states
 */
export const generateTimeline = (
    status: OrderStatus,
    createdAt?: string | null
): TimelineStep[] => {
    const currentIndex = getCurrentStepIndex(status);

    // If abnormal status, return empty (component should handle this)
    if (currentIndex < 0) {
        return [];
    }

    const steps = [
        { key: 'CREATED', label: i18n.t('order:timeline.created') },
        { key: 'PROCESSING', label: i18n.t('order:timeline.processing') },
        { key: 'SHIPPING', label: i18n.t('order:timeline.shipping') },
        { key: 'COMPLETED', label: i18n.t('order:timeline.completed') },
    ];

    return steps.map((step, index) => ({
        key: step.key,
        label: step.label,
        // Only show time for first step if provided, others unknown
        time: index === 0 && createdAt ? createdAt : null,
        isCompleted: index < currentIndex,
        isActive: index === currentIndex,
    }));
};

/**
 * Get status message for abnormal orders
 * Used when timeline cannot be displayed
 */
export const getAbnormalStatusMessage = (status: OrderStatus): string | null => {
    const messages: Partial<Record<OrderStatus, string>> = {
        CANCELLED: i18n.t('order:timeline.abnormal.cancelled'),
        REJECTED: i18n.t('order:timeline.abnormal.rejected'),
        RETURNED_TO_SENDER: i18n.t('order:timeline.abnormal.returnedToSender'),
        RETURNED: i18n.t('order:timeline.abnormal.returned'),
        DELIVERY_FAILED: i18n.t('order:timeline.abnormal.deliveryFailed'),
    };
    return messages[status] ?? null;
};

/**
 * Determine if order can show timeline tracker
 * Returns false for cancelled, rejected, returned orders
 */
export const canShowTimeline = (status: OrderStatus): boolean => {
    return !isAbnormalStatus(status);
};

/**
 * Get progress percentage for timeline (0-100)
 * Useful for progress bar animations
 */
export const getTimelineProgress = (status: OrderStatus): number => {
    const currentIndex = getCurrentStepIndex(status);
    if (currentIndex < 0) return 0;

    // 4 steps: 0=25%, 1=50%, 2=75%, 3=100%
    return Math.min(100, ((currentIndex + 1) / 4) * 100);
};
