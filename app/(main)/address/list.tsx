/**
 * Address List Screen - Quản lý địa chỉ giao hàng
 * 
 * - mode=selection: Từ Checkout -> chọn địa chỉ -> save to store -> back
 * - mode=management: Từ Settings -> CRUD địa chỉ
 */

import { AddressHeader, AddressList } from '@/components/address';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import {
    checkAddressLimitAndShowToast,
    useCanAddAddress,
    useUserAddresses,
} from '@/hooks/api/useUserAddresses';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { AddressListMode, ShippingAddress } from '@/types/address';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function AddressListScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // Get mode and selectedId from search params
    const { mode: modeParam, selectedId: selectedIdParam } = useLocalSearchParams<{
        mode?: string;
        selectedId?: string;
    }>();

    const mode: AddressListMode = modeParam === 'selection' ? 'selection' : 'management';

    // Fetch addresses with refetch support for pull-to-refresh
    const { data: addresses, isLoading, isRefetching, refetch } = useUserAddresses();
    const { currentCount, maxCount } = useCanAddAddress();

    // Checkout store for selection mode
    const setDeliveryAddress = useCheckoutStore((s) => s.setDeliveryAddress);

    // Sort addresses: default first
    const sortedAddresses = useMemo(() => {
        if (!addresses) return [];
        return [...addresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });
    }, [addresses]);

    /**
     * Determine which address should be visually selected (radio button)
     */
    const effectiveSelectedId = useMemo(() => {
        // Priority 1: Use selectedId from URL params (the address currently in checkout)
        if (selectedIdParam) {
            return selectedIdParam;
        }

        // Priority 2: In selection mode, default to the default address
        if (mode === 'selection' && addresses) {
            const defaultAddr = addresses.find((addr) => addr.isDefault);
            return defaultAddr?.id ?? null;
        }

        return null;
    }, [selectedIdParam, mode, addresses]);

    /**
     * Handle address selection in selection mode
     * Saves selected address to checkout store and navigates back
     */
    const handleSelect = useCallback(
        (address: ShippingAddress) => {
            if (mode === 'selection') {
                // Save selected address to checkout store
                setDeliveryAddress(address);
                router.back();
            }
        },
        [mode, setDeliveryAddress]
    );

    // Handle edit - navigate to edit form
    const handleEdit = useCallback((address: ShippingAddress) => {
        router.push({
            pathname: ROUTES.ADDRESS.ADD,
            params: { id: address.id },
        } as never);
    }, []);

    /**
     * Navigate to add new address
     * Check limit before navigating
     */
    const handleAddNew = useCallback(() => {
        if (checkAddressLimitAndShowToast(currentCount, maxCount)) {
            router.push(ROUTES.ADDRESS.ADD as never);
        }
    }, [currentCount, maxCount]);

    // Header title
    const headerTitle = mode === 'selection' ? 'Chọn địa chỉ nhận hàng' : 'Quản lý địa chỉ';

    return (
        <View style={styles.container}>
            <AddressHeader title={headerTitle} />

            <AddressList
                addresses={sortedAddresses}
                mode={mode}
                selectedId={effectiveSelectedId}
                isLoading={isLoading}
                isRefreshing={isRefetching}
                onRefresh={refetch}
                onSelect={handleSelect}
                onEdit={handleEdit}
                contentContainerStyle={{
                    paddingBottom: 80 + insets.bottom,
                }}
            />

            {/* Sticky Add Button */}
            <View
                style={[
                    styles.footerContainer,
                    { paddingBottom: insets.bottom + theme.margins.md },
                ]}
            >
                <Pressable
                    onPress={handleAddNew}
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.addButtonPressed,
                    ]}
                >
                    <IconSymbol name="add" size={20} color={theme.colors.onPrimary} />
                    <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
                </Pressable>
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        paddingVertical: theme.margins.smd,
        height: 48,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
