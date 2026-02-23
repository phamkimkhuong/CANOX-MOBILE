import { ProductCard } from '@/components/ui/product/ProductCard';
import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { productRoutes } from '@/constants/routes';
import { useProductFeed } from '@/hooks/api/useHomeProducts';
import type { ProductFeedItem } from '@/types/product/product';
import { Navigator } from '@/utils/navigation';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const RecommendedProducts = () => {
    const { theme } = useUnistyles();

    const { data, isLoading } = useProductFeed('new');

    const products = data?.pages.flatMap((page) => page.items) ?? [];

    if (isLoading && products.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.newPrimary} />
            </View>
        );
    }

    if (products.length === 0) {
        return null;
    }

    // Limit to 10 items for recommendation
    const displayProducts = products.slice(0, 10);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <View style={styles.titleLine} />
                    <Text style={styles.title}>{PRODUCT_STRINGS.related.title.toUpperCase()}</Text>
                    <View style={styles.titleLine} />
                </View>
            </View>

            <FlashList<ProductFeedItem>
                data={displayProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                masonry={true}
                optimizeItemArrangement={true}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }: ListRenderItemInfo<ProductFeedItem>) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            title={item.title}
                            price={item.price}
                            image={toSizedImageUrl(item.thumbnail, null, 'medium') ?? item.thumbnail}
                            originalPrice={item.originalPrice}
                            rating={item.rating}
                            reviews={item.reviews}
                            sold={item.sold}
                            location={item.location}
                            discount={item.discountPercentage}
                            isMall={item.isMall}
                            isInternational={item.isInternational}
                            onPress={() => {
                                Navigator.push(productRoutes.detail(item.id));
                            }}
                            route={productRoutes.detail(item.id)}
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.xl,
        paddingBottom: theme.margins.xl,
    },
    header: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    titleLine: {
        height: 1,
        flex: 1,
        backgroundColor: theme.colors.border,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: theme.margins.sm,
    },
    cardWrapper: {
        paddingHorizontal: 4,
    },
    loadingContainer: {
        padding: theme.margins.xl,
        alignItems: 'center',
    },
}));
