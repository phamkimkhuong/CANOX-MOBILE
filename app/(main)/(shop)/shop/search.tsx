/**
 * ==============================================
 * SHOP SEARCH SCREEN - Search within a Shop
 * ==============================================
 * 
 * Features:
 * - Search products within a specific shop
 * - Filter by category within the shop
 * - Shop-specific empty state (no global recommendations)
 * - Infinite scroll with FlashList
 */

import { ProductGridSkeleton, SortBar } from '@/components/search';
import {
    ShopSearchEmptyState,
    ShopSearchHeader,
    ShopSearchHeaderRef,
} from '@/components/shop';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { productRoutes, shopRoutes } from '@/constants/routes';
import { usePrefetchProductDetail } from '@/hooks/api/product/useProductDetail';
import { useSearchProducts } from '@/hooks/api/search';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import type {
    SearchProductUI,
    SearchSortField
} from '@/types/search-results';
import { Navigator } from '@/utils/navigation';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
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

const NUM_COLUMNS = 2;

// ============================================
// MAIN COMPONENT
// ============================================
export default function ShopSearchScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');

    // Get search params
    const {
        shopId = '',
        categoryId,
        categoryName,
    } = useLocalSearchParams<{
        shopId: string;
        categoryId?: string;
        categoryName?: string;
    }>();

    // Refs
    const headerRef = useRef<ShopSearchHeaderRef>(null);

    // State - Separate input value from search keyword
    const [inputValue, setInputValue] = useState('');      // What user is typing
    const [searchKeyword, setSearchKeyword] = useState(''); // Actual search trigger
    const [sortBy, setSortBy] = useState<SearchSortField>('RELEVANCE');

    // Search products within shop
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
        keyword: searchKeyword.trim(),  // Only changes on submit
        shopId,
        categoryId,
        sortBy,
        enabled: !!shopId,
    });

    // Placeholder for search input
    const placeholder = categoryName
        ? t('shop.searchInCategory', { category: categoryName, defaultValue: `Tìm trong "${categoryName}"` })
        : t('shop.searchPlaceholder', 'Tìm sản phẩm trong shop...');

    // ========================================
    // HANDLERS
    // ========================================

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleTextChange = useCallback((text: string) => {
        setInputValue(text);  // Only update input display, don't trigger search
    }, []);

    const handleSubmit = useCallback((text: string) => {
        Keyboard.dismiss();
        setSearchKeyword(text.trim());  // Trigger API call on submit
    }, []);

    const handleSortChange = useCallback((newSort: SearchSortField) => {
        setSortBy(newSort);
    }, []);


    const handleViewAllProducts = useCallback(() => {
        // Navigate to shop detail products tab
        Navigator.replace(shopRoutes.detail(shopId));
    }, [shopId]);

    // ========================================
    // PRODUCT ITEM HANDLING
    // ========================================
    const prefetchProduct = usePrefetchProductDetail();
    const pressInTimeRefs = useRef<Map<string, number>>(new Map());

    const handleProductPressIn = useCallback((productId: string) => {
        pressInTimeRefs.current.set(productId, Date.now());
        prefetchProduct(productId);
    }, [prefetchProduct]);

    const handleProductPress = useCallback((productId: string) => {
        const pressInTime = pressInTimeRefs.current.get(productId) ?? 0;
        const elapsed = pressInTime ? Date.now() - pressInTime : 0;
        pressInTimeRefs.current.delete(productId);
        const isInstantTap = elapsed > 0 && elapsed < PREFETCH_GRACE_PERIOD_MS;
        Navigator.push(productRoutes.detail(productId, { instantNav: isInstantTap }));
    }, []);

    // ========================================
    // RENDER HELPERS
    // ========================================

    const renderProduct = useCallback(({ item }: ListRenderItemInfo<SearchProductUI>) => (
        <ProductCard
            title={item.title}
            price={item.price}
            image={item.thumbnail}
            originalPrice={item.originalPrice}
            rating={item.rating}
            reviews={item.reviews}
            sold={item.sold}
            discount={item.discountPercentage}
            location={item.location}
            onPress={() => handleProductPress(item.id)}
            onPressIn={() => handleProductPressIn(item.id)}
            route={productRoutes.detail(item.id)}
        />
    ), [handleProductPress, handleProductPressIn]);

    const keyExtractor = useCallback((item: SearchProductUI) => item.id, []);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

    // ========================================
    // RENDER EMPTY STATE
    // ========================================
    const renderEmptyState = useCallback(() => {
        if (isLoading) {
            return <ProductGridSkeleton count={6} />;
        }

        if (isEmpty) {
            return (
                <ShopSearchEmptyState
                    keyword={searchKeyword.trim() || undefined}
                    categoryName={categoryName}
                    onViewAllProducts={handleViewAllProducts}
                    onBack={handleBack}
                />
            );
        }

        return null;
    }, [isLoading, isEmpty, searchKeyword, categoryName, handleViewAllProducts, handleBack]);

    // ========================================
    // LIST FOOTER
    // ========================================
    const renderFooter = useCallback(() => {
        if (isFetchingNextPage) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.footerText}>
                        {t('common.loadingMore', 'Đang tải thêm...')}
                    </Text>
                </View>
            );
        }
        return null;
    }, [isFetchingNextPage, theme.colors.primary, t]);

    // ========================================
    // LIST HEADER (Sort + Filters)
    // ========================================
    const renderListHeader = useCallback(() => {
        if (isEmpty && !isLoading) return null;

        return (
            <View style={styles.listHeader}>
                {/* Sort Bar */}
                <SortBar
                    currentSort={sortBy}
                    onSortChange={handleSortChange}
                />
            </View>
        );
    }, [isEmpty, isLoading, sortBy, handleSortChange]);

    // ========================================
    // MAIN RENDER
    // ========================================
    return (
        <View style={styles.container}>
            {/* Header with Search Input */}
            <ShopSearchHeader
                ref={headerRef}
                value={inputValue}
                onChangeText={handleTextChange}
                onSubmit={handleSubmit}
                onBack={handleBack}
                placeholder={placeholder}
                autoFocus={!categoryName}
            />

            {/* Product List */}
            <FlashList
                data={products}
                renderItem={renderProduct}
                keyExtractor={keyExtractor}
                numColumns={NUM_COLUMNS}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && !isLoading && !isFetchingNextPage}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 16 },
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
    listContent: {
        paddingHorizontal: theme.margins.sm,
    },
    listHeader: {

    },
    footer: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
}));
