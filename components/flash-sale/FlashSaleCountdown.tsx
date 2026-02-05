import { formatSynchronizedTimeLeft, getSynchronizedTargetTimestamp } from '@/utils/date';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface FlashSaleCountdownProps {
    endTime: string;
    secondsUntilStart?: number;
    secondsUntilEnd?: number;
    onEnd?: () => void;
    label?: string;
}

/**
 * FlashSaleCountdown - Premium Liquid Glass Countdown Timer
 */
export const FlashSaleCountdown = memo(({ endTime, onEnd, label, secondsUntilStart, secondsUntilEnd }: FlashSaleCountdownProps) => {
    const { t } = useTranslation(['home']);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // High Precision Target Calculation:
        // Instead of relying on user's system clock which might be wrong/in different timezone,
        // we use the relative seconds provided by the Backend at the moment of the request.
        // Even if user clock is skewed, (Date.now() + seconds*1000) - current_Date.now() will stay accurate.

        const targetMs = getSynchronizedTargetTimestamp(
            endTime,
            (secondsUntilEnd && secondsUntilEnd > 0) ? secondsUntilEnd : secondsUntilStart
        );

        const updateTimer = () => {
            const time = formatSynchronizedTimeLeft(targetMs);
            if (time.total <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                onEnd?.();
            } else {
                setTimeLeft({
                    hours: time.hours,
                    minutes: time.minutes,
                    seconds: time.seconds,
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [endTime, onEnd, secondsUntilStart, secondsUntilEnd]);

    const styles = stylesheet;
    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            <View style={styles.glassContainer}>
                <BlurView intensity={20} tint="light" style={styles.blurBg}>
                    <Text style={styles.label}>{label || t('home:flashSale.endingIn')}</Text>

                    <View style={styles.timerRow}>
                        <TimeUnit value={formatNumber(timeLeft.hours)} />
                        <Text style={styles.colon}>:</Text>
                        <TimeUnit value={formatNumber(timeLeft.minutes)} />
                        <Text style={styles.colon}>:</Text>
                        <TimeUnit value={formatNumber(timeLeft.seconds)} />
                    </View>
                </BlurView>

                {/* Visual Accent Glow */}
                <View style={styles.accentGlow} />
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

const stylesheet = StyleSheet.create((_theme) => ({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    glassContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Deep Navy Glass
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    blurBg: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    boxWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    box: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        minWidth: 30,
        alignItems: 'center',
    },
    timeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
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
        fontSize: 16,
        fontWeight: '900',
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
}));
