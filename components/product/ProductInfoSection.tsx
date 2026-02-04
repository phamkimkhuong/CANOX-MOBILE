import type { FlashSaleInfo, PriceDisplay } from '@/types/product/productDetail';
import { formatCurrency } from '@/utils/format';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { ProductFlashSaleBar } from './ProductFlashSaleBar';

interface ProductInfoSectionProps {
    name: string;
    priceDisplay: PriceDisplay;
    rating: number;
    totalReviews: number;
    totalSold: number;
    flashSale?: FlashSaleInfo;
    isMall?: boolean;
    isInternational?: boolean;
    /** Callback khi flash sale hết hạn - có thể dùng để refetch data */
    onFlashSaleExpired?: () => void;
    /** Callback to show price breakdown bottom sheet */
    onShowPriceBreakdown?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format số lượng đã bán (1500 -> "1.5k")
 */
const formatSoldCount = (count: number): string => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * PriceSection - Hiển thị giá và cho phép nhấn để xem chi tiết
 */
const PriceSection = memo<{
    priceDisplay: PriceDisplay;
    onPress?: () => void;
}>(({ priceDisplay, onPress }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');

    // Memoize price rendering to avoid re-calculation
    const priceContent = useMemo(() => {
        return (
            <Pressable
                style={styles.priceContainer}
                onPress={onPress}
                android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            >
                <View style={styles.priceMainRow}>
                    <Text style={styles.currentPrice}>
                        {formatCurrency(priceDisplay.currentPrice)}
                    </Text>
                    {priceDisplay.originalPrice != null && priceDisplay.originalPrice > 0 && (
                        <Text style={styles.originalPrice}>
                            {formatCurrency(priceDisplay.originalPrice)}
                        </Text>
                    )}
                    {priceDisplay.discountPercentage != null && priceDisplay.discountPercentage > 0 && (
                        <View style={styles.discountBadgeContainer}>
                            <LinearGradient
                                colors={
                                    (priceDisplay.breakdown?.productDiscount && priceDisplay.voucherDiscount != null && priceDisplay.voucherDiscount > 0)
                                        ? ['#FF4B2B', '#FF416C'] // Red/Pink for "After Voucher"
                                        : ['#F97316', '#F44336']   // Orange/Red for Normal Discount
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.discountBadgeGradient}
                            >
                                <BlurView intensity={10} tint="light" style={styles.discountBadgeBlur}>
                                    <Text style={styles.discountText}>
                                        {priceDisplay.breakdown?.productDiscount && priceDisplay.voucherDiscount && priceDisplay.voucherDiscount > 0
                                            ? t('priceBreakdown.afterVoucher')
                                            : `-${priceDisplay.discountPercentage}%`}
                                    </Text>
                                </BlurView>
                            </LinearGradient>
                        </View>
                    )}
                </View>



                {/* Info icon hint - Small indicator that this is clickable */}
                <View style={styles.infoIconWrapper}>
                    <IconSymbol name="info" size={12} color={theme.colors.secondary} />
                </View>
            </Pressable >
        );
    }, [priceDisplay, onPress, theme.colors.secondary, t]);

    return priceContent;
});

PriceSection.displayName = 'PriceSection';

/**
 * StatsRow - Hiển thị rating, reviews, sold count
 */
const StatsRow = memo<{
    rating: number;
    totalReviews: number;
    totalSold: number;
}>(({ rating, totalReviews, totalSold }) => {
    const { t } = useTranslation('product');
    // Memoize formatted values
    const formattedRating = useMemo(() => rating.toFixed(1), [rating]);
    const formattedReviews = useMemo(() => formatSoldCount(totalReviews), [totalReviews]);
    const formattedSold = useMemo(() => formatSoldCount(totalSold), [totalSold]);

    return (
        <View style={styles.statsRow}>
            {/* Rating */}
            <View style={styles.statItem}>
                <IconSymbol name="star" size={14} color="#FFB800" />
                <Text style={styles.statValue}>{formattedRating}</Text>
                <Text style={styles.statLabel}> ({formattedReviews})</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Sold */}
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('info.sold')}</Text>
                <Text style={styles.statValue}>{formattedSold}</Text>
            </View>
        </View>
    );
});

StatsRow.displayName = 'StatsRow';

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * ProductInfoSection - Hiển thị thông tin chính sản phẩm
 */
export const ProductInfoSection = memo<ProductInfoSectionProps>(({
    name,
    priceDisplay,
    rating,
    totalReviews,
    totalSold,
    flashSale,
    isMall = false,
    isInternational = false,
    onFlashSaleExpired,
    onShowPriceBreakdown,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');

    const badgesContent = useMemo(() => (
        <View style={styles.badgeRow}>
            {isMall && (
                <View style={styles.premiumBadgeContainer}>
                    <LinearGradient
                        colors={['#E53935', '#B71C1C']}
                        style={styles.premiumBadgeGradient}
                    >
                        <Text style={styles.mallText}>{t('badges.mall')}</Text>
                    </LinearGradient>
                </View>
            )}
            {isInternational && (
                <View style={styles.premiumBadgeContainer}>
                    <LinearGradient
                        colors={['#2196F3', '#1565C0']}
                        style={styles.premiumBadgeGradient}
                    >
                        <IconSymbol name="globe" size={12} color="#FFFFFF" />
                        <Text style={styles.internationalText}>{t('badges.international')}</Text>
                    </LinearGradient>
                </View>
            )}
            {priceDisplay.shopVoucherDiscount != null && priceDisplay.shopVoucherDiscount > 0 && (
                <View style={[styles.badge, styles.voucherBadge]}>
                    <IconSymbol name="ticket" size={12} color={theme.colors.success} />
                    <Text style={styles.voucherText}> {t('info.discount')}
                        -{formatCurrency(priceDisplay.shopVoucherDiscount)}
                    </Text>
                </View>
            )}
            {priceDisplay.platformVoucherDiscount != null && priceDisplay.platformVoucherDiscount > 0 && (
                <View style={[styles.badge, styles.voucherBadge]}>
                    <IconSymbol name="ticket" size={12} color={theme.colors.success} />
                    <Text style={styles.voucherText}> {t('info.discount')}
                        -{formatCurrency(priceDisplay.platformVoucherDiscount)}
                    </Text>
                </View>
            )}
        </View>
    ), [isMall, isInternational, priceDisplay.shopVoucherDiscount, priceDisplay.platformVoucherDiscount, theme.colors.success, t]);

    return (
        <View style={styles.container}>
            {/* Flash Sale Banner - Full Width */}
            {flashSale?.isActive && (
                <ProductFlashSaleBar
                    flashSale={flashSale}
                    onExpired={onFlashSaleExpired}
                />
            )}

            {/* Padded Content Section */}
            <View style={styles.contentContainer}>
                {/* Price Section */}
                <PriceSection
                    priceDisplay={priceDisplay}
                    onPress={onShowPriceBreakdown}
                />

                {/* Badges Row */}
                <View style={styles.badgesWrapper}>
                    {badgesContent}
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <StatsRow
                        rating={rating}
                        totalReviews={totalReviews}
                        totalSold={totalSold}
                    />
                </View>

                <Text style={styles.title} numberOfLines={3}>
                    {name}
                </Text>
            </View>
        </View>
    );
});

ProductInfoSection.displayName = 'ProductInfoSection';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingBottom: theme.margins.sm,
    },
    contentContainer: {
        paddingHorizontal: theme.margins.sm,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        marginBottom: 2,
    },
    priceMainRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        flex: 1,
    },
    currentPrice: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: 14,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    discountBadgeContainer: {
        borderRadius: 6,
        overflow: 'hidden',
    },
    discountBadgeGradient: {
        borderRadius: 6,
    },
    discountBadgeBlur: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    infoIconWrapper: {
        padding: 4,
        opacity: 0.5,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    premiumBadgeContainer: {
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    premiumBadgeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgesWrapper: {
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: theme.margins.sm,
    },
    mallText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    internationalText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    voucherBadge: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: theme.colors.success,
    },
    voucherText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.success,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statDivider: {
        width: 1,
        height: 14,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.smd,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
    },
}));

export default ProductInfoSection;
