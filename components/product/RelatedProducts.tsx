import { ProductCard } from '@/components/ui/ProductCard';
import { productRoutes } from '@/constants/routes';
import { useRelatedProducts } from '@/hooks/api/useProductDetail';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RelatedProductsProps {
    productId: string;
}

export const RelatedProducts = ({ productId }: RelatedProductsProps) => {
    const { t } = useTranslation('product');
    const { data, isLoading } = useRelatedProducts(productId);
    const { theme } = useUnistyles();

    const products = useMemo(() => data?.content ?? [], [data]);

    if (isLoading && products.length === 0) {
        return null; // Or show skeleton
    }
    if (!isLoading && products.length === 0) {
        return null;
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('related.title')}</Text>
            </View>

            <View style={styles.grid}>
                {products.map((item) => (
                    <View key={item.id} style={styles.cardWrapper}>
                        <ProductCard
                            title={item.title}
                            price={item.price}
                            image={item.thumbnail}
                            originalPrice={item.originalPrice}
                            rating={item.rating}
                            reviews={item.reviews}
                            sold={item.sold}
                            discount={item.discountPercentage}
                            isMall={item.isMall}
                            onPress={() => {
                                router.push(productRoutes.detail(item.id));
                            }}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingBottom: theme.margins.xl,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.margins.sm,
    },
    cardWrapper: {
        width: '50%',
        paddingBottom: theme.margins.sm,
    },
}));
