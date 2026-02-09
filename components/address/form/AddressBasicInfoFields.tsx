import { AddressFormData } from '@/types/address';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface AddressBasicInfoFieldsProps {
    control: Control<AddressFormData>;
    errors: FieldErrors<AddressFormData>;
}

export const AddressBasicInfoFields: React.FC<AddressBasicInfoFieldsProps> = ({
    control,
    errors,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <>
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
        </>
    );
};
