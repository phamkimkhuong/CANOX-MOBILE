import { formatSynchronizedTimeLeft, getSynchronizedTargetTimestamp } from '@/utils/date';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FlashSaleCountdownProps {
    endTime: string;
    startTime?: string;
    secondsUntilStart?: number;
    secondsUntilEnd?: number;
    isUpcoming?: boolean;
    onEnd?: () => void;
    label?: string;
    embedded?: boolean;
}

/**
 * FlashSaleCountdown - Premium Liquid Glass Countdown Timer
 */
export const FlashSaleCountdown = memo(({
    endTime,
    startTime,
    onEnd,
    label,
    secondsUntilStart,
    secondsUntilEnd,
    isUpcoming = false,
    embedded = false,
}: FlashSaleCountdownProps) => {
    const { t } = useTranslation(['home']);
    const { theme } = useUnistyles();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const hasTriggeredEndRef = useRef(false);

    useEffect(() => {
        const fallbackTime = isUpcoming ? (startTime || endTime) : endTime;
        const relativeSeconds = isUpcoming ? secondsUntilStart : secondsUntilEnd;

        const targetMs = getSynchronizedTargetTimestamp(
            fallbackTime,
            (relativeSeconds && relativeSeconds > 0) ? relativeSeconds : undefined
        );
        hasTriggeredEndRef.current = false;

        const updateTimer = () => {
            const time = formatSynchronizedTimeLeft(targetMs);
            if (time.total <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (!hasTriggeredEndRef.current) {
                    hasTriggeredEndRef.current = true;
                    onEnd?.();
                }
            } else {
                hasTriggeredEndRef.current = false;
                setTimeLeft({
                    days: time.days,
                    hours: time.hours,
                    minutes: time.minutes,
                    seconds: time.seconds,
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [endTime, isUpcoming, onEnd, secondsUntilEnd, secondsUntilStart, startTime]);

    const styles = stylesheet;
    const formatNumber = (num: number) => num.toString().padStart(2, '0');
    const displayHours = timeLeft.days > 0 ? (timeLeft.days * 24) + timeLeft.hours : timeLeft.hours;
    const inlineClockText = `${formatNumber(timeLeft.hours)}:${formatNumber(timeLeft.minutes)}:${formatNumber(timeLeft.seconds)}`;
    const inlineDayText = `${timeLeft.days}d`;
    const hasDays = timeLeft.days > 0;

    return (
        <View style={[styles.container, embedded && styles.containerEmbedded]}>
            <View style={[styles.glassContainer, embedded && styles.glassContainerEmbedded]}>
                {embedded ? (
                    <View style={[styles.blurBg, styles.blurBgEmbedded]}>
                        <Text
                            style={[styles.label, styles.labelEmbedded]}
                            numberOfLines={1}
                        >
                            {label || t('home:flashSale.endingIn')}
                        </Text>

                        <View style={styles.inlineTimerRack}>
                            {hasDays ? (
                                <View style={[styles.daySlot, styles.daySlotActive]}>
                                    <Text style={[styles.daySlotText, styles.daySlotTextActive]}>
                                        {inlineDayText}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={styles.timeCapsuleWrapper}>
                                <LinearGradient
                                    colors={[theme.colors.newPrimary, theme.colors.accent]}
                                    style={styles.timeCapsule}
                                >
                                    <Text style={styles.timeCapsuleText}>{inlineClockText}</Text>
                                </LinearGradient>
                                <View style={styles.timeCapsuleHighlight} />
                            </View>
                        </View>
                    </View>
                ) : (
                    <BlurView intensity={20} tint="light" style={styles.blurBg}>
                        <Text style={styles.label}>{label || t('home:flashSale.endingIn')}</Text>

                        <View style={styles.timerRow}>
                            <TimeUnit value={formatNumber(displayHours)} />
                            <Text style={styles.colon}>:</Text>
                            <TimeUnit value={formatNumber(timeLeft.minutes)} />
                            <Text style={styles.colon}>:</Text>
                            <TimeUnit value={formatNumber(timeLeft.seconds)} />
                        </View>
                    </BlurView>
                )}

                {/* Visual Accent Glow */}
                <View style={[styles.accentGlow, embedded && styles.accentGlowEmbedded]} />
            </View>
        </View>
    );
});

const TimeUnit = ({ value }: { value: string }) => {
    const styles = stylesheet;

    return (
        <View style={styles.boxWrapper}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.box}
            >
                <Text style={styles.timeText}>{value}</Text>
            </LinearGradient>
            <View style={styles.boxHighlight} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        alignItems: 'center',
    },
    containerEmbedded: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        alignItems: 'stretch',
    },
    glassContainer: {
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Deep Navy Glass
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassContainerEmbedded: {
        borderRadius: 0,
        overflow: 'visible',
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
    },
    blurBg: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
    },
    blurBgEmbedded: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: theme.margins.sm,
    },
    label: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.bold,
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    labelEmbedded: {
        color: theme.colors.typographySecondary,
        letterSpacing: 0.6,
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        flexShrink: 1,
        minWidth: 0,
        marginRight: theme.margins.xs,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm - 2,
    },
    inlineTimerRack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
        flexShrink: 0,
    },
    daySlot: {
        minWidth: 34,
        height: 36,
        paddingHorizontal: theme.margins.sm - 2,
        borderRadius: theme.radius.m,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    daySlotActive: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    daySlotText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.2,
        fontVariant: ['tabular-nums'],
    },
    daySlotTextActive: {
        color: theme.colors.warning,
    },
    timeCapsuleWrapper: {
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 4,
    },
    timeCapsule: {
        width: 140,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeCapsuleText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.bold,
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.5,
    },
    timeCapsuleHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    },
    boxWrapper: {
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    box: {
        paddingHorizontal: theme.margins.sm - 2,
        paddingVertical: theme.margins.xs,
        minWidth: 30,
        alignItems: 'center',
    },
    timeText: {
        color: '#fff',
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
        fontFamily: 'System',
    },
    boxHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    colon: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    accentGlow: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: 80,
        height: 40,
        borderRadius: 40,
        backgroundColor: 'rgba(249, 115, 22, 0.2)', // Orange Glow
    },
    accentGlowEmbedded: {
        opacity: 0,
    },
}));
