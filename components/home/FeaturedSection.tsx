import { SectionHeader } from '@/components/ui/SectionHeader';
import { useProductFeed } from '@/hooks/api/useHomeProducts';
import type { ProductFeedItem } from '@/types/product/product';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FeaturedSectionSkeleton } from './FeaturedSectionSkeleton';

type BadgeType = 'mall' | 'bestSeller' | 'topRated' | null;

interface BadgeInfo {
    text: string;
    type: BadgeType;
}

/**
 * Xác định badge dựa trên dữ liệu sản phẩm
 * Ưu tiên: Mall > Best Seller > Top Rated > null
 */
const getBadge = (product: ProductFeedItem): BadgeInfo | null => {
    //  Mall - Shop chính hãng
    if (product.isMall) {
        return { text: 'Mall', type: 'mall' };
    }
    //  Best Seller - Bán chạy (sold > 500)
    if (product.sold > 500) {
        return { text: 'Bán chạy', type: 'bestSeller' };
    }
    // Top Rated - Đánh giá cao (rating >= 4.5 và có ít nhất 20 reviews)
    if (product.rating >= 4.5 && product.reviews >= 20) {
        return { text: 'Top', type: 'topRated' };
    }
    // Không có badge
    return null;
};

/**
 * Tính discount badge nếu có giảm giá
 */
const getDiscountBadge = (item: ProductFeedItem): string | null => {
    if (item.discountPercentage && item.discountPercentage > 0) {
        return `-${Math.round(item.discountPercentage)}%`;
    }
    return null;
};

/**
 * FeaturedSection - Component hiển thị sản phẩm Featured/Nổi bật
 * 
 * Data structure:
 * - products[0] → Main Banner (sản phẩm lớn)
 * - products.slice(1, 4) → Small Products (3 sản phẩm nhỏ)
 */
interface FeaturedSectionProps {
    onProductPress?: (productId: string) => void;
}

export const FeaturedSection = memo(({ onProductPress }: FeaturedSectionProps = {}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['home', 'product']);

    // Fetch data từ API
    // const { data, isLoading, isError } = useProductFeed('featured');
    const { data, isLoading, isError } = useProductFeed('new');

    // Flatten pages và lấy products
    const products = useMemo(() => {
        return data?.pages.flatMap(page => page.items) ?? [];
    }, [data]);

    const mainProduct = products[0];
    const smallProducts = products.slice(1, 4);

    // Loading state
    if (isLoading) {
        return <FeaturedSectionSkeleton />;
    }

    // Error hoặc không có data
    if (isError || !mainProduct) {
        return null;
    }

    // Map badge type to style
    const getBadgeStyle = (type: BadgeType): ViewStyle => {
        switch (type) {
            case 'mall':
                return { backgroundColor: theme.colors.primary };
            case 'bestSeller':
                return { backgroundColor: theme.colors.warning };
            case 'topRated':
                return { backgroundColor: theme.colors.success };
            default:
                return { backgroundColor: theme.colors.primary };
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerPadding}>
                <SectionHeader
                    title={t('home:featured.title')}
                    onSeeAll={() => { }}
                />
            </View>

            {/* Main Featured Banner */}
            <TouchableOpacity
                style={styles.mainBanner}
                activeOpacity={0.85}
                onPress={() => onProductPress?.(mainProduct.id)}
            >
                <Image
                    source={{ uri: mainProduct.thumbnail }}
                    style={styles.mainImage}
                    contentFit="cover"
                    accessibilityLabel={mainProduct.title}
                />
                <View style={styles.mainOverlay}>
                    <View style={styles.editorBadge}>
                        <Text style={styles.editorBadgeText}>Editor's Pick</Text>
                    </View>
                    <Text style={styles.mainTitle} numberOfLines={2}>
                        {mainProduct.title}
                    </Text>
                    <Text style={styles.mainSubtitle} numberOfLines={1}>
                        {mainProduct.shopName}
                    </Text>
                    <View style={styles.mainFooter}>
                        <Text style={styles.mainPrice}>
                            {formatCurrency(mainProduct.price)}
                        </Text>
                        <TouchableOpacity style={styles.buyNowBtn}>
                            <Text style={styles.buyNowText}>{t('product:variant.buyNow')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Small Featured Products*/}
            {smallProducts.length > 0 && (
                <View style={styles.smallProductsRow}>
                    {smallProducts.map((product) => {
                        const badge = getBadge(product);
                        const discountBadge = getDiscountBadge(product);

                        return (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.smallCard}
                                activeOpacity={0.85}
                                onPress={() => onProductPress?.(product.id)}
                            >
                                <View style={styles.smallImageContainer}>
                                    <Image
                                        source={{ uri: product.thumbnail }}
                                        style={styles.smallImage}
                                        contentFit="cover"
                                        accessibilityLabel={product.title}
                                    />

                                    {/* Feature badge - chỉ hiển thị nếu có */}
                                    {badge && (
                                        <View style={[styles.smallBadge, getBadgeStyle(badge.type)]}>
                                            <Text style={styles.smallBadgeText}>{badge.text}</Text>
                                        </View>
                                    )}

                                    {/* Discount badge - chỉ hiển thị nếu có giảm giá */}
                                    {discountBadge && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>{discountBadge}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.smallTitle} numberOfLines={2}>
                                    {product.title}
                                </Text>
                                <Text style={styles.smallPrice}>
                                    {formatCurrency(product.price)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.md,
        borderRadius: 10
    },
    headerPadding: {
        paddingHorizontal: theme.margins.md,
    },
    mainBanner: {
        marginHorizontal: theme.margins.md,
        height: 180,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        marginBottom: theme.margins.md,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    mainOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: theme.margins.md,
        justifyContent: 'flex-end',
    },
    editorBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        marginBottom: theme.margins.sm,
    },
    editorBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
        marginBottom: 4,
    },
    mainSubtitle: {
        fontSize: 13,
        color: theme.colors.textOnOverlay,
        marginBottom: theme.margins.sm,
    },
    mainFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    buyNowBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
    },
    buyNowText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    smallProductsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    smallCard: {
        flex: 1,
        marginHorizontal: theme.margins.sm / 2,
    },
    smallImageContainer: {
        width: '100%',
        height: 100,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundInput,
        marginBottom: theme.margins.sm,
    },
    smallImage: {
        width: '100%',
        height: '100%',
    },
    smallBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    smallBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    discountBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    discountText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    smallTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typography,
        height: 32,
        lineHeight: 16,
    },
    smallPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.error,
    },
}));
