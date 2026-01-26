/**
 * ==============================================
 * SHOP FEATURED PRODUCTS - Manual Masonry Layout
 * ==============================================
 * 
 * Implements masonry layout manually using View + flexWrap.
 * This avoids nested FlashList conflicts with parent scroll.
 * 
 * Masonry logic: Distributes items into 2 columns, placing each
 * item in the column with the shorter current height.
 */

import { ProductCard } from '@/components/ui/product/ProductCard';
import { productRoutes } from '@/constants/routes';
import type { ShopProductItemUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ShopFeaturedProductsProps {
    products: ShopProductItemUI[];
    title?: string;
}

export const ShopFeaturedProducts = memo(({
    products,
    title = 'Sản phẩm nổi bật',
}: ShopFeaturedProductsProps) => {
    const styles = stylesheet;

    // Limit to 6-10 products as requested
    const displayProducts = useMemo(() => products.slice(0, 10), [products]);

    /**
     * Distribute items into 2 columns for masonry layout.
     * Each item goes to the column with shorter current height.
     */
    const { leftColumn, rightColumn } = useMemo(() => {
        const left: ShopProductItemUI[] = [];
        const right: ShopProductItemUI[] = [];

        // Simple distribution: alternate between columns
        // This creates a staggered masonry effect
        displayProducts.forEach((product, index) => {
            if (index % 2 === 0) {
                left.push(product);
            } else {
                right.push(product);
            }
        });

        return { leftColumn: left, rightColumn: right };
    }, [displayProducts]);

    if (products.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.masonryContainer}>
                {/* Left Column */}
                <View style={styles.column}>
                    {leftColumn.map((product) => (
                        <View key={product.id} style={styles.productWrapper}>
                            <ProductCard
                                title={product.title}
                                price={product.price}
                                image={product.thumbnail}
                                originalPrice={product.originalPrice}
                                rating={product.rating}
                                reviews={product.reviews}
                                sold={product.sold}
                                discount={product.discountPercentage}
                                isMall={product.isMall}
                                location={product.location}
                                onPress={() => Navigator.push(productRoutes.detail(product.id))}
                                route={productRoutes.detail(product.id)}
                            />
                        </View>
                    ))}
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                    {rightColumn.map((product) => (
                        <View key={product.id} style={styles.productWrapper}>
                            <ProductCard
                                title={product.title}
                                price={product.price}
                                image={product.thumbnail}
                                originalPrice={product.originalPrice}
                                rating={product.rating}
                                reviews={product.reviews}
                                sold={product.sold}
                                discount={product.discountPercentage}
                                isMall={product.isMall}
                                location={product.location}
                                onPress={() => Navigator.push(productRoutes.detail(product.id))}
                                route={productRoutes.detail(product.id)}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
});

ShopFeaturedProducts.displayName = 'ShopFeaturedProducts';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: 'transparent',
        paddingVertical: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
        paddingHorizontal: theme.margins.xs,
    },
    masonryContainer: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        gap: 4,
    },
    productWrapper: {
        width: '100%',
    },
}));

export default ShopFeaturedProducts;