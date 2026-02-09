/**
 * ==============================================
 * SHIPPING INFO CARD - Thông tin vận chuyển
 * ==============================================
 * Hiển thị:
 * - Đơn vị vận chuyển (carrier)
 * - Mã vận đơn (tracking number) với nút Copy
 * - Thời gian giao dự kiến (nếu có)
 * 
 * UX Requirements:
 * - Tracking number PHẢI có nút "Sao chép"
 * - Nếu tracking null -> ẩn dòng mã vận đơn
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { Carrier } from '@/types/order/order';
import * as Clipboard from 'expo-clipboard';
import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShippingInfoCardProps {
    carrier: Carrier | null;
    trackingNumber: string | null;
    estimatedDelivery?: string | null;
    onTrackingPress?: () => void;
}

/**
 * Carrier name mapping
 */
const CARRIER_DISPLAY: Record<Carrier, { name: string; color: string }> = {
    GHN: { name: 'Giao Hàng Nhanh', color: '#f97316' },
    SUPERSHIP: { name: 'SuperShip', color: '#0ea5e9' },
    GHTK: { name: 'Giao Hàng Tiết Kiệm', color: '#22c55e' },
    VIETTEL_POST: { name: 'Viettel Post', color: '#ef4444' },
};

/**
 * CopyableText - Text với nút copy
 */
const CopyableText = memo<{
    label: string;
    value: string;
    onCopy?: () => void;
}>(({ label, value, onCopy }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await Clipboard.setStringAsync(value);
        setCopied(true);
        onCopy?.();

        Toast.show({
            type: 'success',
            text1: t('order:detail.copyTrackingSuccess'),
            text2: value,
        });

        // Reset after 2 seconds
        setTimeout(() => setCopied(false), 2000);
    }, [value, onCopy, t]);

    return (
        <View style={styles.copyableRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.copyableValue}>
                <Text style={styles.trackingCode} selectable>
                    {value}
                </Text>
                <Pressable
                    onPress={handleCopy}
                    style={({ pressed }) => [
                        styles.copyButton,
                        pressed && styles.copyButtonPressed,
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <IconSymbol
                        name={copied ? 'check' : 'content-copy'}
                        size={16}
                        color={copied ? theme.colors.success : theme.colors.primary}
                    />
                    <Text style={[
                        styles.copyText,
                        { color: copied ? theme.colors.success : theme.colors.primary }
                    ]}>
                        {copied ? t('common:status.copied' as never) || 'Đã sao chép' : t('common:actions.copy' as never) || 'Sao chép'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
});

CopyableText.displayName = 'CopyableText';

/**
 * ShippingInfoCard - Main Component
 */
export const ShippingInfoCard: React.FC<ShippingInfoCardProps> = ({
    carrier,
    trackingNumber,
    estimatedDelivery,
    onTrackingPress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;

    // If no carrier, don't show anything
    if (!carrier) return null;

    const carrierInfo = CARRIER_DISPLAY[carrier] || { name: carrier, color: theme.colors.primary };

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <IconSymbol
                        name="shipping"
                        size={18}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={styles.headerTitle}>{t('order:detail.tracking')}</Text>
            </View>

            {/* Carrier Info */}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('order:detail.carrierTitle')}</Text>
                <View style={styles.carrierBadge}>
                    <View style={[styles.carrierDot, { backgroundColor: carrierInfo.color }]} />
                    <Text style={styles.carrierName}>{carrierInfo.name}</Text>
                </View>
            </View>

            {/* Tracking Number - Only show if available */}
            {trackingNumber && (
                <CopyableText
                    label={t('order:detail.trackingID')}
                    value={trackingNumber}
                />
            )}

            {/* Estimated Delivery - Only show if available */}
            {estimatedDelivery && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('order:detail.estimatedDelivery')}</Text>
                    <Text style={styles.infoValue}>{estimatedDelivery}</Text>
                </View>
            )}

            {/* Track Button - Only show if has tracking */}
            {trackingNumber && onTrackingPress && (
                <Pressable
                    style={({ pressed }) => [
                        styles.trackButton,
                        pressed && styles.trackButtonPressed,
                    ]}
                    onPress={onTrackingPress}
                >
                    <IconSymbol
                        name="location"
                        size={16}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.trackButtonText}>{t('order:detail.trackOrder')}</Text>
                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={theme.colors.primary}
                    />
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.smd,
        gap: theme.margins.sm,
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    infoLabel: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    carrierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    carrierDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    carrierName: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    // Copyable row
    copyableRow: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    copyableValue: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    trackingCode: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.primaryMuted,
        gap: 4,
    },
    copyButtonPressed: {
        opacity: 0.7,
    },
    copyText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Track button
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.sm,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        gap: 6,
    },
    trackButtonPressed: {
        backgroundColor: theme.colors.primaryMuted,
    },
    trackButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));
