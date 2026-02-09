import { IconSymbol } from '@/components/ui/Icon';
import { AddressFormData, Country } from '@/types/address';
import React from 'react';
import { FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface AddressCountryPickerProps {
    selectedCountry: Country | null;
    onShowCountryPicker: () => void;
    errors: FieldErrors<AddressFormData>;
}

export const AddressCountryPicker: React.FC<AddressCountryPickerProps> = ({
    selectedCountry,
    onShowCountryPicker,
    errors,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.field}>
            <View style={styles.fieldRow}>
                <Text style={styles.label}>{t('address:form.country.label')}</Text>

                <Pressable
                    onPress={onShowCountryPicker}
                    style={[
                        styles.picker,
                        styles.pickerCompact,
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
            </View>
            {errors.countryCode && (
                <Text style={styles.errorText}>
                    {t('address:form.country.error')}
                </Text>
            )}
        </View>
    );
};
