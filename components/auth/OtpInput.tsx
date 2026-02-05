import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    NativeSyntheticEvent,
    Pressable,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface OtpInputProps {
    /** Number of OTP digits */
    length?: number;
    /** Current OTP value */
    value: string;
    /** Callback when OTP changes */
    onChange: (otp: string) => void;
    /** Callback when OTP is complete (all digits filled) */
    onComplete?: (otp: string) => void;
    /** Show error state */
    hasError?: boolean;
    /** Disable input */
    disabled?: boolean;
    /** Auto focus on mount */
    autoFocus?: boolean;
}

/**
 * OtpInput - Component nhập mã OTP với kỹ thuật "Invisible Input"
 * 
 * Nguyên lý:
 * - 1 TextInput ẩn (opacity: 0) nằm đè lên toàn bộ khu vực
 * - 6 ô vuông bên dưới chỉ hiển thị (không phải input riêng)
 * - Hỗ trợ Copy-Paste, Autofill từ SMS/Keyboard
 */
export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    value,
    onChange,
    onComplete,
    hasError = false,
    disabled = false,
    autoFocus = true,
}) => {
    const styles = stylesheet;
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Animation for error shake
    const shakeX = useSharedValue(0);
    // Animation for cursor blink
    const cursorOpacity = useSharedValue(1);

    // Start cursor blink animation
    useEffect(() => {
        cursorOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1, // infinite
            false
        );
    }, [cursorOpacity]);

    const triggerShake = useCallback(() => {
        shakeX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    }, [shakeX]);

    // Shake when error
    React.useEffect(() => {
        if (hasError) {
            triggerShake();
        }
    }, [hasError, triggerShake]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const animatedCursorStyle = useAnimatedStyle(() => ({
        opacity: cursorOpacity.value,
    }));

    const handleChange = useCallback(
        (text: string) => {
            // Only allow numeric input
            const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
            onChange(numericText);

            // Auto-submit when complete
            if (numericText.length === length) {
                onComplete?.(numericText);
            }
        },
        [length, onChange, onComplete]
    );

    const handleKeyPress = useCallback(
        (_e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            // Handle backspace on empty - do nothing special needed
            // The invisible input handles this naturally
        },
        []
    );

    const handleContainerPress = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // Render individual digit boxes
    const renderBoxes = () => {
        const boxes: React.ReactNode[] = [];

        for (let i = 0; i < length; i++) {
            const char = value[i] || '';
            const isCurrentIndex = i === value.length;
            const isFilled = char !== '';
            const showCursor = isFocused && isCurrentIndex && !disabled;

            boxes.push(
                <View
                    key={i}
                    style={[
                        styles.box,
                        isFocused && isCurrentIndex && styles.boxFocused,
                        isFilled && styles.boxFilled,
                        hasError && styles.boxError,
                        disabled && styles.boxDisabled,
                    ]}
                >
                    {showCursor ? (
                        <Animated.View style={[styles.cursor, animatedCursorStyle]} />
                    ) : (
                        <Text
                            style={[
                                styles.boxText,
                                hasError && styles.boxTextError,
                                disabled && styles.boxTextDisabled,
                            ]}
                        >
                            {char}
                        </Text>
                    )}
                </View>
            );
        }

        return boxes;
    };

    return (
        <Pressable onPress={handleContainerPress} disabled={disabled}>
            <Animated.View style={[styles.container, animatedContainerStyle]}>
                {/* Invisible TextInput - The heart of the trick */}
                <TextInput
                    ref={inputRef}
                    style={styles.hiddenInput}
                    value={value}
                    onChangeText={handleChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    keyboardType="number-pad"
                    maxLength={length}
                    autoFocus={autoFocus}
                    editable={!disabled}
                    // iOS SMS autofill
                    textContentType="oneTimeCode"
                    // Android SMS autofill
                    autoComplete="sms-otp"
                    // Prevent suggestions
                    autoCorrect={false}
                    // Accessibility
                    accessibilityLabel="Nhập mã xác thực OTP"
                    accessibilityHint={`Nhập ${length} số`}
                />

                {/* Visible digit boxes */}
                <View style={styles.boxesContainer}>{renderBoxes()}</View>
            </Animated.View>
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        position: 'relative',
    },
    hiddenInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,
        // Make it cover the entire area
        width: '100%',
        height: '100%',
        // Prevent any visual artifacts
        backgroundColor: 'transparent',
        color: 'transparent',
        // Ensure it's above the boxes for touch capture
        zIndex: 1,
    },
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.margins.sm,
    },
    box: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
    },
    boxFilled: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySubtle,
    },
    boxError: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    boxDisabled: {
        backgroundColor: theme.colors.secondaryLight,
        borderColor: theme.colors.border,
    },
    boxText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    boxTextError: {
        color: theme.colors.error,
    },
    boxTextDisabled: {
        color: theme.colors.secondary,
    },
    cursor: {
        width: 2,
        height: 24,
        backgroundColor: theme.colors.primary,
    },
}));
