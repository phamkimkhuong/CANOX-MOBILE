import { CategoryRail } from '@/components/home/CategoryRail';
import { HomeBanner } from '@/components/home/HomeBanner';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context'; // Để tránh tai thỏ

// Mock data sản phẩm
const PRODUCTS = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Sản phẩm Demo ${i + 1} - Chất lượng cao`,
  price: 100 + i * 10,
  image: `https://picsum.photos/300?random=${i}`,
}));

export default function HomeScreen() {
  const theme = useTheme();
  // Header Component (Thanh tìm kiếm)
  const renderListHeader = () => (
    <View>
      <HomeBanner />

      <View style={styles.sectionPadding}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Danh mục</Text>
        <CategoryRail />
      </View>

      <View style={styles.sectionPadding}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Gợi ý hôm nay</Text>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* 1. Header Cố định ở trên cùng (Sticky) */}
      <HomeHeader />

      {/* 2. Nội dung cuộn bên dưới */}
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderListHeader} // Banner & Category nằm ở đây
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            price={item.price}
            image={item.image}
            onPress={() => console.log('Click', item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  sectionPadding: {
    paddingHorizontal: 16, // Căn lề trái phải cho tiêu đề
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
