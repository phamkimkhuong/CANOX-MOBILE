import { IconSymbol } from '@/components/ui/Icon';
import { AddressFormData, Province, Ward } from '@/types/address';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface AddressLocationPickersProps {
    control: Control<AddressFormData>;
    errors: FieldErrors<AddressFormData>;
    isVietnam: boolean;
    selectedProvince: Province | null;
    provinceName?: string;
    selectedWard: Ward | null;
    wardName?: string;
    districtName?: string;
    onOpenPicker: () => void;
}

export const AddressLocationPickers: React.FC<AddressLocationPickersProps> = ({
    control,
    errors,
    isVietnam,
    selectedProvince,
    provinceName,
    selectedWard,
    wardName,
    districtName,
    onOpenPicker,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Combined label
    const combinedLabel = `${t('address:form.province.label')}, ${t('address:form.district.label')}, ${t('address:form.ward.label')} *`;

    // Combined path display
    const currentPath = [
        selectedProvince?.fullName || provinceName,
        districtName,
        selectedWard?.fullName || wardName
    ].filter(Boolean).join(', ');

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{combinedLabel}</Text>

            {isVietnam ? (
                <Pressable
                    onPress={onOpenPicker}
                    style={({ pressed }) => [
                        styles.picker,
                        (errors.provinceName || errors.wardName || errors.districtName) && styles.inputError,
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Text
                        style={[
                            styles.pickerText,
                            !currentPath && styles.pickerPlaceholder,
                        ]}
                        numberOfLines={2}
                    >
                        {currentPath || t('address:form.province.placeholder')}
                    </Text>
                    <IconSymbol
                        name="chevron-down"
                        size={20}
                        color={theme.colors.secondary}
                    />
                </Pressable>
            ) : (
                <View style={{ gap: theme.margins.md }}>
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
                </View>
            )}

            {(errors.provinceName || errors.wardName || errors.districtName) && (
                <Text style={styles.errorText}>
                    {t('address:form.province.error')}
                </Text>
            )}
        </View>
    );
};
