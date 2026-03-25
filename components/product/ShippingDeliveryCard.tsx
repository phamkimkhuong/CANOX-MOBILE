import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import type { ShippingAddress } from '@/types/address';
import { formatShippingAddress } from '@/utils/adapter/addressAdapter';
import type { ProductShippingCompatibility } from '@/utils/productShipping';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShippingDeliveryCardProps {
    address: ShippingAddress | null;
    compatibility: ProductShippingCompatibility;
}

export const ShippingDeliveryCard = memo<ShippingDeliveryCardProps>(({ address, compatibility }) => {
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

    const addressText = useMemo(() => {
        if (compatibility.requiresAddressSelection) {
            return t('shipping.addressRequired');
        }

        return address ? formatShippingAddress(address) : t('shipping.addressRequired');
    }, [address, compatibility.requiresAddressSelection, t]);

    const warningMessage = useMemo(() => {
        if (compatibility.mismatch === 'domestic_address_for_international_only') {
            return t('shipping.internationalOnly');
        }

        if (compatibility.mismatch === 'international_address_for_domestic_only') {
            return t('shipping.domesticOnly');
        }

        return null;
    }, [compatibility.mismatch, t]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <View style={styles.leftIcon}>
                <IconSymbol name="local-shipping" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>
                    {t('shipping.title')}
                </Text>
                <Text
                    style={[
                        styles.addressText,
                        compatibility.requiresAddressSelection && styles.addressPromptText,
                    ]}
                    numberOfLines={warningMessage ? 1 : 2}
                >
                    {addressText}
                </Text>
                {warningMessage && (
                    <View style={styles.warningRow}>
                        <IconSymbol name="warning" size={14} color={theme.colors.warning} />
                        <Text style={styles.warningText} numberOfLines={2}>
                            {warningMessage}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.chevronWrapper}>
                <IconSymbol name="chevron-right" size={20} color={theme.colors.typographySecondary} />
            </View>
        </Pressable>
    );
});

ShippingDeliveryCard.displayName = 'ShippingDeliveryCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
    },
    leftIcon: {
        marginRight: theme.margins.sm,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    addressText: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    addressPromptText: {
        color: theme.colors.primary,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.xs,
        marginTop: theme.margins.xs,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
        color: theme.colors.warning,
    },
    chevronWrapper: {
        marginLeft: theme.margins.sm,
        marginTop: 2,
    },
}));
