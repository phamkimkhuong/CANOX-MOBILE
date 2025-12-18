import { CategoryRail } from '@/components/home/CategoryRail';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { FlashSale } from '@/components/home/FlashSale';
import { ProductTabs } from '@/components/home/ProductTabs';
import { HomeHeader } from '@/components/home/SearchHomeHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Mock data sản phẩm với đầy đủ thông tin
const PRODUCTS = [
  {
    id: 1,
    title: 'Smart Watch Series 7 - Black Aluminum Case',
    price: 329,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.5,
    reviews: 1200,
    location: 'New York',
    discount: 10,
  },
  {
    id: 2,
    title: 'Retro Sunglasses UV400 Protection',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    rating: 4.8,
    reviews: 450,
    location: 'Chicago',
    isMall: true,
  },
  {
    id: 3,
    title: 'Luxury Mechanical Watch for Men',
    price: 129.50,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    rating: 4.2,
    reviews: 89,
    location: 'London',
  },
  {
    id: 4,
    title: 'Shockproof Clear Case for iPhone 15',
    price: 4.99,
    originalPrice: 9.99,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
    rating: 3.8,
    reviews: 2500,
    location: 'Shenzhen',
    discount: 50,
  },
  {
    id: 5,
    title: 'Wireless Bluetooth Earbuds Pro',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    rating: 4.6,
    reviews: 890,
    location: 'Tokyo',
  },
  {
    id: 6,
    title: 'Minimalist Leather Wallet',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    rating: 4.4,
    reviews: 320,
    location: 'Milan',
    isMall: true,
  },
];

export default function HomeScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const [activeTab, setActiveTab] = useState('Recommended');

  const renderListHeader = useCallback(
    () => (
      <View>
        {/* Category Grid */}
        <View style={styles.sectionPadding}>
          <CategoryRail />
        </View>

        {/* Flash Sale */}
        <FlashSale />

        {/* Featured Section */}
        <FeaturedSection />

        {/* Product Tabs */}
        <ProductTabs onTabChange={setActiveTab} />
      </View>
    ),
    [styles.sectionPadding]
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.seeMoreBtn}>
          <Text style={styles.seeMoreText}>See More Products</Text>
        </TouchableOpacity>
      </View>
    ),
    [styles.footer, styles.seeMoreBtn, styles.seeMoreText]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HomeHeader />
      <FlashList
        data={PRODUCTS}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            price={item.price}
            image={item.image}
            originalPrice={item.originalPrice}
            rating={item.rating}
            reviews={item.reviews}
            location={item.location}
            discount={item.discount}
            isMall={item.isMall}
            onPress={() => { }}
          />
        )}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingHorizontal: theme.margins.sm,
    paddingBottom: theme.margins.lg,
  },
  footer: {
    paddingVertical: theme.margins.lg,
    alignItems: 'center',
  },
  seeMoreBtn: {
    paddingHorizontal: theme.margins.xl,
    paddingVertical: theme.margins.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
}));
