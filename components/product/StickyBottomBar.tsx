import type { InventoryStatus } from '@/types/product/productDetail';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { SmartNavButton } from '../ui/navigation/SmartNavButton';

interface StickyBottomBarProps {
    isFullySelected: boolean;
    inventoryStatus: InventoryStatus;
    onChatPress?: () => void;
    onPrefetchChat?: () => void;
    onAddToCartPress?: () => void;
    onBuyNowPress?: () => void;
    isFavorite?: boolean;
    onFavoritePress?: () => void;
}

export const StickyBottomBar = memo<StickyBottomBarProps>(({
    isFullySelected: _isFullySelected,
    inventoryStatus,
    onChatPress,
    onPrefetchChat,
    onAddToCartPress,
    onBuyNowPress,
    isFavorite: _isFavorite = false,
    onFavoritePress: _onFavoritePress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');

    const isOutOfStock = inventoryStatus === 'out_of_stock';
    const isDisabled = isOutOfStock;

    // Memoize button texts để tránh tính lại mỗi render
    const addToCartText = useMemo(() => {
        if (isOutOfStock) return t('bottomBar.outOfStock');
        return t('bottomBar.addToCart');
    }, [isOutOfStock, t]);

    const buyNowText = useMemo(() => {
        if (isOutOfStock) return t('bottomBar.outOfStock');
        return t('bottomBar.buyNow');
    }, [isOutOfStock, t]);

    // Memoize container style với safe area
    const containerStyle = useMemo(() => [
        styles.container,
        styles.safeBottom,
    ], []);

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
                        <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                            <IconSymbol
                                name="chat"
                                size={26}
                                color={theme.colors.typography}
                            />
                            <Text style={styles.iconLabel}>{t('bottomBar.chat')}</Text>
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
    safeBottom: {
        paddingBottom: UnistylesRuntime.insets.bottom + 8,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: theme.margins.smd,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.xs,
    },
    iconWrapper: {
        alignItems: 'center',
    },
    pressedOpacity: {
        opacity: 0.6,
    },
    iconLabel: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        marginLeft: theme.margins.sm,
    },
    addToCartButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.activeSoft,
        borderWidth: 1,
        borderColor: theme.colors.newPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.newPrimary,
    },
    buyNowButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.newPrimary,
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
