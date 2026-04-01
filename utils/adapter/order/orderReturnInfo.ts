import i18n from '@/constants/i18n';
import type { OrderStatus } from '@/types/order/order';

export const RETURN_FLOW_STATUSES: OrderStatus[] = [
    'RETURN_REQUESTED',
    'RETURN_APPROVED',
    'RETURN_REJECTED',
    'RETURNING',
    'RETURNED',
    'RETURN_DISPUTED',
    'REFUND_PENDING',
    'REFUNDED',
];

export type ReturnFlowTone = 'warning' | 'info' | 'success' | 'danger' | 'neutral';

export interface ReturnFlowSummary {
    title: string;
    description: string;
    timestampLabel: string | null;
    timestamp: string | null;
    icon: string;
    tone: ReturnFlowTone;
}

export interface ReturnFlowHistoryEvent {
    key: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURNED';
    title: string;
    timestamp: string;
    icon: string;
}

interface ReturnFlowInfoLike {
    requestedAt?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    returnedAt?: string | null;
}

const buildTimestampMeta = (
    labelKey: string,
    timestamp?: string | null
): Pick<ReturnFlowSummary, 'timestampLabel' | 'timestamp'> => ({
    timestampLabel: timestamp ? i18n.t(labelKey as never) : null,
    timestamp: timestamp ?? null,
});

export const isReturnFlowStatus = (status: OrderStatus): boolean => {
    return RETURN_FLOW_STATUSES.includes(status);
};

export const buildReturnFlowSummary = (
    status: OrderStatus,
    returnInfo?: ReturnFlowInfoLike | null
): ReturnFlowSummary | null => {
    if (!isReturnFlowStatus(status)) {
        return null;
    }

    switch (status) {
        case 'RETURN_REQUESTED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.requestedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.requestedDescription'),
                ...buildTimestampMeta('order:detail.returnFlow.fields.requestedAt', returnInfo?.requestedAt),
                icon: 'time',
                tone: 'warning',
            };
        case 'RETURN_APPROVED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.approvedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.approvedDescription'),
                ...buildTimestampMeta(
                    returnInfo?.approvedAt
                        ? 'order:detail.returnFlow.fields.approvedAt'
                        : 'order:detail.returnFlow.fields.requestedAt',
                    returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'check-circle',
                tone: 'info',
            };
        case 'RETURN_REJECTED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.rejectedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.rejectedDescription'),
                ...buildTimestampMeta(
                    returnInfo?.rejectedAt
                        ? 'order:detail.returnFlow.fields.rejectedAt'
                        : 'order:detail.returnFlow.fields.requestedAt',
                    returnInfo?.rejectedAt ?? returnInfo?.requestedAt
                ),
                icon: 'close-circle',
                tone: 'danger',
            };
        case 'RETURNING':
            return {
                title: i18n.t('order:detail.returnFlow.summary.returningTitle'),
                description: i18n.t('order:detail.returnFlow.summary.returningDescription'),
                ...buildTimestampMeta(
                    returnInfo?.approvedAt
                        ? 'order:detail.returnFlow.fields.approvedAt'
                        : 'order:detail.returnFlow.fields.requestedAt',
                    returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'truck-step',
                tone: 'info',
            };
        case 'RETURNED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.returnedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.returnedDescription'),
                ...buildTimestampMeta(
                    returnInfo?.returnedAt
                        ? 'order:detail.returnFlow.fields.returnedAt'
                        : 'order:detail.returnFlow.fields.approvedAt',
                    returnInfo?.returnedAt ?? returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'cube',
                tone: 'info',
            };
        case 'RETURN_DISPUTED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.disputedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.disputedDescription'),
                ...buildTimestampMeta(
                    returnInfo?.returnedAt
                        ? 'order:detail.returnFlow.fields.returnedAt'
                        : 'order:detail.returnFlow.fields.approvedAt',
                    returnInfo?.returnedAt ?? returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'warning',
                tone: 'warning',
            };
        case 'REFUND_PENDING':
            return {
                title: i18n.t('order:detail.returnFlow.summary.refundPendingTitle'),
                description: i18n.t('order:detail.returnFlow.summary.refundPendingDescription'),
                ...buildTimestampMeta(
                    returnInfo?.returnedAt
                        ? 'order:detail.returnFlow.fields.returnedAt'
                        : 'order:detail.returnFlow.fields.approvedAt',
                    returnInfo?.returnedAt ?? returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'wallet',
                tone: 'info',
            };
        case 'REFUNDED':
            return {
                title: i18n.t('order:detail.returnFlow.summary.refundedTitle'),
                description: i18n.t('order:detail.returnFlow.summary.refundedDescription'),
                ...buildTimestampMeta(
                    returnInfo?.returnedAt
                        ? 'order:detail.returnFlow.fields.returnedAt'
                        : 'order:detail.returnFlow.fields.approvedAt',
                    returnInfo?.returnedAt ?? returnInfo?.approvedAt ?? returnInfo?.requestedAt
                ),
                icon: 'wallet',
                tone: 'success',
            };
        default:
            return null;
    }
};

export const buildReturnFlowHistory = (
    returnInfo?: ReturnFlowInfoLike | null
): ReturnFlowHistoryEvent[] => {
    if (!returnInfo) {
        return [];
    }

    const events: Array<ReturnFlowHistoryEvent | null> = [
        returnInfo.requestedAt
            ? {
                key: 'REQUESTED',
                title: i18n.t('order:detail.returnFlow.history.requested'),
                timestamp: returnInfo.requestedAt,
                icon: 'time',
            }
            : null,
        returnInfo.approvedAt
            ? {
                key: 'APPROVED',
                title: i18n.t('order:detail.returnFlow.history.approved'),
                timestamp: returnInfo.approvedAt,
                icon: 'check-circle',
            }
            : null,
        returnInfo.rejectedAt
            ? {
                key: 'REJECTED',
                title: i18n.t('order:detail.returnFlow.history.rejected'),
                timestamp: returnInfo.rejectedAt,
                icon: 'close-circle',
            }
            : null,
        returnInfo.returnedAt
            ? {
                key: 'RETURNED',
                title: i18n.t('order:detail.returnFlow.history.returned'),
                timestamp: returnInfo.returnedAt,
                icon: 'cube',
            }
            : null,
    ];

    return events.filter((event): event is ReturnFlowHistoryEvent => Boolean(event));
};
