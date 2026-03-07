import { IconSymbol } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/product/ProductCardSkeleton';
import { productRoutes } from '@/constants/routes';
import { useInternationalProducts, useRefreshInternationalProducts } from '@/hooks/api/product/useInternationalProducts';
import { useFavoriteSync, useToggleFavorite } from '@/hooks/api/wishlist';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import { MOCK_GLOBAL_BANNERS } from '@/services/api/mocks/globalBanners';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductFeedItem } from '@/types/product/product';
import { Navigator } from '@/utils/navigation';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * Filter Categories for Global Hub Mockup
 */
const GLOBAL_FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'beauty', label: 'Mỹ phẩm Hàn' },
    { id: 'tech', label: 'Điện tử Trung' },
    { id: 'food', label: 'Đồ ăn dặm Nhật' },
    { id: 'fashion', label: 'Thời trang US' },
];

/**
 * Product Item Component
 */
const ProductRowItem = memo(({
    item,
    onFavoritePress,
}: {
    item: ProductFeedItem;
    onFavoritePress?: (variantId: string) => void;
}) => {
    const pressInTimeRef = useRef(0);

    const handlePressIn = useCallback(() => {
        pressInTimeRef.current = Date.now();
        // Prefetch logic can be added here
    }, []);

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
            image={toSizedImageUrl(item.thumbnail, null, 'medium') ?? ''}
            originalPrice={item.originalPrice}
            rating={item.rating}
            reviews={item.reviews}
            sold={item.sold}
            location={item.location || 'Nước ngoài'}
            discount={item.discountPercentage}
            isMall={item.isMall}
            isInternational={true} // Hardcoded true for this specific hub to emphasize it
            onPress={handlePress}
            onPressIn={handlePressIn}
            route={productRoutes.detail(item.id)}
            variantId={item.defaultVariantId}
            onFavoritePress={onFavoritePress}
        />
    );
});

ProductRowItem.displayName = 'ProductRowItem';

/**
 * Main Global Hub Screen
 */
export default function InternationalShippingScreen() {
    useNavigationUnlockOnFocus();
    const { theme } = useUnistyles();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const styles = stylesheet;
    const { t } = useTranslation('home');
    const { top } = useSafeAreaInsets();
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();

    const [activeFilter, setActiveFilter] = useState('all');
    const listRef = useRef<FlashListRef<GlobalHubListItem>>(null);

    // Deferred Rendering for Performance
    const [isReady, setIsReady] = useState(false);
    useFocusEffect(
        useCallback(() => {
            const task = setTimeout(() => setIsReady(true), 50);
            return () => clearTimeout(task);
        }, [])
    );

    // Shimmer sweep animation for Header
    const shimmerX = useSharedValue(-50);
    useEffect(() => {
        shimmerX.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: 0 }),
                withDelay(4000, withTiming(120, { duration: 600 })),
            ),
            -1,
            false,
        );
    }, [shimmerX]);

    const globalShimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: `${shimmerX.value}%` as unknown as number }],
    }));

    // Skeleton shimmer value (Pulse effect for loading)
    const skeletonPulse = useSharedValue(0.3);
    useEffect(() => {
        skeletonPulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    }, [skeletonPulse]);
    const skeletonAnimatedStyle = useAnimatedStyle(() => ({ opacity: skeletonPulse.value }));

    // Data Fetching
    const {
        data,
        isLoading,
        isError,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInternationalProducts();

    // Determine the active daily banner
    const activeDailyBanner = useMemo(() => {
        // Use the current date string (e.g., "Mon Jan 01 2026") as a seed
        const todayStr = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
            hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % MOCK_GLOBAL_BANNERS.length;
        return MOCK_GLOBAL_BANNERS[index];
    }, []);

    // Favorite System Sync
    const { syncFromProducts, resetCheckedIds } = useFavoriteSync();
    const toggleFavoriteMutation = useToggleFavorite();

    useEffect(() => {
        if (data?.pages) {
            const allProducts = data.pages.flatMap(page => page.items);
            syncFromProducts(allProducts);
        }
    }, [data?.pages, syncFromProducts]);

    const handleFavoritePress = useCallback((variantId: string) => {
        const isCurrentlyLiked = !!useWishlistStore.getState().favoritesMap[variantId];
        toggleFavoriteMutation.mutate({ variantId, isCurrentlyLiked });
    }, [toggleFavoriteMutation]);

    // Pull to Refresh
    const { refresh: smartRefresh } = useRefreshInternationalProducts();
    const handleRefresh = useCallback(async () => {
        resetCheckedIds();
        await smartRefresh();
    }, [smartRefresh, resetCheckedIds]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

    const renderHeader = useCallback(() => (
        <View style={styles.headerContainer}>
            {/* Global Hero Banner (Daily Active) */}
            <View style={styles.heroBannerContainer}>
                <View style={[styles.heroBanner, { width: screenWidth }]}>
                    <Image
                        source={{ uri: activeDailyBanner.image }}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="cover"
                    />
                    <View style={styles.heroOverlay}>
                        {/* Glowing Liquid Glass Badge */}
                        <View style={styles.liquidGlassBadgeContainer}>
                            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(79, 70, 229, 0.85)', 'rgba(0, 229, 255, 0.85)']} // Indigo to Cyan
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View style={styles.shimmerMask}>
                                <Animated.View style={[styles.shimmerStrip, globalShimmerStyle]}>
                                    <LinearGradient
                                        colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.shimmerGradient}
                                    />
                                </Animated.View>
                            </View>
                            <View style={styles.liquidGlassBadgeContent}>
                                <IconSymbol name="airplane" size={14} color="#FFF" />
                                <Text style={styles.liquidGlassText}>
                                    {t(activeDailyBanner.badgeTextKey, activeDailyBanner.defaultBadgeText)}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.heroTitle}>
                            {t(activeDailyBanner.titleKey, activeDailyBanner.defaultTitle)}
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            {t(activeDailyBanner.subtitleKey, activeDailyBanner.defaultSubtitle)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Floating Filters (SurfaceBlur) */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
                style={styles.filterContainer}
            >
                {GLOBAL_FILTERS.map(filter => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <TouchableOpacity
                            key={filter.id}
                            activeOpacity={0.7}
                            onPress={() => setActiveFilter(filter.id)}
                            style={[
                                styles.filterChip,
                                isActive && styles.filterChipActive
                            ]}
                        >
                            {!isActive && <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFillObject} />}
                            <Text style={[
                                styles.filterText,
                                isActive && styles.filterTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    ), [activeFilter, styles, globalShimmerStyle, activeDailyBanner, screenWidth, t]);

    type GlobalHubListItem = { type: 'skeleton'; id: string } | { type: 'product'; data: ProductFeedItem };

    const listData = useMemo<GlobalHubListItem[]>(() => {
        if (!isReady || isLoading) {
            return Array.from({ length: 10 }).map((_, i) => ({ type: 'skeleton', id: `skel-${i}` }));
        }
        if (isError) return [];
        const products = data?.pages.flatMap(p => p.items) || [];
        return products.map(p => ({ type: 'product', data: p }));
    }, [data, isLoading, isError, isReady]);

    const renderItem = useCallback(({ item }: ListRenderItemInfo<GlobalHubListItem>) => {
        if (item.type === 'skeleton') {
            return <ProductCardSkeleton animatedStyle={skeletonAnimatedStyle} />;
        }
        if (item.type === 'product') {
            return <ProductRowItem item={item.data} onFavoritePress={isAuthenticated ? handleFavoritePress : undefined} />;
        }
        return null;
    }, [skeletonAnimatedStyle, handleFavoritePress, isAuthenticated]);

    const renderEmpty = useCallback(() => (
        <View style={[styles.emptyContainer, { minHeight: screenHeight * 0.5 }]}>
            <ActivityIndicator size="large" color={theme.colors.buttonActive} />
        </View>
    ), [screenHeight, styles.emptyContainer, theme.colors.buttonActive]);

    const renderFooter = useCallback(() => (
        isFetchingNextPage ? (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.buttonActive} />
            </View>
        ) : null
    ), [isFetchingNextPage, styles.footerLoader, theme.colors.buttonActive]);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            {/* Custom Floating Back Button */}
            <View style={[styles.floatingHeader, { top: Math.max(top, 16) }]}>
                <TouchableOpacity
                    style={styles.floatingBackButton}
                    onPress={() => Navigator.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="chevron-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <FlashList
                ref={listRef}
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => (item.type === 'skeleton' ? item.id : item.data.id)}
                numColumns={2}
                masonry={true}
                optimizeItemArrangement={true}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={isLoading ? renderEmpty : null}
                ListFooterComponent={renderFooter}
                onScrollEndDrag={() => { }}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isLoading}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.buttonActive}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                getItemType={(item) => item.type}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingHorizontal: theme.margins.sm,
        paddingBottom: theme.margins.xl * 2,
    },
    headerContainer: {
        marginBottom: theme.margins.md,
    },
    heroBannerContainer: {
        height: 220,
        marginHorizontal: -theme.margins.sm,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
        backgroundColor: '#1E1E2A',
    },
    heroBanner: {
        height: '100%',
        overflow: 'hidden',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 20, 0.4)',
        padding: theme.margins.lg,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    liquidGlassBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.s,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 6,
        marginBottom: theme.margins.sm,
    },
    liquidGlassBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    liquidGlassText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    shimmerMask: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shimmerStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '40%',
    },
    shimmerGradient: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    filterContainer: {
        marginTop: theme.margins.md,
    },
    filterScroll: {
        paddingHorizontal: theme.margins.sm,
        gap: theme.margins.sm,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.05)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(150, 150, 150, 0.2)',
        overflow: 'hidden',
    },
    filterChipActive: {
        backgroundColor: 'transparent',
        borderColor: '#00E5FF',
        borderWidth: 1,
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    filterTextActive: {
        color: theme.colors.typography,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        padding: theme.margins.lg,
        alignItems: 'center',
    },
    floatingHeader: {
        position: 'absolute',
        left: theme.margins.md,
        zIndex: 100, // Ensure it's above the FlashList and HeroBanner
    },
    floatingBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.45)', // Semi-transparent black for contrast
        justifyContent: 'center',
        alignItems: 'center',
    },
}));
