/**
 * ==============================================
 * SHOP SEARCH HEADER - Search within a Shop
 * ==============================================
 * 
 * Similar UI to SearchResultHeader but for shop context.
 * Features:
 * - Back button
 * - Readonly search input (tap to focus & edit)
 * - Filter button with active count badge
 * - Cart icon with badge
 */

import { IconSymbol } from '@/components/ui/Icon';
import { SmartNavButton } from '@/components/ui/navigation/SmartNavButton';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface ShopSearchHeaderProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: (text: string) => void;
    onBack: () => void;
    onFilterPress?: () => void;
    placeholder?: string;
    activeFilterCount?: number;
    autoFocus?: boolean;
}

export interface ShopSearchHeaderRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ShopSearchHeader = forwardRef<ShopSearchHeaderRef, ShopSearchHeaderProps>(({
    value,
    onChangeText,
    onSubmit,
    onBack,
    onFilterPress,
    placeholder,
    activeFilterCount = 0,
    autoFocus = false,
}, ref) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');
    const inputRef = useRef<TextInput>(null);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const cartItemCount = useCartStore((state) => state.totalQuantity);

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
        onSubmit(value.trim());
    }, [value, onSubmit]);

    const displayPlaceholder = placeholder || t('shop.searchPlaceholder', 'Tìm trong shop...');

    return (
        <View style={[styles.container, styles.safeTop]}>
            {/* Back Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.iconButton,
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

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <IconSymbol
                    name="search"
                    size={18}
                    color={theme.colors.secondary}
                />
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

                {/* Clear Button */}
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

            {/* Filter Button (optional) */}
            {onFilterPress && (
                <Pressable
                    style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onFilterPress}
                    hitSlop={8}
                >
                    <IconSymbol
                        name="options-outline"
                        size={22}
                        color={theme.colors.typography}
                    />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>
                                {activeFilterCount > 9 ? '9+' : activeFilterCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            )}

            {/* Cart Button */}
            <SmartNavButton
                route={isAuthenticated ? ROUTES.CART.INDEX : ROUTES.AUTH.LOGIN}
                style={styles.iconButton}
            >
                {({ pressed }) => (
                    <View style={[styles.cartWrapper, pressed && styles.buttonPressed]}>
                        <IconSymbol
                            name="cart-outline"
                            size={24}
                            color={theme.colors.typography}
                        />
                        {cartItemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </SmartNavButton>
        </View>
    );
});

ShopSearchHeader.displayName = 'ShopSearchHeader';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingBottom: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        gap: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    safeTop: {
        paddingTop: UnistylesRuntime.insets.top + 8,
    },
    iconButton: {
        padding: 6,
        position: 'relative',
    },
    buttonPressed: {
        opacity: 0.6,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 38,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.margins.smd,
        gap: theme.margins.xs,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: theme.colors.typography,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 2,
    },
    filterBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: theme.colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        color: theme.colors.onPrimary,
        fontSize: 10,
        fontWeight: '700',
    },
    cartWrapper: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: theme.colors.surface,
    },
    cartBadgeText: {
        color: theme.colors.onPrimary,
        fontSize: 10,
        fontWeight: '700',
    },
}));

export default ShopSearchHeader;
