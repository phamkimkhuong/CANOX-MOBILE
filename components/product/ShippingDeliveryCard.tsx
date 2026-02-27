import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useProductShippingInfo } from '@/hooks/api/product/useShippingEligibility';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShippingDeliveryCardProps {
    productId: string;
}

export const ShippingDeliveryCard = memo<ShippingDeliveryCardProps>(({ productId }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');
    const { data: shippingInfo, isLoading, isGuest, hasMissingAddress } = useProductShippingInfo(productId);

    const handlePress = useCallback(() => {
        if (isGuest) {
            Navigator.push(ROUTES.AUTH.LOGIN);
        } else if (hasMissingAddress) {
            const params = new URLSearchParams({ mode: 'selection' });
            Navigator.push(`${ROUTES.ADDRESS.LIST}?${params.toString()}` as never);
        }
    }, [isGuest, hasMissingAddress]);

    const renderContent = () => {
        if (isGuest) {
            return <Text style={styles.text}>{t('shipping.loginToView', 'Đăng nhập để xem phí vận chuyển')}</Text>;
        }
        if (hasMissingAddress) {
            return <Text style={styles.text}>{t('shipping.addAddress', 'Thêm địa chỉ nhận hàng để xem phí')}</Text>;
        }
        if (isLoading) {
            return (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={theme.colors.buttonActive} />
                    <Text style={[styles.text, styles.loadingText]}>{t('shipping.checking', 'Đang kiểm tra khu vực...')}</Text>
                </View>
            );
        }
        if (shippingInfo?.eligible) {
            return (
                <View style={styles.infoRow}>
                    <Text style={[styles.text, styles.successText]} numberOfLines={2}>
                        {shippingInfo.message || t('shipping.eligible', 'Sẵn sàng giao hàng đến địa chỉ của bạn')}
                    </Text>
                </View>
            );
        }
        if (shippingInfo && !shippingInfo.eligible) {
            return (
                <View style={styles.infoRow}>
                    <Text style={[styles.text, styles.errorText]} numberOfLines={2}>
                        {shippingInfo.message || t('shipping.notEligible', 'Không hỗ trợ giao khối lượng hàng này đến khu vực của bạn')}
                    </Text>
                </View>
            );
        }
        return <Text style={styles.text}>{t('shipping.check', 'Kiểm tra phí giao hàng')}</Text>;
    };

    return (
        <Pressable style={styles.container} onPress={handlePress} disabled={!isGuest && !hasMissingAddress}>
            <View style={styles.leftIcon}>
                <IconSymbol name="local-shipping" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.content}>
                {renderContent()}
            </View>
            {(isGuest || hasMissingAddress) && (
                <IconSymbol name="chevron-right" size={20} color={theme.colors.typographySecondary} />
            )}
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
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
    },
    text: {
        fontSize: 13,
        color: theme.colors.typography,
    },
    loadingText: {
        color: theme.colors.typographySecondary,
    },
    successText: {
        color: theme.colors.success,
    },
    errorText: {
        color: theme.colors.error,
    },
}));
