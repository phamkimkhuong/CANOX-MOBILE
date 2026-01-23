import { SkeletonBox, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// Constants matching FlashSale dimensions
const PRODUCT_CARD_WIDTH = 140;
const PRODUCT_IMAGE_SIZE = 140;
const PRODUCT_COUNT = 4;

/**
 * Single product card skeleton for FlashSale
 */
const ProductCardSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.productCard}>
            {/* Image skeleton */}
            <SkeletonBox
                width={PRODUCT_IMAGE_SIZE}
                height={PRODUCT_IMAGE_SIZE}
                borderRadius={12}
            />

            {/* Product info */}
            <View style={styles.productInfo}>
                {/* Price skeleton */}
                <SkeletonText width="70%" height={15} />

                {/* Progress bar skeleton */}
                <SkeletonBox width="100%" height={16} borderRadius={8} />
            </View>
        </View>
    );
};

/**
 * FlashSaleSkeleton - Loading placeholder for FlashSale section
 * Matches exact layout and dimensions of FlashSale component to prevent layout shift
 * 
 * @example
 * if (isLoading) return <FlashSaleSkeleton />;
 */
export const FlashSaleSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    {/* Flash Sale title skeleton */}
                    <SkeletonText width={100} height={18} />

                    {/* Timer boxes skeleton */}
                    <View style={styles.timerRow}>
                        <SkeletonBox width={28} height={20} borderRadius={4} />
                        <SkeletonBox width={28} height={20} borderRadius={4} />
                        <SkeletonBox width={28} height={20} borderRadius={4} />
                    </View>
                </View>

                {/* See all button skeleton */}
                <SkeletonText width={70} height={12} />
            </View>

            {/* Products scroll skeleton */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.scrollContent}
            >
                {Array.from({ length: PRODUCT_COUNT }).map((_, index) => (
                    <ProductCardSkeleton key={`flash-product-skeleton-${index}`} />
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: 12,
        gap: 12,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    productCard: {
        width: PRODUCT_CARD_WIDTH,
    },
    productInfo: {
        marginTop: theme.margins.sm,
        gap: 6,
    },
}));
