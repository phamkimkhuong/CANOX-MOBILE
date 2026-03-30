/**
 * ==============================================
 * ORDER TIMELINE - Lifecycle Tracker Logic
 * ==============================================
 *
 * Backend now returns concrete lifecycle timestamps in order detail.
 * This adapter uses those timestamps directly instead of inferring
 * a fake 4-step progress model from status alone.
 */

import i18n from '@/constants/i18n';
import type { OrderLifecycleTimestamps, OrderStatus } from '@/types/order/order';

export interface TimelineStep {
    key: string;
    label: string;
    description?: string;
    time?: string | null;
    isCompleted: boolean;
    isActive: boolean;
}

const TIMELINE_STEPS = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] as const;
type TimelineStepKey = (typeof TIMELINE_STEPS)[number];

const STATUS_TO_STEP_INDEX: Record<OrderStatus, number> = {
    CREATED: 0,
    AWAITING_PAYMENT: 0,
    PAID: 1,
    FULFILLING: 1,
    READY_FOR_PICKUP: 1,
    SHIPPED: 2,
    OUT_FOR_DELIVERY: 2,
    DELIVERED: 3,
    COMPLETED: 4,
    FINALIZED: 4,
    REJECTED: -1,
    DELIVERY_FAILED: -1,
    RETURNING_TO_SENDER: -1,
    RETURNED_TO_SENDER: -1,
    RETURN_REQUESTED: -1,
    RETURN_APPROVED: -1,
    RETURN_REJECTED: -1,
    RETURNING: -1,
    RETURNED: -1,
    RETURN_DISPUTED: -1,
    REFUND_PENDING: -1,
    REFUNDED: -1,
    CANCELLED: -1,
    UNKNOWN_STATUS: -1,
};

const ABNORMAL_STATUSES: OrderStatus[] = [
    'REJECTED',
    'DELIVERY_FAILED',
    'RETURNING_TO_SENDER',
    'RETURNED_TO_SENDER',
    'RETURN_REQUESTED',
    'RETURN_APPROVED',
    'RETURN_REJECTED',
    'RETURNING',
    'RETURNED',
    'RETURN_DISPUTED',
    'REFUND_PENDING',
    'REFUNDED',
    'CANCELLED',
    'UNKNOWN_STATUS',
];

const getStepTime = (
    stepKey: TimelineStepKey,
    lifecycle?: Partial<OrderLifecycleTimestamps> | null
): string | null => {
    if (!lifecycle) return null;

    switch (stepKey) {
        case 'CREATED':
            return lifecycle.createdAt || lifecycle.createdDate || null;
        case 'CONFIRMED':
            return lifecycle.confirmedAt ?? null;
        case 'SHIPPED':
            return lifecycle.shippedAt ?? null;
        case 'DELIVERED':
            return lifecycle.deliveredAt ?? null;
        case 'COMPLETED':
            return lifecycle.completedAt ?? null;
        default:
            return null;
    }
};

export const getCurrentStepIndex = (status: OrderStatus): number => {
    return STATUS_TO_STEP_INDEX[status] ?? 0;
};

export const isAbnormalStatus = (status: OrderStatus): boolean => {
    return ABNORMAL_STATUSES.includes(status);
};

export const generateTimeline = (
    status: OrderStatus,
    lifecycle?: Partial<OrderLifecycleTimestamps> | null
): TimelineStep[] => {
    const currentIndex = getCurrentStepIndex(status);

    if (currentIndex < 0) {
        return [];
    }

    const steps: Array<{ key: TimelineStepKey; label: string }> = [
        { key: 'CREATED', label: i18n.t('order:timeline.created') },
        { key: 'CONFIRMED', label: i18n.t('order:timeline.confirmed') },
        { key: 'SHIPPED', label: i18n.t('order:timeline.shipped') },
        { key: 'DELIVERED', label: i18n.t('order:timeline.delivered') },
        { key: 'COMPLETED', label: i18n.t('order:timeline.completed') },
    ];

    return steps.map((step, index) => ({
        key: step.key,
        label: step.label,
        time: getStepTime(step.key, lifecycle),
        isCompleted: index < currentIndex,
        isActive: index === currentIndex,
    }));
};

export const getAbnormalStatusMessage = (status: OrderStatus, statusRaw?: string): string | null => {
    const messages: Partial<Record<OrderStatus, string>> = {
        CANCELLED: i18n.t('order:timeline.abnormal.cancelled'),
        REJECTED: i18n.t('order:timeline.abnormal.rejected'),
        RETURNED_TO_SENDER: i18n.t('order:timeline.abnormal.returnedToSender'),
        RETURN_REQUESTED: i18n.t('order:statusLabel.returnRequested'),
        RETURN_APPROVED: i18n.t('order:statusLabel.returnApproved'),
        RETURN_REJECTED: i18n.t('order:statusLabel.returnRejected'),
        RETURNING: i18n.t('order:statusLabel.returning'),
        RETURNED: i18n.t('order:timeline.abnormal.returned'),
        RETURN_DISPUTED: i18n.t('order:statusLabel.returnDisputed'),
        REFUND_PENDING: i18n.t('order:statusLabel.refundPending'),
        REFUNDED: i18n.t('order:statusLabel.refunded'),
        DELIVERY_FAILED: i18n.t('order:timeline.abnormal.deliveryFailed'),
        RETURNING_TO_SENDER: i18n.t('order:timeline.abnormal.returnedToSender'),
        UNKNOWN_STATUS: i18n.t('order:statusLabel.unknown', { status: statusRaw || 'UNKNOWN_STATUS' }),
    };

    return messages[status] ?? null;
};

export const canShowTimeline = (status: OrderStatus): boolean => {
    return !isAbnormalStatus(status);
};

export const getTimelineProgress = (status: OrderStatus): number => {
    const currentIndex = getCurrentStepIndex(status);
    if (currentIndex < 0) return 0;

    return Math.min(100, ((currentIndex + 1) / TIMELINE_STEPS.length) * 100);
};
