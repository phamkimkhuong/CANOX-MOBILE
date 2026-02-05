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
import i18n from '@/constants/i18n';
import { useCountries, useProvinces, useWards } from '@/hooks/api/useAddressData';
import type {
    AddressFormData,
    AddressLabel,
    Country,
    Province,
    ShippingAddress,
    Ward,
} from '@/types/address';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    countryCode: z.string().min(1, 'Vui lòng chọn Quốc gia'),
    countryName: z.string(),
    provinceCode: z.string().optional(),
    provinceName: z.string().min(1, 'Vui lòng nhập Tỉnh/Thành phố'),
    districtName: z.string().min(1, 'Vui lòng nhập Quận/Huyện'),
    wardCode: z.string().optional(),
    wardName: z.string().min(1, 'Vui lòng nhập Phường/Xã'),
    streetAddress: z
        .string()
        .min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự')
        .max(200, 'Địa chỉ chi tiết tối đa 200 ký tự'),
    label: z.enum(['home', 'work', 'other']),
    isDefault: z.boolean(),
}).superRefine((data, ctx) => {
    // If country is Vietnam, provinceCode and wardCode are required for cascading pickers
    if (data.countryCode === 'VN') {
        if (!data.provinceCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng chọn Tỉnh/Thành phố',
                path: ['provinceCode'],
            });
        }
        if (!data.wardCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng chọn Phường/Xã',
                path: ['wardCode'],
            });
        }
    }
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


/**
 * Helper to detect Vietnam from various country name formats
 */
const isVietnamName = (name?: string) => {
    if (!name) return false;
    const n = name.toLowerCase().trim();
    return n === 'vietnam' || n === 'viet nam' || n === 'việt nam';
};

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
    const { t } = useTranslation(['address', 'common']);
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const LABEL_OPTIONS: LabelOption[] = [
        { value: 'home', label: t('address:form.label.home'), icon: 'home' },
        { value: 'work', label: t('address:form.label.work'), icon: 'work' },
        { value: 'other', label: t('address:form.label.other'), icon: 'location-outline' },
    ];

    /**
     * PREFETCHING & DATA LOGIC
     */
    const { data: countriesResponse } = useCountries({ enabled: true });
    const countriesList = useMemo(() => countriesResponse?.data ?? [], [countriesResponse]);

    const { data: provincesResponse } = useProvinces({ enabled: true });
    const provincesList = useMemo(() => provincesResponse?.data ?? [], [provincesResponse]);

    // Picker state
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showProvincePicker, setShowProvincePicker] = useState(false);
    const [showWardPicker, setShowWardPicker] = useState(false);

    // Selected location state initialization
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
        if (initialData?.countryName) {
            const isVN = isVietnamName(initialData.countryName);
            return {
                code: isVN ? 'VN' : 'INTL', // Use placeholder if not VN to pass min(1) validation during loading
                name: initialData.countryName,
                fullName: initialData.countryName,
                totalProvinces: isVN ? 34 : 0,
            };
        }
        // Smart default: If language is VI, default to Viet Nam
        if (i18n.language === 'vi') {
            return {
                code: 'VN',
                name: 'Vietnam',
                fullName: 'Vietnam',
                totalProvinces: 34,
            };
        }
        return null;
    });

    const [selectedProvince, setSelectedProvince] = useState<Province | null>(
        initialData?.provinceName
            ? {
                id: '',
                code: initialData.provinceCode || '',
                fullName: initialData.provinceName,
                totalWards: 0,
            }
            : null
    );

    const [selectedWard, setSelectedWard] = useState<Ward | null>(
        initialData?.wardName
            ? {
                id: '',
                code: initialData.wardCode || '',
                fullName: initialData.wardName,
                provinceCode: initialData.provinceCode || '',
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
                countryCode: isVietnamName(initialData.countryName) ? 'VN' : 'INTL',
                countryName: initialData.countryName,
                provinceCode: initialData.provinceCode,
                provinceName: initialData.provinceName,
                districtName: initialData.districtName,
                wardCode: initialData.wardCode,
                wardName: initialData.wardName,
                streetAddress: initialData.streetAddress,
                label: initialData.label,
                isDefault: initialData.isDefault,
            }
            : {
                recipientName: '',
                phone: '',
                countryCode: selectedCountry?.code || '',
                countryName: selectedCountry?.name || '',
                provinceCode: '',
                provinceName: '',
                districtName: '',
                wardCode: '',
                wardName: '',
                streetAddress: '',
                label: 'home',
                isDefault: false,
            },
    });

    const selectedLabel = watch('label');
    const watchingCountryCode = watch('countryCode');
    const isVietnam = watchingCountryCode === 'VN';

    /**
     * AUTO-RESOLUTION LOGIC (EDIT MODE)
     */

    // 0. Resolve Country Code from list if missing or placeholder used
    useEffect(() => {
        if (initialData?.countryName && countriesList.length > 0) {
            const matched = countriesList.find(
                (c: Country) =>
                    c.name.toLowerCase() === initialData.countryName.toLowerCase() ||
                    c.fullName?.toLowerCase() === initialData.countryName.toLowerCase() ||
                    (isVietnamName(initialData.countryName) && c.code === 'VN')
            );

            if (matched && matched.code !== watchingCountryCode) {
                setSelectedCountry(matched);
                setValue('countryCode', matched.code);
            }
        }
    }, [countriesList, initialData, setValue, watchingCountryCode]);
    useEffect(() => {
        // 1. Resolve Province Code
        if (isVietnam && initialData && !selectedProvince?.code && provincesList.length > 0) {
            const matchedProvince = provincesList.find(
                (p: Province) => p.fullName.toLowerCase().trim() === initialData.provinceName.toLowerCase().trim()
            );

            if (matchedProvince) {
                setSelectedProvince(matchedProvince);
                setValue('provinceCode', matchedProvince.code);
            }
        }
    }, [isVietnam, initialData, provincesList, selectedProvince?.code, setValue]);

    // Fetch wards automatically once province code is resolved to find ward code
    const { data: wardsResponse } = useWards({
        provinceCode: selectedProvince?.code || null,
        enabled: isVietnam && !!selectedProvince?.code && !!initialData // Only auto-fetch in edit mode
    });
    const wardsList = useMemo(() => wardsResponse?.data ?? [], [wardsResponse]);

    useEffect(() => {
        // 2. Resolve Ward Code
        if (isVietnam && initialData && !selectedWard?.code && wardsList.length > 0) {
            const matchedWard = wardsList.find(
                (w: Ward) => w.fullName.toLowerCase().trim() === initialData.wardName.toLowerCase().trim()
            );

            if (matchedWard) {
                setSelectedWard(matchedWard);
                setValue('wardCode', matchedWard.code);
            }
        }
    }, [isVietnam, initialData, wardsList, selectedWard?.code, setValue]);

    /**
     * Handle country selection
     */
    const handleCountrySelect = useCallback(
        (country: Country | Province | Ward) => {
            const c = country as Country;
            setSelectedCountry(c);
            setValue('countryCode', c.code, { shouldValidate: true });
            setValue('countryName', c.name);

            // Reset other fields when country changes
            setSelectedProvince(null);
            setSelectedWard(null);
            setValue('provinceCode', '');
            setValue('provinceName', '');
            setValue('districtName', '');
            setValue('wardCode', '');
            setValue('wardName', '');
        },
        [setValue]
    );

    /**
     * Handle province selection
     */
    const handleProvinceSelect = useCallback(
        (province: Country | Province | Ward) => {
            const prov = province as Province;
            setSelectedProvince(prov);
            setValue('provinceCode', prov.code, { shouldValidate: true });
            setValue('provinceName', prov.fullName);

            // Reset ward when province changes
            setSelectedWard(null);
            setValue('wardCode', '', { shouldValidate: false });
            setValue('wardName', '');
        },
        [setValue]
    );

    /**
     * Handle ward selection
     */
    const handleWardSelect = useCallback(
        (ward: Country | Province | Ward) => {
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
                contentContainerStyle={[
                    styles.scrollContent,
                    styles.scrollContentExtra
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Country Picker */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.country.label')}</Text>

                    <Pressable
                        onPress={() => setShowCountryPicker(true)}
                        style={[
                            styles.picker,
                            errors.countryCode && styles.inputError,
                        ]}
                    >
                        <Text
                            style={[
                                styles.pickerText,
                                !selectedCountry && styles.pickerPlaceholder,
                            ]}
                        >
                            {selectedCountry?.name || t('address:form.country.placeholder')}
                        </Text>

                        <IconSymbol
                            name="chevron-down"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </Pressable>
                    {errors.countryCode && (
                        <Text style={styles.errorText}>
                            {t('address:form.country.error')}
                        </Text>
                    )}
                </View>

                {/* Recipient Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.recipientName.label')}</Text>

                    <Controller
                        control={control}
                        name="recipientName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.recipientName && styles.inputError,
                                ]}
                                placeholder={t('address:form.recipientName.placeholder')}
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
                            {t('address:form.recipientName.error')}
                        </Text>
                    )}
                </View>

                {/* Phone */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.phone.label')}</Text>

                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder={t('address:form.phone.placeholder')}
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
                        <Text style={styles.errorText}>{t('address:form.phone.error')}</Text>
                    )}
                </View>

                {/* Province / City */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.province.label')}</Text>

                    {isVietnam ? (
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
                                {selectedProvince?.fullName || t('address:form.province.placeholder')}
                            </Text>
                            <IconSymbol
                                name="chevron-down"
                                size={20}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    ) : (
                        <Controller
                            control={control}
                            name="provinceName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.provinceName && styles.inputError]}
                                    placeholder={t('address:form.province.placeholder')}
                                    placeholderTextColor={theme.colors.secondary}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    )}
                    {(errors.provinceCode || errors.provinceName) && (
                        <Text style={styles.errorText}>
                            {t('address:form.province.error')}
                        </Text>
                    )}
                </View>

                {/* District */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.district.label')}</Text>
                    <Controller
                        control={control}
                        name="districtName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.districtName && styles.inputError]}
                                placeholder={t('address:form.district.placeholder')}
                                placeholderTextColor={theme.colors.secondary}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                        )}
                    />
                    {errors.districtName && (
                        <Text style={styles.errorText}>
                            {t('address:form.district.error')}
                        </Text>
                    )}
                </View>

                {/* Ward / Commune */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.ward.label')}</Text>

                    {isVietnam ? (
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
                                (errors.wardCode || errors.wardName) && styles.inputError,
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
                                        ? t('address:form.ward.placeholder')
                                        : t('address:form.ward.hint'))}
                            </Text>
                            <IconSymbol
                                name="chevron-down"
                                size={20}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    ) : (
                        <Controller
                            control={control}
                            name="wardName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.wardName && styles.inputError]}
                                    placeholder={t('address:form.ward.placeholder')}
                                    placeholderTextColor={theme.colors.secondary}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    )}
                    {(errors.wardCode || errors.wardName) && (
                        <Text style={styles.errorText}>{t('address:form.ward.error')}</Text>
                    )}
                </View>

                {/* Street Address */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.streetAddress.label')}</Text>

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
                                placeholder={t('address:form.streetAddress.placeholder')}
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
                            {t('address:form.streetAddress.error')}
                        </Text>
                    )}

                </View>

                {/* Address Label */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.label.title')}</Text>

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
                                    {t('address:form.isDefault.label')}
                                </Text>
                                <Text style={styles.switchDescription}>
                                    {t('address:form.isDefault.description')}
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
            <View style={[styles.footer, { paddingBottom: insets.bottom + theme.margins.md }]}>
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
                                {isDeleting ? t('address:form.actions.deleting') : t('address:form.actions.delete')}
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
                                ? t('address:form.actions.submitting')
                                : initialData
                                    ? t('address:form.actions.submitUpdate')
                                    : t('address:form.actions.submitAdd')}
                        </Text>

                    </Pressable>
                </View>
            </View>

            {/* Location Pickers */}
            <LocationPickerSheet
                type="country"
                visible={showCountryPicker}
                selectedValue={selectedCountry}
                onClose={() => setShowCountryPicker(false)}
                onSelect={handleCountrySelect}
            />

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
    scrollContentExtra: {
        paddingBottom: 10,
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
