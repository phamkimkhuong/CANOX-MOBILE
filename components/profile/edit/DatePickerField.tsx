import { IconSymbol } from '@/components/ui/Icon';
import { dateToDisplayFormat } from '@/hooks/api/profile/useUpdateProfile';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
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
 * - Display format: DD/MM/YYYY
 * - iOS: Inline picker with modal
 * - Android: Native date dialog
 */
export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    value,
    onChange,
    error,
    label = 'Ngày sinh',
    placeholder = 'Chọn ngày sinh',
    minDate,
    maxDate = new Date(), // Default: cannot select future dates
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // On Android, picker auto-closes
        if (Platform.OS === 'android' || event.type === 'dismissed') {
            setShowPicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            onChange(selectedDate);
        }

        // iOS: Close picker when done button is pressed
        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowPicker(false);
        }
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
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={[
                    styles.inputWrapper,
                    !!error && styles.inputError,
                    disabled && styles.inputDisabled,
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={disabled}
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
                    {displayValue || placeholder}
                </Text>

                <View style={styles.chevronContainer}>
                    <IconSymbol name="chevron-right" size={20} color={theme.colors.secondary} />
                </View>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Native Date Picker */}
            {showPicker && (
                <>
                    {Platform.OS === 'ios' ? (
                        // iOS: Show as modal overlay
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={handleIOSClose}>
                                    <Text style={styles.iosDoneButton}>Xong</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value || new Date(2000, 0, 1)}
                                mode="date"
                                display="spinner"
                                onChange={handleChange}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                locale="vi-VN"
                            />
                        </View>
                    ) : (
                        // Android: Native dialog
                        <DateTimePicker
                            value={value || new Date(2000, 0, 1)}
                            mode="date"
                            display="default"
                            onChange={handleChange}
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
        marginBottom: theme.margins.lg,
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
