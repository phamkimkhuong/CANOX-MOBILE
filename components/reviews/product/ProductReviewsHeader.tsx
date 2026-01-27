/**
 * ==============================================
 * PRODUCT REVIEWS HEADER
 * ==============================================
 * Sticky header for All Reviews screen with:
 * - Average rating summary
 * - Rating distribution bars
 * - Total review count
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ProductReviewStatisticsUI } from '@/types/review/productReview';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';


interface ProductReviewsHeaderProps {
    statistics: ProductReviewStatisticsUI | null;
    isLoading?: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Rating Bar - Single rating row
 */
const RatingBar = memo<{
    star: number;
    count: number;
    percentage: number;
}>(({ star, count, percentage }) => {
    const { theme } = useUnistyles();

    return (
        <View style={barStyles.container}>
            <View style={barStyles.starLabel}>
                <Text style={barStyles.starText}>{star}</Text>
                <IconSymbol name="star" size={10} color={theme.colors.warning} />
            </View>
            <View style={barStyles.barBackground}>
                <View style={[barStyles.barFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={barStyles.countText}>{count}</Text>
        </View>
    );
});

RatingBar.displayName = 'RatingBar';

const barStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    starLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        width: 24,
    },
    starText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    barBackground: {
        flex: 1,
        height: 6,
        backgroundColor: theme.colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: theme.colors.warning,
        borderRadius: 3,
    },
    countText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        width: 30,
        textAlign: 'right',
    },
}));

/**
 * Skeleton for loading state
 */
const HeaderSkeleton = memo(() => {
    return (
        <View style={skeletonStyles.container}>
            <View style={skeletonStyles.left}>
                <View style={skeletonStyles.ratingBox} />
                <View style={skeletonStyles.starsBox} />
            </View>
            <View style={skeletonStyles.right}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={skeletonStyles.barBox} />
                ))}
            </View>
        </View>
    );
});

HeaderSkeleton.displayName = 'HeaderSkeleton';

const skeletonStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        padding: theme.margins.md,
        gap: 20,
    },
    left: {
        alignItems: 'center',
        gap: 8,
    },
    ratingBox: {
        width: 60,
        height: 40,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.m,
    },
    starsBox: {
        width: 80,
        height: 16,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
    right: {
        flex: 1,
        gap: 6,
    },
    barBox: {
        height: 10,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const ProductReviewsHeader = memo<ProductReviewsHeaderProps>(({
    statistics,
    isLoading,
}) => {
    const { theme } = useUnistyles();

    // Compute rating bars data
    const ratingBars = useMemo(() => {
        if (!statistics) return [];

        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: statistics.ratingDistribution[star.toString()] ?? 0,
            percentage: statistics.ratingPercentage[star.toString()] ?? 0,
        }));
    }, [statistics]);

    // Loading state
    if (isLoading || !statistics) {
        return <HeaderSkeleton />;
    }

    return (
        <View style={styles.container}>
            {/* Left: Rating Summary */}
            <View style={styles.ratingSection}>
                <Text style={styles.ratingValue}>{statistics.formattedRating}</Text>
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <IconSymbol
                            key={star}
                            name="star"
                            size={14}
                            color={
                                star <= Math.round(statistics.averageRating)
                                    ? theme.colors.warning
                                    : theme.colors.border
                            }
                        />
                    ))}
                </View>
                <Text style={styles.totalText}>
                    {statistics.formattedTotal} đánh giá
                </Text>
            </View>

            {/* Right: Rating Distribution */}
            <View style={styles.distributionSection}>
                {ratingBars.map((bar) => (
                    <RatingBar
                        key={bar.star}
                        star={bar.star}
                        count={bar.count}
                        percentage={bar.percentage}
                    />
                ))}
            </View>
        </View>
    );
});

ProductReviewsHeader.displayName = 'ProductReviewsHeader';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        padding: theme.margins.md,
        backgroundColor: theme.colors.surface,
        gap: 20,
    },
    ratingSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: theme.margins.md,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    ratingValue: {
        fontSize: 40,
        fontWeight: '700',
        color: theme.colors.typography,
        lineHeight: 44,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
    totalText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },
    distributionSection: {
        flex: 1,
        justifyContent: 'center',
    },
}));
