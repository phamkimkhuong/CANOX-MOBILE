/**
 * ==============================================
 * PRODUCT GRID SKELETON - Loading State
 * ==============================================
 * 
 * Features:
 * - 2-column grid layout
 * - Shimmer animation
 * - Matches ProductCard dimensions
 */

import { ProductCardSkeleton } from '@/components/ui/product/ProductCardSkeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ProductGridSkeletonProps {
    count?: number;
    animatedStyle?: object;
}

export const ProductGridSkeleton = React.memo(({
    count = 6,
    animatedStyle,
}: ProductGridSkeletonProps) => {
    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <View style={styles.container}>
            {items.map((index) => (
                <View key={`skeleton_${index}`} style={styles.itemWrapper}>
                    <ProductCardSkeleton animatedStyle={animatedStyle} />
                </View>
            ))}
        </View>
    );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.margins.sm,
        paddingTop: theme.margins.sm,
    },
    itemWrapper: {
        width: '50%',
        paddingHorizontal: theme.margins.sm / 2,
        paddingBottom: theme.margins.sm,
    },
}));

export default ProductGridSkeleton;
