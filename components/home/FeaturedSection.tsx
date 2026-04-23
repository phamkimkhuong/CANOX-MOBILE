import { SectionHeader } from '@/components/ui/SectionHeader';
import { useProductFeed } from '@/hooks/api/useHomeProducts';
import type { ProductFeedItem } from '@/types/product/product';
import { formatCurrency, formatSoldCount } from '@/utils/format';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { InternationalBadge } from '../ui/product/InternationalBadge';
import { FeaturedSectionSkeleton } from './FeaturedSectionSkeleton';

type BadgeType = 'mall' | 'bestSeller' | 'topRated' | 'international' | null;

interface BadgeInfo {
    text: string;
    type: BadgeType;
}

/**
 * Xác định badge dựa trên dữ liệu sản phẩm
 * Ưu tiên: Mall > International > Best Seller > Top Rated > null
 */
const getBadge = (product: ProductFeedItem): BadgeInfo | null => {
    //  Mall - Shop chính hãng
    if (product.isMall) {
        return { text: 'Mall', type: 'mall' };
    }
    //  International - Giao hàng quốc tế
    if (product.isInternational) {
        return { text: 'Quốc tế', type: 'international' };
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
    onProductPress?: (
        productId: string,
        action?: 'buy-now' | 'add-to-cart',
        previewImageUrl?: string | null
    ) => void;
    /** Shared shimmer animation from MarketingHeader — avoids multiple animation loops */
    shimmerAnimatedStyle?: object;
    liquidGlassShimmerStyle?: object;
}

export const FeaturedSection = memo(({ onProductPress, shimmerAnimatedStyle, liquidGlassShimmerStyle }: FeaturedSectionProps = {}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['home', 'product']);
    const { width: screenWidth } = useWindowDimensions();

    const VISIBLE_CARDS = 2.6;
    const horizontalPadding = theme.margins.md * 2;
    const gapBetweenCards = theme.margins.sm;
    const totalGaps = gapBetweenCards * (Math.ceil(VISIBLE_CARDS) - 1);
    const cardWidth = (screenWidth - horizontalPadding - totalGaps) / VISIBLE_CARDS;
    const imageHeight = cardWidth * 0.85;

    // Fetch data từ API
    // const { data, isLoading, isError } = useProductFeed('featured');
    const { data, isLoading, isError } = useProductFeed('new');

    // Flatten pages và lấy products
    const products = useMemo(() => {
        return data?.pages.flatMap(page => page.items) ?? [];
    }, [data]);

    const mainProduct = products[0];
    const smallProducts = products.slice(1);

    // Loading state
    if (isLoading) {
        return <FeaturedSectionSkeleton animatedStyle={shimmerAnimatedStyle} />;
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
            case 'international':
                return { backgroundColor: theme.colors.info };
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
                onPress={() => onProductPress?.(
                    mainProduct.id,
                    undefined,
                    toSizedImageUrl(mainProduct.thumbnail, null, 'large') ?? mainProduct.thumbnail
                )}
            >
                <Image
                    source={{ uri: toSizedImageUrl(mainProduct.thumbnail, null, 'large') ?? mainProduct.thumbnail }}
                    style={styles.mainImage}
                    contentFit="cover"
                    accessibilityLabel={mainProduct.title}
                />
                <View style={styles.mainOverlay}>
                    <View style={styles.mainBadgesRow}>
                        <View style={styles.editorBadge}>
                            <Text style={styles.editorBadgeText}>{t('featured.editorBadge')}</Text>
                        </View>
                        {mainProduct.isInternational && (
                            <View style={styles.liquidGlassBadgeContainer}>
                                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
                                <LinearGradient
                                    colors={['rgba(79, 70, 229, 0.85)', 'rgba(0, 229, 255, 0.85)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <View style={styles.shimmerMask}>
                                    <Animated.View style={[styles.shimmerStrip, liquidGlassShimmerStyle]}>
                                        <LinearGradient
                                            colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.shimmerGradient}
                                        />
                                    </Animated.View>
                                </View>
                                <View style={styles.liquidGlassBadgeContent}>
                                    <IconSymbol name="globe" size={11} color="#FFFFFF" />
                                    <Text style={styles.liquidGlassBadgeText}>
                                        {t('product:badges.international')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                    <Text style={styles.mainTitle} numberOfLines={2}>
                        {mainProduct.title}
                    </Text>
                    <View style={styles.mainRatingLocationRow}>
                        <View style={styles.mainRatingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconSymbol
                                    key={star}
                                    name={star <= Math.floor(mainProduct.rating ?? 0) ? 'star' : 'star-border'}
                                    size={12}
                                    color="#facc15"
                                />
                            ))}
                            {mainProduct.reviews > 0 && (
                                <Text style={styles.mainReviewsText}>
                                    ({mainProduct.reviews >= 1000 ? `${(mainProduct.reviews / 1000).toFixed(1)}k` : mainProduct.reviews})
                                </Text>
                            )}
                        </View>
                        <Text style={styles.mainSubtitle} numberOfLines={1}>
                            {mainProduct.location ? ` • ${mainProduct.location}` : ''}
                        </Text>
                    </View>
                    <View style={styles.mainFooter}>
                        <View style={styles.mainPriceContainer}>
                            <Text style={styles.mainPrice}>
                                {formatCurrency(mainProduct.price)}
                            </Text>
                            {mainProduct.originalPrice && mainProduct.originalPrice > mainProduct.price && (
                                <Text style={styles.mainOriginalPrice}>
                                    {formatCurrency(mainProduct.originalPrice)}
                                </Text>
                            )}
                        </View>
                        <View style={styles.mainActionRow}>
                            {mainProduct.sold > 0 && (
                                <Text style={styles.mainSoldText}>
                                    {t('product:info.soldCountTemplate', { soldCount: formatSoldCount(mainProduct.sold) })}
                                </Text>
                            )}
                            <TouchableOpacity
                                style={styles.buyNowBtn}
                                onPress={() => onProductPress?.(
                                    mainProduct.id,
                                    'buy-now',
                                    toSizedImageUrl(mainProduct.thumbnail, null, 'large') ?? mainProduct.thumbnail
                                )}
                            >
                                <Text style={styles.buyNowText}>{t('product:variant.buyNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Small Featured Products - Horizontal Scrollable */}
            {smallProducts.length > 0 && (
                <FlashList<ProductFeedItem>
                    data={smallProducts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.smallProductsList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item: product }) => {

                        const badge = getBadge(product);
                        const discountBadge = getDiscountBadge(product);

                        return (
                            <TouchableOpacity
                                style={[styles.smallCard, { width: cardWidth, marginRight: theme.margins.sm }]}
                                activeOpacity={0.85}
                                onPress={() => onProductPress?.(
                                    product.id,
                                    undefined,
                                    toSizedImageUrl(product.thumbnail, null, 'medium') ?? product.thumbnail
                                )}
                            >
                                <View style={[styles.smallImageContainer, { height: imageHeight }]}>
                                    <Image
                                        source={{ uri: toSizedImageUrl(product.thumbnail, null, 'medium') ?? product.thumbnail }}
                                        style={styles.smallImage}
                                        contentFit="cover"
                                        accessibilityLabel={product.title}
                                    />

                                    {/* Feature badge */}
                                    {badge && badge.type !== 'international' && (
                                        <View style={[styles.smallBadge, getBadgeStyle(badge.type)]}>
                                            <Text style={styles.smallBadgeText}>{badge.text}</Text>
                                        </View>
                                    )}

                                    {/* Discount badge */}
                                    {discountBadge && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>{discountBadge}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.smallCardContent}>
                                    <Text style={styles.smallTitle} numberOfLines={2}>
                                        {product.title}
                                    </Text>

                                    {/* International badge */}
                                    {product.isInternational && (
                                        <InternationalBadge label={t('product:badges.international')} size="sm" shimmerStyle={liquidGlassShimmerStyle} />
                                    )}

                                    {/* Rating Row */}
                                    <View style={styles.smallRatingRow}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <IconSymbol
                                                key={star}
                                                name={star <= Math.floor(product.rating ?? 0) ? 'star' : 'star-border'}
                                                size={10}
                                                color="#facc15"
                                            />
                                        ))}
                                        {product.reviews > 0 && (
                                            <Text style={styles.smallReviewsText}>
                                                ({product.reviews >= 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.smallPriceRow}>
                                        <Text style={styles.smallPrice}>
                                            {formatCurrency(product.price)}
                                        </Text>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <Text style={styles.smallOriginalPrice}>
                                                {formatCurrency(product.originalPrice)}
                                            </Text>
                                        )}
                                    </View>
                                    {product.sold > 0 && (
                                        <Text style={styles.smallSoldText}>
                                            {t('product:info.soldCountTemplate', { soldCount: formatSoldCount(product.sold) })}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
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
    mainBadgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.sm,
    },
    editorBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
    },
    liquidGlassBadgeContainer: {
        borderRadius: theme.radius.s,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 4,
    },
    liquidGlassBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    liquidGlassBadgeText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.3,
    },
    shimmerMask: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shimmerStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '35%',
    },
    shimmerGradient: {
        flex: 1,
    },
    editorBadgeText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
        marginBottom: 4,
    },
    mainRatingLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.margins.sm,
    },
    mainRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    mainReviewsText: {
        fontSize: 12,
        color: theme.colors.onPrimary,
        marginLeft: 2,
        fontWeight: '500',
    },
    mainSubtitle: {
        fontSize: 13,
        color: theme.colors.textOnOverlay,
        marginLeft: 4,
    },
    mainFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    mainPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    mainOriginalPrice: {
        fontSize: 14,
        color: theme.colors.textOnOverlay,
        textDecorationLine: 'line-through',
    },
    mainActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    mainSoldText: {
        fontSize: 12,
        color: theme.colors.textOnOverlay,
        fontWeight: '500',
    },
    buyNowBtn: {
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
    },
    buyNowText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    smallProductsList: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    smallCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        // Soft UI Shadow for depth
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.04)',
        paddingBottom: 4,
    },
    smallImageContainer: {
        width: '100%',
        backgroundColor: theme.colors.backgroundInput,
    },
    smallCardContent: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        gap: 3,
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
        lineHeight: 16,
    },
    smallRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    smallReviewsText: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        marginLeft: 2,
        fontWeight: '500',
    },
    smallPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 2,
    },
    smallPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.error,
    },
    smallOriginalPrice: {
        fontSize: 10,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    smallSoldText: {
        fontSize: 10,
        color: theme.colors.secondary,
        marginTop: 2,
    },
}));
