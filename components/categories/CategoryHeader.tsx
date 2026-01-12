import { IconSymbol } from '@/components/ui/Icon';
import { useCartStore } from '@/store/useCartStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface CategoryHeaderProps {
    cartCount?: number;
    onCartPress?: () => void;
    onChatPress?: () => void;
    onSearchFocus?: () => void;
}

/**
 * CategoryHeader - Header với Search bar và Cart/Chat icons
 * 
 */
export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
    cartCount,
    onCartPress,
    onChatPress,
    onSearchFocus,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('category');
    const storeCartCount = useCartStore((state) => state.totalQuantity);
    const displayCount = cartCount ?? storeCartCount;

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <IconSymbol name="search" size={20} color={theme.colors.secondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('search.placeholder')}
                    placeholderTextColor={theme.colors.secondary}
                    onFocus={onSearchFocus}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                {/* Cart Button */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={onCartPress}
                    activeOpacity={0.7}
                >
                    <IconSymbol name="cart-outline" size={24} color={theme.colors.typographySecondary} />
                    {displayCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {displayCount > 99 ? '99+' : displayCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Chat Button */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={onChatPress}
                    activeOpacity={0.7}
                >
                    <IconSymbol
                        name="chatbubble-ellipses-outline"
                        size={24}
                        color={theme.colors.typographySecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        paddingTop: UnistylesRuntime.insets.top + theme.margins.sm,
        backgroundColor: theme.colors.surface,
        gap: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        paddingVertical: 0,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffffff',
    },
}));
