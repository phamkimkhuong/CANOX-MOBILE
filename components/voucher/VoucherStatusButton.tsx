/**
 * VoucherStatusButton - Nút hành động cho Voucher
 * 
 * Các trạng thái:
 * - collect: Nút "Lưu" màu nổi (có thể lưu)
 * - use: Nút "Dùng ngay" màu primary filled
 * - collected: Nút "Đã lưu" màu xám (disabled)
 * - expired: Nút "Hết hạn" màu xám (disabled)
 * - soldout: Nút "Hết lượt" màu xám (disabled)
 * - reminder: Nút "Nhắc tôi" outline (cho live voucher)
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import type { VoucherStatus } from '@/types/voucher';
import React, { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface VoucherStatusButtonProps {
    /** Trạng thái của voucher */
    status: VoucherStatus;
    /** Callback khi bấm nút */
    onPress?: () => void;
    /** Đang loading (sau khi bấm) */
    isLoading?: boolean;
    /** Size của nút */
    size?: 'small' | 'medium';
}

/**
 * Config cho từng trạng thái button
 */
interface ButtonConfig {
    label: string;
    variant: 'primary' | 'outline' | 'disabled';
    disabled: boolean;
}

const getButtonConfig = (status: VoucherStatus): ButtonConfig => {
    switch (status) {
        case 'collect':
            return {
                label: VOUCHER_STRINGS.actions.collect,
                variant: 'outline',
                disabled: false,
            };
        case 'use':
            return {
                label: VOUCHER_STRINGS.actions.use,
                variant: 'primary',
                disabled: false,
            };
        case 'collected':
            return {
                label: VOUCHER_STRINGS.actions.collected,
                variant: 'disabled',
                disabled: true,
            };
        case 'expired':
            return {
                label: VOUCHER_STRINGS.actions.expired,
                variant: 'disabled',
                disabled: true,
            };
        case 'soldout':
            return {
                label: VOUCHER_STRINGS.actions.soldout,
                variant: 'disabled',
                disabled: true,
            };
        case 'reminder':
            return {
                label: VOUCHER_STRINGS.actions.reminder,
                variant: 'outline',
                disabled: false,
            };
        default:
            return {
                label: VOUCHER_STRINGS.actions.collect,
                variant: 'outline',
                disabled: false,
            };
    }
};

export const VoucherStatusButton = memo<VoucherStatusButtonProps>(({
    status,
    onPress,
    isLoading = false,
    size = 'small',
}) => {
    const { theme } = useUnistyles();

    // Get config based on status
    const config = useMemo(() => getButtonConfig(status), [status]);

    // Handle press with loading check
    const handlePress = useCallback(() => {
        if (!config.disabled && !isLoading && onPress) {
            onPress();
        }
    }, [config.disabled, isLoading, onPress]);

    // Dynamic styles based on variant
    const buttonStyle = useMemo(() => {
        const baseStyle = size === 'small' ? styles.buttonSmall : styles.buttonMedium;

        switch (config.variant) {
            case 'primary':
                return [
                    baseStyle,
                    styles.buttonPrimary,
                    { backgroundColor: theme.colors.primary },
                ];
            case 'outline':
                return [
                    baseStyle,
                    styles.buttonOutline,
                    { borderColor: theme.colors.primary },
                ];
            case 'disabled':
                return [
                    baseStyle,
                    styles.buttonDisabled,
                    { backgroundColor: theme.colors.border },
                ];
            default:
                return baseStyle;
        }
    }, [config.variant, size, theme.colors.primary, theme.colors.border]);

    const textStyle = useMemo(() => {
        const baseStyle = size === 'small' ? styles.textSmall : styles.textMedium;

        switch (config.variant) {
            case 'primary':
                return [baseStyle, styles.textPrimary];
            case 'outline':
                return [baseStyle, styles.textOutline, { color: theme.colors.primary }];
            case 'disabled':
                return [baseStyle, styles.textDisabled];
            default:
                return baseStyle;
        }
    }, [config.variant, size, theme.colors.primary]);

    return (
        <Pressable
            style={({ pressed }) => [
                buttonStyle,
                pressed && !config.disabled && styles.buttonPressed,
            ]}
            onPress={handlePress}
            disabled={config.disabled || isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={config.variant === 'primary' ? '#ffffff' : theme.colors.primary}
                />
            ) : (
                <Text style={textStyle}>{config.label}</Text>
            )}
        </Pressable>
    );
});

VoucherStatusButton.displayName = 'VoucherStatusButton';

const styles = StyleSheet.create((theme) => ({
    // Size variants
    buttonSmall: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.s,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonMedium: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Variant styles
    buttonPrimary: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonOutline: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    buttonDisabled: {
        opacity: 1,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },

    // Text variants
    textSmall: {
        fontSize: 11,
        fontWeight: '700',
    },
    textMedium: {
        fontSize: 13,
        fontWeight: '700',
    },
    textPrimary: {
        color: '#ffffff',
    },
    textOutline: {
        // Color set dynamically
    },
    textDisabled: {
        color: theme.colors.typographySecondary,
    },
}));

export default VoucherStatusButton;

