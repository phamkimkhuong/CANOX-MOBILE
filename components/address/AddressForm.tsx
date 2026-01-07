/**
 * AddressForm - Form thêm/sửa địa chỉ với Location Picker
 * 
 * Features:
 * - react-hook-form + zod validation
 * - Cascading location picker (Province -> Ward)
 * - Address label selection (Home/Work/Other)
 * - Default address toggle
 * - Handles edit mode where provinceCode might be missing from API
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import type {
    AddressFormData,
    AddressLabel,
    Province,
    ShippingAddress,
    Ward,
} from '@/types/address';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { memo, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';
import { LocationPickerSheet } from './LocationPickerSheet';

// ============================================
// VALIDATION SCHEMA
// ============================================

const addressFormSchema = z.object({
    recipientName: z
        .string()
        .min(2, 'Tên người nhận tối thiểu 2 ký tự')
        .max(50, 'Tên người nhận tối đa 50 ký tự'),
    phone: z
        .string()
        .min(10, 'Số điện thoại không hợp lệ')
        .max(11, 'Số điện thoại không hợp lệ')
        .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
    provinceCode: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
    provinceName: z.string(),
    wardCode: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
    wardName: z.string(),
    streetAddress: z
        .string()
        .min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự')
        .max(200, 'Địa chỉ chi tiết tối đa 200 ký tự'),
    label: z.enum(['home', 'work', 'other']),
    isDefault: z.boolean(),
});

// ============================================
// TYPES
// ============================================

interface AddressFormProps {
    /** Initial data for edit mode */
    initialData?: ShippingAddress;
    /** Called when form is submitted */
    onSubmit: (data: AddressFormData) => void;
    /** Called when delete button is pressed (only in edit mode) */
    onDelete?: () => void;
    /** Loading state for submit */
    isSubmitting?: boolean;
    /** Loading state for delete */
    isDeleting?: boolean;
}

interface LabelOption {
    value: AddressLabel;
    label: string;
    icon: IconSymbolName;
}

// ============================================
// CONSTANTS
// ============================================

const LABEL_OPTIONS: LabelOption[] = [
    { value: 'home', label: 'Nhà riêng', icon: 'home' },
    { value: 'work', label: 'Văn phòng', icon: 'work' },
    { value: 'other', label: 'Khác', icon: 'location-outline' },
];

// ============================================
// COMPONENT
// ============================================

export const AddressForm: React.FC<AddressFormProps> = memo(({
    initialData,
    onSubmit,
    onDelete,
    isSubmitting = false,
    isDeleting = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Picker state
    const [showProvincePicker, setShowProvincePicker] = useState(false);
    const [showWardPicker, setShowWardPicker] = useState(false);

    /**
     * Selected location state
     */
    const hasValidProvinceCode = initialData?.provinceCode && initialData.provinceCode.length > 0;

    const [selectedProvince, setSelectedProvince] = useState<Province | null>(
        initialData && hasValidProvinceCode
            ? {
                id: '',
                code: initialData.provinceCode,
                fullName: initialData.provinceName,
                totalWards: 0,
            }
            : null
    );

    const [selectedWard, setSelectedWard] = useState<Ward | null>(
        initialData && hasValidProvinceCode
            ? {
                id: '',
                code: initialData.wardCode,
                fullName: initialData.wardName,
                provinceCode: initialData.provinceCode,
                province: null,
            }
            : null
    );

    // Form setup
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: initialData
            ? {
                recipientName: initialData.recipientName,
                phone: initialData.phone,
                provinceCode: initialData.provinceCode,
                provinceName: initialData.provinceName,
                wardCode: initialData.wardCode,
                wardName: initialData.wardName,
                streetAddress: initialData.streetAddress,
                label: initialData.label,
                isDefault: initialData.isDefault,
            }
            : {
                recipientName: '',
                phone: '',
                provinceCode: '',
                provinceName: '',
                wardCode: '',
                wardName: '',
                streetAddress: '',
                label: 'home',
                isDefault: false,
            },
    });

    const selectedLabel = watch('label');

    /**
     * Handle province selection
     */
    const handleProvinceSelect = useCallback(
        (province: Province | Ward) => {
            const prov = province as Province;
            setSelectedProvince(prov);
            setValue('provinceCode', prov.code, { shouldValidate: true });
            setValue('provinceName', prov.fullName);

            // Reset ward when province changes
            setSelectedWard(null);
            setValue('wardCode', '', { shouldValidate: false }); // Don't validate yet
            setValue('wardName', '');
        },
        [setValue]
    );

    /**
     * Handle ward selection
     */
    const handleWardSelect = useCallback(
        (ward: Province | Ward) => {
            const w = ward as Ward;
            setSelectedWard(w);
            setValue('wardCode', w.code, { shouldValidate: true });
            setValue('wardName', w.fullName);
        },
        [setValue]
    );

    // Handle label selection
    const handleLabelSelect = useCallback(
        (label: AddressLabel) => {
            setValue('label', label);
        },
        [setValue]
    );

    // Handle form submission
    const handleFormSubmit = handleSubmit((data) => {
        Keyboard.dismiss();
        onSubmit(data);
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Recipient Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Họ và tên người nhận *</Text>
                    <Controller
                        control={control}
                        name="recipientName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.recipientName && styles.inputError,
                                ]}
                                placeholder="Nhập họ tên người nhận"
                                placeholderTextColor={theme.colors.secondary}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                maxLength={50}
                            />
                        )}
                    />
                    {errors.recipientName && (
                        <Text style={styles.errorText}>
                            {errors.recipientName.message}
                        </Text>
                    )}
                </View>

                {/* Phone */}
                <View style={styles.field}>
                    <Text style={styles.label}>Số điện thoại *</Text>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor={theme.colors.secondary}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                        )}
                    />
                    {errors.phone && (
                        <Text style={styles.errorText}>{errors.phone.message}</Text>
                    )}
                </View>

                {/* Province Picker */}
                <View style={styles.field}>
                    <Text style={styles.label}>Tỉnh/Thành phố *</Text>
                    <Pressable
                        onPress={() => setShowProvincePicker(true)}
                        style={[
                            styles.picker,
                            errors.provinceCode && styles.inputError,
                        ]}
                    >
                        <Text
                            style={[
                                styles.pickerText,
                                !selectedProvince && styles.pickerPlaceholder,
                            ]}
                        >
                            {selectedProvince?.fullName || 'Chọn Tỉnh/Thành phố'}
                        </Text>
                        <IconSymbol
                            name="chevron-down"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </Pressable>
                    {errors.provinceCode && (
                        <Text style={styles.errorText}>
                            {errors.provinceCode.message}
                        </Text>
                    )}
                </View>

                {/* Ward Picker */}
                <View style={styles.field}>
                    <Text style={styles.label}>Phường/Xã *</Text>
                    <Pressable
                        onPress={() => {
                            if (!selectedProvince || !selectedProvince.code) {
                                setShowProvincePicker(true);
                            } else {
                                setShowWardPicker(true);
                            }
                        }}
                        style={[
                            styles.picker,
                            errors.wardCode && styles.inputError,
                            !selectedProvince && styles.pickerDisabled,
                        ]}
                    >
                        <Text
                            style={[
                                styles.pickerText,
                                !selectedWard && styles.pickerPlaceholder,
                            ]}
                        >
                            {selectedWard?.fullName ||
                                (selectedProvince
                                    ? 'Chọn Phường/Xã'
                                    : 'Vui lòng chọn Tỉnh/Thành phố trước')}
                        </Text>
                        <IconSymbol
                            name="chevron-down"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </Pressable>
                    {errors.wardCode && (
                        <Text style={styles.errorText}>{errors.wardCode.message}</Text>
                    )}
                </View>

                {/* Street Address */}
                <View style={styles.field}>
                    <Text style={styles.label}>Địa chỉ chi tiết *</Text>
                    <Controller
                        control={control}
                        name="streetAddress"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.inputMultiline,
                                    errors.streetAddress && styles.inputError,
                                ]}
                                placeholder="Số nhà, tên đường, tòa nhà..."
                                placeholderTextColor={theme.colors.secondary}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                multiline
                                numberOfLines={3}
                                maxLength={200}
                                textAlignVertical="top"
                            />
                        )}
                    />
                    {errors.streetAddress && (
                        <Text style={styles.errorText}>
                            {errors.streetAddress.message}
                        </Text>
                    )}
                </View>

                {/* Address Label */}
                <View style={styles.field}>
                    <Text style={styles.label}>Loại địa chỉ</Text>
                    <View style={styles.labelOptions}>
                        {LABEL_OPTIONS.map((option) => (
                            <Pressable
                                key={option.value}
                                onPress={() => handleLabelSelect(option.value)}
                                style={[
                                    styles.labelOption,
                                    selectedLabel === option.value &&
                                    styles.labelOptionSelected,
                                ]}
                            >
                                <IconSymbol
                                    name={option.icon}
                                    size={18}
                                    color={
                                        selectedLabel === option.value
                                            ? theme.colors.primary
                                            : theme.colors.secondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.labelOptionText,
                                        selectedLabel === option.value &&
                                        styles.labelOptionTextSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Default Address Toggle */}
                <Controller
                    control={control}
                    name="isDefault"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.switchRow}>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>
                                    Đặt làm địa chỉ mặc định
                                </Text>
                                <Text style={styles.switchDescription}>
                                    Địa chỉ này sẽ được chọn tự động khi đặt hàng
                                </Text>
                            </View>
                            <Switch
                                value={value}
                                onValueChange={onChange}
                                trackColor={{
                                    false: theme.colors.border,
                                    true: theme.colors.primarySoft,
                                }}
                                thumbColor={
                                    value ? theme.colors.primary : theme.colors.surface
                                }
                            />
                        </View>
                    )}
                />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <View style={styles.footerButtonRow}>
                    {/* Delete Button - Only show in edit mode */}
                    {initialData && onDelete && (
                        <Pressable
                            onPress={onDelete}
                            disabled={isDeleting || isSubmitting}
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.deleteButtonPressed,
                                isDeleting && styles.deleteButtonDisabled,
                            ]}
                        >
                            <IconSymbol
                                name="delete"
                                size={18}
                                color={theme.colors.error}
                            />
                            <Text style={styles.deleteButtonText}>
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Submit Button */}
                    <Pressable
                        onPress={handleFormSubmit}
                        disabled={isSubmitting || isDeleting}
                        style={({ pressed }) => [
                            styles.submitButton,
                            // Make full width if no delete button
                            !initialData && styles.submitButtonFullWidth,
                            pressed && styles.submitButtonPressed,
                            (isSubmitting || isDeleting) && styles.submitButtonDisabled,
                        ]}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting
                                ? 'Đang lưu...'
                                : initialData
                                    ? 'Cập nhật'
                                    : 'Thêm địa chỉ'}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Location Pickers */}
            <LocationPickerSheet
                type="province"
                visible={showProvincePicker}
                selectedValue={selectedProvince}
                onClose={() => setShowProvincePicker(false)}
                onSelect={handleProvinceSelect}
            />

            <LocationPickerSheet
                type="ward"
                provinceCode={selectedProvince?.code}
                visible={showWardPicker}
                selectedValue={selectedWard}
                onClose={() => setShowWardPicker(false)}
                onSelect={handleWardSelect}
            />
        </KeyboardAvoidingView>
    );
});

AddressForm.displayName = 'AddressForm';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.margins.md,
        gap: theme.margins.md,
    },

    field: {
        gap: theme.margins.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        fontSize: 15,
        color: theme.colors.typography,
    },
    inputMultiline: {
        minHeight: 80,
        paddingTop: theme.margins.smd,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
    },

    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        minHeight: 48,
    },
    pickerDisabled: {
        opacity: 0.6,
    },
    pickerText: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.typography,
    },
    pickerPlaceholder: {
        color: theme.colors.secondary,
    },

    labelOptions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    labelOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
    },
    labelOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
    },
    labelOptionText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    labelOptionTextSelected: {
        color: theme.colors.primary,
        fontWeight: '500',
    },

    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    switchTextContainer: {
        flex: 1,
        marginRight: theme.margins.md,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    switchDescription: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },

    footer: {
        padding: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    footerButtonRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.error,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.md,
        height: 48,
    },
    deleteButtonPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },
    submitButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    submitButtonFullWidth: {
        flex: 1,
    },
    submitButtonPressed: {
        opacity: 0.9,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
