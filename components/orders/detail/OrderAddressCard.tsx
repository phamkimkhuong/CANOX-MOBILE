/**
 * ==============================================
 * ORDER ADDRESS CARD - Địa chỉ nhận hàng (Read-only)
 * ==============================================
 * Hiển thị địa chỉ giao hàng trong Order Detail
 * Khác với AddressCard trong Checkout (có nút sửa/chọn)
 * 
 * Features:
 * - Display only - không có interaction
 * - Hiển thị: Tên + SĐT + Địa chỉ đầy đủ
 * - Nút copy địa chỉ (optional)
 */

import { IconSymbol } from '@/components/ui/Icon';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderAddressCardProps {
    recipientName: string;
    phoneNumber: string;
    fullAddress: string;
    email?: string | null;
}

export const OrderAddressCard: React.FC<OrderAddressCardProps> = ({
    recipientName,
    phoneNumber,
    fullAddress,
    email,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = useCallback(async () => {
        const textToCopy = `${recipientName}\n${phoneNumber}\n${fullAddress}`;
        await Clipboard.setStringAsync(textToCopy);
        setCopied(true);

        Toast.show({
            type: 'success',
            text1: t('common:status.success'),
        });

        setTimeout(() => setCopied(false), 2000);
    }, [recipientName, phoneNumber, fullAddress, t]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <IconSymbol
                        name="location-on"
                        size={18}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={styles.headerTitle}>{t('order:detail.shippingAddress')}</Text>

                {/* Copy button */}
                <Pressable
                    onPress={handleCopyAddress}
                    style={({ pressed }) => [
                        styles.copyButton,
                        pressed && styles.copyButtonPressed,
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <IconSymbol
                        name={copied ? 'check' : 'content-copy'}
                        size={14}
                        color={copied ? theme.colors.success : theme.colors.typographySecondary}
                    />
                </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Name + Phone Row */}
                <View style={styles.nameRow}>
                    <Text style={styles.recipientName}>{recipientName}</Text>
                    <View style={styles.phoneBadge}>
                        <IconSymbol
                            name="phone"
                            size={12}
                            color={theme.colors.typographySecondary}
                        />
                        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                    </View>
                </View>

                {/* Full Address */}
                <Text style={styles.fullAddress}>{fullAddress}</Text>

                {/* Email (if available) */}
                {email && (
                    <View style={styles.emailRow}>
                        <IconSymbol
                            name="mail-outline"
                            size={12}
                            color={theme.colors.typographySecondary}
                        />
                        <Text style={styles.email}>{email}</Text>
                    </View>
                )}
            </View>
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
        marginBottom: theme.margins.sm,
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
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    copyButton: {
        padding: theme.margins.sm,
        borderRadius: theme.radius.s,
    },
    copyButtonPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    content: {
        paddingHorizontal: theme.margins.md,
        paddingLeft: theme.margins.md + 32 + theme.margins.sm, // Align with header text
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        marginBottom: 4,
    },
    recipientName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    phoneBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    phoneNumber: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    fullAddress: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    email: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
}));
