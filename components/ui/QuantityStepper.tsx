/**
 * QuantityStepper - Atomic component for quantity control
 * 
 * Features:
 * - Debounced API calls (prevents spam when user presses rapidly)
 * - Min/Max quantity limits
 * - Proper hit slop for touch targets (40px minimum)
 * - Haptic feedback ready
 * 
 * @example
 * <QuantityStepper 
 *   value={2} 
 *   min={1} 
 *   max={10} 
 *   onValueChange={(qty) => updateQuantity(qty)} 
 * />
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from './Icon';

// ============================================
// TYPES
// ============================================

interface QuantityStepperProps {
    /** Current quantity value */
    value: number;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Callback when value changes (debounced) */
    onValueChange: (newValue: number) => void;
    /** Immediate callback on each press (for optimistic UI) */
    onImmediateChange?: (newValue: number) => void;
    /** Debounce delay in ms */
    debounceMs?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'small' | 'medium';
}

const DEFAULT_DEBOUNCE_MS = 500;

const SIZE_CONFIG = {
    small: {
        buttonSize: 28,
        inputWidth: 32,
        height: 28,
        fontSize: 13,
        iconSize: 14,
    },
    medium: {
        buttonSize: 32,
        inputWidth: 40,
        height: 32,
        fontSize: 14,
        iconSize: 16,
    },
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// COMPONENT
// ============================================

export const QuantityStepper: React.FC<QuantityStepperProps> = memo(({
    value,
    min = 1,
    max = 99,
    onValueChange,
    onImmediateChange,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    disabled = false,
    size = 'medium',
}) => {
    const { theme } = useUnistyles();
    const config = SIZE_CONFIG[size];

    // Local display value for optimistic UI
    const [displayValue, setDisplayValue] = useState(value);

    // Debounce timer ref
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Animation values
    const minusScale = useSharedValue(1);
    const plusScale = useSharedValue(1);

    // Sync display value with prop
    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Handle value change with debounce
     */
    const handleChange = useCallback(
        (newValue: number) => {
            // Clamp value
            const clampedValue = Math.min(Math.max(newValue, min), max);

            // Update display immediately (Optimistic UI)
            setDisplayValue(clampedValue);
            onImmediateChange?.(clampedValue);

            // Debounce the API call
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                onValueChange(clampedValue);
            }, debounceMs);
        },
        [min, max, debounceMs, onValueChange, onImmediateChange]
    );

    /**
     * Decrement handler
     */
    const handleDecrement = useCallback(() => {
        if (disabled || displayValue <= min) return;

        // Button press animation
        minusScale.value = withSequence(
            withTiming(0.85, { duration: 50 }),
            withTiming(1, { duration: 100 })
        );

        handleChange(displayValue - 1);
    }, [disabled, displayValue, min, minusScale, handleChange]);

    /**
     * Increment handler
     */
    const handleIncrement = useCallback(() => {
        if (disabled || displayValue >= max) return;

        // Button press animation
        plusScale.value = withSequence(
            withTiming(0.85, { duration: 50 }),
            withTiming(1, { duration: 100 })
        );

        handleChange(displayValue + 1);
    }, [disabled, displayValue, max, plusScale, handleChange]);

    // Animated styles
    const minusAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: minusScale.value }],
    }));

    const plusAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: plusScale.value }],
    }));

    // Disable states
    const isMinDisabled = disabled || displayValue <= min;
    const isMaxDisabled = disabled || displayValue >= max;

    return (
        <View style={[styles.container, styles.dynamicHeight(config.height)]}>
            {/* Decrement Button */}
            <AnimatedPressable
                onPress={handleDecrement}
                disabled={isMinDisabled}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                style={[
                    styles.button,
                    minusAnimatedStyle,
                    styles.dynamicLeftButton(config.buttonSize, config.height, isMinDisabled),
                ]}
                accessibilityLabel="Giảm số lượng"
                accessibilityRole="button"
            >
                <IconSymbol
                    name="remove"
                    size={config.iconSize}
                    color={isMinDisabled ? theme.colors.secondary : theme.colors.typography}
                />
            </AnimatedPressable>

            {/* Value Display */}
            <View
                style={[
                    styles.valueContainer,
                    styles.dynamicValueContainer(config.inputWidth, config.height),
                ]}
            >
                <Text
                    style={[
                        styles.valueText,
                        styles.dynamicValueText(config.fontSize, disabled),
                    ]}
                >
                    {displayValue}
                </Text>
            </View>

            {/* Increment Button */}
            <AnimatedPressable
                onPress={handleIncrement}
                disabled={isMaxDisabled}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                style={[
                    styles.button,
                    plusAnimatedStyle,
                    styles.dynamicRightButton(config.buttonSize, config.height, isMaxDisabled),
                ]}
                accessibilityLabel="Tăng số lượng"
                accessibilityRole="button"
            >
                <IconSymbol
                    name="add"
                    size={config.iconSize}
                    color={isMaxDisabled ? theme.colors.secondary : theme.colors.typography}
                />
            </AnimatedPressable>
        </View>
    );
});

QuantityStepper.displayName = 'QuantityStepper';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    dynamicHeight: (height: number) => ({
        height,
    }),
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dynamicLeftButton: (width: number, height: number, isDisabled: boolean) => ({
        width,
        height,
        borderTopLeftRadius: theme.radius.m,
        borderBottomLeftRadius: theme.radius.m,
        opacity: isDisabled ? 0.4 : 1,
    }),
    dynamicRightButton: (width: number, height: number, isDisabled: boolean) => ({
        width,
        height,
        borderTopRightRadius: theme.radius.m,
        borderBottomRightRadius: theme.radius.m,
        opacity: isDisabled ? 0.4 : 1,
    }),
    valueContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.border,
    },
    dynamicValueContainer: (width: number, height: number) => ({
        width,
        height,
    }),
    valueText: {
        fontWeight: '600',
        textAlign: 'center',
    },
    dynamicValueText: (fontSize: number, isDisabled: boolean) => ({
        fontSize,
        color: isDisabled ? theme.colors.secondary : theme.colors.typography,
    }),
}));
