/**
 * ==============================================
 * REVIEW HISTORY LIST - FlashList with Filters
 * ==============================================
 */

import type { MyReviewUI, RatingFilter } from '@/types/review';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { EmptyReviewState } from './EmptyReviewState';
import { RatingFilterBar } from './RatingFilterBar';
import { ReviewHistoryCard } from './ReviewHistoryCard';

interface ReviewHistoryListProps {
    /** Review data */
    reviews: MyReviewUI[];
    /** Current rating filter */
    ratingFilter: RatingFilter;
    /** Rating filter change callback */
    onRatingFilterChange: (filter: RatingFilter) => void;
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

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }, [isFetchingNextPage, styles.footer, theme.colors.primary]);

    // Empty state
    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                {/* RatingFilterBar*/}
                <RatingFilterBar
                    activeFilter={ratingFilter}
                    onFilterChange={onRatingFilterChange}
                    counts={counts}
                />
                <EmptyReviewState
                    type="history"
                    onRefresh={onRefresh}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RatingFilterBar
                activeFilter={ratingFilter}
                onFilterChange={onRatingFilterChange}
                counts={counts}
            />
            <FlashList
                data={reviews}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
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
