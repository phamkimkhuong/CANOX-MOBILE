/**
 * ==============================================
 * ORDER TRACKER - Timeline/Stepper Component
 * ==============================================
 * Hiển thị tiến trình đơn hàng theo 4 bước
 * 
 * Features:
 * - Horizontal stepper with connecting lines
 * - Completed steps: Green checkmark
 * - Active step: Pulsing dot
 * - Inactive steps: Gray dot
 * - Handles abnormal statuses (cancelled, rejected)
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { OrderStatus } from '@/types/order/order';
import {
    canShowTimeline,
    generateTimeline,
    getAbnormalStatusMessage,
    type TimelineStep,
} from '@/utils/adapter/order/orderTimeline';
import { formatDate } from '@/utils/date';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderTrackerProps {
    status: OrderStatus;
    createdAt?: string | null;
}

/**
 * Single Step Item
 */
const StepItem = memo<{
    step: TimelineStep;
    isFirst: boolean;
    isLast: boolean;
}>(({ step, isFirst, isLast }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const getStepColor = () => {
        if (step.isCompleted) return theme.colors.success;
        if (step.isActive) return theme.colors.primary;
        return theme.colors.secondary;
    };

    const stepColor = getStepColor();

    return (
        <View style={styles.stepContainer}>
            {/* Step indicator */}
            <View style={styles.stepIndicatorRow}>
                {/* Left line */}
                {!isFirst && (
                    <View
                        style={[
                            styles.line,
                            styles.dynamicLineColor(step.isCompleted || step.isActive),
                        ]}
                    />
                )}

                {/* Circle indicator */}
                <View
                    style={[
                        styles.circle,
                        styles.dynamicCircle(step.isCompleted, step.isActive, stepColor),
                    ]}
                >
                    {step.isCompleted ? (
                        <IconSymbol
                            name="check"
                            size={12}
                            color={theme.colors.onPrimary}
                        />
                    ) : step.isActive ? (
                        <View style={[styles.innerDot, styles.bgPrimary]} />
                    ) : null}
                </View>

                {/* Right line */}
                {!isLast && (
                    <View
                        style={[
                            styles.line,
                            styles.dynamicLineColor(step.isCompleted),
                        ]}
                    />
                )}
            </View>

            {/* Step label */}
            <Text
                style={[
                    styles.stepLabel,
                    styles.dynamicLabel(step.isCompleted || step.isActive, step.isActive),
                ]}
                numberOfLines={1}
            >
                {step.label}
            </Text>

            {/* Step time (if available) */}
            {step.time && (
                <Text style={styles.stepTime}>
                    {formatDate(step.time, 'DD/MM')}
                </Text>
            )}
        </View>
    );
});

StepItem.displayName = 'StepItem';

/**
 * Abnormal Status Banner
 * Shown when order is cancelled, rejected, etc.
 */
const AbnormalStatusBanner = memo<{
    status: OrderStatus;
    message: string;
}>(({ status, message }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const isCancelled = status === 'CANCELLED';
    const bgColor = isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    const textColor = isCancelled ? theme.colors.error : theme.colors.warning;

    return (
        <View style={[styles.abnormalBanner, styles.dynamicAbnormalBg(bgColor)]}>
            <IconSymbol
                name={isCancelled ? 'close-circle' : 'alert-circle'}
                size={20}
                color={textColor}
            />
            <Text style={[styles.abnormalText, styles.dynamicAbnormalColor(textColor)]}>
                {message}
            </Text>
        </View>
    );
});

AbnormalStatusBanner.displayName = 'AbnormalStatusBanner';

/**
 * OrderTracker - Main Component
 */
export const OrderTracker: React.FC<OrderTrackerProps> = ({
    status,
    createdAt,
}) => {
    const styles = stylesheet;

    // Generate timeline based on current status
    const timeline = useMemo(() => {
        return generateTimeline(status, createdAt);
    }, [status, createdAt]);

    // Check if we should show abnormal status banner instead
    const showTimeline = canShowTimeline(status);
    const abnormalMessage = getAbnormalStatusMessage(status);

    // If abnormal status, show banner instead of timeline
    if (!showTimeline && abnormalMessage) {
        return (
            <View style={styles.container}>
                <AbnormalStatusBanner status={status} message={abnormalMessage} />
            </View>
        );
    }

    // If no timeline steps, don't render anything
    if (timeline.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.trackerRow}>
                {timeline.map((step, index) => (
                    <StepItem
                        key={step.key}
                        step={step}
                        isFirst={index === 0}
                        isLast={index === timeline.length - 1}
                    />
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.sm,
    },
    trackerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
    },
    stepIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 24,
        width: '100%',
        justifyContent: 'center',
    },
    line: {
        flex: 1,
        height: 2,
    },
    dynamicLineColor: (isHighlighted: boolean) => ({
        backgroundColor: isHighlighted ? theme.colors.success : theme.colors.border,
    }),
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dynamicCircle: (isCompleted: boolean, isActive: boolean, borderColor: string) => ({
        backgroundColor: isCompleted
            ? theme.colors.success
            : isActive
                ? theme.colors.primary
                : theme.colors.background,
        borderColor,
    }),
    innerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bgPrimary: {
        backgroundColor: theme.colors.primary,
    },
    stepLabel: {
        fontSize: 11,
        marginTop: theme.margins.sm,
        textAlign: 'center',
    },
    dynamicLabel: (isHighlighted: boolean, isActive: boolean) => ({
        color: isHighlighted
            ? theme.colors.typography
            : theme.colors.typographySecondary,
        fontWeight: isActive ? '600' : '400',
    }),
    stepTime: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    // Abnormal status banner
    abnormalBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        gap: theme.margins.sm,
    },
    dynamicAbnormalBg: (backgroundColor: string) => ({
        backgroundColor,
    }),
    dynamicAbnormalColor: (color: string) => ({
        color,
    }),
    abnormalText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
}));
