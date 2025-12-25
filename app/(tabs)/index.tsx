import { CategoryRail } from '@/components/home/CategoryRail';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { FlashSale } from '@/components/home/FlashSale';
import { ProductTabs } from '@/components/home/ProductTabs';
import { HomeHeader } from '@/components/home/SearchHomeHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { FeedType, useProductFeed } from '@/hooks/api/useHomeProducts';
import { HEADER_LAYOUT, useStickyTabs } from '@/hooks/useStickyTabs';
import type { ProductFeedItem } from '@/types/product';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * HeaderContent - Phần nội dung phía trên tabs
 * Đo chiều cao để biết khi nào tabs cần dính
 */
const HeaderContent = memo(({ onHeightMeasured }: { onHeightMeasured: (height: number) => void }) => {
  const styles = stylesheet;
  const [measured, setMeasured] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (!measured) {
      onHeightMeasured(event.nativeEvent.layout.height);
      setMeasured(true);
    }
  }, [measured, onHeightMeasured]);

  return (
    <View onLayout={handleLayout}>
      <View style={styles.sectionPadding}>
        <CategoryRail />
      </View>
      <FlashSale />
      <FeaturedSection />
    </View>
  );
});

/**
 * ListHeader - Header của FlashList
 * Bao gồm HeaderContent + ProductTabs
 */
const ListHeader = memo(({
  activeTab,
  onTabChange,
  onContentHeightMeasured,
}: {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
  onContentHeightMeasured: (height: number) => void;
}) => (
  <View>
    <HeaderContent onHeightMeasured={onContentHeightMeasured} />
    <ProductTabs activeTab={activeTab} onTabChange={onTabChange} />
  </View>
));

/**
 * HomeScreen - Màn hình chính với Sticky Tabs
 * 
 * Cơ chế:
 * - Tất cả nội dung cuộn bình thường trong FlashList
 * - Khi ProductTabs sắp chạm HomeHeader → Sticky overlay hiện lên
 * - Products tiếp tục cuộn bên dưới sticky tabs
 */
export default function HomeScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FeedType>('featured');
  const [homeHeaderHeight, setHomeHeaderHeight] = useState(0);
  const [contentBeforeTabsHeight, setContentBeforeTabsHeight] = useState<number>(HEADER_LAYOUT.CONTENT_BEFORE_TABS);

  const { handleScroll: onScrollUpdate, stickyTabsAnimatedStyle } = useStickyTabs({
    headerContentHeight: contentBeforeTabsHeight,
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductFeed(activeTab);

  const products = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? [];
  }, [data]);

  const handleHomeHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    if (homeHeaderHeight === 0) {
      setHomeHeaderHeight(event.nativeEvent.layout.height);
    }
  }, [homeHeaderHeight]);

  const handleContentHeightMeasured = useCallback((height: number) => {
    setContentBeforeTabsHeight(height);
  }, []);

  const handleTabChange = useCallback((tab: FeedType) => {
    setActiveTab(tab);
  }, []);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollUpdate(event.nativeEvent.contentOffset.y);
  }, [onScrollUpdate]);

  const renderListHeader = useCallback(() => (
    <ListHeader
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onContentHeightMeasured={handleContentHeightMeasured}
    />
  ), [activeTab, handleTabChange, handleContentHeightMeasured]);

  const renderItem = useCallback(({ item }: { item: ProductFeedItem }) => (
    <ProductCard
      title={item.title}
      price={item.price}
      image={item.thumbnail}
      originalPrice={item.originalPrice}
      rating={item.rating}
      reviews={item.reviews}
      location={item.shopName}
      discount={item.discountPercentage}
      isMall={item.isMall}
      onPress={() => handleProductPress(item.id)}
    />
  ), [handleProductPress]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Fixed HomeHeader - đo chiều cao */}
      <View onLayout={handleHomeHeaderLayout}>
        <HomeHeader />
      </View>

      {/* Sticky Tabs Overlay - Hiện khi cuộn qua content */}
      <Animated.View
        style={[
          styles.stickyTabsContainer,
          { top: homeHeaderHeight },
          stickyTabsAnimatedStyle as any,
        ]}
      >
        <ProductTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </Animated.View>

      {/* FlashList - Nội dung cuộn */}
      <FlashList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item: ProductFeedItem) => item.id}
        numColumns={2}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : null}
        ListFooterComponent={isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải thêm...</Text>
          </View>
        ) : null}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
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
  sectionPadding: {
    paddingHorizontal: theme.margins.md,
  },
  stickyTabsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    paddingHorizontal: theme.margins.sm,
    paddingBottom: theme.margins.lg,
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
