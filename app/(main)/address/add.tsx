/**
 * Add/Edit Address Screen
 * 
 * Features:
 * - Add new address
 * - Edit existing address (when id param is provided)
 * - Delete address (in edit mode)
 */

import { AddressForm, AddressHeader } from '@/components/address';
import {
    useAddAddress,
    useDeleteAddress,
    useUpdateAddress,
    useUserAddresses,
} from '@/hooks/api/useUserAddresses';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { AddressFormData } from '@/types/address';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native-unistyles';

export default function AddAddressScreen() {
    const { t } = useTranslation(['address', 'common']);
    const styles = stylesheet;

    // Get id from params
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!id;

    // Fetch existing address for edit mode
    const { data: addresses } = useUserAddresses();
    const existingAddress = useMemo(
        () => addresses?.find((addr) => addr.id === id) ?? undefined,
        [addresses, id]
    );

    // Store action for success message
    const setPendingSuccessMessage = useUserAddressStore((s) => s.setPendingSuccessMessage);

    // Mutations
    const addAddress = useAddAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();

    // Handle form submission
    const handleSubmit = useCallback(
        async (data: AddressFormData) => {
            try {
                if (isEditMode && id) {
                    await updateAddress.mutateAsync({ id, data });
                    setPendingSuccessMessage('update');
                } else {
                    await addAddress.mutateAsync(data);
                    setPendingSuccessMessage('add');
                }
                Navigator.back();
            } catch {
                Toast.show({
                    type: 'error',
                    text1: t('common:status.error'),
                    text2: isEditMode
                        ? t('address:form.messages.updateError') // I'll use a generic error if not specific
                        : t('address:form.messages.addError'),
                });
            }
        },
        [isEditMode, id, addAddress, updateAddress, setPendingSuccessMessage, t]
    );

    /**
     * Handle delete address with confirmation
     * Shows warning if trying to delete default address
     */
    const handleDelete = useCallback(() => {
        if (!id || !existingAddress) return;

        // Prevent deleting default address
        if (existingAddress.isDefault) {
            Toast.show({
                type: 'error',
                text1: t('common:status.error'),
                text2: t('address:list.cannotDeleteDefault'),
            });
            return;
        }

        // Custom Confirmation dialog
        Alert.show({
            title: t('address:deleteAlert.title'),
            message: t('address:deleteAlert.message', { name: existingAddress.recipientName }),
            type: 'warning',
            buttons: [
                {
                    text: t('address:deleteAlert.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('address:deleteAlert.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAddress.mutateAsync(id);
                            setPendingSuccessMessage('delete');
                            Navigator.back();
                        } catch {
                            // Use custom alert for error too
                            Alert.error(t('address:deleteAlert.error'));
                        }
                    },
                },
            ],
        });
    }, [id, existingAddress, deleteAddress, setPendingSuccessMessage, t]);

    // Header title
    const headerTitle = isEditMode ? t('address:form.editTitle') : t('address:form.addTitle');

    return (
        <View style={styles.container}>
            <AddressHeader title={headerTitle} />

            <AddressForm
                initialData={existingAddress}
                onSubmit={handleSubmit}
                onDelete={isEditMode ? handleDelete : undefined}
                isSubmitting={addAddress.isPending || updateAddress.isPending}
                isDeleting={deleteAddress.isPending}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
}));
