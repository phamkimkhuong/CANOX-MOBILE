/**
 * ==============================================
 * SHOP FEATURED PRODUCTS - Showcase for Home tab
 * ==============================================
 */

import { ProductCard } from '@/components/ui/product/ProductCard';
import { productRoutes } from '@/constants/routes';
import type { ShopProductItemUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import React, { memo } from 'react';
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

    if (products.length === 0) return null;

    // Limit to 6-10 products as requested
    const displayProducts = products.slice(0, 10);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.grid}>
                {displayProducts.map((product) => (
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    productWrapper: {
        width: '50%',
        paddingHorizontal: 4,
        marginBottom: 8,
    },
}));

export default ShopFeaturedProducts;