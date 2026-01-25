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
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Keyboard,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type ListItemType =
    | { type: 'controls'; id: string }
    | { type: 'emptyHeader'; id: string; keyword: string }
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
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');

    // Get search params from URL
    const params = useLocalSearchParams<{ q?: string }>();
    const keyword = params.q ?? '';

    // Search state
    const [sortBy, setSortBy] = useState<SearchSortField>('RELEVANCE');
    const [quickFilters, setQuickFilters] = useState<QuickFilterType[]>([]);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Search query
    const {
        products,
        totalCount,
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

    // Calculate active filter count for badge
    const activeFilterCount = useMemo(() => {
        let count = quickFilters.length;
        if (advancedFilters.minPrice !== undefined) count++;
        if (advancedFilters.maxPrice !== undefined) count++;
        if (advancedFilters.minRating !== undefined) count++;
        return count;
    }, [quickFilters, advancedFilters]);

    // ========================================
    // HANDLERS
    // ========================================

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleSearchPress = useCallback(() => {
        // Navigate back to search entry to edit keyword
        Navigator.push(searchRoutes.entry());
    }, []);

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

    const handleClearFilters = useCallback(() => {
        setQuickFilters([]);
        setAdvancedFilters({});
    }, []);

    const handleTryAgain = useCallback(() => {
        Navigator.push(searchRoutes.entry());
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
        const items: ListItemType[] = [
            { type: 'controls', id: 'controls' },
        ];

        // If empty, show recommendation header + recommended products
        if (isEmpty && recommendedProducts.length > 0) {
            items.push({ type: 'emptyHeader', id: 'emptyHeader', keyword });
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
        if (item.type === 'controls') {
            return (
                <View style={styles.controlsWrapper}>
                    <SortBar currentSort={sortBy} onSortChange={handleSortChange} />
                    <QuickFilters
                        activeFilters={quickFilters}
                        onFilterToggle={handleQuickFilterToggle}
                    />
                </View>
            );
        }

        if (item.type === 'emptyHeader') {
            return (
                <View style={styles.emptyHeader}>
                    <Text style={styles.emptyTitle}>
                        {t('empty.subtitle', { keyword: item.keyword })}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {t('empty.suggestion')}
                    </Text>
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
    }, [isFetchingNextPage, theme.colors.primary]);

    const keyExtractor = useCallback((item: ListItemType) => {
        if (item.type === 'controls') return item.id;
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
        if (item.type === 'controls' || item.type === 'emptyHeader') {
            layout.span = 2;
        }
    }, []);

    // ========================================
    // LOADING STATE
    // ========================================

    if (isLoading && products.length === 0) {
        return (
            <View style={styles.container}>
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
                <ProductGridSkeleton count={6} />
            </View>
        );
    }

    // Show skeleton when loading recommended products for empty state
    if (isEmpty && isLoadingRecommended) {
        return (
            <View style={styles.container}>
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
                <View style={styles.emptyHeader}>
                    <Text style={styles.emptyTitle}>
                        {t('empty.subtitle', { keyword })}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {t('empty.suggestion')}
                    </Text>
                </View>
                <ProductGridSkeleton count={6} />
            </View>
        );
    }

    // ========================================
    // MAIN RENDER
    // ========================================

    return (
        <View style={styles.container}>
            <SearchResultHeader
                keyword={keyword}
                onSearchPress={handleSearchPress}
                onFilterPress={handleFilterPress}
                onBack={handleBack}
                activeFilterCount={activeFilterCount}
            />

            <FlashList
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
