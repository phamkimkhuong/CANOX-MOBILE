/**
 * ==============================================
 * SHOP DETAIL SCREEN - [id].tsx
 * ==============================================
 * 
 * Features:
 * 1. Shop Banner with blur fallback (when bannerUrl is null)
 * 2. Shop Header Info (avatar, name, stats, actions)
 * 3. Sticky Tabs (Products / Profile / Categories)
 * 4. Product Grid with 2-column FlashList
 * 5. Infinite scroll pagination
 * 
 * Architecture:
 * - FlashList with ListHeaderComponent for banner + header
 * - stickyHeaderIndices for sticky tabs
 * - numColumns={2} for product grid
 * 
 * Data Flow:
 * - useShopDetail() → ShopHeaderUI → Banner + HeaderInfo
 * - useShopProducts() → ShopProductItemUI[] → Grid items
 */

import '@/constants/unistyles';

import {
    ShopBanner,
    ShopEmptyState,
    ShopHeaderInfo,
    ShopHeaderSkeleton,
    ShopProductItem,
    ShopProductSkeleton,
    ShopTabs
} from '@/components/shop';
import { IconSymbol } from '@/components/ui/Icon';
import { chatRoutes, productRoutes } from '@/constants/routes';
import { useShopDetail, useShopProducts } from '@/hooks/api/useShop';
import type { ShopProductFilterParams, ShopProductItemUI, ShopTabType } from '@/types/shop';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const NUM_COLUMNS = 2;
const GRID_GAP = 8;

/** 
 * Flattened list item type for mixed content rendering
 * - header: Banner + HeaderInfo + Tabs
 * - product: Product grid item
 */
type FlatListItem =
    | { type: 'header' }
    | { type: 'tab-spacer' }  // Sticky tabs spacer
    | { type: 'product'; data: ShopProductItemUI };

/**
 * Transparent Header - floats over banner
 */
const ShopScreenHeader: React.FC<{
    shopName?: string;
    onBackPress: () => void;
    onSearchPress: () => void;
    onMorePress: () => void;
}> = ({ shopName, onBackPress, onSearchPress, onMorePress }) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <Pressable
                    onPress={onBackPress}
                    style={styles.headerIconBtn}
                    hitSlop={10}
                >
                    <View style={styles.headerIconBg}>
                        <IconSymbol name="arrow-back" size={22} color={theme.colors.surface} />
                    </View>
                </Pressable>

                <Pressable
                    onPress={onSearchPress}
                    style={styles.searchBar}
                >
                    <IconSymbol name="search" size={18} color={theme.colors.surface} />
                    <Text style={styles.searchText}>Tìm kiếm trong Shop</Text>
                </Pressable>

                <View style={styles.headerActions}>
                    <Pressable
                        onPress={onMorePress}
                        style={styles.headerIconBtn}
                        hitSlop={10}
                    >
                        <View style={styles.headerIconBg}>
                            <IconSymbol name="more-vert" size={22} color={theme.colors.surface} />
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

/**
 * List Footer - loading indicator for pagination
 */
const ListFooterComponent: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const { theme } = useUnistyles();

    if (!isLoading) return null;

    return (
        <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ShopDetailScreen() {
    const { theme } = useUnistyles();
    const router = useRouter();
    const { id: shopId } = useLocalSearchParams<{ id: string }>();

    // ==========================================
    // STATE
    // ==========================================
    const [activeTab, setActiveTab] = useState<ShopTabType>('products');
    const [filters, setFilters] = useState<ShopProductFilterParams>({
        size: 20,
    });

    // ==========================================
    // QUERIES
    // ==========================================
    const {
        data: shop,
        isLoading: isLoadingShop,
        isError: isShopError,
        refetch: refetchShop,
    } = useShopDetail(shopId);

    const {
        data: productsData,
        isLoading: isLoadingProducts,
        isRefetching: isRefetchingProducts,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch: refetchProducts,
    } = useShopProducts(shopId, filters);

    // ==========================================
    // DERIVED DATA
    // ==========================================

    // Flatten product pages for FlashList
    const products = useMemo(() =>
        productsData?.pages.flatMap(page => page.items) ?? [],
        [productsData]);

    // Total product count from API
    const totalProductCount = productsData?.pages[0]?.totalElements ?? 0;

    // Build flattened list data with header
    const listData = useMemo((): FlatListItem[] => {
        // Only show products tab content for now
        if (activeTab !== 'products') {
            return [
                { type: 'header' },
                { type: 'tab-spacer' },
            ];
        }

        const productItems: FlatListItem[] = products.map(product => ({
            type: 'product' as const,
            data: product,
        }));

        return [
            { type: 'header' },
            { type: 'tab-spacer' },
            ...productItems,
        ];
    }, [activeTab, products]);

    // Calculate sticky header index (tabs should stick after header)
    const stickyHeaderIndices = useMemo(() => [1], []); // tab-spacer at index 1

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleBackPress = useCallback(() => {
        router.back();
    }, [router]);

    const handleSearchPress = useCallback(() => {
        // TODO: Navigate to search with shop context
        // router.push({ pathname: '/search', params: { shopId } });
    }, []);

    const handleMorePress = useCallback(() => {
        // TODO: Show action sheet with Share, Report options
    }, []);

    const handleTabChange = useCallback((tab: ShopTabType) => {
        setActiveTab(tab);
    }, []);

    const handleChatPress = useCallback(() => {
        if (!shop) return;
        router.push(chatRoutes.detail(shop.id));
    }, [router, shop]);

    const handleFollowPress = useCallback(() => {
        // TODO: Implement follow/unfollow mutation
    }, []);

    const handleProductPress = useCallback((product: ShopProductItemUI) => {
        router.push(productRoutes.detail(product.id));
    }, [router]);

    const handleAddToCart = useCallback((productId: string) => {
        // TODO: Implement add to cart
        // For products with variants, navigate to product detail
        router.push(productRoutes.detail(productId));
    }, [router]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && activeTab === 'products') {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, activeTab, fetchNextPage]);

    const handleRefresh = useCallback(() => {
        refetchShop();
        refetchProducts();
    }, [refetchShop, refetchProducts]);

    // ==========================================
    // RENDER FUNCTIONS
    // ==========================================

    const renderItem: ListRenderItem<FlatListItem> = useCallback(({ item, index }) => {
        switch (item.type) {
            case 'header':
                // Shop Banner + Header Info
                if (isLoadingShop) {
                    return <ShopHeaderSkeleton />;
                }

                if (!shop) {
                    return null;
                }

                return (
                    <View>
                        <ShopBanner
                            bannerUrl={shop.bannerUrl}
                            logoUrl={shop.logoUrl}
                        />
                        <ShopHeaderInfo
                            shop={shop}
                            onChatPress={handleChatPress}
                            onFollowPress={handleFollowPress}
                        />
                    </View>
                );

            case 'tab-spacer':
                // Sticky Tabs
                return (
                    <View style={styles.tabsWrapper}>
                        <ShopTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            productCount={totalProductCount}
                        />
                    </View>
                );

            case 'product':
                // Product Grid Item
                return (
                    <View style={styles.productItemWrapper}>
                        <ShopProductItem
                            product={item.data}
                            onAddToCart={() => handleAddToCart(item.data.id)}
                            gap={GRID_GAP}
                        />
                    </View>
                );

            default:
                return null;
        }
    }, [
        isLoadingShop,
        shop,
        activeTab,
        totalProductCount,
        handleChatPress,
        handleFollowPress,
        handleTabChange,
        handleProductPress,
        handleAddToCart,
    ]);

    const keyExtractor = useCallback((item: FlatListItem, index: number) => {
        switch (item.type) {
            case 'header':
                return 'shop-header';
            case 'tab-spacer':
                return 'tab-spacer';
            case 'product':
                return `product-${item.data.id}`;
            default:
                return `item-${index}`;
        }
    }, []);

    const getItemType = useCallback((item: FlatListItem) => item.type, []);

    const renderEmptyProducts = useCallback(() => {
        if (isLoadingProducts) {
            return <ShopProductSkeleton count={6} />;
        }

        if (activeTab !== 'products') {
            return (
                <ShopEmptyState
                    type="no-products"
                    message={activeTab === 'profile' ? 'Hồ sơ shop' : 'Danh mục'}
                    subMessage="Tính năng đang phát triển"
                />
            );
        }

        return <ShopEmptyState type="no-products" />;
    }, [isLoadingProducts, activeTab]);

    // ==========================================
    // LOADING / ERROR STATES
    // ==========================================

    // Full screen error state
    if (isShopError) {
        return (
            <View style={styles.errorContainer}>
                <IconSymbol name="error" size={64} color={theme.colors.error} />
                <Text style={styles.errorTitle}>Không thể tải thông tin shop</Text>
                <Pressable
                    onPress={() => refetchShop()}
                    style={styles.retryButton}
                >
                    <Text style={styles.retryText}>Thử lại</Text>
                </Pressable>
            </View>
        );
    }

    // ==========================================
    // MAIN RENDER
    // ==========================================

    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            {/* Configure navigation header to be hidden */}
            <Stack.Screen options={{ headerShown: false }} />

            {/* Floating Header - always on top */}
            <ShopScreenHeader
                shopName={shop?.name}
                onBackPress={handleBackPress}
                onSearchPress={handleSearchPress}
                onMorePress={handleMorePress}
            />

            {/* Main Content - FlashList */}
            <FlashList<FlatListItem>
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                stickyHeaderIndices={stickyHeaderIndices}
                numColumns={NUM_COLUMNS}
                overrideItemLayout={useCallback((layout: any, item: FlatListItem) => {
                    if (item.type === 'header' || item.type === 'tab-spacer') {
                        layout.span = NUM_COLUMNS;
                    } else {
                        layout.span = 1;
                    }
                }, [])}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={products.length === 0 && !isLoadingProducts ? renderEmptyProducts : null}
                ListFooterComponent={
                    <ListFooterComponent isLoading={isFetchingNextPage} />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetchingProducts && !isLoadingProducts}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                        // Pull from under the floating header
                        progressViewOffset={Platform.OS === 'android' ? 100 : 0}
                    />
                }
                contentContainerStyle={styles.listContent}
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

    // Floating Header
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        height: 60,
        gap: theme.margins.sm,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        height: 36,
        borderRadius: 18,
        paddingHorizontal: theme.margins.smd,
        gap: 4,
    },
    searchText: {
        fontSize: 14,
        color: theme.colors.surface,
        opacity: 0.8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconBtn: {
        // Touch area handled by hitSlop
    },
    headerIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Tabs Wrapper
    tabsWrapper: {
        backgroundColor: theme.colors.surface,
        // Full width for sticky behavior
    },

    // Product Grid
    productItemWrapper: {
        width: '100%',
        paddingHorizontal: 4,
        paddingBottom: 8,
    },

    // List
    listContent: {
        paddingBottom: theme.margins.xxl,
    },

    // Loading Footer
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.lg,
        gap: theme.margins.sm,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    // Error State
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.margins.lg,
        backgroundColor: theme.colors.background,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: theme.margins.md,
        marginBottom: theme.margins.lg,
    },
    retryButton: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
    },
    retryText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.surface,
    },
}));
