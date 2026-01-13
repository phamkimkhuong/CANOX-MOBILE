/**
 * ==============================================
 * REVIEW HISTORY LIST - FlashList with Filters
 * ==============================================
 * Infinite scroll list for review history with
 * rating filter support
 */

import type { MyReviewUI, RatingFilter } from '@/types/review';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { EmptyReviewState } from './EmptyReviewState';
import { RatingFilterBar } from './RatingFilterBar';
import { ReviewHistoryCard } from './ReviewHistoryCard';
import { ReviewListSkeleton } from './ReviewListSkeleton';

interface ReviewHistoryListProps {
    /** Review data */
    reviews: MyReviewUI[];
    /** Current rating filter */
    ratingFilter: RatingFilter;
    /** Rating filter change callback */
    onRatingFilterChange: (filter: RatingFilter) => void;
    /** Loading state */
    isLoading?: boolean;
    /** Refreshing state */
    isRefreshing?: boolean;
    /** Refresh callback */
    onRefresh?: () => void;
    /** Fetching next page */
    isFetchingNextPage?: boolean;
    /** Has more data */
    hasNextPage?: boolean;
    /** Load more callback */
    onLoadMore?: () => void;
    /** Edit review callback */
    onEditReview?: (review: MyReviewUI) => void;
    /** Review counts per rating */
    counts?: Record<RatingFilter, number>;
}

/**
 * ReviewHistoryList - Infinite scroll FlashList with rating filter
 */
export const ReviewHistoryList: React.FC<ReviewHistoryListProps> = ({
    reviews,
    ratingFilter,
    onRatingFilterChange,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    isFetchingNextPage = false,
    hasNextPage = false,
    onLoadMore,
    onEditReview,
    counts,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const renderItem: ListRenderItem<MyReviewUI> = useCallback(
        ({ item }) => (
            <ReviewHistoryCard
                review={item}
                onEdit={onEditReview ? () => onEditReview(item) : undefined}
            />
        ),
        [onEditReview]
    );

    const keyExtractor = useCallback(
        (item: MyReviewUI) => item.id,
        []
    );

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

    const renderHeader = () => (
        <RatingFilterBar
            activeFilter={ratingFilter}
            onFilterChange={onRatingFilterChange}
            counts={counts}
        />
    );

    // Loading state
    if (isLoading && reviews.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <ReviewListSkeleton />
            </View>
        );
    }

    // Empty state
    if (!isLoading && reviews.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <EmptyReviewState
                    type="history"
                    onRefresh={onRefresh}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList
                data={reviews}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        paddingBottom: theme.margins.xl,
    },
    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    itemSeparator: {
        height: 4,
    },
}));

export default ReviewHistoryList;
