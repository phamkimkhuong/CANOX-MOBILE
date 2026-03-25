/**
 * ==============================================
 * ORDER DETAIL HEADER - Header cho Order Detail
 * ==============================================
 * Hiển thị:
 * - Back button
 * - Mã đơn hàng (có thể copy)
 * - Nút support/chat
 */

import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderDetailHeaderProps {
    orderNumber: string;
    placedAtText?: string;
    onSupportPress?: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
    orderNumber,
    placedAtText,
    onSupportPress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleCopyOrderNumber = useCallback(async () => {
        await Clipboard.setStringAsync(orderNumber);
        Toast.show({
            type: 'success',
            text1: t('common:status.success'),
            text2: orderNumber,
        });
    }, [orderNumber, t]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Back Button */}
                <Pressable
                    onPress={handleBack}
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.buttonPressed,
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol
                        name="arrow-back"
                        size={24}
                        color={theme.colors.typography}
                    />
                </Pressable>

                {/* Title + Order Number */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{t('order:detail.title')}</Text>
                    <Pressable
                        onPress={handleCopyOrderNumber}
                        style={styles.orderNumberRow}
                    >
                        <Text style={styles.orderNumber}>#{orderNumber}</Text>
                        <IconSymbol
                            name="content-copy"
                            size={12}
                            color={theme.colors.typographySecondary}
                        />
                    </Pressable>
                    {placedAtText ? (
                        <Text style={styles.placedAtText} numberOfLines={1}>
                            {placedAtText}
                        </Text>
                    ) : null}
                </View>

                {/* Support Button */}
                <Pressable
                    onPress={onSupportPress}
                    style={({ pressed }) => [
                        styles.supportButton,
                        pressed && styles.buttonPressed,
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol
                        name="headset"
                        size={22}
                        color={theme.colors.typography}
                    />
                </Pressable>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 64,
        paddingHorizontal: theme.margins.sm,
        paddingBottom: theme.margins.xs,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.full,
    },
    buttonPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    orderNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    orderNumber: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    placedAtText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    supportButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.full,
    },
}));
