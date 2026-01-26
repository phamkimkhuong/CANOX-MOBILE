/**
 * VoucherBadge - Nhãn nhỏ cho Voucher
 * 
 * Các loại badge:
 * - hot: Badge "HOT" màu vàng
 * - new: Badge "MỚI" màu xanh
 * - limited: Badge "Số lượng có hạn" màu cam
 * - expiring: Badge "Sắp hết hạn" màu đỏ
 * - extra: Badge "EXTRA" / "Xtra" 
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type BadgeVariant = 'hot' | 'new' | 'limited' | 'expiring' | 'extra' | 'almostGone' | 'custom';

interface VoucherBadgeProps {
    /** Loại badge */
    variant: BadgeVariant;
    /** Text tùy chỉnh (cho variant='custom') */
    text?: string;
    /** Vị trí badge */
    position?: 'topRight' | 'inline';
    /** Size */
    size?: 'small' | 'medium';
}

interface BadgeConfig {
    text: string;
    bgColor: string;
    textColor: string;
}

const getBadgeConfig = (variant: BadgeVariant, customText?: string): BadgeConfig => {
    switch (variant) {
        case 'hot':
            return {
                text: VOUCHER_STRINGS.badges.hot,
                bgColor: '#fbbf24', // Yellow-400
                textColor: '#78350f', // Yellow-900
            };
        case 'new':
            return {
                text: VOUCHER_STRINGS.badges.new,
                bgColor: '#3b82f6', // Blue-500
                textColor: '#ffffff',
            };
        case 'limited':
            return {
                text: VOUCHER_STRINGS.badges.limited,
                bgColor: 'rgba(249, 115, 22, 0.1)', // Orange light
                textColor: '#f97316', // Orange-500
            };
        case 'expiring':
            return {
                text: VOUCHER_STRINGS.card.expiringSoon,
                bgColor: 'rgba(239, 68, 68, 0.1)', // Red light
                textColor: '#ef4444', // Red-500
            };
        case 'almostGone':
            return {
                text: VOUCHER_STRINGS.card.almostGone,
                bgColor: 'rgba(249, 115, 22, 0.1)',
                textColor: '#f97316',
            };
        case 'extra':
            return {
                text: VOUCHER_STRINGS.badges.extra,
                bgColor: 'rgba(139, 92, 246, 0.1)', // Purple light
                textColor: '#8b5cf6', // Purple-500
            };
        case 'custom':
            return {
                text: customText ?? '',
                bgColor: 'rgba(100, 116, 139, 0.1)', // Slate light
                textColor: '#64748b', // Slate-500
            };
        default:
            return {
                text: '',
                bgColor: 'transparent',
                textColor: '#64748b',
            };
    }
};

export const VoucherBadge = memo<VoucherBadgeProps>(({
    variant,
    text,
    position = 'inline',
    size = 'small',
}) => {
    const config = useMemo(() => getBadgeConfig(variant, text), [variant, text]);

    const containerStyle = useMemo(() => [
        styles.container,
        size === 'small' ? styles.containerSmall : styles.containerMedium,
        { backgroundColor: config.bgColor },
        position === 'topRight' && styles.positionTopRight,
    ], [size, config.bgColor, position]);

    const textStyle = useMemo(() => [
        styles.text,
        size === 'small' ? styles.textSmall : styles.textMedium,
        { color: config.textColor },
    ], [size, config.textColor]);

    if (!config.text) return null;

    return (
        <View style={containerStyle}>
            <Text style={textStyle}>{config.text}</Text>
        </View>
    );
});

VoucherBadge.displayName = 'VoucherBadge';

const styles = StyleSheet.create((theme) => ({
    container: {
        borderRadius: theme.radius.s,
    },
    containerSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    containerMedium: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    positionTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderTopRightRadius: theme.radius.m,
        borderBottomLeftRadius: theme.radius.m,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 10,
    },
    text: {
        fontWeight: '700',
    },
    textSmall: {
        fontSize: 9,
    },
    textMedium: {
        fontSize: 11,
    },
}));

export default VoucherBadge;

