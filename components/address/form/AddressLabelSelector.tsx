import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { AddressLabel } from '@/types/address';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface LabelOption {
    value: AddressLabel;
    label: string;
    icon: IconSymbolName;
}

interface AddressLabelSelectorProps {
    selectedLabel: AddressLabel;
    onSelect: (label: AddressLabel) => void;
}

export const AddressLabelSelector: React.FC<AddressLabelSelectorProps> = ({
    selectedLabel,
    onSelect,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const LABEL_OPTIONS: LabelOption[] = [
        { value: 'home', label: t('address:form.label.home'), icon: 'home' },
        { value: 'work', label: t('address:form.label.work'), icon: 'work' },
        { value: 'other', label: t('address:form.label.other'), icon: 'location-outline' },
    ];

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{t('address:form.label.title')}</Text>

            <View style={styles.labelOptions}>
                {LABEL_OPTIONS.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        style={[
                            styles.labelOption,
                            selectedLabel === option.value && styles.labelOptionSelected,
                        ]}
                    >
                        <IconSymbol
                            name={option.icon}
                            size={18}
                            color={
                                selectedLabel === option.value
                                    ? theme.colors.newPrimary
                                    : theme.colors.secondary
                            }
                        />
                        <Text
                            style={[
                                styles.labelOptionText,
                                selectedLabel === option.value && styles.labelOptionTextSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};
