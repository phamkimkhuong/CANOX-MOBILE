import { MarketingHeader } from '@/components/home/MarketingHeader';
import { ProductTabs } from '@/components/home/ProductTabs';
import { HomeHeader } from '@/components/home/SearchHomeHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { useScrollToTopHandler } from '@/contexts/ScrollToTopContext';
import { FeedType, useProductFeed } from '@/hooks/api/useHomeProducts';
import type { ProductFeedItem } from '@/types/product/product';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';


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

type ListItem = HeaderItem | TabsItem | ProductItem;

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
 * ProductRowItem 
 */
const ProductRowItem = memo(({
  item,
  onPress,
}: {
  item: ProductFeedItem;
  onPress: (id: string) => void;
}) => {
  return (
    <ProductCard
      title={item.title}
      price={item.price}
      image={item.thumbnail}
      originalPrice={item.originalPrice}
      rating={item.rating}
      reviews={item.reviews}
      sold={item.sold}
      location={item.shopName}
      discount={item.discountPercentage}
      isMall={item.isMall}
      onPress={() => onPress(item.id)}
    />
  );
});

ProductRowItem.displayName = 'ProductRowItem';



/**
 * HomeScreen 
 * 
 * Cơ chế "Manual Absolute Overlay":
 * 1. HomeHeader: Fixed ở top, không cuộn
 * 2. MarketingHeader: Cuộn bình thường trong FlashList
 * 3. ProductTabs trong List: Cuộn bình thường (sẽ đi khuất)
 * 4. ProductTabs Absolute Overlay: Ẩn mặc định, CHỈ hiện khi scrollY >= marketingHeaderHeight
 * 5. Products: Grid 2 cột, infinite scroll
 */
export default function HomeScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const router = useRouter();

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

  // State để quản lý chiều cao HomeHeader (search bar)
  const [homeHeaderHeight, setHomeHeaderHeight] = useState(0);

  const minHeightStyle = useMemo(() => ({
    minHeight: screenHeight + headerHeightRef.current
  }), [screenHeight]);

  // Fetch product data theo activeTab
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductFeed(activeTab);

  /**
   * Scroll to Top Handler - Register with context to handle when user returns to Home tab
   */
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  }, []);

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

    return [
      headerItem,
      tabsItem,
      ...products.map((product): ProductItem => ({
        type: 'product',
        data: product,
      })),
    ];
  }, [data]);

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
   * Scroll Handler - Cập nhật scrollY để điều khiển opacity của sticky overlay
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.value = y;
    scrollYRef.current = y;
  }, [scrollY]);

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
   * LOGIC Xử lý đổi tab
   * 
   * TH1: Đang ở đỉnh (scrollY < headerHeight)
   * - Chỉ đổi activeTab -> React re-render products
   * - MarketingHeader được memo nên không re-render
   * 
   * TH2: Đã cuộn sâu (scrollY >= headerHeight) 
   * - Đổi activeTab
   * - Scroll về đúng vị trí headerHeight
   * - User thấy sản phẩm đầu tiên, tabs vẫn sticky
   */
  const handleTabChange = useCallback((newTab: FeedType) => {
    setActiveTab(newTab);

    // TH2: Nếu đang sticky, scroll về đầu danh sách sản phẩm
    if (scrollYRef.current > headerHeightRef.current && headerHeightRef.current > 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: headerHeightRef.current,
          animated: true,
        });
      }, 50);
    }
  }, []);

  /**
   * Navigate tới Product Detail
   */
  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

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
            onPress={handleProductPress}
          />
        );
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    return null;
  }, [isLoading, styles.emptyContainer, theme.colors.primary]);

  /**
   * ListFooter: Loading more indicator
   */
  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thêm...</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, styles.footer, styles.loadingText, theme.colors.primary]);

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 1. Fixed HomeHeader - Search bar */}
      <View onLayout={handleHomeHeaderLayout}>
        <HomeHeader />
      </View>

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

      {/* 3. FlashList - Main content */}
      <FlashList
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        getItemType={getItemType}
        overrideItemLayout={overrideItemLayout}
        // Scroll handler
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.listContent,
          (isLoading || listData.length < 5) && minHeightStyle
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: theme.margins.sm,
    paddingBottom: theme.margins.lg,
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
