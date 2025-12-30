import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import type { ReviewStatistics } from '@/types/productDetail';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

interface ProductReviewsProps {
    /** Review statistics từ product data */
    reviewStatistics: ReviewStatistics;
    /** Rating trung bình */
    rating: number;
    /** Tổng số reviews */
    totalReviews: number;
    /** Callback khi nhấn "Xem tất cả" */
    onViewAllPress?: () => void;
    /** Callback khi nhấn "Hỏi đáp" */
    onAskQuestionPress?: () => void;
}

interface FilterChipProps {
    label: string;
    count?: number;
    isActive: boolean;
    onPress: () => void;
}

interface RatingBarProps {
    star: number;
    percentage: number;
    count: number;
}

const PLACEHOLDER_AVATAR = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format số lượng đánh giá
 */
const formatReviewCount = (count: number): string => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Filter Chip Component
 */
const FilterChip = memo<FilterChipProps>(({ label, count, isActive, onPress }) => {
    const displayLabel = count !== undefined ? `${label} (${formatReviewCount(count)})` : label;

    return (
        <Pressable
            style={[chipStyles.container, isActive && chipStyles.containerActive]}
            onPress={onPress}
        >
            <Text style={[chipStyles.text, isActive && chipStyles.textActive]}>
                {displayLabel}
            </Text>
        </Pressable>
    );
});

FilterChip.displayName = 'FilterChip';

const chipStyles = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.background,
    },
    containerActive: {
        backgroundColor: theme.colors.primaryMuted,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    textActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
}));

/**
 * Rating Bar Component - Hiển thị thanh progress cho mỗi mức sao
 */
const RatingBar = memo<RatingBarProps>(({ star, percentage, count }) => {
    const { theme } = useUnistyles();

    return (
        <View style={barStyles.container}>
            <View style={barStyles.starLabel}>
                <Text style={barStyles.starText}>{star}</Text>
                <IconSymbol name="star" size={12} color={theme.colors.warning} />
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
    },
    starLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        width: 24,
    },
    starText: {
        fontSize: 12,
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
        fontSize: 12,
        color: theme.colors.typographySecondary,
        width: 30,
        textAlign: 'right',
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const ProductReviews = memo<ProductReviewsProps>(({
    reviewStatistics,
    rating,
    totalReviews,
    onViewAllPress,
    onAskQuestionPress,
}) => {
    const { theme } = useUnistyles();

    // Memoize rating distribution data
    const ratingBars = useMemo(() => {
        const distribution = reviewStatistics.ratingDistribution ?? {};
        const percentage = reviewStatistics.ratingPercentage ?? {};

        return [5, 4, 3, 2, 1].map(star => ({
            star,
            count: distribution[star.toString()] ?? 0,
            percentage: percentage[star.toString()] ?? 0,
        }));
    }, [reviewStatistics.ratingDistribution, reviewStatistics.ratingPercentage]);

    // Memoize filter chips data
    const filterChips = useMemo(() => [
        { id: 'all', label: PRODUCT_STRINGS.reviews.filterAll, count: totalReviews, isActive: true },
        { id: '5star', label: PRODUCT_STRINGS.reviews.filter5Star, count: reviewStatistics.ratingDistribution?.['5'] ?? 0, isActive: false },
        { id: 'media', label: PRODUCT_STRINGS.reviews.filterWithMedia, count: reviewStatistics.mediaReviewCount ?? 0, isActive: false },
    ], [totalReviews, reviewStatistics.ratingDistribution, reviewStatistics.mediaReviewCount]);

    // Callbacks
    const handleFilterPress = useCallback((filterId: string) => {
        // TODO: Implement filter logic
        if (__DEV__) {
            console.log('Filter selected:', filterId);
        }
    }, []);

    // Empty state khi chưa có đánh giá
    if (totalReviews === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{PRODUCT_STRINGS.reviews.title}</Text>
                </View>

                <View style={styles.emptyContainer}>
                    <IconSymbol
                        name="rate-review"
                        size={48}
                        color={theme.colors.secondary}
                    />
                    <Text style={styles.emptyTitle}>{PRODUCT_STRINGS.reviews.noReviews}</Text>
                    <Text style={styles.emptySubtitle}>
                        {PRODUCT_STRINGS.reviews.beFirst}
                    </Text>
                </View>

                {/* Q&A Section */}
                <Pressable style={styles.qaSection} onPress={onAskQuestionPress}>
                    <Text style={styles.qaTitle}>{PRODUCT_STRINGS.reviews.qna}</Text>
                    <View style={styles.qaAction}>
                        <Text style={styles.qaActionText}>{PRODUCT_STRINGS.reviews.askQuestion}</Text>
                        <IconSymbol
                            name="chevron-right"
                            size={16}
                            color={theme.colors.primary}
                        />
                    </View>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{PRODUCT_STRINGS.reviews.title}</Text>
                    <View style={styles.headerRating}>
                        <IconSymbol name="star" size={14} color={theme.colors.warning} />
                        <Text style={styles.headerRatingText}>{rating.toFixed(1)}/5</Text>
                    </View>
                    <Text style={styles.totalCount}>({formatReviewCount(totalReviews)} {PRODUCT_STRINGS.reviews.reviewCount})</Text>
                </View>
                <Pressable style={styles.viewAllButton} onPress={onViewAllPress}>
                    <Text style={styles.viewAllText}>{PRODUCT_STRINGS.reviews.viewAll}</Text>
                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={theme.colors.primary}
                    />
                </Pressable>
            </View>

            {/* Rating Overview */}
            <View style={styles.overviewContainer}>
                {/* Left: Average Rating */}
                <View style={styles.ratingLeft}>
                    <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconSymbol
                                key={star}
                                name="star"
                                size={14}
                                color={star <= Math.round(rating) ? theme.colors.warning : theme.colors.border}
                            />
                        ))}
                    </View>
                    <Text style={styles.ratingSubtext}>
                        {formatReviewCount(totalReviews)} {PRODUCT_STRINGS.reviews.reviewCount}
                    </Text>
                </View>

                {/* Right: Rating Distribution */}
                <View style={styles.ratingRight}>
                    {ratingBars.map((bar) => (
                        <RatingBar
                            key={bar.star}
                            star={bar.star}
                            percentage={bar.percentage}
                            count={bar.count}
                        />
                    ))}
                </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {filterChips.map((chip) => (
                    <FilterChip
                        key={chip.id}
                        label={chip.label}
                        count={chip.count}
                        isActive={chip.isActive}
                        onPress={() => handleFilterPress(chip.id)}
                    />
                ))}
            </ScrollView>

            {/* Review Preview - Placeholder */}
            <View style={styles.reviewPreview}>
                <View style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                            <View style={styles.avatarPlaceholder}>
                                <IconSymbol
                                    name="person"
                                    size={20}
                                    color={theme.colors.secondary}
                                />
                            </View>
                            <View>
                                <Text style={styles.reviewerName}>Người dùng</Text>
                                <View style={styles.reviewStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconSymbol
                                            key={star}
                                            name="star"
                                            size={12}
                                            color={theme.colors.warning}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                        <Text style={styles.reviewDate}>{PRODUCT_STRINGS.reviews.newest}</Text>
                    </View>
                    <Text style={styles.reviewPlaceholder}>
                        {PRODUCT_STRINGS.reviews.viewAllReviews}
                    </Text>
                </View>
            </View>

            {/* Q&A Section */}
            <Pressable style={styles.qaSection} onPress={onAskQuestionPress}>
                <View style={styles.qaLeft}>
                    <Text style={styles.qaTitle}>{PRODUCT_STRINGS.reviews.qna}</Text>
                    <Text style={styles.qaCount}>
                        ({reviewStatistics.commentCount ?? 0} {PRODUCT_STRINGS.reviews.questions})
                    </Text>
                </View>
                <View style={styles.qaAction}>
                    <Text style={styles.qaActionText}>{PRODUCT_STRINGS.reviews.viewAll}</Text>
                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={theme.colors.primary}
                    />
                </View>
            </Pressable>
        </View>
    );
});

ProductReviews.displayName = 'ProductReviews';


const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
        paddingVertical: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.smd,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    headerRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    totalCount: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    viewAllText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    // Rating Overview
    overviewContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        gap: theme.margins.md,
    },
    ratingLeft: {
        alignItems: 'center',
        paddingRight: theme.margins.md,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    ratingValue: {
        fontSize: 36,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
    ratingSubtext: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },
    ratingRight: {
        flex: 1,
        gap: 4,
        justifyContent: 'center',
    },

    // Filters
    filtersContainer: {
        marginBottom: theme.margins.md,
    },
    filtersContent: {
        paddingHorizontal: theme.margins.md,
        gap: 8,
    },

    // Review Preview
    reviewPreview: {
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    reviewItem: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.margins.sm,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewerName: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 1,
        marginTop: 2,
    },
    reviewDate: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    reviewPlaceholder: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },

    // Q&A Section
    qaSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    qaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    qaTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    qaCount: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    qaAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    qaActionText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    emptySubtitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 4,
        textAlign: 'center',
    },
}));

export default ProductReviews;

