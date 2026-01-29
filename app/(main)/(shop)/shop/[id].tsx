/**
 * ==============================================
 * SHOP DETAIL SCREEN - [id].tsx (Premium Animated Header)
 * ==============================================
 */

import '@/constants/unistyles';

import {
    ShopBanner,
    ShopCategoriesTab,
    ShopHeaderInfo,
    ShopHeaderSkeleton,
    ShopNavBar,
    ShopProductSkeleton,
    ShopProfileTab,
    ShopTabs,
    ShopVoucherSection,
} from '@/components/shop';
import { IconSymbol } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { chatRoutes, productRoutes, shopSearchRoutes } from '@/constants/routes';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useRefreshShopProducts, useShopCategories, useShopDetail, useShopProducts, useShopVouchers } from '@/hooks/api/useShop';
import { MINIMUM_SKELETON_DURATION_MS } from '@/hooks/usePrefetchTiming';
import { getMockShopProfile } from '@/services/api/mocks/shopProfile';
import { useAuthStore } from '@/store/useAuthStore';
import type { ShopProductFilterParams, ShopProductItemUI, ShopProfileUI, ShopTabType } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    StatusBar,
    Text,
    View,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const NUM_COLUMNS = 2;
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

/**
 * Flattened list item type for mixed content rendering
 */
type FlatListItem =
    | { type: 'header' }
    | { type: 'voucher-section' }
    | { type: 'tab-spacer' }
    | { type: 'profile-content' }
    | { type: 'categories-content' }
    | { type: 'product'; data: ShopProductItemUI };

const ListFooterComponent: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const { theme } = useUnistyles();
    if (!isLoading) return null;
    return (
        <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={theme.colors.buttonActive} />
            <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
    );
};

export default function ShopDetailScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { id: shopId, instantNav } = useLocalSearchParams<{ id: string; instantNav?: string }>();

    // Instant Nav: If true, enforce minimum skeleton duration to avoid flash
    const isInstantNav = instantNav === 'true';

    const [activeTab, setActiveTab] = useState<ShopTabType>('home');
    const [filters] = useState<ShopProductFilterParams>({ size: 20 });
    const [statusBarStyle, setStatusBarStyle] = useState<'light-content' | 'dark-content'>('light-content');
    const scrollY = useSharedValue(0);

    // Mock profile data - will be replaced with API call
    const [shopProfile, setShopProfile] = useState<ShopProfileUI | null>(null);

    const HEADER_HEIGHT = 56 + insets.top;
    const STATUS_BAR_THRESHOLD = 100; // Switch at this scroll position

    // Animate StatusBar style based on scroll position
    useAnimatedReaction(
        () => scrollY.value,
        (currentScrollY: number, previousScrollY: number | null) => {
            const shouldBeDark = currentScrollY > STATUS_BAR_THRESHOLD;
            const wasDark = (previousScrollY ?? 0) > STATUS_BAR_THRESHOLD;

            // Only trigger update when crossing threshold
            if (shouldBeDark !== wasDark) {
                runOnJS(setStatusBarStyle)(shouldBeDark ? 'dark-content' : 'light-content');
            }
        },
        [STATUS_BAR_THRESHOLD]
    );

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { data: shop, isLoading: isLoadingShop, isError: isShopError, refetch: refetchShop } = useShopDetail(shopId);
    const { data: productsData, isLoading: isLoadingProducts, isRefetching: isRefetchingProducts, isFetchingNextPage, hasNextPage, fetchNextPage } = useShopProducts(shopId, filters);
    const { data: vouchers = [], isLoading: isLoadingVouchers } = useShopVouchers(shopId);
    const { data: categories = [], isLoading: isLoadingCategories } = useShopCategories(shopId);

    // Minimum skeleton duration for instant nav (prevents flash)
    const [minSkeletonComplete, setMinSkeletonComplete] = useState(!isInstantNav);

    React.useEffect(() => {
        if (!isInstantNav) {
            setMinSkeletonComplete(true);
            return;
        }
        // Minimum skeleton duration for instant tap navigation (prevents flash)
        const timer = setTimeout(() => setMinSkeletonComplete(true), MINIMUM_SKELETON_DURATION_MS);
        return () => clearTimeout(timer);
    }, [isInstantNav]);

    // Show skeleton if: loading OR (instant nav AND minimum duration not complete)
    const shouldShowSkeleton = isLoadingShop || (isInstantNav && !minSkeletonComplete);

    // Load mock profile data when shop is loaded
    React.useEffect(() => {
        if (shop?.id) {
            const profile = getMockShopProfile(shop.id);
            setShopProfile(profile);
        }
    }, [shop?.id]);

    // Smart refresh for products infinite query
    const { refresh: smartRefreshProducts } = useRefreshShopProducts(shopId, filters);

    // Auth info for chat validation
    const myShopId = useAuthStore((s) => s.shopId);

    // Prefetch hook for ghost loading
    const prefetchShopChat = usePrefetchShopChat();

    const products = useMemo(() => productsData?.pages.flatMap(page => page.items) ?? [], [productsData]);
    const totalProductCount = productsData?.pages[0]?.totalElements ?? 0;

    // Build list data with voucher section between header and tabs
    const hasVouchers = vouchers.length > 0 || isLoadingVouchers;

    const listData = useMemo((): FlatListItem[] => {
        const baseItems: FlatListItem[] = [{ type: 'header' }];

        baseItems.push({ type: 'tab-spacer' });

        // Home tab: show profile content ONLY
        if (activeTab === 'home') {
            baseItems.push({ type: 'profile-content' });
            return baseItems;
        }

        // Products tab: show voucher section THEN product grid
        if (activeTab === 'products') {
            const productItems: FlatListItem[] = products.map(product => ({ type: 'product' as const, data: product }));

            // Insert voucher section at the beginning of product list if has vouchers
            if (hasVouchers) {
                return [...baseItems, { type: 'voucher-section' }, ...productItems];
            }

            return [...baseItems, ...productItems];
        }

        // Categories tab
        if (activeTab === 'categories') {
            baseItems.push({ type: 'categories-content' });
            return baseItems;
        }

        return baseItems;
    }, [activeTab, products, hasVouchers]);

    // Sticky header index: tabs are always at index 1 now (Header is 0)
    const stickyHeaderIndices = useMemo(() => [1], []);

    const handleBackPress = useCallback(() => Navigator.back(), []);
    const handleSearchPress = useCallback(() => { }, []);
    const handleMorePress = useCallback(() => { }, []);
    const handleTabChange = useCallback((tab: ShopTabType) => setActiveTab(tab), []);

    /**
     * Prefetch chat - triggered on press in (ghost loading)
     * Reused from Product Detail pattern
     */
    const handlePrefetchChat = useCallback(() => {
        if (!shop || !shop.userId || shop.userId === myShopId) return;
        prefetchShopChat(shop.userId, shop.name, shop.logoUrl, shop.id);
    }, [shop, myShopId, prefetchShopChat]);

    /**
     * Handle Chat with Shop - Pure 0ms Navigation
     * Reused from Product Detail pattern
     */
    const handleChatPress = useCallback(() => {
        if (!shop || !shop.userId) return;

        // Prevent chatting with own shop
        if (shop.id === myShopId) {
            Toast.show({
                type: 'info',
                text1: CHAT_STRINGS.error.chatWithSelf,
                text2: 'Bạn đang ở trong shop của chính mình',
            });
            return;
        }

        // Use Cache (if done), otherwise use Ghost ID (instant, no await)
        const cachedId = getCachedConversationId(shop.userId);

        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shop.userId}`, {
            partnerName: shop.name,
            partnerAvatar: shop.logoUrl,
            shopUserId: shop.userId,
            shopId: shop.id,
        }));
    }, [shop, myShopId]);

    const handleFollowPress = useCallback(() => { }, []);
    const handleProductPress = useCallback((product: ShopProductItemUI) => Navigator.push(productRoutes.detail(product.id)), []);
    const handleCategoryPress = useCallback((category: any) => {
        Navigator.push(shopSearchRoutes.search({
            shopId,
            categoryId: category.id,
            categoryName: category.name,
        }));
    }, [shopId]);

    const handleLoadMore = useCallback(() => hasNextPage && !isFetchingNextPage && activeTab === 'products' && fetchNextPage(), [hasNextPage, isFetchingNextPage, activeTab, fetchNextPage]);
    const handleRefresh = useCallback(() => { refetchShop(); smartRefreshProducts(); }, [refetchShop, smartRefreshProducts]);

    /** Collect voucher handler */
    const handleCollectVoucher = useCallback((_voucherId: string) => {
        // TODO: Implement collect voucher API
        Toast.show({
            type: 'success',
            text1: 'Đã lưu voucher',
            text2: 'Voucher đã được thêm vào kho của bạn',
        });
    }, []);

    const renderItem: ListRenderItem<FlatListItem> = useCallback(({ item }) => {
        switch (item.type) {
            case 'header':
                if (shouldShowSkeleton) return <ShopHeaderSkeleton />;
                if (!shop) return null;
                return (
                    <View style={styles.fullWidthItem}>
                        <ShopBanner bannerUrl={shop.bannerUrl} logoUrl={shop.logoUrl} />
                        <ShopHeaderInfo
                            shop={shop}
                            onChatPress={handleChatPress}
                            onPrefetchChat={handlePrefetchChat}
                            onFollowPress={handleFollowPress}
                            hasVouchers={hasVouchers}
                        />
                    </View>
                );
            case 'voucher-section':
                return (
                    <ShopVoucherSection
                        vouchers={vouchers}
                        shopName={shop?.name}
                        isLoading={isLoadingVouchers && shouldShowSkeleton}
                        onCollectVoucher={handleCollectVoucher}
                    />
                );
            case 'tab-spacer':
                return (
                    <View style={styles.tabsWrapper}>
                        <ShopTabs activeTab={activeTab} onTabChange={handleTabChange} productCount={totalProductCount} />
                    </View>
                );
            case 'profile-content':
                if (!shop) return null;
                return (
                    <View style={styles.fullWidthItem}>
                        <ShopProfileTab
                            shop={shop}
                            profile={shopProfile}
                            products={products}
                        />
                    </View>
                );
            case 'categories-content':
                return (
                    <View style={styles.fullWidthItem}>
                        <ShopCategoriesTab
                            categories={categories}
                            isLoading={isLoadingCategories}
                            onCategoryPress={handleCategoryPress}
                        />
                    </View>
                );
            case 'product': {
                const product = item.data;
                return (
                    <View style={styles.productItemWrapper}>
                        <ProductCard
                            title={product.title}
                            price={product.price}
                            image={product.thumbnail}
                            originalPrice={product.originalPrice}
                            rating={product.rating}
                            reviews={product.reviews}
                            sold={product.sold}
                            discount={product.discountPercentage}
                            isMall={product.isMall}
                            location={product.location}
                            onPress={() => handleProductPress(product)}
                            route={productRoutes.detail(product.id)}
                        />
                    </View>
                );
            }
            default: return null;
        }
    }, [shouldShowSkeleton, shop, shopProfile, activeTab, totalProductCount, vouchers, isLoadingVouchers, hasVouchers, handleChatPress, handleFollowPress, handleTabChange, handleCollectVoucher, handlePrefetchChat, handleProductPress]);

    if (isShopError) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <ShopNavBar scrollY={scrollY} onBackPress={handleBackPress} onSearchPress={handleSearchPress} onMorePress={handleMorePress} />
                <View style={styles.errorContainer}>
                    <IconSymbol name="error" size={64} color={theme.colors.error} />
                    <Text style={styles.errorText}>Cửa hàng không tồn tại hoặc đã bị xóa</Text>
                    <Pressable onPress={() => Navigator.back()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Quay lại</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle={statusBarStyle} />
            <Stack.Screen options={{ headerShown: false }} />

            <ShopNavBar scrollY={scrollY} onBackPress={handleBackPress} onSearchPress={handleSearchPress} onMorePress={handleMorePress} />

            <AnimatedFlashList
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={listData as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                renderItem={renderItem as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                keyExtractor={(item: any, index: number) => item.type === 'product' ? `product-${item.data.id}` : `item-${item.type}-${index}`}
                stickyHeaderIndices={stickyHeaderIndices}
                numColumns={NUM_COLUMNS}
                masonry
                optimizeItemArrangement
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                overrideItemLayout={(layout: any, item: any) => {
                    layout.span = (item.type === 'header' || item.type === 'voucher-section' || item.type === 'tab-spacer' || item.type === 'profile-content' || item.type === 'categories-content') ? NUM_COLUMNS : 1;
                }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListFooterComponent={<ListFooterComponent isLoading={isFetchingNextPage} />}
                refreshControl={<RefreshControl refreshing={isRefetchingProducts && !isLoadingProducts} onRefresh={handleRefresh} tintColor={theme.colors.buttonActive} colors={[theme.colors.buttonActive]} progressViewOffset={HEADER_HEIGHT} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={!isLoadingProducts && products.length === 0 ? <ShopProductSkeleton count={6} /> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },

    fullWidthItem: {
        marginHorizontal: -theme.margins.sm,
    },
    tabsWrapper: {
        marginHorizontal: -theme.margins.sm,
        backgroundColor: theme.colors.surface,
        zIndex: 10,
    },
    productItemWrapper: {
        flex: 1,
        paddingBottom: 4
    },
    listContent: {
        paddingHorizontal: theme.margins.sm,
        paddingBottom: theme.margins.xxl
    },
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.lg,
        gap: theme.margins.sm
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.typographySecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
}));
