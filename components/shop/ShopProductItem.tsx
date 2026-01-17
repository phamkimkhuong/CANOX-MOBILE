/**
 * ==============================================
 * SHOP PRODUCT ITEM - Grid Product Card
 * ==============================================
 * 
 * Features:
 * - Responsive width (50% - gap)
 * - Standardized ProductFeedItem mapping
 * - Out of stock indicator logic (future)
 * - Add to cart button
 * - Graceful null handling
 */

import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { ShopProductItemUI } from '@/types/shop';
import { formatCurrency, formatSoldCount } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface ShopProductItemProps {
    /** Product data from adapter (ProductFeedItem) */
    product: ShopProductItemUI;
    /** Callback when add to cart pressed */
    onAddToCart?: (productId: string) => void;
    /** Gap between items (for width calculation) */
    gap?: number;
}

const NUM_COLUMNS = 2;
const DEFAULT_GAP = 8;
const IMAGE_ASPECT_RATIO = 1;

/**
 * ShopProductItem - Product card for shop grid
 */
export const ShopProductItem: React.FC<ShopProductItemProps> = ({
    product,
    onAddToCart,
    gap = DEFAULT_GAP,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const screenWidth = UnistylesRuntime.screen.width;

    // Calculate item width for 2-column grid
    const horizontalMargin = theme.margins.md;
    const itemWidth = (screenWidth - horizontalMargin * 2 - gap) / 2;
    const imageHeight = itemWidth * IMAGE_ASPECT_RATIO;

    const handlePress = useCallback(() => {
        Navigator.push(productRoutes.detail(product.id));
    }, [product.id]);

    const handleAddToCart = useCallback(
        (e: any) => {
            e.stopPropagation();
            if (onAddToCart) {
                onAddToCart(product.id);
            }
        },
        [onAddToCart, product.id]
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
            {/* Image Section */}
            <View style={[styles.imageContainer, { height: imageHeight }]}>
                <Image
                    source={{ uri: product.thumbnail }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />

                {/* Discount Badge */}
                {product.discountPercentage && product.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                {/* Product Name (title) */}
                <Text style={styles.productName} numberOfLines={2}>
                    {product.title}
                </Text>

                {/* Info Row: Rating & Sold */}
                <View style={styles.infoRow}>
                    <View style={styles.ratingBox}>
                        <IconSymbol name="star" size={10} color="#facc15" />
                        <Text style={styles.ratingText}>{Number(product.rating || 0).toFixed(1)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.soldText}>Đã bán {formatSoldCount(product.sold || 0)}</Text>
                </View>

                {/* Price Display */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>
                        {formatCurrency(product.price)}
                    </Text>
                </View>

                {/* Original Price Row (Handle crash by safe check) */}
                {typeof product.originalPrice === 'number' && (
                    <Text style={styles.originalPriceText}>
                        {formatCurrency(product.originalPrice)}
                    </Text>
                )}

                {/* Action Row */}
                <View style={styles.actionRow}>
                    <View style={styles.locationContainer}>
                        {product.isMall && (
                            <View style={styles.mallBadge}>
                                <Text style={styles.mallText}>Mall</Text>
                            </View>
                        )}
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.cartBtn,
                            pressed && styles.cartBtnPressed
                        ]}
                        onPress={handleAddToCart}
                    >
                        <IconSymbol name="cart-outline" size={16} color={theme.colors.onPrimary} />
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
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 8,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.85,
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
    discountBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        padding: 8,
    },
    productName: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typography,
        height: 34,
        lineHeight: 17,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    divider: {
        width: 1,
        height: 10,
        backgroundColor: theme.colors.border,
        marginHorizontal: 6,
    },
    soldText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    priceRow: {
        marginTop: 6,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
    },
    originalPriceText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textDecorationLine: 'line-through',
        marginTop: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    locationContainer: {
        flex: 1,
    },
    mallBadge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 4,
        paddingVertical: 0,
        borderRadius: 2,
        alignSelf: 'flex-start',
    },
    mallText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#fff',
    },
    cartBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBtnPressed: {
        opacity: 0.8,
    },
}));

export default ShopProductItem;
