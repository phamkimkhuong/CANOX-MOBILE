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

import i18n from '@/constants/i18n';
import { useCountries, useProvinces, useWards } from '@/hooks/api/useAddressData';
import {
    AddressFormData,
    AddressFormSchema,
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
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { LocationPickerSheet } from './LocationPickerSheet';
import { SmartLocationPicker } from './SmartLocationPicker';

// Sub-components
import { stylesheet } from './AddressForm.styles';
import { AddressBasicInfoFields } from './form/AddressBasicInfoFields';
import { AddressCountryPicker } from './form/AddressCountryPicker';
import { AddressFormFooter } from './form/AddressFormFooter';
import { AddressLabelSelector } from './form/AddressLabelSelector';
import { AddressLocationPickers } from './form/AddressLocationPickers';

// ============================================
// TYPES & HELPERS
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

    /**
     * PREFETCHING & DATA LOGIC
     */
    const { data: countriesResponse } = useCountries({ enabled: true });
    const countriesList = useMemo(() => countriesResponse?.data ?? [], [countriesResponse]);

    const { data: provincesResponse } = useProvinces({ enabled: true });
    const provincesList = useMemo(() => provincesResponse?.data ?? [], [provincesResponse]);

    // Picker visibility state
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showProvincePicker, setShowProvincePicker] = useState(false);
    const [showWardPicker, setShowWardPicker] = useState(false);
    const [showSmartPicker, setShowSmartPicker] = useState(false);

    // Selected location state
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
        if (initialData?.countryName) {
            const isVN = isVietnamName(initialData.countryName);
            return {
                code: isVN ? 'VN' : 'INTL',
                name: initialData.countryName,
                fullName: initialData.countryName,
                totalProvinces: isVN ? 34 : 0,
            };
        }
        if (i18n.language === 'vi') {
            return { code: 'VN', name: 'Vietnam', fullName: 'Vietnam', totalProvinces: 34 };
        }
        return null;
    });

    const [selectedProvince, setSelectedProvince] = useState<Province | null>(
        initialData?.provinceName
            ? { id: '', code: initialData.provinceCode || '', fullName: initialData.provinceName, totalWards: 0 }
            : null
    );

    const [selectedWard, setSelectedWard] = useState<Ward | null>(
        initialData?.wardName
            ? { id: '', code: initialData.wardCode || '', fullName: initialData.wardName, provinceCode: initialData.provinceCode || '', province: null }
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
        resolver: zodResolver(AddressFormSchema),
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
    const watchingProvinceName = watch('provinceName');
    const watchingWardName = watch('wardName');
    const isVietnam = watchingCountryCode === 'VN';

    /**
     * AUTO-RESOLUTION LOGIC (EDIT MODE)
     */
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

    // Wards logic for initial data sync (if needed)
    useWards({
        provinceCode: selectedProvince?.code || null,
        enabled: isVietnam && !!selectedProvince?.code && !!initialData
    });


    /**
     * HANDLERS
     */
    const handleCountrySelect = useCallback((item: Country | Province | Ward) => {
        const country = item as Country;
        setSelectedCountry(country);
        setValue('countryCode', country.code, { shouldValidate: true });
        setValue('countryName', country.name);
        setSelectedProvince(null);
        setSelectedWard(null);
        setValue('provinceCode', '');
        setValue('provinceName', '');
        setValue('districtName', '');
        setValue('wardCode', '');
        setValue('wardName', '');
    }, [setValue]);

    const handleProvinceSelect = useCallback((item: Country | Province | Ward) => {
        const province = item as Province;
        setSelectedProvince(province);
        setValue('provinceCode', province.code, { shouldValidate: true });
        setValue('provinceName', province.fullName);
        setSelectedWard(null);
        setValue('wardCode', '', { shouldValidate: false });
        setValue('wardName', '');
    }, [setValue]);

    const handleWardSelect = useCallback((item: Country | Province | Ward) => {
        const ward = item as Ward;
        setSelectedWard(ward);
        setValue('wardCode', ward.code, { shouldValidate: true });
        setValue('wardName', ward.fullName);
    }, [setValue]);

    const handleSmartLocationSelect = useCallback(({
        province,
        districtName,
        ward
    }: {
        province: Province | null;
        districtName: string;
        ward: Ward | null;
    }) => {
        if (province) {
            setSelectedProvince(province);
            setValue('provinceCode', province.code, { shouldValidate: true });
            setValue('provinceName', province.fullName);
        }

        setValue('districtName', districtName, { shouldValidate: true });

        if (ward) {
            setSelectedWard(ward);
            setValue('wardCode', ward.code, { shouldValidate: true });
            setValue('wardName', ward.fullName);
        }
    }, [setValue]);

    const handleLabelSelect = useCallback((label: AddressLabel) => {
        setValue('label', label);
    }, [setValue]);

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
                contentContainerStyle={[styles.scrollContent, styles.scrollContentExtra]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <AddressCountryPicker
                    selectedCountry={selectedCountry}
                    onShowCountryPicker={() => setShowCountryPicker(true)}
                    errors={errors}
                />

                <AddressBasicInfoFields control={control} errors={errors} />

                <AddressLocationPickers
                    control={control}
                    errors={errors}
                    isVietnam={isVietnam}
                    selectedProvince={selectedProvince}
                    provinceName={watchingProvinceName}
                    selectedWard={selectedWard}
                    wardName={watchingWardName}
                    districtName={watch('districtName')}
                    onOpenPicker={() => setShowSmartPicker(true)}
                />

                {/* Street Address - Keep here for now as simple field */}
                <View style={styles.field}>
                    <Text style={styles.label}>{t('address:form.streetAddress.label')}</Text>
                    <Controller
                        control={control}
                        name="streetAddress"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, styles.inputMultiline, errors.streetAddress && styles.inputError]}
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
                    {errors.streetAddress && <Text style={styles.errorText}>{t('address:form.streetAddress.error')}</Text>}
                </View>

                <AddressLabelSelector selectedLabel={selectedLabel} onSelect={handleLabelSelect} />

                {/* Default Toggle */}
                <View style={styles.switchRow}>
                    <View style={styles.switchTextContainer}>
                        <Text style={styles.switchLabel}>{t('address:form.isDefault.label')}</Text>
                        <Text style={styles.switchDescription}>{t('address:form.isDefault.description')}</Text>
                    </View>
                    <Controller
                        control={control}
                        name="isDefault"
                        render={({ field: { onChange, value } }) => (
                            <Switch
                                value={value}
                                onValueChange={onChange}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={Platform.OS === 'ios' ? undefined : theme.colors.surface}
                            />
                        )}
                    />
                </View>
            </ScrollView>

            <AddressFormFooter
                isEdit={!!initialData}
                isSubmitting={isSubmitting}
                isDeleting={isDeleting}
                onSubmit={handleFormSubmit}
                onDelete={onDelete}
            />

            {/* Sheets */}
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

            <SmartLocationPicker
                visible={showSmartPicker}
                onClose={() => setShowSmartPicker(false)}
                onSelect={handleSmartLocationSelect}
                initialProvince={selectedProvince}
                initialDistrict={watch('districtName')}
                initialWard={selectedWard}
            />
        </KeyboardAvoidingView>
    );
});

AddressForm.displayName = 'AddressForm';
