/**
 * ==============================================
 * REVIEW TEXT INPUT - Comment Textarea
 * ==============================================
 */

import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReviewTextInputProps {
    /** Current value */
    value: string;
    /** Callback when text changes */
    onChange: (text: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Max character count */
    maxLength?: number;
    /** Min rows (height) */
    minRows?: number;
    /** Error state */
    hasError?: boolean;
    /** Error message */
    errorMessage?: string;
}

const DEFAULT_MAX_LENGTH = 500;
const DEFAULT_MIN_ROWS = 4;
const LINE_HEIGHT = 20;

/**
 * ReviewTextInput - Multi-line text input for review comment
 */
export const ReviewTextInput: React.FC<ReviewTextInputProps> = ({
    value,
    onChange,
    placeholder = 'Hãy chia sẻ nhận xét của bạn về sản phẩm...',
    maxLength = DEFAULT_MAX_LENGTH,
    minRows = DEFAULT_MIN_ROWS,
    hasError = false,
    errorMessage,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const minHeight = minRows * LINE_HEIGHT + 24; // 24 for padding

    return (
        <View style={styles.container}>
            <TextInput
                style={[
                    styles.input,
                    { minHeight },
                    hasError && styles.inputError,
                ]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.secondary}
                multiline
                maxLength={maxLength}
                textAlignVertical="top"
            />

            <View style={styles.footer}>
                {/* Error message */}
                {hasError && errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                {/* Character count */}
                <Text
                    style={[
                        styles.charCount,
                        value.length >= maxLength && styles.charCountMax,
                    ]}
                >
                    {value.length}/{maxLength}
                </Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.sm / 2,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        fontSize: 15,
        lineHeight: 20,
        color: theme.colors.typography,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        flex: 1,
    },
    charCount: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    charCountMax: {
        color: theme.colors.error,
    },
}));

export default ReviewTextInput;
