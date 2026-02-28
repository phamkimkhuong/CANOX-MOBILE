import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// Constants matching FlashSale dimensions
const PRODUCT_CARD_WIDTH = 140;
const PRODUCT_IMAGE_SIZE = 140;
const PRODUCT_COUNT = 3;

/**
 * Single product card skeleton for FlashSale
 */
const FlashProductSkeleton: React.FC<{ animatedStyle?: StyleProp<ViewStyle> }> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.productCard}>
            <SkeletonBox
                width={PRODUCT_IMAGE_SIZE}
                height={PRODUCT_IMAGE_SIZE}
                borderRadius={12}
                animatedStyle={animatedStyle}
            />
            {/* Combined info block: price + progress merged into single block */}
            <View style={styles.productInfo}>
                <SkeletonBox width="70%" height={14} animatedStyle={animatedStyle} />
                <SkeletonBox width="100%" height={16} borderRadius={8} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

interface FlashSaleSkeletonProps {
    /** Shared shimmer animation from parent — prevents multiple animation loops */
    animatedStyle?: StyleProp<ViewStyle>;
}

/**
 * FlashSaleSkeleton - Optimized shell-based loading placeholder
 */
export const FlashSaleSkeleton: React.FC<FlashSaleSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header skeleton — simplified */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    {/* Flash Sale title */}
                    <SkeletonBox width={100} height={18} animatedStyle={animatedStyle} />
                    {/* Timer: 3 boxes merged into 1 block */}
                    <SkeletonBox width={96} height={20} borderRadius={4} animatedStyle={animatedStyle} />
                </View>
                {/* See all */}
                <SkeletonBox width={70} height={12} animatedStyle={animatedStyle} />
            </View>

            {/* Products row — static View instead of ScrollView (not scrollable anyway) */}
            <View style={styles.scrollContent}>
                {Array.from({ length: PRODUCT_COUNT }).map((_, index) => (
                    <FlashProductSkeleton key={`flash-sk-${index}`} animatedStyle={animatedStyle} />
                ))}
            </View>
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
    scrollContent: {
        flexDirection: 'row',
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
