import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShippingDeliveryCardProps {
    productId: string;
}

export const ShippingDeliveryCard = memo<ShippingDeliveryCardProps>(() => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const handlePress = useCallback(() => {
        if (!isAuthenticated) {
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }
        const params = new URLSearchParams({ mode: 'selection' });
        Navigator.push(`${ROUTES.ADDRESS.LIST}?${params.toString()}` as never);
    }, [isAuthenticated]);

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <View style={styles.leftIcon}>
                <IconSymbol name="local-shipping" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Text style={[styles.text, styles.successText]} numberOfLines={2}>
                        {t('shipping.estimate', 'Phí vận chuyển dự kiến hiển thị tại bước thanh toán')}
                    </Text>
                </View>
            </View>
            <IconSymbol name="chevron-right" size={20} color={theme.colors.typographySecondary} />
        </Pressable>
    );
});

ShippingDeliveryCard.displayName = 'ShippingDeliveryCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
    },
    leftIcon: {
        marginRight: theme.margins.sm,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 13,
        color: theme.colors.typography,
    },
    successText: {
        color: theme.colors.typography,
    },
}));
