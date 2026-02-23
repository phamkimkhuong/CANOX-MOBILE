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
import { toSizedImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { GestureResponderEvent, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopProductItemProps {
    /** Product data from adapter (ProductFeedItem) */
    product: ShopProductItemUI;
    /** Callback when add to cart pressed */
    onAddToCart?: (productId: string) => void;
}

const IMAGE_ASPECT_RATIO = 1;

/**
 * ShopProductItem - Premium product card for shop grid
 */
export const ShopProductItem: React.FC<ShopProductItemProps> = ({
    product,
    onAddToCart,
}) => {
    const { theme } = useUnistyles();

    const handlePress = useCallback(() => {
        Navigator.push(productRoutes.detail(product.id));
    }, [product.id]);

    const handleAddToCart = useCallback(
        (e: GestureResponderEvent) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product.id);
        },
        [onAddToCart, product.id]
    );

    return (
        <Pressable
            style={({ pressed }) => [
                stylesheet.container,
                pressed && stylesheet.containerPressed,
            ]}
            onPress={handlePress}
        >
            <View
                style={stylesheet.shadowWrapper}
                shouldRasterizeIOS={true}
                renderToHardwareTextureAndroid={true}
            >
                <View style={stylesheet.surfaceLayer}>
                    {/* Specular Highlight */}
                    <View style={stylesheet.highlight} />

                    {/* Image Section */}
                    <View style={stylesheet.imageContainer}>
                        <Image
                            source={{ uri: toSizedImageUrl(product.thumbnail, null, 'medium') ?? product.thumbnail }}
                            style={stylesheet.image}
                            contentFit="cover"
                            transition={200}
                        />

                        {/* Badges */}
                        <View style={stylesheet.badgeContainer}>
                            {product.discountPercentage != null && product.discountPercentage > 0 && (
                                <View style={stylesheet.discountBadge}>
                                    <Text style={stylesheet.discountText}>-{product.discountPercentage}%</Text>
                                </View>
                            )}
                            {product.isMall && (
                                <View style={stylesheet.mallBadge}>
                                    <Text style={stylesheet.mallText}>MALL</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={stylesheet.content}>
                        <Text style={stylesheet.productName} numberOfLines={2}>
                            {product.title}
                        </Text>

                        <View style={stylesheet.infoRow}>
                            <View style={stylesheet.ratingBox}>
                                <IconSymbol name="star" size={10} color="#facc15" />
                                <Text style={stylesheet.ratingText}>{Number(product.rating || 0).toFixed(1)}</Text>
                            </View>
                            <View style={stylesheet.divider} />
                            <Text style={stylesheet.soldText}>Đã bán {formatSoldCount(product.sold || 0)}</Text>
                        </View>

                        <View style={stylesheet.priceRow}>
                            <Text style={stylesheet.priceText}>
                                {formatCurrency(product.price)}
                            </Text>
                            {typeof product.originalPrice === 'number' && product.originalPrice > product.price && (
                                <Text style={stylesheet.originalPriceText}>
                                    {formatCurrency(product.originalPrice)}
                                </Text>
                            )}
                        </View>

                        {/* Action Row */}
                        <View style={stylesheet.actionRow}>
                            <View style={stylesheet.flex1} />

                            <Pressable
                                onPress={handleAddToCart}
                                style={stylesheet.cartBtnWrapper}
                            >
                                {({ pressed }) => (
                                    <LinearGradient
                                        colors={[theme.colors.buttonActive, theme.colors.accent]}
                                        style={[stylesheet.cartBtn, pressed && stylesheet.cartBtnPressed]}
                                    >
                                        <IconSymbol name="cart-outline" size={14} color="#FFF" />
                                    </LinearGradient>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: 8,
    },
    shadowWrapper: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
    },
    surfaceLayer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: theme.colors.surface,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 10,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: theme.colors.background,
        position: 'relative',
        aspectRatio: IMAGE_ASPECT_RATIO,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'column',
        gap: 4,
    },
    discountBadge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    mallBadge: {
        backgroundColor: theme.colors.inkBlack,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    mallText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#fff',
    },
    content: {
        padding: 12,
    },
    productName: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    divider: {
        width: 1,
        height: 8,
        backgroundColor: theme.colors.borderMuted,
        marginHorizontal: 8,
    },
    soldText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.vibrantRed,
    },
    originalPriceText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    flex1: {
        flex: 1,
    },
    locationText: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    cartBtnWrapper: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    cartBtn: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBtnPressed: {
        opacity: 0.8,
    },
}));

export default ShopProductItem;
