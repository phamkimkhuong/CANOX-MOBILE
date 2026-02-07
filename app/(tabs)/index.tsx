import { MarketingHeader } from '@/components/home/MarketingHeader';
import { ProductTabs } from '@/components/home/ProductTabs';
import { HomeHeader } from '@/components/home/SearchHomeHeader';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/product/ProductCardSkeleton';
import { productRoutes } from '@/constants/routes';
import { useScrollToTopHandler } from '@/contexts/ScrollToTopContext';
import { usePrefetchProductDetail } from '@/hooks/api/product/useProductDetail';
import { FeedType, useProductFeed, useRefreshProductFeed } from '@/hooks/api/useHomeProducts';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import type { ProductFeedItem } from '@/types/product/product';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const log = createLogger('HomeScreen');


/**
 * Định nghĩa các loại item trong FlashList
 * - header: MarketingHeader (CategoryRail, FlashSale, FeaturedSection)
 * - tabs: ProductTabs component
 * - product: ProductCard component
 */
interface HeaderItem {
  type: 'header';
  id: 'marketing_header';
}

interface TabsItem {
  type: 'tabs';
  id: string;
}

interface ProductItem {
  type: 'product';
  data: ProductFeedItem;
}

interface SkeletonItem {
  type: 'skeleton';
  id: string;
}

type ListItem = HeaderItem | TabsItem | ProductItem | SkeletonItem;

/**
 * TabsRowItem
 */
const TabsRowItem = memo(({
  activeTab,
  onTabChange,
}: {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}) => {
  return <ProductTabs activeTab={activeTab} onTabChange={onTabChange} />;
});

TabsRowItem.displayName = 'TabsRowItem';

/**
 * ProductRowItem - Hybrid Pattern Navigation
 * - PressIn: Start prefetch + record timing
 * - Press: Navigate with instant flag based on elapsed time
 */
const ProductRowItem = memo(({
  item,
}: {
  item: ProductFeedItem;
}) => {
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
      image={toSizedImageUrl(item.thumbnail, null, 'medium') ?? ''}
      originalPrice={item.originalPrice}
      rating={item.rating}
      reviews={item.reviews}
      sold={item.sold}
      location={item.location}
      discount={item.discountPercentage}
      isMall={item.isMall}
      onPress={handlePress}
      onPressIn={handlePressIn}
      route={productRoutes.detail(item.id)}
    />
  );
});

ProductRowItem.displayName = 'ProductRowItem';



/**
 * HomeScreen 
 */
export default function HomeScreen() {
  // Unlock navigation when screen gains focus
  useNavigationUnlockOnFocus();

  const { theme } = useUnistyles();

  const styles = stylesheet;
  const { t } = useTranslation(['home', 'common']);

  const { height: screenHeight } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<FeedType>('new');
  const listRef = useRef<FlashListRef<ListItem>>(null);

  // scrollY: Vị trí cuộn hiện tại (chạy trên UI Thread)
  const scrollY = useSharedValue(0);
  // headerHeight: Chiều cao của MarketingHeader
  const headerHeight = useSharedValue(0);
  // Ref để lưu giá trị JS cho logic đổi tab
  const headerHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deferred Rendering: Only render heavy content after transition
  const [isReady, setIsReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const task = setTimeout(() => setIsReady(true), 50);
      return () => {
        clearTimeout(task);
        if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
      };
    }, [])
  );

  // Shared Animation Pattern: One loop for all Skeletons
  const shimmerValue = useSharedValue(0.3);
  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [shimmerValue]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerValue.value,
  }));

  // Lưu scroll position cho từng tab để restore khi quay lại
  const scrollPositions = useRef<Record<FeedType, number>>({
    new: 0,
    sale: 0,
    promoted: 0,
    featured: 0,
  });

  // State để quản lý chiều cao HomeHeader (search bar)
  const [homeHeaderHeight, setHomeHeaderHeight] = useState(0);

  const minHeightStyle = useMemo(() => ({
    minHeight: screenHeight + headerHeightRef.current
  }), [screenHeight]);

  const {
    data,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductFeed(activeTab);

  // Smart refresh: only fetch page 0 instead of all loaded pages
  const { refresh: smartRefreshProducts } = useRefreshProductFeed(activeTab);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    // Refresh products feed (smart way - page 0 only)
    const refreshPromise = smartRefreshProducts();

    // Refresh other home sections
    queryClient.invalidateQueries({ queryKey: ['campaigns', 'slots', 'active'] });

    await refreshPromise;
  }, [smartRefreshProducts, queryClient]);

  /**
   * Scroll to Top Handler - Register with context to handle when user returns to Home tab
   */
  const scrollToTop = useCallback(() => {
    const currentOffset = scrollYRef.current;
    const threshold = screenHeight * 2;
    const shouldAnimate = currentOffset < threshold;

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: shouldAnimate,
    });
  }, [screenHeight]);

  // Đăng ký handler với context (tự cleanup khi unmount)
  useScrollToTopHandler('index', scrollToTop);

  /**
   * Tạo mảng data cho FlashList
   * - Item 0: MarketingHeader
   * - Item 1: ProductTabs
   * - Items 2+: Products
   */
  const listData = useMemo((): ListItem[] => {
    const products = data?.pages.flatMap(page => page.items) ?? [];

    const headerItem: HeaderItem = { type: 'header', id: 'marketing_header' };
    const tabsItem: TabsItem = { type: 'tabs', id: 'inline-tabs' };

    const items: ListItem[] = [headerItem, tabsItem];

    if (isLoading && products.length === 0) {
      for (let i = 0; i < 6; i++) {
        items.push({ type: 'skeleton', id: `skeleton-${i}` });
      }
    } else {
      items.push(...products.map((product): ProductItem => ({
        type: 'product',
        data: product,
      })));
    }

    return items;
  }, [data, isLoading]);

  /**
   * Đo chiều cao HomeHeader (search bar) để định vị sticky overlay
   */
  const handleHomeHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (homeHeaderHeight === 0) {
      setHomeHeaderHeight(height);
    }
  }, [homeHeaderHeight]);

  /**
   * Callback khi MarketingHeader đo được chiều cao
   * Cập nhật cả sharedValue (cho animation) và ref
   */
  const handleMarketingHeaderLayout = useCallback((height: number) => {
    headerHeight.value = height;
    headerHeightRef.current = height;
  }, [headerHeight]);

  /**
   * Scroll Handler - Cập nhật scrollY và lưu position cho tab hiện tại
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.value = y;
    scrollYRef.current = y;
    // Lưu scroll position cho tab hiện tại
    scrollPositions.current[activeTab] = y;
  }, [scrollY, activeTab]);

  /**
   * Animated Style cho Sticky Tabs Overlay
   * - opacity: 0 khi chưa cuộn đến ngưỡng, 1 khi đã cuộn qua
   */
  const stickyTabsAnimatedStyle = useAnimatedStyle(() => {
    // Chỉ hiện khi scrollY >= headerHeight (MarketingHeader đã khuất hoàn toàn)
    const shouldShow = scrollY.value >= headerHeight.value && headerHeight.value > 0;
    return {
      opacity: withTiming(shouldShow ? 1 : 0, { duration: 100 }),
      // Tắt pointer events khi ẩn để không chặn touch
      pointerEvents: shouldShow ? 'auto' : 'none',
    };
  });

  /**
   * LOGIC Xử lý đổi tab - Preserve Scroll Position
   */
  const handleTabChange = useCallback((newTab: FeedType) => {
    if (newTab === activeTab) return;

    const isTabsSticky = scrollYRef.current >= headerHeightRef.current && headerHeightRef.current > 0;

    if (isTabsSticky) {
      if (__DEV__) {
        log.info(`Switching tab to: ${newTab} (Sticky Mode)`);
        console.time(`TabChange_${newTab}`);
      }

      scrollPositions.current[activeTab] = scrollYRef.current;
      const savedPosition = scrollPositions.current[newTab];

      // Đổi tab
      setActiveTab(newTab);

      // Clear previous timer if any
      if (tabTimerRef.current) clearTimeout(tabTimerRef.current);

      if (savedPosition >= headerHeightRef.current && savedPosition > 0) {
        // Restore vị trí đã lưu nếu có
        tabTimerRef.current = setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: savedPosition,
            animated: false,
          });
          scrollYRef.current = savedPosition;
          scrollY.value = savedPosition;
          if (__DEV__) console.timeEnd(`TabChange_${newTab}`);
        }, 100) as any;
      } else {
        tabTimerRef.current = setTimeout(() => {
          const targetOffset = headerHeightRef.current;
          listRef.current?.scrollToOffset({
            offset: targetOffset,
            animated: false,
          });
          scrollYRef.current = targetOffset;
          scrollY.value = targetOffset;
          if (__DEV__) console.timeEnd(`TabChange_${newTab}`);
        }, 100) as any;
      }
    } else {
      setActiveTab(newTab);
    }
  }, [activeTab, scrollY]);

  /**
   * Navigate tới Product Detail
   */
  const handleProductPress = useCallback((productId: string) => {
    Navigator.push(productRoutes.detail(productId));
  }, []);

  /**
   * Infinite scroll - load more khi gần cuối list
   */
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  /**
   * Key extractor: Đảm bảo unique key cho mỗi item
   */
  const keyExtractor = useCallback((item: ListItem, index: number) => {
    switch (item.type) {
      case 'header':
        return item.id;
      case 'tabs':
        return item.id;
      case 'product':
        return `${activeTab}_${item.data.id}_${index}`;
      case 'skeleton':
        return item.id;
      default:
        return `item-${index}`;
    }
  }, [activeTab]);

  /**
   * Render từng item trong FlashList
   */
  const renderItem = useCallback(({ item }: ListRenderItemInfo<ListItem>) => {
    switch (item.type) {
      case 'header':
        return <MarketingHeader onHeightMeasured={handleMarketingHeaderLayout} onProductPress={handleProductPress} />;
      case 'tabs':
        // Tabs inline - sẽ cuộn đi khi scroll
        return (
          <TabsRowItem
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        );
      case 'product':
        return (
          <ProductRowItem
            item={item.data}
          />
        );
      case 'skeleton':
        return <ProductCardSkeleton animatedStyle={shimmerAnimatedStyle} />;
      default:
        return null;
    }
  }, [activeTab, handleTabChange, handleProductPress, handleMarketingHeaderLayout]);

  /**
   * Item type cho FlashList recycling optimization
   */
  const getItemType = useCallback((item: ListItem) => {
    return item.type;
  }, []);

  /**
   * ListEmpty: Loading indicator
   */
  const renderListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.buttonActive} />
        </View>
      );
    }
    return null;
  }, [isLoading, styles.emptyContainer, theme.colors.buttonActive]);

  /**
   * ListFooter: Loading more indicator
   */
  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.buttonActive} />
          <Text style={styles.loadingText}>{t('home:feed.loadingMore')}</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, styles.footer, styles.loadingText, theme.colors.buttonActive, t]);

  /**
   * Override item layout: header và tabs chiếm full width
   */
  const overrideItemLayout = useCallback((
    layout: { span?: number; size?: number },
    item: ListItem,
  ) => {
    if (item.type === 'header' || item.type === 'tabs') {
      layout.span = 2;
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Fixed HomeHeader - Search bar */}
      <View onLayout={handleHomeHeaderLayout}>
        <HomeHeader />
      </View>

      {!isReady ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.colors.buttonActive} />
        </View>
      ) : (
        <>
          {/* 2. Sticky Tabs Overlay - Absolute positioned, controlled by Reanimated */}
          <Animated.View
            style={[
              styles.stickyTabsOverlay,
              { top: homeHeaderHeight },
              stickyTabsAnimatedStyle,
            ]}
          >
            <ProductTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </Animated.View>

          {/* 3. FlashList - Main content với layout zigzag (masonry) */}
          <FlashList<ListItem>
            ref={listRef}
            data={listData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={2}
            masonry={true}
            optimizeItemArrangement={true}
            ListEmptyComponent={renderListEmpty}
            ListFooterComponent={renderListFooter}
            getItemType={getItemType}
            overrideItemLayout={overrideItemLayout}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && !isLoading}
                onRefresh={handleRefresh}
                tintColor={theme.colors.buttonActive}
                colors={[theme.colors.buttonActive]}
                progressViewOffset={homeHeaderHeight}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              (isLoading || listData.length < 5) && minHeightStyle
            ]}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    paddingBottom: theme.margins.sm,
  },
  stickyTabsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: theme.colors.surface,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow cho Android
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.margins.xl * 2,
  },
  footer: {
    paddingVertical: theme.margins.lg,
    alignItems: 'center',
    gap: theme.margins.sm,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
}));
