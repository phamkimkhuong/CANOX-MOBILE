/**
 * ==============================================
 * SEARCH RESULT HEADER - Readonly Search + Actions
 * ==============================================
 * 
 * Features:
 * - Back button
 * - Readonly search input (tap to edit keyword)
 * - Filter button with active count badge
 * - Cart icon with badge
 */

import { IconSymbol } from '@/components/ui/Icon';
import { SmartNavButton } from '@/components/ui/navigation/SmartNavButton';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SearchResultHeaderProps {
    keyword: string;
    onSearchPress: () => void;
    onFilterPress: () => void;
    onBack: () => void;
    activeFilterCount?: number;
}

export const SearchResultHeader = React.memo(({
    keyword,
    onSearchPress,
    onFilterPress,
    onBack,
    activeFilterCount = 0,
}: SearchResultHeaderProps) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const cartItemCount = useCartStore((state) => state.totalQuantity);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
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

            {/* Search Input (Readonly - Tap to edit) */}
            <Pressable
                style={({ pressed }) => [
                    styles.searchContainer,
                    pressed && styles.searchPressed,
                ]}
                onPress={onSearchPress}
            >
                <IconSymbol
                    name="search"
                    size={18}
                    color={theme.colors.secondary}
                />
                <Text style={styles.searchText} numberOfLines={1}>
                    {keyword}
                </Text>
            </Pressable>

            {/* Filter Button */}
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

            {/* Cart Button */}
            <SmartNavButton
                route={isAuthenticated ? ROUTES.CART.INDEX : ROUTES.AUTH.LOGIN}
                style={styles.iconButton}
            >
                {({ pressed }) => (
                    <View style={{ opacity: pressed ? 0.7 : 1 }}>
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

SearchResultHeader.displayName = 'SearchResultHeader';

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
        gap: theme.margins.sm,
    },
    searchPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    searchText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
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

export default SearchResultHeader;
