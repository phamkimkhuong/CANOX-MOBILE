/**
 * AddressList - Danh sách địa chỉ với 2 mode: Selection & Management
 * Supports pull-to-refresh for refreshing address data
 */

import type { AddressListMode, ShippingAddress } from '@/types/address';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AddressCard } from './AddressCard';
import { AddressListSkeleton } from './AddressListSkeleton';

interface AddressListProps {
    addresses: ShippingAddress[];
    mode: AddressListMode;
    selectedId?: string | null;
    isLoading?: boolean;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    onSelect?: (address: ShippingAddress) => void;
    onEdit?: (address: ShippingAddress) => void;
    contentContainerStyle?: { paddingBottom?: number };
}

export const AddressList: React.FC<AddressListProps> = memo(({
    addresses,
    mode,
    selectedId,
    isLoading,
    isRefreshing = false,
    onRefresh,
    onSelect,
    onEdit,
    contentContainerStyle,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const renderItem = useCallback(
        ({ item }: { item: ShippingAddress }) => (
            <AddressCard
                address={item}
                mode={mode}
                selectedId={selectedId}
                onPress={mode === 'selection' ? onSelect : onEdit}
                onEdit={onEdit}
            />
        ),
        [mode, selectedId, onSelect, onEdit]
    );

    const keyExtractor = useCallback((item: ShippingAddress) => item.id, []);

    const ItemSeparator = useCallback(
        () => <View style={styles.separator} />,
        [styles.separator]
    );

    // Loading state (first load)
    if (isLoading) {
        return <AddressListSkeleton />;
    }

    // Empty state
    if (addresses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {t('address:list.emptyTitle')}
                </Text>
                <Text style={styles.emptySubtext}>
                    {t('address:list.emptySubtitle')}
                </Text>
            </View>
        );

    }

    return (
        <FlashList<ShippingAddress>
            data={addresses}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            contentContainerStyle={{
                padding: theme.margins.md,
                ...contentContainerStyle,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.newPrimary]}
                        tintColor={theme.colors.newPrimary}
                    />
                ) : undefined
            }
        />
    );
});

AddressList.displayName = 'AddressList';

const stylesheet = StyleSheet.create((theme) => ({
    separator: {
        height: theme.margins.smd,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.margins.xl,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
