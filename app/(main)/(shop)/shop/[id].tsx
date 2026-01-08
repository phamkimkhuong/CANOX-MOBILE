/**
 * ==============================================
 * SHOP DETAIL SCREEN - [id].tsx (Premium Animated Header)
 * ==============================================
 */

import '@/constants/unistyles';

import {
    ShopBanner,
    ShopHeaderInfo,
    ShopHeaderSkeleton,
    ShopProductSkeleton,
    ShopTabs
} from '@/components/shop';
import { IconSymbol } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { chatRoutes, productRoutes } from '@/constants/routes';
import { useShopDetail, useShopProducts } from '@/hooks/api/useShop';
import type { ShopProductFilterParams, ShopProductItemUI, ShopTabType } from '@/types/shop';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const NUM_COLUMNS = 2;
const GRID_GAP = 8;
const AnimatedFlashList = Animated.createAnimatedComponent<any>(FlashList);

/** 
 * Flattened list item type for mixed content rendering
 */
type FlatListItem =
    | { type: 'header' }
    | { type: 'tab-spacer' }
    | { type: 'product'; data: ShopProductItemUI };

interface ShopScreenHeaderProps {
    onBackPress: () => void;
    onSearchPress: () => void;
    onMorePress: () => void;
    scrollY: SharedValue<number>;
}

/**
 * Shop Screen Header - Animated Transition (Match ProductNavBar style)
 */
const ShopScreenHeader: React.FC<ShopScreenHeaderProps> = ({
    onBackPress,
    onSearchPress,
    onMorePress,
    scrollY
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();

    const SCROLL_THRESHOLD = 120;

    const animatedHeaderStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['transparent', theme.colors.surface]
        );
        const borderBottomColor = interpolateColor(
            scrollY.value,
            [SCROLL_THRESHOLD - 10, SCROLL_THRESHOLD],
            ['transparent', theme.colors.border]
        );
        return {
            backgroundColor,
            borderBottomColor,
            borderBottomWidth: 1,
        };
    });

    const animatedSearchStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['rgba(255, 255, 255, 0.4)', theme.colors.background]
        );
        return { backgroundColor };
    });

    const animatedContentStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['#FFFFFF', theme.colors.typography]
        );
        return { color };
    });

    const animatedPlaceholderStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['rgba(255, 255, 255, 0.8)', theme.colors.typographySecondary]
        );
        return { color };
    });

    const animatedIconBgStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, SCROLL_THRESHOLD / 2],
            [1, 0],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    return (
        <Animated.View style={[styles.floatingHeader, { paddingTop: insets.top }, animatedHeaderStyle]}>
            <View style={styles.headerContent}>
                <Pressable onPress={onBackPress} style={styles.headerActionBtn}>
                    <View style={styles.iconContainer}>
                        <Animated.View style={[styles.headerIconBg, animatedIconBgStyle]} />
                        <IconSymbol name="arrow-back" size={24} color="#FFF" animatedStyle={animatedContentStyle as any} />
                    </View>
                </Pressable>

                <Pressable onPress={onSearchPress} style={{ flex: 1 }}>
                    <Animated.View style={[styles.searchBar, animatedSearchStyle]}>
                        <IconSymbol name="search" size={18} color="#FFF" animatedStyle={animatedPlaceholderStyle as any} />
                        <Animated.Text style={[styles.searchText, animatedPlaceholderStyle]}>
                            Tìm trong Shop
                        </Animated.Text>
                    </Animated.View>
                </Pressable>

                <View style={styles.headerRightActions}>
                    <Pressable onPress={onMorePress} style={styles.headerActionBtn}>
                        <View style={styles.iconContainer}>
                            <Animated.View style={[styles.headerIconBg, animatedIconBgStyle]} />
                            <IconSymbol name="more-vert" size={24} color="#FFF" animatedStyle={animatedContentStyle as any} />
                        </View>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
};

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

export default function ShopDetailScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id: shopId } = useLocalSearchParams<{ id: string }>();

    const [activeTab, setActiveTab] = useState<ShopTabType>('products');
    const [filters, setFilters] = useState<ShopProductFilterParams>({ size: 20 });
    const scrollY = useSharedValue(0);

    const HEADER_HEIGHT = 56 + insets.top;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { data: shop, isLoading: isLoadingShop, isError: isShopError, refetch: refetchShop } = useShopDetail(shopId);
    const { data: productsData, isLoading: isLoadingProducts, isRefetching: isRefetchingProducts, isFetchingNextPage, hasNextPage, fetchNextPage, refetch: refetchProducts } = useShopProducts(shopId, filters);

    const products = useMemo(() => productsData?.pages.flatMap(page => page.items) ?? [], [productsData]);
    const totalProductCount = productsData?.pages[0]?.totalElements ?? 0;

    const listData = useMemo((): FlatListItem[] => {
        if (activeTab !== 'products') return [{ type: 'header' }, { type: 'tab-spacer' }];
        const productItems: FlatListItem[] = products.map(product => ({ type: 'product' as const, data: product }));
        return [{ type: 'header' }, { type: 'tab-spacer' }, ...productItems];
    }, [activeTab, products]);

    const stickyHeaderIndices = useMemo(() => [1], []);

    const handleBackPress = useCallback(() => router.back(), [router]);
    const handleSearchPress = useCallback(() => { }, []);
    const handleMorePress = useCallback(() => { }, []);
    const handleTabChange = useCallback((tab: ShopTabType) => setActiveTab(tab), []);
    const handleChatPress = useCallback(() => shop && router.push(chatRoutes.detail(shop.id)), [router, shop]);
    const handleFollowPress = useCallback(() => { }, []);
    const handleProductPress = useCallback((product: ShopProductItemUI) => router.push(productRoutes.detail(product.id)), [router]);
    const handleLoadMore = useCallback(() => hasNextPage && !isFetchingNextPage && activeTab === 'products' && fetchNextPage(), [hasNextPage, isFetchingNextPage, activeTab, fetchNextPage]);
    const handleRefresh = useCallback(() => { refetchShop(); refetchProducts(); }, [refetchShop, refetchProducts]);

    const renderItem: ListRenderItem<FlatListItem> = useCallback(({ item, index }) => {
        switch (item.type) {
            case 'header':
                if (isLoadingShop) return <ShopHeaderSkeleton />;
                if (!shop) return null;
                return (
                    <View>
                        <ShopBanner bannerUrl={shop.bannerUrl} logoUrl={shop.logoUrl} />
                        <ShopHeaderInfo
                            shop={shop}
                            onChatPress={handleChatPress}
                            onFollowPress={handleFollowPress}
                        />
                    </View>
                );
            case 'tab-spacer':
                return (
                    <View style={styles.tabsWrapper}>
                        <ShopTabs activeTab={activeTab} onTabChange={handleTabChange} productCount={totalProductCount} />
                    </View>
                );
            case 'product':
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
                            location={product.shopName}
                            onPress={() => handleProductPress(product)}
                            route={productRoutes.detail(product.id)}
                        />
                    </View>
                );
            default: return null;
        }
    }, [isLoadingShop, shop, activeTab, totalProductCount, handleChatPress, handleFollowPress, handleTabChange, theme, HEADER_HEIGHT]);

    if (isShopError) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <ShopScreenHeader onBackPress={handleBackPress} onSearchPress={handleSearchPress} onMorePress={handleMorePress} scrollY={scrollY} />
                <View style={styles.errorContainer}>
                    <IconSymbol name="error" size={64} color={theme.colors.error} />
                    <Text style={styles.errorText}>Cửa hàng không tồn tại hoặc đã bị xóa</Text>
                    <Pressable onPress={() => router.back()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Quay lại</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <ShopScreenHeader onBackPress={handleBackPress} onSearchPress={handleSearchPress} onMorePress={handleMorePress} scrollY={scrollY} />

            <AnimatedFlashList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item: any, index: number) => item.type === 'product' ? `product-${item.data.id}` : `item-${item.type}-${index}`}
                stickyHeaderIndices={stickyHeaderIndices}
                numColumns={NUM_COLUMNS}
                overrideItemLayout={(layout: any, item: FlatListItem) => {
                    layout.span = (item.type === 'header' || item.type === 'tab-spacer') ? NUM_COLUMNS : 1;
                }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListFooterComponent={<ListFooterComponent isLoading={isFetchingNextPage} />}
                refreshControl={<RefreshControl refreshing={isRefetchingProducts && !isLoadingProducts} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} progressViewOffset={HEADER_HEIGHT} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={!isLoadingProducts && products.length === 0 ? <ShopProductSkeleton count={6} /> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },

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
        height: 56,
        gap: theme.margins.sm
    },
    headerActionBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 38,
        borderRadius: 20,
        paddingHorizontal: theme.margins.smd,
        gap: 8,
    },
    searchText: {
        fontSize: 14,
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    tabsWrapper: {
        backgroundColor: theme.colors.surface,
        zIndex: 10,
    },
    productItemWrapper: {
        width: '100%',
        paddingBottom: 4
    },
    listContent: {
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
