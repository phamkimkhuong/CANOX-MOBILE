import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import type { InventoryStatus } from '@/types/product/productDetail';
import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { SmartNavButton } from '../ui/SmartNavButton';

interface StickyBottomBarProps {
    isFullySelected: boolean;
    inventoryStatus: InventoryStatus;
    onChatPress?: () => void;
    onPrefetchChat?: () => void;
    onShopPress?: () => void;
    onAddToCartPress?: () => void;
    onBuyNowPress?: () => void;
    isFavorite?: boolean;
    onFavoritePress?: () => void;
}

export const StickyBottomBar = memo<StickyBottomBarProps>(({
    isFullySelected,
    inventoryStatus,
    onChatPress,
    onPrefetchChat,
    onShopPress,
    onAddToCartPress,
    onBuyNowPress,
    isFavorite = false,
    onFavoritePress,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();

    const isOutOfStock = inventoryStatus === 'out_of_stock';
    const isDisabled = isOutOfStock;

    // Memoize button texts để tránh tính lại mỗi render
    const addToCartText = useMemo(() => {
        if (isOutOfStock) return PRODUCT_STRINGS.bottomBar.outOfStock;
        return PRODUCT_STRINGS.bottomBar.addToCart;
    }, [isOutOfStock]);

    const buyNowText = useMemo(() => {
        if (isOutOfStock) return PRODUCT_STRINGS.bottomBar.outOfStock;
        return PRODUCT_STRINGS.bottomBar.buyNow;
    }, [isOutOfStock]);

    // Memoize container style với safe area
    const containerStyle = useMemo(() => [
        styles.container,
        { paddingBottom: insets.bottom + 8 },
    ], [insets.bottom]);

    return (
        <View style={containerStyle}>
            {/* Left Actions */}
            <View style={styles.leftActions}>
                <SmartNavButton
                    onPress={onChatPress}
                    prefetchAction={onPrefetchChat}
                    style={styles.iconButton}
                >
                    {({ pressed }) => (
                        <View style={{ alignItems: 'center', opacity: pressed ? 0.6 : 1 }}>
                            <IconSymbol
                                name="chat"
                                size={22}
                                color={theme.colors.typography}
                            />
                            <Text style={styles.iconLabel}>{PRODUCT_STRINGS.bottomBar.chat}</Text>
                        </View>
                    )}
                </SmartNavButton>

                <View style={styles.divider} />

                <SmartNavButton onPress={onShopPress} style={styles.iconButton}>
                    {({ pressed }) => (
                        <View style={{ alignItems: 'center', opacity: pressed ? 0.6 : 1 }}>
                            <IconSymbol
                                name="storefront-outline"
                                size={22}
                                color={theme.colors.typography}
                            />
                            <Text style={styles.iconLabel}>{PRODUCT_STRINGS.bottomBar.shop}</Text>
                        </View>
                    )}
                </SmartNavButton>
            </View>

            {/* Right Actions */}
            <View style={styles.rightActions}>
                {/* Add to Cart Button */}
                <Pressable
                    style={[
                        styles.addToCartButton,
                        isDisabled && styles.buttonDisabled,
                    ]}
                    onPress={onAddToCartPress}
                    disabled={isDisabled}
                >
                    <Text
                        style={[
                            styles.addToCartText,
                            isDisabled && styles.textDisabled,
                        ]}
                    >
                        {addToCartText}
                    </Text>
                </Pressable>

                {/* Buy Now Button */}
                <Pressable
                    style={[
                        styles.buyNowButton,
                        isDisabled && styles.buttonDisabled,
                    ]}
                    onPress={onBuyNowPress}
                    disabled={isDisabled}
                >
                    <Text
                        style={[
                            styles.buyNowText,
                            isDisabled && styles.textDisabled,
                        ]}
                    >
                        {buyNowText}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
});

StickyBottomBar.displayName = 'StickyBottomBar';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingTop: 8,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 8,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.smd,
    },
    iconLabel: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: theme.colors.border,
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        marginLeft: theme.margins.smd,
    },
    addToCartButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    buyNowButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyNowText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.surface,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    textDisabled: {
        color: theme.colors.secondary,
    },
}));

export default StickyBottomBar;
