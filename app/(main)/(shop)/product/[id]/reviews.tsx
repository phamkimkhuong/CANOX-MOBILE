/**
 * ==============================================
 * ALL PRODUCT REVIEWS SCREEN
 * ==============================================
 * Full screen for viewing all reviews of a product
 * 
 * Route: /product/[id]/reviews
 * Features:
 * - Rating summary header
 * - Filter by star rating, media, seller response
 * - Filter by variant (size, color)
 * - Quick media gallery
 * - Infinite scroll reviews list
 * - Mark as helpful
 */

import {
    ProductReviewCard,
    ProductReviewsHeader,
    QuickMediaGallery,
    ReviewEmptyState,
    ReviewFilterChips,
    ReviewListSkeleton,
    VariantFilterDropdown,
} from '@/components/reviews/product';
import { IconSymbol } from '@/components/ui/Icon';
import { SmartNavButton } from '@/components/ui/navigation/SmartNavButton';
import { chatRoutes, ROUTES } from '@/constants/routes';
import { usePrefetchCart } from '@/hooks/api/cart/useCart';
import { useUnreadMessageCount } from '@/hooks/api/chat';
import { usePrefetchChat } from '@/hooks/api/chat/useChatList';
import {
    useInfiniteProductReviews,
    useMarkReviewHelpful,
    useProductReviewStatistics,
    useRefreshProductReviews,
} from '@/hooks/api/review/useInfiniteProductReviews';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import type {
    ProductReviewFilterType,
    ProductReviewMediaUI,
    ProductReviewSortOption,
    ProductReviewStatisticsUI,
    ProductReviewUI,
} from '@/types/review/productReview';
import { getReviewEmptyState } from '@/utils/adapter/review/productReviewAdapter';
import { createLogger } from '@/utils/logger';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const log = createLogger('ProductReviewsScreen');

// ============================================
// TYPES
// ============================================

interface ListHeaderProps {
    statistics: ProductReviewStatisticsUI | null;
    reviews: ProductReviewUI[];
    activeFilter: ProductReviewFilterType;
    selectedVariantId: string | null;
    onFilterChange: (filter: ProductReviewFilterType) => void;
    onVariantChange: (variantId: string | null) => void;
    onMediaPress: (media: ProductReviewMediaUI[], index: number) => void;
    isLoading: boolean;
}

// ============================================
// LIST HEADER COMPONENT
// ============================================

const ListHeader = React.memo<ListHeaderProps>(({
    statistics,
    reviews,
    activeFilter,
    selectedVariantId,
    onFilterChange,
    onVariantChange,
    onMediaPress,
    isLoading,
}) => {
    return (
        <>
            {/* Rating Summary */}
            <ProductReviewsHeader
                statistics={statistics}
                isLoading={isLoading}
            />

            {/* Filter Chips */}
            <ReviewFilterChips
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                statistics={statistics}
            />

            {/* Variant Filter (if available) */}
            {statistics?.variantOptions && statistics.variantOptions.length > 0 && (
                <View style={headerStyles.variantContainer}>
                    <VariantFilterDropdown
                        options={statistics.variantOptions}
                        selectedVariantId={selectedVariantId}
                        onSelect={onVariantChange}
                    />
                </View>
            )}

            {/* Quick Media Gallery */}
            <QuickMediaGallery
                reviews={reviews}
                onMediaPress={onMediaPress}
            />
        </>
    );
});

ListHeader.displayName = 'ListHeader';

const headerStyles = StyleSheet.create((theme) => ({
    variantContainer: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
}));

// ============================================
// MAIN SCREEN
// ============================================

export default function ProductReviewsScreen() {
    const { id: productId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();

    // ============================================
    // STATE
    // ============================================

    const [activeFilter, setActiveFilter] = useState<ProductReviewFilterType>('all');
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<ProductReviewSortOption>('newest');

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const cartItemCount = useCartStore((state) => state.totalQuantity);
    const { data: unreadMessageCount } = useUnreadMessageCount();

    const prefetchCart = usePrefetchCart();
    const prefetchChat = usePrefetchChat();

    const cartRoute = useMemo(() => (isAuthenticated ? ROUTES.CART.INDEX : ROUTES.AUTH.LOGIN), [isAuthenticated]);
    const chatRoute = useMemo(() => (isAuthenticated ? chatRoutes.list() : ROUTES.AUTH.LOGIN), [isAuthenticated]);

    // ============================================
    // DATA FETCHING
    // ============================================

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListLoading,
        isError: isListError,
        refetch: refetchList,
        isRefetching: isRefetchingList,
    } = useInfiniteProductReviews(productId ?? '', {
        filter: activeFilter,
        variantId: selectedVariantId,
        sort: sortOption,
        enabled: !!productId,
    });

    const {
        data: statistics,
        isLoading: isStatsLoading,
        isError: isStatsError,
        refetch: refetchStats,
    } = useProductReviewStatistics(productId ?? '', !!productId);

    const { mutate: markHelpful } = useMarkReviewHelpful();

    // Smart Refresh
    const { refresh: smartRefreshList } = useRefreshProductReviews(
        productId ?? '',
        activeFilter,
        selectedVariantId,
        sortOption
    );

    // ============================================
    // DERIVED DATA
    // ============================================

    const reviews = useMemo(() => {
        return data?.pages.flatMap(page => page.reviews) ?? [];
    }, [data]);

    const statisticsData = statistics ?? null;

    const totalReviews = statisticsData?.totalReviews ?? 0;

    const isLoading = isListLoading || isStatsLoading;
    const isError = isListError || isStatsError;
    const isRefetching = isRefetchingList;

    const handleRefetch = useCallback(() => {
        smartRefreshList();
        refetchStats();
    }, [smartRefreshList, refetchStats]);

    // Get empty state config
    const emptyConfig = useMemo(() => {
        const variantLabel = statisticsData?.variantOptions.find(
            v => v.variantId === selectedVariantId
        )?.label;
        return getReviewEmptyState(activeFilter, variantLabel);
    }, [activeFilter, selectedVariantId, statisticsData]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleFilterChange = useCallback((filter: ProductReviewFilterType) => {
        log.info('Filter changed:', filter);
        setActiveFilter(filter);
    }, []);

    const handleVariantChange = useCallback((variantId: string | null) => {
        log.info('Variant changed:', variantId);
        setSelectedVariantId(variantId);
    }, []);

    const handleHelpfulPress = useCallback((reviewId: string) => {
        if (!productId) return;
        markHelpful({ reviewId, productId });
    }, [productId, markHelpful]);

    const handleMediaPress = useCallback((media: ProductReviewMediaUI[], startIndex: number) => {
        log.info('Media pressed:', { count: media.length, startIndex });
        // TODO: Open media gallery modal
        // router.push({ pathname: '/media-gallery', params: { ... }});
    }, []);

    const handleUserPress = useCallback((userId: string) => {
        log.info('User pressed:', userId);
        // TODO: Navigate to user profile if needed
    }, []);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            log.info('Loading more reviews...');
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    const renderItem = useCallback(({ item }: { item: ProductReviewUI }) => {
        return (
            <ProductReviewCard
                review={item}
                onHelpfulPress={handleHelpfulPress}
                onMediaPress={handleMediaPress}
                onUserPress={handleUserPress}
            />
        );
    }, [handleHelpfulPress, handleMediaPress, handleUserPress]);

    const keyExtractor = useCallback((item: ProductReviewUI) => item.id, []);

    const renderListHeader = useCallback(() => (
        <ListHeader
            statistics={statisticsData}
            reviews={reviews}
            activeFilter={activeFilter}
            selectedVariantId={selectedVariantId}
            onFilterChange={handleFilterChange}
            onVariantChange={handleVariantChange}
            onMediaPress={handleMediaPress}
            isLoading={isLoading}
        />
    ), [
        statisticsData,
        reviews,
        activeFilter,
        selectedVariantId,
        handleFilterChange,
        handleVariantChange,
        handleMediaPress,
        isLoading,
    ]);

    const renderListFooter = useCallback(() => {
        if (isFetchingNextPage) {
            return (
                <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            );
        }
        return null;
    }, [isFetchingNextPage, theme.colors.primary]);

    const renderListEmpty = useCallback(() => {
        if (isLoading) {
            return <ReviewListSkeleton count={3} />;
        }
        return <ReviewEmptyState config={emptyConfig} />;
    }, [isLoading, emptyConfig]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: `Đánh giá${totalReviews > 0 ? ` (${totalReviews})` : ''}`,
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: '600',
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                    },
                    headerLeft: () => (
                        <Pressable onPress={handleBack} style={styles.headerButton}>
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <SmartNavButton
                                route={cartRoute}
                                prefetchAction={prefetchCart}
                                style={styles.iconButton}
                            >
                                {({ pressed }) => (
                                    <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                                        <IconSymbol name="cart" size={24} color={theme.colors.typography} />
                                        {cartItemCount > 0 && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>
                                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </SmartNavButton>

                            <SmartNavButton
                                route={chatRoute}
                                prefetchAction={prefetchChat}
                                style={styles.iconButton}
                            >
                                {({ pressed }) => (
                                    <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                                        <IconSymbol name="chatbubble-ellipses-outline" size={24} color={theme.colors.typography} />
                                        {isAuthenticated && unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>
                                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </SmartNavButton>
                        </View>
                    ),
                }}
            />

            {/* Main Content */}
            <FlashList
                data={reviews}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderListFooter}
                ListEmptyComponent={renderListEmpty}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefetch}
                        tintColor={theme.colors.buttonActive}
                        colors={[theme.colors.buttonActive]}
                    />
                }
                // Top safe area handled automatically by Stack.Screen (headerShown: true)
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + theme.margins.lg }
                ]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        padding: 6,
    },
    iconWrapper: {
        position: 'relative',
    },
    pressedOpacity: {
        opacity: 0.7,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: theme.colors.surface,
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
    loadingFooter: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: theme.margins.sm,
    },
}));
