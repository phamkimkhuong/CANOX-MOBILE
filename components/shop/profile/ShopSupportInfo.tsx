/**
 * ==============================================
 * SHOP SUPPORT INFO - Customer Service & Contact
 * ==============================================
 *
 * Displays support/contact information:
 * - Hotline (with call action)
 * - Support email (with email action)
 * - Working hours
 * - Return policy link
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopSupport } from '@/types/shop/shopIdentity';
import React, { memo, useCallback } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopSupportInfoProps {
    support: ShopSupport;
}

export const ShopSupportInfo = memo(({ support }: ShopSupportInfoProps) => {
    const { theme } = useUnistyles();

    const handleCallPress = useCallback(() => {
        if (!support.hotline) return;
        const phoneNumber = support.hotline.replace(/\s/g, '');
        Linking.openURL(`tel:${phoneNumber}`).catch(() => {
            Toast.show({
                type: 'error',
                text1: 'Không thể thực hiện cuộc gọi',
            });
        });
    }, [support.hotline]);

    const handleEmailPress = useCallback(() => {
        if (!support.supportEmail) return;
        Linking.openURL(`mailto:${support.supportEmail}`).catch(() => {
            Toast.show({
                type: 'error',
                text1: 'Không thể mở ứng dụng email',
            });
        });
    }, [support.supportEmail]);

    const handlePolicyPress = useCallback(() => {
        if (!support.returnPolicyUrl) return;
        Linking.openURL(support.returnPolicyUrl).catch(() => {
            Toast.show({
                type: 'error',
                text1: 'Không thể mở liên kết',
            });
        });
    }, [support.returnPolicyUrl]);

    const hasContent = support.hotline || support.supportEmail || support.workingHoursDisplay;

    if (!hasContent) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconSymbol name="headset" size={20} color={theme.colors.primary} />
                <Text style={styles.title}>Hỗ trợ khách hàng</Text>
            </View>

            {/* Contact Actions */}
            <View style={styles.actions}>
                {/* Hotline */}
                {support.hotline && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleCallPress}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.success + '20' }]}>
                            <IconSymbol name="call" size={18} color={theme.colors.success} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionLabel}>Hotline</Text>
                            <Text style={styles.actionValue}>{support.hotline}</Text>
                        </View>
                        <IconSymbol name="chevron-forward" size={18} color={theme.colors.secondary} />
                    </Pressable>
                )}

                {/* Email */}
                {support.supportEmail && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleEmailPress}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                            <IconSymbol name="mail" size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionLabel}>Email hỗ trợ</Text>
                            <Text style={styles.actionValue}>{support.supportEmail}</Text>
                        </View>
                        <IconSymbol name="chevron-forward" size={18} color={theme.colors.secondary} />
                    </Pressable>
                )}
            </View>

            {/* Working Hours */}
            {support.workingHoursDisplay && (
                <View style={styles.infoRow}>
                    <IconSymbol name="time-outline" size={16} color={theme.colors.secondary} />
                    <Text style={styles.infoText}>{support.workingHoursDisplay}</Text>
                </View>
            )}

            {/* Return Policy Link */}
            {support.returnPolicyUrl && (
                <Pressable onPress={handlePolicyPress} style={styles.policyLink}>
                    <IconSymbol name="document-text-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.policyText}>Xem chính sách đổi trả & bảo hành</Text>
                </Pressable>
            )}
        </View>
    );
});

ShopSupportInfo.displayName = 'ShopSupportInfo';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.background,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    buttonPressed: {
        opacity: 0.8,
        backgroundColor: theme.colors.activeSoft,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    actionContent: {
        flex: 1,
        marginLeft: theme.margins.sm,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        marginBottom: 2,
    },
    actionValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
    },
    infoText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    policyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginTop: 12,
    },
    policyText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
}));

export default ShopSupportInfo;
