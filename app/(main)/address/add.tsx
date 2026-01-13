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
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Alert, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native-unistyles';

export default function AddAddressScreen() {
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
                    text1: 'Lỗi',
                    text2: isEditMode
                        ? 'Không thể cập nhật địa chỉ. Vui lòng thử lại.'
                        : 'Không thể thêm địa chỉ. Vui lòng thử lại.',
                });
            }
        },
        [isEditMode, id, addAddress, updateAddress, setPendingSuccessMessage]
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
                text1: 'Không thể xóa',
                text2: 'Vui lòng chọn địa chỉ mặc định khác trước khi xóa địa chỉ này.',
            });
            return;
        }

        // Confirmation dialog
        Alert.alert(
            'Xóa địa chỉ',
            `Bạn có chắc muốn xóa địa chỉ của ${existingAddress.recipientName}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAddress.mutateAsync(id);
                            setPendingSuccessMessage('delete');
                            Navigator.back();
                        } catch {
                            Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại.');
                        }
                    },
                },
            ]
        );
    }, [id, existingAddress, deleteAddress, setPendingSuccessMessage]);

    // Header title
    const headerTitle = isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới';

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
