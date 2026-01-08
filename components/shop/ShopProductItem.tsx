/**
 * ==============================================
 * SHOP PRODUCT ITEM - Grid Product Card
 * ==============================================
 * 
 * Features:
 * - Responsive width (50% - gap)
 * - Price range display
 * - Out of stock indicator
 * - Add to cart button
 * - Graceful null handling
 */

import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { ShopProductItemUI } from '@/types/shop';
import { formatSoldCount } from '@/utils/format';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopProductItemProps {
    /** Product data from adapter */
    product: ShopProductItemUI;
    /** Callback when add to cart pressed */
    onAddToCart?: (productId: string) => void;
    /** Gap between items (for width calculation) */
    gap?: number;
}

const NUM_COLUMNS = 2;
const DEFAULT_GAP = 8;
const IMAGE_ASPECT_RATIO = 1; // Square images

/**
 * ShopProductItem - Product card for shop grid
 * 
 * Designed for 2-column FlashList grid
 * Width is calculated responsively: (screenWidth - padding - gaps) / 2
 */
export const ShopProductItem: React.FC<ShopProductItemProps> = ({
    product,
    onAddToCart,
    gap = DEFAULT_GAP,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { width: screenWidth } = useWindowDimensions();

    // Calculate item width
    // Formula: (screenWidth - horizontalPadding*2 - gap*(numColumns-1)) / numColumns
    const horizontalPadding = theme.margins.md;
    const itemWidth = (screenWidth - horizontalPadding * 2 - gap * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
    const imageHeight = itemWidth * IMAGE_ASPECT_RATIO;

    // Handle product press
    const handlePress = useCallback(() => {
        router.push(productRoutes.detail(product.id));
    }, [product.id]);

    // Handle add to cart
    const handleAddToCart = useCallback(
        (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            if (onAddToCart && !product.isOutOfStock) {
                onAddToCart(product.id);
            }
        },
        [onAddToCart, product.id, product.isOutOfStock]
    );

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { width: itemWidth },
                pressed && styles.containerPressed,
            ]}
            onPress={handlePress}
        >
            {/* Image */}
            <View style={[styles.imageContainer, { height: imageHeight }]}>
                <Image
                    source={{ uri: product.thumbnail }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />

                {/* Out of Stock Overlay */}
                {product.isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Hết hàng</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Product Name */}
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>

                {/* Rating Row - Only show if available */}
                {product.rating !== null && (
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconSymbol
                                key={star}
                                name={star <= Math.floor(product.rating ?? 0) ? 'star' : 'star-border'}
                                size={12}
                                color="#facc15"
                            />
                        ))}
                        {product.reviewCount !== null && product.reviewCount > 0 && (
                            <Text style={styles.reviewCount}>
                                ({product.reviewCount >= 1000
                                    ? `${(product.reviewCount / 1000).toFixed(1)}k`
                                    : product.reviewCount})
                            </Text>
                        )}
                    </View>
                )}

                {/* Price Row */}
                <View style={styles.priceRow}>
                    <Text
                        style={[
                            styles.price,
                            product.hasPriceRange && styles.priceRange,
                        ]}
                        numberOfLines={1}
                    >
                        {product.priceDisplay}
                    </Text>
                </View>

                {/* Original Price (Strikethrough) */}
                {product.originalPrice !== null && (
                    <Text style={styles.originalPrice}>
                        {`${product.originalPrice.toLocaleString('vi-VN')}\u00A0đ`}
                    </Text>
                )}

                {/* Bottom Row: Sold + Add to Cart */}
                <View style={styles.bottomRow}>
                    {/* Sold Count - Only show if available */}
                    {product.soldCount !== null && product.soldCount > 0 ? (
                        <Text style={styles.soldText}>
                            Đã bán {formatSoldCount(product.soldCount)}
                        </Text>
                    ) : (
                        // Placeholder to maintain layout
                        <View style={styles.soldPlaceholder} />
                    )}

                    {/* Add to Cart Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addToCartBtn,
                            product.isOutOfStock && styles.addToCartBtnDisabled,
                            pressed && !product.isOutOfStock && styles.addToCartBtnPressed,
                        ]}
                        onPress={handleAddToCart}
                        disabled={product.isOutOfStock}
                    >
                        <IconSymbol
                            name="add"
                            size={16}
                            color={product.isOutOfStock ? theme.colors.secondary : theme.colors.onPrimary}
                        />
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        marginBottom: theme.margins.sm,
        // Shadow
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    containerPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        width: '100%',
        backgroundColor: theme.colors.background,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    outOfStockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm / 2,
        borderRadius: theme.radius.s,
    },
    content: {
        padding: theme.margins.sm,
    },
    productName: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 18,
        minHeight: 36, // 2 lines minimum
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm / 2,
        gap: 1,
    },
    reviewCount: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginLeft: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: theme.margins.sm / 2,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.error, // Red for price
    },
    priceRange: {
        fontSize: 14, // Slightly smaller for "Từ xxx"
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.margins.sm,
    },
    soldText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    soldPlaceholder: {
        flex: 1,
    },
    addToCartBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartBtnDisabled: {
        backgroundColor: theme.colors.secondaryLight,
    },
    addToCartBtnPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
}));

export default ShopProductItem;
