/**
 * ==============================================
 * SHOP PRODUCT SKELETON - Simplified Grid Loading
 * ==============================================
 * 
 * Lightweight skeleton - minimal elements
 * Optimized for CPU performance
 */

import { SkeletonBox, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface ShopProductSkeletonProps {
    /** Number of skeleton items to show */
    count?: number;
}

const NUM_COLUMNS = 2;
const DEFAULT_COUNT = 4;
const GAP = 8;

/**
 * ShopProductSkeleton - Minimal skeleton for product grid
 */
export const ShopProductSkeleton: React.FC<ShopProductSkeletonProps> = ({
    count = DEFAULT_COUNT,
}) => {
    const { theme } = useUnistyles();
    const screenWidth = UnistylesRuntime.screen.width;
    const itemWidth = (screenWidth - theme.margins.sm * 2 - GAP) / NUM_COLUMNS;

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {Array.from({ length: count }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.item,
                            { width: itemWidth },
                            index % 2 === 0 && { marginRight: GAP },
                        ]}
                    >
                        {/* Image */}
                        <SkeletonBox width="100%" height={itemWidth} borderRadius={0} />

                        {/* Content */}
                        <View style={styles.content}>
                            <SkeletonText width="80%" height={13} />
                            <SkeletonText width="50%" height={15} style={styles.mt8} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.sm,
        paddingTop: theme.margins.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        marginBottom: 12,
        overflow: 'hidden',
    },
    content: {
        padding: 10,
    },
    mt8: {
        marginTop: 8,
    },
}));

export default ShopProductSkeleton;
