import { ProductCard } from '@/components/ui/ProductCard';
import { useProductFeed } from '@/hooks/api/useProducts';
import { FlashList } from '@shopify/flash-list';

type FeedProduct = {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
};

export const ProductFeed = () => {
    const { data, fetchNextPage, hasNextPage } = useProductFeed();

    // Flatten data từ các page
    const products: FeedProduct[] = data?.pages.flatMap((page) => page.products) ?? [];

    return (
        <FlashList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <ProductCard
                    title={item.title}
                    price={item.price}
                    image={item.thumbnail}
                    onPress={() => { }}
                />
            )}
            onEndReached={() => {
                if (hasNextPage) {
                    void fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            numColumns={2} // Grid 2 cột chuẩn Shopee/eBay
        />
    );
};