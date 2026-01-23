/**
 * CartItem - Molecule component for a single cart item
 * 
 * Features:
 * - Checkbox for selection
 * - Product image with discount badge
 * - Variant selector (dropdown trigger)
 * - Quantity stepper
 * - Out of stock state
 * - Optimized with React.memo
 */

import { createScaledFontSize } from '@/constants/unistyles';
import { useCartStore } from '@/store/useCartStore';
import type { CartItemUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { QuantityStepper } from '../ui/QuantityStepper';
import { CartCheckbox } from './CartCheckbox';

interface CartItemProps {
    /** Cart item data */
    item: CartItemUI;
    /** Toggle selection callback (receives id) */
    onToggleSelect: (id: string) => void;
    /** Quantity change callback (receives id and value) */
    onQuantityChange: (id: string, quantity: number) => void;
    /** Variant change callback (receives id) */
    onVariantPress?: (id: string) => void;
    /** Find similar product callback (receives id) */
    onFindSimilar?: (id: string) => void;
    /** Delete item callback (receives id) */
    onDelete?: (id: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export const CartItem: React.FC<CartItemProps> = memo(({
    item,
    onToggleSelect,
    onQuantityChange,
    onVariantPress,
    onFindSimilar,
    onDelete,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('cart');
    const isSelected = useCartStore(state => state.selectedItemIds.has(item.id));

    // const handleProductPress = useCallback(() => {
    //     router.push(productRoutes.detail(item.productId));
    // }, [router, item.productId]);

    const {
        productName,
        variantAttributes,
        imageUrl,
        unitPrice,
        originalPrice,
        discountPercent,
        quantity,
        maxQuantity,
        isOutOfStock,
    } = item;
    return (
        <View style={[styles.container, isOutOfStock && styles.outOfStockContainer]}>
            {/* Checkbox Column */}
            <View style={styles.checkboxColumn}>
                <CartCheckbox
                    checked={isSelected}
                    onToggle={() => onToggleSelect(item.id)}
                    disabled={isOutOfStock}
                />
            </View>

            {/* Product Content */}
            <View style={styles.contentRow}>
                {/* Image */}
                <Pressable
                    // onPress={handleProductPress}
                    style={({ pressed }) => [
                        styles.imageContainer,
                        pressed && styles.imagePressed
                    ]}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.image, isOutOfStock && styles.outOfStockImage]}
                        contentFit="cover"
                        transition={200}
                        accessibilityLabel={productName}
                    />

                    {/* Discount Badge */}
                    {discountPercent && !isOutOfStock && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discountPercent}%</Text>
                        </View>
                    )}

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>{t('item.outOfStock')}</Text>
                        </View>
                    )}
                </Pressable>

                {/* Info Column */}
                <View style={[styles.infoColumn, isOutOfStock && styles.outOfStockInfo]}>
                    {/* Product Name */}
                    <Pressable
                        // onPress={handleProductPress}
                        style={({ pressed }) => [
                            pressed && styles.textPressed
                        ]}
                    >
                        <Text style={styles.productName} numberOfLines={2}>
                            {productName}
                        </Text>
                    </Pressable>

                    {/* Variant Selector */}
                    {variantAttributes && (
                        <Pressable
                            onPress={() => onVariantPress?.(item.id)}
                            style={styles.variantSelector}
                            disabled={isOutOfStock}
                            accessibilityLabel={t('item.selectVariation')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.variantText} numberOfLines={1}>
                                {variantAttributes}
                            </Text>
                            <IconSymbol
                                name="chevron-down"
                                size={14}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    )}

                    {/* Price & Quantity Row */}
                    <View style={styles.bottomRow}>
                        {/* Price */}
                        <View style={styles.priceContainer}>
                            {originalPrice && (
                                <Text style={styles.originalPrice}>
                                    {formatCurrency(originalPrice)}
                                </Text>
                            )}
                            <Text
                                style={styles.currentPrice}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {formatCurrency(unitPrice)}
                            </Text>
                        </View>

                        {/* Quantity Stepper or Find Similar Button */}
                        {isOutOfStock ? (
                            <Pressable
                                onPress={() => onFindSimilar?.(item.id)}
                                style={styles.findSimilarButton}
                                accessibilityLabel={t('item.findSimilar')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.findSimilarText}>{t('item.findSimilar')}</Text>
                            </Pressable>
                        ) : (
                            <QuantityStepper
                                value={quantity}
                                min={1}
                                max={maxQuantity}
                                onValueChange={(newQty) => onQuantityChange(item.id, newQty)}
                                size="small"
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
});

CartItem.displayName = 'CartItem';

const styles = StyleSheet.create((theme, rt) => {
    const f = (size: number) => createScaledFontSize(size, rt.screen.width);

    return {
        container: {
            flexDirection: 'row',
            paddingHorizontal: theme.margins.smd,
            paddingVertical: theme.margins.md,
            gap: theme.margins.smd,
            backgroundColor: theme.colors.surface,
        },
        outOfStockContainer: {
            opacity: 0.7,
        },
        checkboxColumn: {
            justifyContent: 'flex-start',
            paddingTop: 32, // Align with middle of image
        },
        contentRow: {
            flex: 1,
            flexDirection: 'row',
            gap: theme.margins.smd,
        },
        imageContainer: {
            position: 'relative',
            width: 96,
            height: 96,
        },
        image: {
            width: 96,
            height: 96,
            borderRadius: theme.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        outOfStockImage: {
            opacity: 0.6,
        },
        discountBadge: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: theme.colors.error,
            borderTopLeftRadius: theme.radius.m,
            borderBottomRightRadius: theme.radius.m,
            paddingHorizontal: 6,
            paddingVertical: 2,
        },
        discountText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '700',
            color: theme.colors.onPrimary,
        },
        outOfStockOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderBottomLeftRadius: theme.radius.m,
            borderBottomRightRadius: theme.radius.m,
            paddingVertical: 4,
            alignItems: 'center',
        },
        outOfStockText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '600',
            color: theme.colors.onPrimary,
        },
        infoColumn: {
            flex: 1,
            justifyContent: 'space-between',
        },
        outOfStockInfo: {
            opacity: 0.8,
        },
        productName: {
            fontSize: f(theme.fontSizes.md),
            fontWeight: '500',
            lineHeight: 20,
            color: theme.colors.typography,
        },
        imagePressed: {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
        },
        textPressed: {
            opacity: 0.7,
        },
        variantSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius.s,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
            marginTop: 4,
        },
        variantText: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
        },
        bottomRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 8,
        },
        priceContainer: {
            gap: 2,
        },
        originalPrice: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.secondary,
            textDecorationLine: 'line-through',
        },
        currentPrice: {
            fontSize: f(theme.fontSizes.base),
            fontWeight: '700',
            color: theme.colors.error,
        },
        findSimilarButton: {
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.m,
            paddingHorizontal: 8,
            paddingVertical: 6,
        },
        findSimilarText: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '500',
            color: theme.colors.primary,
        },
    };
});
