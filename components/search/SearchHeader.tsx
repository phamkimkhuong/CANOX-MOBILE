/**
 * ==============================================
 * SEARCH HEADER - Input with Back Button
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SearchHeaderProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: (text: string) => void;
    onBack: () => void;
    autoFocus?: boolean;
    placeholder?: string;
}

export interface SearchHeaderRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * SearchHeader Component
 */
export const SearchHeader = forwardRef<SearchHeaderRef, SearchHeaderProps>(({
    value,
    onChangeText,
    onSubmit,
    onBack,
    autoFocus = true,
    placeholder,
}, ref) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');
    const inputRef = useRef<TextInput>(null);

    // Animation for clear button
    const clearButtonOpacity = useSharedValue(value.length > 0 ? 1 : 0);
    const clearButtonScale = useSharedValue(value.length > 0 ? 1 : 0.5);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => {
            onChangeText('');
            inputRef.current?.focus();
        },
    }));

    // Update animation when value changes
    React.useEffect(() => {
        const hasValue = value.length > 0;
        clearButtonOpacity.value = withTiming(hasValue ? 1 : 0, { duration: 150 });
        clearButtonScale.value = withTiming(hasValue ? 1 : 0.5, { duration: 150 });
    }, [value, clearButtonOpacity, clearButtonScale]);

    const clearButtonStyle = useAnimatedStyle(() => ({
        opacity: clearButtonOpacity.value,
        transform: [{ scale: clearButtonScale.value }],
    }));

    const handleClear = useCallback(() => {
        onChangeText('');
        inputRef.current?.focus();
    }, [onChangeText]);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (trimmed) {
            onSubmit(trimmed);
        }
    }, [value, onSubmit]);

    const displayPlaceholder = placeholder || (
        value.length > 0
            ? t('header.placeholderTyping')
            : t('header.placeholder')
    );

    const hasValue = value.trim().length > 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            {/* Back Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onBack}
                hitSlop={8}
            >
                <IconSymbol
                    name="arrow-back"
                    size={24}
                    color={theme.colors.typography}
                />
            </Pressable>

            {/* Search Input Container */}
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={handleSubmit}
                    placeholder={displayPlaceholder}
                    placeholderTextColor={theme.colors.secondary}
                    autoFocus={autoFocus}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    clearButtonMode="never"
                    selectionColor={theme.colors.primary}
                />

                {/* Clear Button - Only show when has text */}
                <AnimatedPressable
                    style={[styles.clearButton, clearButtonStyle]}
                    onPress={handleClear}
                    hitSlop={8}
                >
                    <IconSymbol
                        name="close-circle"
                        size={18}
                        color={theme.colors.secondary}
                    />
                </AnimatedPressable>
            </View>

            {/* Search Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.searchButton,
                    pressed && styles.buttonPressed,
                    !hasValue && styles.searchButtonDisabled,
                ]}
                onPress={handleSubmit}
                hitSlop={8}
                disabled={!hasValue}
            >
                <Text style={styles.searchButtonText}>
                    {t('actions.search')}
                </Text>
            </Pressable>
        </View>
    );
});

SearchHeader.displayName = 'SearchHeader';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
        gap: theme.margins.sm,
    },
    backButton: {
        padding: 4,
    },
    buttonPressed: {
        opacity: 0.6,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.margins.smd,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: theme.colors.typography,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
    searchButton: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primary,
    },
    searchButtonDisabled: {
        opacity: 0.5,
    },
    searchButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));

export default SearchHeader;
