import { CategoryRail } from '@/components/home/CategoryRail';
import { HomeBanner } from '@/components/home/HomeBanner';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import React from 'react';
import '@/constants/unistyles';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Mock data sản phẩm
const PRODUCTS = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Sản phẩm Demo ${i + 1} - Chất lượng cao`,
  price: 100 + i * 10,
  image: `https://picsum.photos/300?random=${i}`,
}));

export default function HomeScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;

  const renderListHeader = () => (
    <View>
      <HomeBanner />

      <View style={styles.sectionPadding}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <CategoryRail />
      </View>

      <View style={styles.sectionPadding}>
        <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <HomeHeader />

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            price={item.price}
            image={item.image}
            onPress={() => console.log('Click', item.id)}
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
  },
  sectionPadding: {
    paddingHorizontal: theme.margins.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
    color: theme.colors.typography,
    fontSize: 20, // thay cho variant="titleLarge"
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.margins.md,
  },
  listContent: {
    paddingBottom: 20,
  },
}));
