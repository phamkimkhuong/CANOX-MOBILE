/**
 * ==============================================
 * SEARCH RESULTS SCREEN - Product Search
 * ==============================================
 * 
 * Features:
 * - Infinite scroll with FlashList
 * - Sort & Filter controls (sticky)
 * - Quick filter chips
 * - Smart empty state with recommendations
 * - Race condition handling
 * - Scroll restoration
 */

import {
    ProductGridSkeleton,
    QuickFilters,
    SearchFilterModal,
    SearchResultHeader,
    SortBar,
} from '@/components/search';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { productRoutes, searchRoutes } from '@/constants/routes';
import { usePrefetchProductDetail } from '@/hooks/api/product/useProductDetail';
import { useRecommendedProducts, useSearchProducts } from '@/hooks/api/search';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import type {
    AdvancedFilters,
    QuickFilterType,
    SearchProductUI,
    SearchSortField,
} from '@/types/search-results';
import { Navigator } from '@/utils/navigation';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Keyboard,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type ListItemType =
    | { type: 'emptyHeader'; id: string; keyword: string; hasRecommendations: boolean }
    | { type: 'product'; data: SearchProductUI };

// ============================================
// PRODUCT ITEM COMPONENT
// ============================================

const ProductItem = React.memo(({ item }: { item: SearchProductUI }) => {
    const prefetchProduct = usePrefetchProductDetail();
    const pressInTimeRef = useRef(0);

    const handlePressIn = useCallback(() => {
        pressInTimeRef.current = Date.now();
        prefetchProduct(item.id);
    }, [item.id, prefetchProduct]);

    const handlePress = useCallback(() => {
        const elapsed = pressInTimeRef.current ? Date.now() - pressInTimeRef.current : 0;
        pressInTimeRef.current = 0;
        const isInstantTap = elapsed > 0 && elapsed < PREFETCH_GRACE_PERIOD_MS;
        Navigator.push(productRoutes.detail(item.id, { instantNav: isInstantTap }));
    }, [item.id]);

    return (
        <ProductCard
            title={item.title}
            price={item.price}
            image={item.thumbnail}
            originalPrice={item.originalPrice}
            rating={item.rating}
            reviews={item.reviews}
            sold={item.sold}
            location={item.location}
            discount={item.discountPercentage}
            onPress={handlePress}
            onPressIn={handlePressIn}
            route={productRoutes.detail(item.id)}
        />
    );
});

ProductItem.displayName = 'ProductItem';

// ============================================
// MAIN SCREEN
// ============================================

export default function SearchResultsScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');

    // Get search params (global search only - shop search is separate)
    const { q: keyword = '' } = useLocalSearchParams<{ q: string }>();

    // ========================================
    // STATE & REFS
    // ========================================
    const [sortBy, setSortBy] = useState<SearchSortField>('RELEVANCE');
    const [quickFilters, setQuickFilters] = useState<QuickFilterType[]>([]);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        validPriceRange: true,
    });
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Search query
    const {
        products,
        isEmpty,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useSearchProducts({
        keyword,
        sortBy,
        quickFilters,
        advancedFilters,
        enabled: keyword.length > 0,
    });

    // Recommended products query (when search is empty)
    const {
        products: recommendedProducts,
        isLoading: isLoadingRecommended,
    } = useRecommendedProducts({
        enabled: isEmpty && !isLoading,
        pageSize: 20,
    });

    // ========================================
    // ANIMATION STATE
    // ========================================
    const shimmerValue = useSharedValue(0.3);
    const contentOpacity = useSharedValue(0);

    const shimmerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: shimmerValue.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    React.useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true
        );
    }, [shimmerValue]);

    const isDataLoaded = useMemo(() => {
        if (isLoading && products.length === 0) return false;
        if (isEmpty && isLoadingRecommended) return false;
        return true;
    }, [isLoading, products.length, isEmpty, isLoadingRecommended]);

    React.useEffect(() => {
        if (isDataLoaded) {
            contentOpacity.value = withTiming(1, { duration: 400 });
        } else {
            contentOpacity.value = 0;
        }
    }, [isDataLoaded, contentOpacity]);

    // Calculate active filter count for badge
    const activeFilterCount = useMemo(() => {
        let count = quickFilters.length;
        if (advancedFilters.minPrice !== undefined || advancedFilters.maxPrice !== undefined) {
            count++;
        }
        if (advancedFilters.minRating !== undefined && advancedFilters.minRating > 0) {
            count++;
        }
        return count;
    }, [quickFilters, advancedFilters]);

    // ========================================
    // HANDLERS
    // ========================================

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleSearchPress = useCallback(() => {
        Navigator.push(searchRoutes.entry({ q: keyword }));
    }, [keyword]);

    const handleFilterPress = useCallback(() => {
        Keyboard.dismiss();
        setIsFilterModalVisible(true);
    }, []);

    const handleSortChange = useCallback((newSort: SearchSortField) => {
        setSortBy(newSort);
    }, []);

    const handleQuickFilterToggle = useCallback((filter: QuickFilterType) => {
        setQuickFilters((prev) =>
            prev.includes(filter)
                ? prev.filter((f) => f !== filter)
                : [...prev, filter]
        );
    }, []);

    const handleApplyAdvancedFilters = useCallback((filters: AdvancedFilters) => {
        setAdvancedFilters(filters);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // ========================================
    // LIST DATA
    // ========================================

    const listData = useMemo((): ListItemType[] => {
        const items: ListItemType[] = [];

        // If empty, show recommendation header + recommended products
        if (isEmpty) {
            items.push({
                type: 'emptyHeader',
                id: 'emptyHeader',
                keyword,
                hasRecommendations: recommendedProducts.length > 0
            });

            recommendedProducts.forEach((product) => {
                items.push({ type: 'product', data: product });
            });
        } else {
            products.forEach((product) => {
                items.push({ type: 'product', data: product });
            });
        }

        return items;
    }, [products, isEmpty, recommendedProducts, keyword]);

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    const renderItem = useCallback(({ item }: ListRenderItemInfo<ListItemType>) => {
        if (item.type === 'emptyHeader') {
            return (
                <View style={styles.emptyHeader}>
                    <Text style={styles.emptyTitle}>
                        {t('empty.subtitle', { keyword: item.keyword })}
                    </Text>
                    {item.hasRecommendations && (
                        <Text style={styles.emptySubtitle}>
                            {t('empty.suggestion')}
                        </Text>
                    )}
                </View>
            );
        }

        return <ProductItem item={item.data} />;
    }, [sortBy, quickFilters, handleSortChange, handleQuickFilterToggle, t]);

    const renderFooter = useCallback(() => {
        if (isFetchingNextPage) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color={theme.colors.buttonActive} />
                </View>
            );
        }
        return null;
    }, [isFetchingNextPage, theme.colors.buttonActive]);

    const keyExtractor = useCallback((item: ListItemType) => {
        if (item.type === 'emptyHeader') return item.id;
        return item.data.id;
    }, []);

    const getItemType = useCallback((item: ListItemType) => item.type, []);

    /**
     * Override item layout: controls section spans full width
     */
    const overrideItemLayout = useCallback((
        layout: { span?: number; size?: number },
        item: ListItemType,
    ) => {
        if (item.type === 'emptyHeader') {
            layout.span = 2;
        }
    }, []);

    // ========================================
    // LOADING STATE
    // ========================================

    // ========================================
    // MAIN RENDER
    // ========================================

    const shouldShowSkeleton = !isDataLoaded;

    return (
        <View style={styles.container}>
            {/* Header & Controls - Static Shell */}
            <SearchResultHeader
                keyword={keyword}
                onSearchPress={handleSearchPress}
                onFilterPress={handleFilterPress}
                onBack={handleBack}
                activeFilterCount={activeFilterCount}
            />
            <View style={styles.controlsWrapper}>
                <SortBar currentSort={sortBy} onSortChange={handleSortChange} />
                <QuickFilters
                    activeFilters={quickFilters}
                    onFilterToggle={handleQuickFilterToggle}
                />
            </View>

            <View style={styles.flex1}>
                {/* Real Content - Fades in */}
                {isDataLoaded && (
                    <Animated.View style={[styles.flex1, contentAnimatedStyle]}>
                        <FlashList<ListItemType>
                            data={listData}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            getItemType={getItemType}
                            overrideItemLayout={overrideItemLayout}
                            numColumns={2}
                            masonry={true}
                            optimizeItemArrangement={true}
                            ListFooterComponent={renderFooter}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            removeClippedSubviews={true}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isFetching && !isFetchingNextPage}
                                    onRefresh={handleRefresh}
                                    tintColor={theme.colors.buttonActive}
                                />
                            }
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: insets.bottom + 16 },
                            ]}
                            showsVerticalScrollIndicator={false}
                        />
                    </Animated.View>
                )}

                {/* Skeleton Overlay - Fades out */}
                {shouldShowSkeleton && (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.duration(300)}
                        style={[StyleSheet.absoluteFill, styles.skeletonOverlay]}
                        pointerEvents="none"
                    >
                        {isEmpty && (
                            <View style={styles.emptyHeader}>
                                <Text style={styles.emptyTitle}>
                                    {t('empty.subtitle', { keyword })}
                                </Text>
                                {(isLoadingRecommended || recommendedProducts.length > 0) && (
                                    <Text style={styles.emptySubtitle}>
                                        {t('empty.suggestion')}
                                    </Text>
                                )}
                            </View>
                        )}
                        {(isLoadingRecommended || recommendedProducts.length > 0) && (
                            <ProductGridSkeleton count={6} animatedStyle={shimmerAnimatedStyle} />
                        )}
                    </Animated.View>
                )}
            </View>

            <SearchFilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                onApply={handleApplyAdvancedFilters}
                initialFilters={advancedFilters}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    skeletonOverlay: {
        backgroundColor: theme.colors.background,
    },
    controlsWrapper: {
        backgroundColor: theme.colors.surface,
    },
    listContent: {
        paddingHorizontal: theme.margins.sm / 2,
    },
    footer: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
    },
    emptyHeader: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.lg,
        backgroundColor: theme.colors.surface,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
    },
}));
