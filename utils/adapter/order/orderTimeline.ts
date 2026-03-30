/**
 * ==============================================
 * ORDER TIMELINE - Event-driven lifecycle logic
 * ==============================================
 *
 * The order detail screen should now reflect the real backend lifecycle:
 * - Primary milestones follow the order state machine
 * - Secondary events (such as paidAt) enrich the history without
 *   overriding the current business milestone
 */

import i18n from '@/constants/i18n';
import type { OrderLifecycleTimestamps, OrderStatus } from '@/types/order/order';

export type OrderLifecycleEventKey =
    | 'CREATED'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'PAID'
    | 'COMPLETED'
    | 'CANCELLED';

export type OrderLifecycleTone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface OrderLifecycleEvent {
    key: OrderLifecycleEventKey;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    tone: OrderLifecycleTone;
    kind: 'primary' | 'secondary';
    isCurrent: boolean;
}

export interface OrderLifecycleSummary {
    title: string;
    description: string;
    timestamp: string | null;
    icon: string;
    tone: OrderLifecycleTone;
}

type TimelineEventSeed = Omit<OrderLifecycleEvent, 'isCurrent'>;

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
    'UNKNOWN_STATUS',
];

const EVENT_DISPLAY_ORDER: Record<OrderLifecycleEventKey, number> = {
    CREATED: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    PAID: 4,
    COMPLETED: 5,
    CANCELLED: 6,
};

const NORMALIZEABLE_CREATED_STATUSES: OrderStatus[] = ['CREATED', 'AWAITING_PAYMENT'];
const NORMALIZEABLE_PROCESSING_STATUSES: OrderStatus[] = ['PAID', 'FULFILLING', 'READY_FOR_PICKUP'];
const NORMALIZEABLE_SHIPPING_STATUSES: OrderStatus[] = ['SHIPPED', 'OUT_FOR_DELIVERY'];
const NORMALIZEABLE_COMPLETED_STATUSES: OrderStatus[] = ['COMPLETED', 'FINALIZED'];

const getPrimaryEventKey = (status: OrderStatus): OrderLifecycleEventKey | null => {
    if (NORMALIZEABLE_CREATED_STATUSES.includes(status)) return 'CREATED';
    if (NORMALIZEABLE_PROCESSING_STATUSES.includes(status)) return 'CONFIRMED';
    if (NORMALIZEABLE_SHIPPING_STATUSES.includes(status)) return 'SHIPPED';
    if (status === 'DELIVERED') return 'DELIVERED';
    if (NORMALIZEABLE_COMPLETED_STATUSES.includes(status)) return 'COMPLETED';
    if (status === 'CANCELLED') return 'CANCELLED';
    return null;
};

const getCreatedTimestamp = (lifecycle?: Partial<OrderLifecycleTimestamps> | null): string | null => {
    return lifecycle?.createdAt || lifecycle?.createdDate || null;
};

const getCurrentVisibleEventKey = (
    status: OrderStatus,
    events: TimelineEventSeed[]
): OrderLifecycleEventKey | null => {
    const primaryEventKey = getPrimaryEventKey(status);

    if (primaryEventKey && events.some((event) => event.key === primaryEventKey)) {
        return primaryEventKey;
    }

    const latestPrimaryEvent = [...events].reverse().find((event) => event.kind === 'primary');
    return latestPrimaryEvent?.key ?? events.at(-1)?.key ?? null;
};

const compareEvents = (left: TimelineEventSeed, right: TimelineEventSeed): number => {
    const timeDiff = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
    if (timeDiff !== 0) return timeDiff;

    return EVENT_DISPLAY_ORDER[left.key] - EVENT_DISPLAY_ORDER[right.key];
};

const buildEventSeeds = (lifecycle?: Partial<OrderLifecycleTimestamps> | null): TimelineEventSeed[] => {
    if (!lifecycle) return [];

    const events: Array<TimelineEventSeed | null> = [
        getCreatedTimestamp(lifecycle)
            ? {
                key: 'CREATED',
                title: i18n.t('order:timeline.events.createdTitle'),
                description: i18n.t('order:timeline.events.createdDescription'),
                timestamp: getCreatedTimestamp(lifecycle)!,
                icon: 'receipt',
                tone: 'brand',
                kind: 'primary',
            }
            : null,
        lifecycle.confirmedAt
            ? {
                key: 'CONFIRMED',
                title: i18n.t('order:timeline.events.confirmedTitle'),
                description: i18n.t('order:timeline.events.confirmedDescription'),
                timestamp: lifecycle.confirmedAt,
                icon: 'verified-user',
                tone: 'brand',
                kind: 'primary',
            }
            : null,
        lifecycle.shippedAt
            ? {
                key: 'SHIPPED',
                title: i18n.t('order:timeline.events.shippedTitle'),
                description: i18n.t('order:timeline.events.shippedDescription'),
                timestamp: lifecycle.shippedAt,
                icon: 'truck-step',
                tone: 'info',
                kind: 'primary',
            }
            : null,
        lifecycle.deliveredAt
            ? {
                key: 'DELIVERED',
                title: i18n.t('order:timeline.events.deliveredTitle'),
                description: i18n.t('order:timeline.events.deliveredDescription'),
                timestamp: lifecycle.deliveredAt,
                icon: 'shippingbox',
                tone: 'success',
                kind: 'primary',
            }
            : null,
        lifecycle.paidAt
            ? {
                key: 'PAID',
                title: i18n.t('order:timeline.events.paidTitle'),
                description: i18n.t('order:timeline.events.paidDescription'),
                timestamp: lifecycle.paidAt,
                icon: 'wallet',
                tone: 'neutral',
                kind: 'secondary',
            }
            : null,
        lifecycle.completedAt
            ? {
                key: 'COMPLETED',
                title: i18n.t('order:timeline.events.completedTitle'),
                description: i18n.t('order:timeline.events.completedDescription'),
                timestamp: lifecycle.completedAt,
                icon: 'checkmark-circle-fill',
                tone: 'success',
                kind: 'primary',
            }
            : null,
        lifecycle.cancelledAt
            ? {
                key: 'CANCELLED',
                title: i18n.t('order:timeline.events.cancelledTitle'),
                description: i18n.t('order:timeline.events.cancelledDescription'),
                timestamp: lifecycle.cancelledAt,
                icon: 'close-circle',
                tone: 'danger',
                kind: 'primary',
            }
            : null,
    ];

    return events.filter((event): event is TimelineEventSeed => Boolean(event)).sort(compareEvents);
};

const getSummaryTimestamp = (
    status: OrderStatus,
    lifecycle?: Partial<OrderLifecycleTimestamps> | null
): string | null => {
    if (NORMALIZEABLE_CREATED_STATUSES.includes(status)) {
        return getCreatedTimestamp(lifecycle);
    }

    if (NORMALIZEABLE_PROCESSING_STATUSES.includes(status)) {
        return lifecycle?.confirmedAt || lifecycle?.paidAt || getCreatedTimestamp(lifecycle);
    }

    if (NORMALIZEABLE_SHIPPING_STATUSES.includes(status)) {
        return lifecycle?.shippedAt || lifecycle?.confirmedAt || lifecycle?.paidAt || getCreatedTimestamp(lifecycle);
    }

    if (status === 'DELIVERED') {
        return lifecycle?.deliveredAt || lifecycle?.shippedAt || getCreatedTimestamp(lifecycle);
    }

    if (NORMALIZEABLE_COMPLETED_STATUSES.includes(status)) {
        return lifecycle?.completedAt || lifecycle?.deliveredAt || getCreatedTimestamp(lifecycle);
    }

    if (status === 'CANCELLED') {
        return lifecycle?.cancelledAt || getCreatedTimestamp(lifecycle);
    }

    return null;
};

export const buildOrderLifecycleSummary = (
    status: OrderStatus,
    lifecycle?: Partial<OrderLifecycleTimestamps> | null
): OrderLifecycleSummary | null => {
    const timestamp = getSummaryTimestamp(status, lifecycle);

    if (status === 'AWAITING_PAYMENT') {
        return {
            title: i18n.t('order:timeline.summary.awaitingPaymentTitle'),
            description: i18n.t('order:timeline.summary.awaitingPaymentDescription'),
            timestamp,
            icon: 'wallet',
            tone: 'warning',
        };
    }

    if (status === 'CREATED') {
        return {
            title: i18n.t('order:timeline.summary.createdTitle'),
            description: i18n.t('order:timeline.summary.createdDescription'),
            timestamp,
            icon: 'receipt',
            tone: 'brand',
        };
    }

    if (NORMALIZEABLE_PROCESSING_STATUSES.includes(status)) {
        return {
            title: i18n.t('order:timeline.summary.processingTitle'),
            description: i18n.t('order:timeline.summary.processingDescription'),
            timestamp,
            icon: 'verified-user',
            tone: 'brand',
        };
    }

    if (NORMALIZEABLE_SHIPPING_STATUSES.includes(status)) {
        return {
            title: i18n.t('order:timeline.summary.shippingTitle'),
            description: i18n.t('order:timeline.summary.shippingDescription'),
            timestamp,
            icon: 'truck-step',
            tone: 'info',
        };
    }

    if (status === 'DELIVERED') {
        return {
            title: i18n.t('order:timeline.summary.deliveredTitle'),
            description: i18n.t('order:timeline.summary.deliveredDescription'),
            timestamp,
            icon: 'shippingbox',
            tone: 'success',
        };
    }

    if (NORMALIZEABLE_COMPLETED_STATUSES.includes(status)) {
        return {
            title: i18n.t('order:timeline.summary.completedTitle'),
            description: i18n.t('order:timeline.summary.completedDescription'),
            timestamp,
            icon: 'checkmark-circle-fill',
            tone: 'success',
        };
    }

    if (status === 'CANCELLED') {
        return {
            title: i18n.t('order:timeline.summary.cancelledTitle'),
            description: i18n.t('order:timeline.summary.cancelledDescription'),
            timestamp,
            icon: 'close-circle',
            tone: 'danger',
        };
    }

    return null;
};

export const buildOrderLifecycleEvents = (
    status: OrderStatus,
    lifecycle?: Partial<OrderLifecycleTimestamps> | null
): OrderLifecycleEvent[] => {
    const events = buildEventSeeds(lifecycle);
    const currentEventKey = getCurrentVisibleEventKey(status, events);

    return events.map((event) => ({
        ...event,
        isCurrent: currentEventKey === event.key,
    }));
};

export const isAbnormalStatus = (status: OrderStatus): boolean => {
    return ABNORMAL_STATUSES.includes(status);
};

export const canShowLifecycleTimeline = (status: OrderStatus): boolean => {
    return !isAbnormalStatus(status);
};

export const getAbnormalStatusMessage = (status: OrderStatus, statusRaw?: string): string | null => {
    const messages: Partial<Record<OrderStatus, string>> = {
        REJECTED: i18n.t('order:timeline.abnormal.rejected'),
        DELIVERY_FAILED: i18n.t('order:timeline.abnormal.deliveryFailed'),
        RETURNING_TO_SENDER: i18n.t('order:timeline.abnormal.returnedToSender'),
        RETURNED_TO_SENDER: i18n.t('order:timeline.abnormal.returnedToSender'),
        RETURN_REQUESTED: i18n.t('order:statusLabel.returnRequested'),
        RETURN_APPROVED: i18n.t('order:statusLabel.returnApproved'),
        RETURN_REJECTED: i18n.t('order:statusLabel.returnRejected'),
        RETURNING: i18n.t('order:statusLabel.returning'),
        RETURNED: i18n.t('order:timeline.abnormal.returned'),
        RETURN_DISPUTED: i18n.t('order:statusLabel.returnDisputed'),
        REFUND_PENDING: i18n.t('order:statusLabel.refundPending'),
        REFUNDED: i18n.t('order:statusLabel.refunded'),
        UNKNOWN_STATUS: i18n.t('order:statusLabel.unknown', { status: statusRaw || 'UNKNOWN_STATUS' }),
    };

    return messages[status] ?? null;
};
