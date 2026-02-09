import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface AddressSearchFieldProps {
    onOpenSearch: () => void;
    currentAddress?: string;
    isAutoFilling?: boolean;
}

export const AddressSearchField: React.FC<AddressSearchFieldProps> = ({
    onOpenSearch,
    currentAddress,
    isAutoFilling,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{t('address:form.search.label')}</Text>

            <Pressable
                onPress={onOpenSearch}
                style={({ pressed }) => [
                    styles.picker,
                    isAutoFilling && styles.pickerAutoFilling,
                    pressed && styles.pressedOpacity
                ]}
            >
                <View style={styles.searchInner}>
                    <IconSymbol
                        name="search"
                        size={18}
                        color={theme.colors.secondary}
                    />
                    <Text
                        style={[
                            styles.pickerText,
                            !currentAddress && styles.pickerPlaceholder,
                        ]}
                        numberOfLines={1}
                    >
                        {currentAddress || t('address:form.search.placeholder')}
                    </Text>
                </View>

                <IconSymbol
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.secondary}
                />
            </Pressable>
        </View>
    );
};
