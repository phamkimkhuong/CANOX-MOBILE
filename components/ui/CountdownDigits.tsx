import type { CountdownDuration } from '@/hooks/useCountdown';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

type CountdownSize = 'small' | 'medium' | 'large';
type CountdownTheme = 'dark' | 'light' | 'primary';

interface CountdownDigitsProps {
    /** Duration object từ useCountdown hook */
    duration: CountdownDuration;
    /** Kích thước hiển thị */
    size?: CountdownSize;
    /** Theme màu sắc */
    variant?: CountdownTheme;
    /** Hiển thị label "Kết thúc trong" */
    showLabel?: boolean;
    /** Custom label text */
    labelText?: string;
    /** Ẩn hours nếu = 0 */
    hideHoursIfZero?: boolean;
}

// ============================================
// SIZE CONFIG
// ============================================

const SIZE_CONFIG = {
    small: {
        boxPadding: { paddingHorizontal: 4, paddingVertical: 2 },
        boxMinWidth: 22,
        fontSize: 12,
        separatorSize: 12,
        gap: 2,
        borderRadius: 3,
        labelSize: 10,
    },
    medium: {
        boxPadding: { paddingHorizontal: 6, paddingVertical: 3 },
        boxMinWidth: 28,
        fontSize: 14,
        separatorSize: 14,
        gap: 4,
        borderRadius: 4,
        labelSize: 12,
    },
    large: {
        boxPadding: { paddingHorizontal: 8, paddingVertical: 4 },
        boxMinWidth: 36,
        fontSize: 18,
        separatorSize: 18,
        gap: 6,
        borderRadius: 6,
        labelSize: 14,
    },
} as const;

// ============================================
// COMPONENT
// ============================================

/**
 * CountdownDigits - Atomic Component hiển thị ô số đếm ngược
 * 
 * Single Source of Truth cho việc render countdown digits trong toàn app.
 * Hỗ trợ nhiều size và theme để tái sử dụng ở Home, Product Detail, etc.
 * 
 * @example
 * ```tsx
 * // Home page (light theme)
 * <CountdownDigits duration={duration} size="medium" variant="light" />
 * 
 * // Product Detail (dark theme)
 * <CountdownDigits 
 *   duration={duration} 
 *   size="small" 
 *   variant="dark" 
 *   showLabel 
 * />
 * ```
 */
export const CountdownDigits = memo<CountdownDigitsProps>(({
    duration,
    size = 'medium',
    variant = 'dark',
    showLabel = false,
    labelText = 'Kết thúc trong',
    hideHoursIfZero = false,
}) => {
    const { theme } = useUnistyles();
    const config = SIZE_CONFIG[size];

    // Determine colors based on variant
    const colors = {
        dark: {
            boxBg: theme.colors.typography,
            digitColor: theme.colors.surface,
            separatorColor: theme.colors.typography,
            labelColor: theme.colors.typographySecondary,
        },
        light: {
            boxBg: theme.colors.warning,
            digitColor: theme.colors.surface,
            separatorColor: theme.colors.warning,
            labelColor: theme.colors.typographySecondary,
        },
        primary: {
            boxBg: theme.colors.primary,
            digitColor: theme.colors.surface,
            separatorColor: theme.colors.primary,
            labelColor: theme.colors.typographySecondary,
        },
    }[variant];

    // Format number to 2 digits
    const formatNumber = (num: number): string => num.toString().padStart(2, '0');

    // Determine if we should show hours
    const shouldShowHours = !hideHoursIfZero || duration.hours > 0;

    return (
        <View style={styles.wrapper}>
            {showLabel && (
                <Text style={[
                    styles.label,
                    { fontSize: config.labelSize, color: colors.labelColor },
                ]}>
                    {labelText}
                </Text>
            )}
            <View style={[styles.container, { gap: config.gap }]}>
                {/* Hours */}
                {shouldShowHours && (
                    <>
                        <View style={[
                            styles.digitBox,
                            config.boxPadding,
                            {
                                backgroundColor: colors.boxBg,
                                minWidth: config.boxMinWidth,
                                borderRadius: config.borderRadius,
                            },
                        ]}>
                            <Text style={[
                                styles.digit,
                                { fontSize: config.fontSize, color: colors.digitColor },
                            ]}>
                                {formatNumber(duration.hours)}
                            </Text>
                        </View>
                        <Text style={[
                            styles.separator,
                            { fontSize: config.separatorSize, color: colors.separatorColor },
                        ]}>
                            :
                        </Text>
                    </>
                )}

                {/* Minutes */}
                <View style={[
                    styles.digitBox,
                    config.boxPadding,
                    {
                        backgroundColor: colors.boxBg,
                        minWidth: config.boxMinWidth,
                        borderRadius: config.borderRadius,
                    },
                ]}>
                    <Text style={[
                        styles.digit,
                        { fontSize: config.fontSize, color: colors.digitColor },
                    ]}>
                        {formatNumber(duration.minutes)}
                    </Text>
                </View>

                <Text style={[
                    styles.separator,
                    { fontSize: config.separatorSize, color: colors.separatorColor },
                ]}>
                    :
                </Text>

                {/* Seconds */}
                <View style={[
                    styles.digitBox,
                    config.boxPadding,
                    {
                        backgroundColor: colors.boxBg,
                        minWidth: config.boxMinWidth,
                        borderRadius: config.borderRadius,
                    },
                ]}>
                    <Text style={[
                        styles.digit,
                        { fontSize: config.fontSize, color: colors.digitColor },
                    ]}>
                        {formatNumber(duration.seconds)}
                    </Text>
                </View>
            </View>
        </View>
    );
});

CountdownDigits.displayName = 'CountdownDigits';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create((theme) => ({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    label: {
        fontWeight: '500',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    digitBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    digit: {
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    separator: {
        fontWeight: '700',
    },
}));
