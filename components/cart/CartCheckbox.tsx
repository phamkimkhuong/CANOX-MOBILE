/**
 * CartCheckbox - Atomic checkbox component for cart
 * 
 * Supports 3 states: checked, unchecked, indeterminate
 * Used at Item, Shop, and "Select All" levels
 * 
 * @example
 * <CartCheckbox checked={true} onToggle={() => {}} />
 * <CartCheckbox state="indeterminate" onToggle={() => {}} />
 */

import type { CheckboxState } from '@/types/cart';
import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

// ============================================
// TYPES
// ============================================

interface CartCheckboxProps {
    /** Simple boolean mode */
    checked?: boolean;
    /** Advanced 3-state mode (takes precedence over checked) */
    state?: CheckboxState;
    /** Callback when toggled */
    onToggle: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'small' | 'medium';
    /** Test ID for testing */
    testID?: string;
}

// ============================================
// CONSTANTS
// ============================================

const SIZE_CONFIG = {
    small: {
        box: 18,
        icon: 14,
        borderRadius: 4,
    },
    medium: {
        box: 22,
        icon: 16,
        borderRadius: 6,
    },
} as const;

// ============================================
// COMPONENT
// ============================================

export const CartCheckbox: React.FC<CartCheckboxProps> = memo(({
    checked = false,
    state,
    onToggle,
    disabled = false,
    size = 'medium',
    testID,
}) => {
    const { theme } = useUnistyles();

    // Determine actual state
    const actualState: CheckboxState = state ?? (checked ? 'checked' : 'unchecked');
    const isChecked = actualState === 'checked';
    const isIndeterminate = actualState === 'indeterminate';

    // Animation
    const handlePress = useCallback(() => {
        if (disabled) return;
        onToggle();
    }, [disabled, onToggle]);

    const config = SIZE_CONFIG[size];

    // Determine colors
    const backgroundColor =
        isChecked || isIndeterminate
            ? theme.colors.newPrimary
            : 'transparent';

    const borderColor =
        isChecked || isIndeterminate
            ? theme.colors.newPrimary
            : disabled
                ? theme.colors.secondary
                : theme.colors.border;

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked, disabled }}
            testID={testID}
        >
            <View
                style={[
                    styles.checkbox,
                    styles.size(size),
                    styles.colors(backgroundColor, borderColor),
                    disabled && styles.disabled,
                ]}
            >
                {isChecked && (
                    <IconSymbol
                        name="check"
                        size={config.icon}
                        color={theme.colors.onPrimary}
                    />
                )}
                {isIndeterminate && (
                    <View
                        style={[
                            styles.indeterminateLine,
                            styles.indeterminateWidth(config.icon - 4),
                            styles.bgOnPrimary,
                        ]}
                    />
                )}
            </View>
        </Pressable>
    );
});

CartCheckbox.displayName = 'CartCheckbox';

const styles = StyleSheet.create((theme) => ({
    checkbox: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    size: (size: 'small' | 'medium') => ({
        width: SIZE_CONFIG[size].box,
        height: SIZE_CONFIG[size].box,
        borderRadius: SIZE_CONFIG[size].borderRadius,
    }),
    colors: (backgroundColor: string, borderColor: string) => ({
        backgroundColor,
        borderColor,
    }),
    disabled: {
        opacity: 0.5,
    },
    indeterminateLine: {
        height: 2,
        borderRadius: 1,
    },
    bgOnPrimary: {
        backgroundColor: theme.colors.onPrimary,
    },
    indeterminateWidth: (width: number) => ({
        width,
    }),
}));
