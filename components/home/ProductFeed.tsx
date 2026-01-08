import { ProductCard } from '@/components/ui/ProductCard';
import { productRoutes } from '@/constants/routes';
import { useProductFeed } from '@/hooks/api/product/useProducts';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';

interface FeedProduct {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
    rating?: number;
    reviews?: number;
    brand?: string;
    discountPercentage?: number;
}

export const ProductFeed = () => {
    const { data, fetchNextPage, hasNextPage } = useProductFeed();

    // Flatten data từ các page
    const products: FeedProduct[] = data?.pages.flatMap((page) => page.products) ?? [];

    const handleEndReached = useCallback(() => {
        if (hasNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage]);

    return (
        <FlashList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <ProductCard
                    title={item.title}
                    price={item.price}
                    image={item.thumbnail}
                    rating={item.rating}
                    reviews={item.reviews}
                    location={item.brand}
                    discount={item.discountPercentage ? Math.round(item.discountPercentage) : undefined}
                    onPress={() => { }}
                    route={productRoutes.detail(item.id.toString())}
                />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            numColumns={2}
        />
    );
};