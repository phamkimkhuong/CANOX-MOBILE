/**
 * ==============================================
 * ORDER TRACKER - Lifecycle Summary + Expandable Timeline
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { OrderLifecycleTimestamps, OrderStatus } from '@/types/order/order';
import {
    buildOrderLifecycleEvents,
    buildOrderLifecycleSummary,
    canShowLifecycleTimeline,
    getAbnormalStatusMessage,
    type OrderLifecycleEvent,
    type OrderLifecycleTone,
} from '@/utils/adapter/order/orderTimeline';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { formatDateTime } from '@/utils/date';
import React, { memo, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderTrackerProps {
    status: OrderStatus;
    statusRaw?: string;
    lifecycle?: Partial<OrderLifecycleTimestamps> | null;
}

const getTonePalette = (theme: typeof import('@/constants/unistyles').lightTheme, tone: OrderLifecycleTone) => {
    switch (tone) {
        case 'brand':
            return {
                iconBg: theme.colors.primaryLight,
                iconColor: theme.colors.primary,
                surface: theme.colors.primaryMuted,
                border: theme.colors.primaryLight,
            };
        case 'info':
            return {
                iconBg: theme.colors.infoLight,
                iconColor: theme.colors.info,
                surface: theme.colors.infoMuted,
                border: theme.colors.infoLight,
            };
        case 'success':
            return {
                iconBg: theme.colors.successLight,
                iconColor: theme.colors.success,
                surface: theme.colors.successSubtle,
                border: theme.colors.successLight,
            };
        case 'warning':
            return {
                iconBg: theme.colors.warningLight,
                iconColor: theme.colors.warning,
                surface: theme.colors.warningSubtle,
                border: theme.colors.warningLight,
            };
        case 'danger':
            return {
                iconBg: theme.colors.errorLight,
                iconColor: theme.colors.error,
                surface: theme.colors.errorSubtle,
                border: theme.colors.errorLight,
            };
        case 'neutral':
        default:
            return {
                iconBg: theme.colors.secondaryLight,
                iconColor: theme.colors.typographySecondary,
                surface: theme.colors.backgroundNewSurface,
                border: theme.colors.secondaryLight,
            };
    }
};

const EventRow = memo<{
    event: OrderLifecycleEvent;
    isLast: boolean;
}>(({ event, isLast }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const styles = stylesheet;
    const palette = getTonePalette(theme, event.tone);

    return (
        <View style={styles.eventRow}>
            <View style={styles.railColumn}>
                <View style={[styles.eventIconWrap, styles.dynamicIconWrap(palette.iconBg)]}>
                    <IconSymbol name={event.icon as never} size={16} color={palette.iconColor} />
                </View>
                {!isLast && <View style={[styles.eventLine, styles.dynamicEventLine(event.kind === 'primary')]} />}
            </View>

            <View
                style={[
                    styles.eventCard,
                    event.isCurrent && styles.dynamicCurrentEvent(palette.surface, palette.border),
                ]}
            >
                <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, event.kind === 'secondary' && styles.eventTitleSecondary]}>
                        {event.title}
                    </Text>
                    {event.isCurrent && (
                        <View style={[styles.currentChip, styles.dynamicCurrentChip(palette.iconBg)]}>
                            <Text style={[styles.currentChipText, styles.dynamicCurrentChipText(palette.iconColor)]}>
                                {t('timeline.currentBadge')}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventTimeRow}>
                    <IconSymbol name="time" size={12} color={theme.colors.typographySecondary} />
                    <Text style={styles.eventTime}>{formatDateTime(event.timestamp)}</Text>
                </View>
            </View>
        </View>
    );
});

EventRow.displayName = 'EventRow';

const AbnormalStatusCard = memo<{
    status: OrderStatus;
    statusRaw?: string;
    message: string;
}>(({ status, statusRaw, message }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const styles = stylesheet;
    const statusDisplay = getStatusDisplay(status, statusRaw);

    return (
        <View style={styles.container}>
            <View style={[styles.summaryCard, styles.dynamicAbnormalCard(statusDisplay.bgColor || theme.colors.warningLight)]}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.sectionEyebrow}>{t('timeline.title')}</Text>
                    <View style={[styles.statusBadge, styles.dynamicStatusBadge(statusDisplay.bgColor, statusDisplay.color)]}>
                        <Text style={[styles.statusBadgeText, styles.dynamicStatusBadgeText(statusDisplay.color)]}>
                            {statusDisplay.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryHero}>
                    <View style={[styles.summaryIconWrap, styles.dynamicIconWrap(statusDisplay.bgColor || theme.colors.warningLight)]}>
                        <IconSymbol
                            name={(statusDisplay.icon === 'close-circle' ? 'close-circle' : statusDisplay.icon) as never}
                            size={20}
                            color={statusDisplay.color || theme.colors.warning}
                        />
                    </View>

                    <View style={styles.summaryBody}>
                        <Text style={styles.summaryTitle}>{statusDisplay.label}</Text>
                        <Text style={styles.summaryDescription}>{message}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
});

AbnormalStatusCard.displayName = 'AbnormalStatusCard';

export const OrderTracker: React.FC<OrderTrackerProps> = ({
    status,
    statusRaw,
    lifecycle,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const styles = stylesheet;
    const [expanded, setExpanded] = useState(false);

    const statusDisplay = useMemo(() => getStatusDisplay(status, statusRaw), [status, statusRaw]);
    const summary = useMemo(() => buildOrderLifecycleSummary(status, lifecycle), [status, lifecycle]);
    const events = useMemo(() => buildOrderLifecycleEvents(status, lifecycle), [status, lifecycle]);
    const canShowLifecycle = canShowLifecycleTimeline(status) && Boolean(summary);
    const abnormalMessage = getAbnormalStatusMessage(status, statusRaw);
    const canExpand = events.length > 1;

    if (!canShowLifecycle && abnormalMessage) {
        return <AbnormalStatusCard status={status} statusRaw={statusRaw} message={abnormalMessage} />;
    }

    if (!summary) {
        return null;
    }

    const summaryPalette = getTonePalette(theme, summary.tone);

    return (
        <View style={styles.container}>
            <View style={styles.summaryCard}>
                <Pressable
                    disabled={!canExpand}
                    onPress={() => canExpand && setExpanded((prev) => !prev)}
                    style={({ pressed }) => [
                        styles.summaryPressable,
                        canExpand && pressed && styles.summaryPressed,
                    ]}
                >
                    <View style={styles.summaryHeader}>
                        <Text style={styles.sectionEyebrow}>{t('timeline.title')}</Text>
                        <View style={[styles.statusBadge, styles.dynamicStatusBadge(statusDisplay.bgColor, statusDisplay.color)]}>
                            <Text style={[styles.statusBadgeText, styles.dynamicStatusBadgeText(statusDisplay.color)]}>
                                {statusDisplay.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.summaryHero}>
                        <View style={[styles.summaryIconWrap, styles.dynamicIconWrap(summaryPalette.iconBg)]}>
                            <IconSymbol name={summary.icon as never} size={20} color={summaryPalette.iconColor} />
                        </View>

                        <View style={styles.summaryBody}>
                            <Text style={styles.summaryTitle}>{summary.title}</Text>
                            <Text style={styles.summaryDescription}>{summary.description}</Text>

                            {summary.timestamp && (
                                <View style={styles.summaryTimeRow}>
                                    <Text style={styles.summaryTimeLabel}>{t('timeline.latestUpdate')}</Text>
                                    <Text style={styles.summaryTime}>{formatDateTime(summary.timestamp)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {canExpand && (
                        <View style={styles.summaryToggleRow}>
                            <Text style={styles.summaryToggleText}>
                                {expanded ? t('timeline.hideHistory') : t('timeline.showHistory')}
                            </Text>
                            <IconSymbol
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={theme.colors.typographySecondary}
                            />
                        </View>
                    )}
                </Pressable>

                {expanded && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>{t('timeline.historyTitle')}</Text>
                        {events.map((event, index) => (
                            <EventRow
                                key={`${event.key}-${event.timestamp}`}
                                event={event}
                                isLast={index === events.length - 1}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
    },
    summaryCard: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
    },
    summaryPressable: {
        gap: theme.margins.md,
    },
    summaryPressed: {
        opacity: 0.92,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    sectionEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    statusBadge: {
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 6,
    },
    dynamicStatusBadge: (backgroundColor?: string, color?: string) => ({
        backgroundColor: backgroundColor || theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: color ? `${color}22` : theme.colors.primaryLight,
    }),
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    dynamicStatusBadgeText: (color?: string) => ({
        color: color || theme.colors.primary,
    }),
    summaryHero: {
        flexDirection: 'row',
        gap: theme.margins.md,
    },
    summaryIconWrap: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.l,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dynamicIconWrap: (backgroundColor: string) => ({
        backgroundColor,
    }),
    summaryBody: {
        flex: 1,
        gap: 6,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        lineHeight: 24,
    },
    summaryDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
    },
    summaryTimeRow: {
        marginTop: 2,
        gap: 2,
    },
    summaryTimeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
    },
    summaryTime: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    summaryToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.margins.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
    },
    summaryToggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    historySection: {
        marginTop: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
        gap: theme.margins.md,
    },
    historyTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    eventRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        alignItems: 'stretch',
    },
    railColumn: {
        width: 32,
        alignItems: 'center',
    },
    eventIconWrap: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventLine: {
        width: 2,
        flex: 1,
        marginTop: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.border,
    },
    dynamicEventLine: (isPrimary: boolean) => ({
        backgroundColor: isPrimary ? theme.colors.border : theme.colors.borderMuted,
    }),
    eventCard: {
        flex: 1,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.background,
        gap: 4,
    },
    dynamicCurrentEvent: (backgroundColor: string, borderColor: string) => ({
        backgroundColor,
        borderWidth: 1,
        borderColor,
    }),
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    eventTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    eventTitleSecondary: {
        fontWeight: '600',
    },
    currentChip: {
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
    },
    dynamicCurrentChip: (backgroundColor: string) => ({
        backgroundColor,
    }),
    currentChipText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dynamicCurrentChipText: (color: string) => ({
        color,
    }),
    eventDescription: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
    },
    eventTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    eventTime: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    dynamicAbnormalCard: (backgroundColor: string) => ({
        backgroundColor,
    }),
}));
