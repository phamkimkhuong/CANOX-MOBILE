/**
 * ==============================================
 * SHOP PRODUCT SKELETON - Grid Loading State
 * ==============================================
 * 
 * Shows shimmer animation for product grid
 * Renders multiple skeleton cards in 2-column layout
 */

import { SkeletonBox, SkeletonText } from '@/components/ui/Skeleton';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopProductSkeletonProps {
    /** Number of skeleton items to show */
    count?: number;
}

const NUM_COLUMNS = 2;
const DEFAULT_COUNT = 6;
const GAP = 8;

/**
 * ShopProductSkeleton - Loading skeleton for product grid
 * 
 * @example
 * ```tsx
 * {isLoading ? <ShopProductSkeleton count={4} /> : <ProductList />}
 * ```
 */
export const ShopProductSkeleton: React.FC<ShopProductSkeletonProps> = ({
    count = DEFAULT_COUNT,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { width: screenWidth } = useWindowDimensions();

    // Calculate item dimensions
    const horizontalPadding = theme.margins.md;
    const itemWidth = (screenWidth - horizontalPadding * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
    const imageHeight = itemWidth; // Square

    // Create array for rendering
    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {items.map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.itemContainer,
                            { width: itemWidth },
                            index % 2 === 0 && { marginRight: GAP },
                        ]}
                    >
                        {/* Image */}
                        <SkeletonBox
                            width={itemWidth}
                            height={imageHeight}
                            borderRadius={theme.radius.m}
                        />

                        {/* Content */}
                        <View style={styles.content}>
                            {/* Title */}
                            <SkeletonText width="90%" height={14} />
                            <SkeletonText width="70%" height={14} style={styles.titleLine2} />

                            {/* Rating */}
                            <SkeletonText width="60%" height={12} style={styles.rating} />

                            {/* Price */}
                            <SkeletonText width="50%" height={16} style={styles.price} />

                            {/* Bottom Row */}
                            <View style={styles.bottomRow}>
                                <SkeletonText width="40%" height={12} />
                                <SkeletonBox
                                    width={28}
                                    height={28}
                                    borderRadius={14}
                                />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        marginBottom: theme.margins.sm,
        overflow: 'hidden',
    },
    content: {
        padding: theme.margins.sm,
    },
    titleLine2: {
        marginTop: theme.margins.sm / 2,
    },
    rating: {
        marginTop: theme.margins.sm,
    },
    price: {
        marginTop: theme.margins.sm,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.margins.sm,
    },
}));

export default ShopProductSkeleton;
