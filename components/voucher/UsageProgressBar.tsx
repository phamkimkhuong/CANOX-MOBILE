/**
 * UsageProgressBar - Thanh tiến độ sử dụng voucher
 * 
 * Tạo FOMO (Fear Of Missing Out) cho user:
 * - Chỉ hiện khi > 50% đã được dùng
 * - Đổi màu đỏ khi > 90% (báo động)
 * - Có animation mượt mà
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import React, { memo, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface UsageProgressBarProps {
    /** Phần trăm đã sử dụng (0-100) */
    percentage: number;
    /** Có hiển thị text "Đã dùng X%" không */
    showLabel?: boolean;
    /** Chiều cao của thanh progress */
    height?: number;
    /** Màu tùy chỉnh (override logic mặc định) */
    color?: string;
}

/**
 * Lấy màu dựa trên phần trăm:
 * - < 50%: Xanh (an toàn)
 * - 50-90%: Cam (cảnh báo)
 * - > 90%: Đỏ (khẩn cấp)
 */
const getProgressColor = (percentage: number, theme: Record<string, unknown>): string => {
    if (percentage >= 90) {
        return '#ef4444'; // Red-500 - Khẩn cấp
    }
    if (percentage >= 50) {
        return '#f97316'; // Orange-500 - Cảnh báo
    }
    return '#22c55e'; // Green-500 - An toàn
};

export const UsageProgressBar = memo<UsageProgressBarProps>(({
    percentage,
    showLabel = true,
    height = 4,
    color,
}) => {
    const { theme } = useUnistyles();
    const progress = useSharedValue(0);

    // Clamp percentage to 0-100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Animate progress on mount/change
    useEffect(() => {
        progress.value = withTiming(clampedPercentage, { duration: 600 });
    }, [clampedPercentage, progress]);

    // Memoize color
    const progressColor = useMemo(() => {
        return color ?? getProgressColor(clampedPercentage, theme);
    }, [color, clampedPercentage, theme]);

    // Animated width style
    const animatedBarStyle = useAnimatedStyle(() => ({
        width: `${progress.value}%`,
        backgroundColor: progressColor,
    }));

    // Text color matches progress color for emphasis
    const textColor = useMemo(() => {
        if (clampedPercentage >= 90) return '#ef4444';
        if (clampedPercentage >= 50) return '#f97316';
        return theme.colors.typographySecondary;
    }, [clampedPercentage, theme.colors.typographySecondary]);

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={[styles.track, { height }]}>
                <Animated.View style={[styles.fill, animatedBarStyle]} />
            </View>

            {/* Label */}
            {showLabel && (
                <Text style={[styles.label, { color: textColor }]}>
                    {VOUCHER_STRINGS.progress.used} {Math.round(clampedPercentage)}%
                </Text>
            )}
        </View>
    );
});

UsageProgressBar.displayName = 'UsageProgressBar';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    track: {
        flex: 1,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 2,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
}));

export default UsageProgressBar;

