import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AuthInputProps extends TextInputProps {
    control: Control<any>;
    name: string;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isPassword?: boolean;
    placeholder: string;
}

export const AuthInput = ({ control, name, label, icon, isPassword, placeholder, ...props }: AuthInputProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isSecure, setIsSecure] = useState(isPassword);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    <Text style={styles.label}>{label}</Text>

                    <View style={[
                        styles.inputWrapper,
                        isFocused && styles.inputFocused,
                        !!error && styles.inputError
                    ]}>
                        {/* Left Icon */}
                        <View style={styles.iconContainer}>
                            <MaterialIcons name={icon} size={20} color={theme.colors.secondary} />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder={placeholder}
                            placeholderTextColor={theme.colors.secondary}
                            value={value}
                            onChangeText={onChange}
                            onBlur={() => {
                                onBlur();
                                setIsFocused(false);
                            }}
                            onFocus={() => setIsFocused(true)}
                            secureTextEntry={isSecure}
                            autoCapitalize="none"
                            {...props}
                        />

                        {/* Toggle Password Visibility */}
                        {isPassword && (
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setIsSecure(!isSecure)}
                            >
                                <MaterialIcons
                                    name={isSecure ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={theme.colors.secondary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Error Message */}
                    {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
            )}
        />
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 8,
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
        overflow: 'hidden',
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    inputError: {
        borderColor: theme.colors.error,
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
    },
    eyeBtn: {
        paddingHorizontal: 12,
        height: '100%',
        justifyContent: 'center',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
}));