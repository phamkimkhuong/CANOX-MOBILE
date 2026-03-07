/**
 * ==============================================
 * REVIEWS SCREEN - "Đánh giá của tôi"
 * ==============================================
 * Two-tab layout: "Chưa đánh giá" & "Đã đánh giá"
 * Using custom segmented tabs instead of Material Top Tabs
 */

import { DataGuard } from '@/components/common/DataGuard';
import {
    PendingReviewList,
    ReviewHistoryList,
} from '@/components/reviews/list';
import { RatingFilterBar } from '@/components/reviews/list/RatingFilterBar';
import { ReviewListSkeleton } from '@/components/reviews/list/ReviewListSkeleton';
import { IconSymbol } from '@/components/ui/Icon';
import { reviewRoutes } from '@/constants/routes';
import {
    useMyReviews,
    usePendingReviews,
    useRefreshMyReviews,
    useRefreshPendingReviews
} from '@/hooks/api/review';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import type { MyReviewUI, RatingFilter } from '@/types/review';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type TabType = 'pending' | 'history';

export default function ReviewsScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const { filterOrderId } = useLocalSearchParams<{ filterOrderId?: string }>();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    // Reset filter when navigating back or manually
    const handleClearFilter = useCallback(() => {
        Navigator.replace(reviewRoutes.list());
    }, []);

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    // Rating filter for history tab
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

    // Pending reviews data
    const pendingQuery = usePendingReviews();
    const {
        pendingGroups,
        pendingCount,
        isRefetching: isPendingRefetching,
    } = pendingQuery;
    const { refresh: refreshPending } = useRefreshPendingReviews();

    // History reviews data
    const historyQuery = useMyReviews(ratingFilter, activeTab === 'history');
    const {
        reviews: historyReviews,
        isRefetching: isHistoryRefetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = historyQuery;
    const { refresh: refreshHistory } = useRefreshMyReviews();

    // Handlers
    const handleRefreshPending = useCallback(() => {
        refreshPending();
    }, [refreshPending]);

    const handleRefreshHistory = useCallback(() => {
        refreshHistory();
    }, [refreshHistory]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRatingFilterChange = useCallback((filter: RatingFilter) => {
        setRatingFilter(filter);
    }, []);

    const handleEditReview = useCallback(
        (review: MyReviewUI) => {
            Navigator.push({
                pathname: '/(main)/(user)/reviews/write/[itemId]',
                params: {
                    itemId: review.productId,
                    mode: 'edit',
                    reviewId: review.id,
                    existingRating: String(review.rating),
                    existingComment: encodeURIComponent(review.comment || ''),
                },
            });
        },
        []
    );

    return (
        <View style={styles.container}>
            {/* Header - integrated with safe area */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => Navigator.back()}
                        hitSlop={8}
                    >
                        <IconSymbol
                            name="chevron.left"
                            size={24}
                            color={theme.colors.typography}
                        />
                    </Pressable>
                    <Text style={styles.title}>{t('title')}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Custom Tabs */}
                <View style={styles.tabBar}>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'pending' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'pending' && styles.tabTextActive,
                            ]}
                        >
                            {t('tabs.pending')}
                        </Text>
                        {pendingCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {pendingCount > 99 ? '99+' : pendingCount}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'history' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'history' && styles.tabTextActive,
                            ]}
                        >
                            {t('tabs.history')}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Tab Content */}
            <View style={styles.content}>
                {activeTab === 'pending' ? (
                    <DataGuard
                        query={pendingQuery}
                        skeleton={<ReviewListSkeleton />}
                        isDataEmpty={() => false}
                    >
                        {() => (
                            <PendingReviewList
                                groups={pendingGroups}
                                isRefreshing={isPendingRefetching}
                                onRefresh={handleRefreshPending}
                                filterOrderId={filterOrderId}
                                onClearFilter={handleClearFilter}
                            />
                        )}
                    </DataGuard>
                ) : (
                    <DataGuard
                        query={historyQuery}
                        skeleton={
                            <View style={styles.skeletonContainer}>
                                <RatingFilterBar
                                    activeFilter={ratingFilter}
                                    onFilterChange={handleRatingFilterChange}
                                    counts={undefined}
                                />
                                <ReviewListSkeleton />
                            </View>
                        }
                        isDataEmpty={() => false}
                    >
                        {() => (
                            <ReviewHistoryList
                                reviews={historyReviews}
                                ratingFilter={ratingFilter}
                                onRatingFilterChange={handleRatingFilterChange}
                                isRefreshing={isHistoryRefetching}
                                onRefresh={handleRefreshHistory}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                                onLoadMore={handleLoadMore}
                                onEditReview={handleEditReview}
                            />
                        )}
                    </DataGuard>
                )}
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginLeft: -theme.margins.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    placeholder: {
        width: 40,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: 6,
    },
    tabActive: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    badge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    skeletonContainer: {
        flex: 1,
    },
}));
