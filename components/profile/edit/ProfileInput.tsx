import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProfileInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    icon: IconSymbolName;
    placeholder?: string;
    disabled?: boolean;
    rightIcon?: IconSymbolName;
    rightText?: string;
}

/**
 * ProfileInput - Reusable input component for profile form
 * - Supports disabled state with visual indicator
 * - Compatible with react-hook-form Controller
 * - Shows lock icon for read-only fields
 */
export function ProfileInput<T extends FieldValues>({
    control,
    name,
    label,
    icon,
    placeholder,
    disabled = false,
    rightIcon,
    rightText,
    ...props
}: ProfileInputProps<T>) {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    <Text style={styles.label}>{label}</Text>

                    <View
                        style={[
                            styles.inputWrapper,
                            isFocused && !disabled && styles.inputFocused,
                            !!error && styles.inputError,
                            disabled && styles.inputDisabled,
                        ]}
                    >
                        {/* Left Icon */}
                        <View style={styles.iconContainer}>
                            <IconSymbol
                                name={icon}
                                size={20}
                                color={disabled ? theme.colors.secondary : theme.colors.primary}
                            />
                        </View>

                        {/* Text Input */}
                        <TextInput
                            style={[styles.input, disabled && styles.inputTextDisabled]}
                            placeholder={placeholder}
                            placeholderTextColor={theme.colors.secondary}
                            value={value as string}
                            onChangeText={onChange}
                            onBlur={() => {
                                onBlur();
                                setIsFocused(false);
                            }}
                            onFocus={() => setIsFocused(true)}
                            editable={!disabled}
                            selectTextOnFocus={!disabled}
                            autoCapitalize="none"
                            {...props}
                        />

                        {/* Right Icon (Lock for disabled) */}
                        {disabled && (
                            <View style={styles.rightIconContainer}>
                                <IconSymbol
                                    name={rightIcon || 'lock'}
                                    size={18}
                                    color={theme.colors.secondary}
                                />
                            </View>
                        )}

                        {/* Right Text (e.g., Verified badge) */}
                        {rightText && !disabled && (
                            <View style={styles.rightTextContainer}>
                                <IconSymbol name="check-circle" size={16} color={theme.colors.success} />
                                <Text style={styles.rightText}>{rightText}</Text>
                            </View>
                        )}
                    </View>

                    {/* Error Message */}
                    {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
            )}
        />
    );
}

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
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputDisabled: {
        backgroundColor: theme.colors.background,
        opacity: 0.7,
    },
    iconContainer: {
        paddingLeft: 12,
        paddingRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: '100%',
        color: theme.colors.typography,
        fontSize: 16,
        paddingRight: 12,
    },
    inputTextDisabled: {
        color: theme.colors.secondary,
    },
    rightIconContainer: {
        paddingRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        gap: 4,
    },
    rightText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.success,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
}));

export default ProfileInput;
