import { IconSymbol } from '@/components/ui/Icon';
import { dateToDisplayFormat } from '@/hooks/api/profile/useUpdateProfile';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@expo/ui/community/datetime-picker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface DatePickerFieldProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    error?: string;
    label?: string;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
}

/**
 * DatePickerField - Native Date Picker wrapper
 * Sử dụng @expo/ui (SwiftUI trên iOS, Jetpack Compose trên Android)
 */
export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    value,
    onChange,
    error,
    label,
    placeholder,
    minDate,
    maxDate = new Date(), // Default: cannot select future dates
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const { t, i18n } = useTranslation(['profile', 'common']);
    const styles = stylesheet;
    const [showPicker, setShowPicker] = useState(false);

    const actualLabel = label || t('profile:editProfile.form.birthday');
    const actualPlaceholder = placeholder || t('profile:editProfile.form.birthdayPlaceholder');

    const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
        // Android dialog tự đóng sau khi chọn
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        onChange(selectedDate);
    };

    const handleDismiss = () => {
        // Android: User nhấn Cancel trên dialog
        setShowPicker(false);
    };

    const handlePress = () => {
        if (!disabled) {
            setShowPicker(true);
        }
    };

    const handleIOSClose = () => {
        setShowPicker(false);
    };

    const displayValue = value ? dateToDisplayFormat(value) : '';

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{actualLabel}</Text>

            <TouchableOpacity
                style={[
                    styles.inputWrapper,
                    !!error && styles.inputError,
                    disabled && styles.inputDisabled,
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={disabled}
                accessibilityLabel={`${actualLabel}, ${displayValue || actualPlaceholder}`}
                accessibilityRole="button"
            >
                <View style={styles.iconContainer}>
                    <IconSymbol name="calendar" size={20} color={theme.colors.secondary} />
                </View>

                <Text
                    style={[
                        styles.inputText,
                        !displayValue && styles.placeholder,
                    ]}
                >
                    {displayValue || actualPlaceholder}
                </Text>

                <View style={styles.chevronContainer}>
                    <IconSymbol name="chevron-right" size={20} color={theme.colors.secondary} />
                </View>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Native Date Picker — @expo/ui */}
            {showPicker && (
                <>
                    {Platform.OS === 'ios' ? (
                        // iOS: Show inline spinner with Done button
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={handleIOSClose} accessibilityLabel={t('common:actions.done')}>
                                    <Text style={styles.iosDoneButton}>{t('common:actions.done')}</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value || new Date(2000, 0, 1)}
                                mode="date"
                                display="spinner"
                                onValueChange={handleValueChange}
                                onDismiss={handleDismiss}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                locale={i18n.language === 'vi' ? 'vi-VN' : 'en-US'}
                            />
                        </View>
                    ) : (
                        // Android: Dialog presentation (default)
                        <DateTimePicker
                            value={value || new Date(2000, 0, 1)}
                            mode="date"
                            presentation="dialog"
                            onValueChange={handleValueChange}
                            onDismiss={handleDismiss}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundInput,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        height: 48,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: theme.colors.background,
    },
    iconContainer: {
        paddingLeft: 12,
        paddingRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.typography,
    },
    placeholder: {
        color: theme.colors.secondary,
    },
    chevronContainer: {
        paddingRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
    // iOS Picker Styles
    iosPickerContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        marginTop: theme.margins.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    iosDoneButton: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));

export default DatePickerField;
