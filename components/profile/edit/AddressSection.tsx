import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useUserAddresses } from '@/hooks/api/useUserAddresses';
import { formatShippingAddress } from '@/utils/adapter/addressAdapter';
import { Navigator } from '@/utils/navigation';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * AddressSection - Displays a summary of the buyer's default address
 * in the profile edit screen and provides navigation to the full list.
 */
export const AddressSection: React.FC = memo(() => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['profile', 'common']);
    const styles = stylesheet;

    // Fetch addresses
    const { data: addresses, isLoading } = useUserAddresses();

    // Find default address
    const defaultAddress = useMemo(() => {
        return addresses?.find(addr => addr.isDefault) || addresses?.[0];
    }, [addresses]);

    const handleManageAddresses = () => {
        Navigator.push({
            pathname: ROUTES.ADDRESS.LIST,
            params: { mode: 'management' },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('profile:settings.items.profile')}</Text>
                <TouchableOpacity onPress={handleManageAddresses} activeOpacity={0.6}>
                    <Text style={styles.manageText}>
                        {addresses && addresses.length > 0 ? t('common:actions.edit') : t('common:actions.add')}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.card}
                onPress={handleManageAddresses}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.newPrimary} />
                ) : defaultAddress ? (
                    <View style={styles.addressInfo}>
                        <View style={styles.iconWrapper}>
                            <IconSymbol name="location" size={20} color={theme.colors.newPrimary} />
                        </View>
                        <View style={styles.textWrapper}>
                            <View style={styles.nameRow}>
                                <Text style={styles.recipientName}>{defaultAddress.recipientName}</Text>
                                {defaultAddress.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.phone}>{defaultAddress.phone}</Text>
                            <Text style={styles.fullAddress} numberOfLines={2}>
                                {formatShippingAddress(defaultAddress)}
                            </Text>
                        </View>
                        <IconSymbol name="chevron-right" size={20} color={theme.colors.secondary} />
                    </View>
                ) : (
                    <View style={styles.emptyWrapper}>
                        <IconSymbol name="location-off" size={24} color={theme.colors.secondary} />
                        <Text style={styles.emptyText}>Chưa có địa chỉ giao hàng</Text>
                        <IconSymbol name="chevron-right" size={20} color={theme.colors.secondary} />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
});

AddressSection.displayName = 'AddressSection';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.lg,
        marginBottom: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.margins.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    manageText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.newPrimary,
    },
    card: {
        backgroundColor: theme.colors.backgroundInput || 'rgba(0,0,0,0.02)',
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.activeSoft || 'rgba(239, 68, 68, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrapper: {
        flex: 1,
        gap: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    recipientName: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    defaultBadge: {
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    phone: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    fullAddress: {
        fontSize: 13,
        color: theme.colors.secondary,
        lineHeight: 18,
    },
    emptyWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    emptyText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.secondary,
        fontStyle: 'italic',
    },
}));
