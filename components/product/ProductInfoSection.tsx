import type { FlashSaleInfo, PriceDisplay } from '@/types/productDetail';
import { formatCurrency } from '@/utils/adapter/productDetailAdapter';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { ProductFlashSaleBar } from './ProductFlashSaleBar';

// ============================================
// TYPES
// ============================================

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
}

// ============================================
// HELPER FUNCTIONS - Đặt ngoài component
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
// SUB-COMPONENTS - Tách riêng để optimize re-render
// ============================================

/**
 * PriceSection - Hiển thị giá
 * Memo riêng vì chỉ phụ thuộc priceDisplay
 */
const PriceSection = memo<{ priceDisplay: PriceDisplay }>(({ priceDisplay }) => {
    // Memoize price rendering để tránh re-calculate mỗi render
    const priceContent = useMemo(() => {
        if (priceDisplay.isRange && priceDisplay.priceRange) {
            return (
                <View style={styles.priceContainer}>
                    <Text style={styles.priceRange}>
                        {formatCurrency(priceDisplay.priceRange.min)} - {formatCurrency(priceDisplay.priceRange.max)}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>
                    {formatCurrency(priceDisplay.currentPrice)}
                </Text>
                {priceDisplay.originalPrice && (
                    <Text style={styles.originalPrice}>
                        {formatCurrency(priceDisplay.originalPrice)}
                    </Text>
                )}
                {priceDisplay.discountPercentage && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            -{priceDisplay.discountPercentage}%
                        </Text>
                    </View>
                )}
            </View>
        );
    }, [priceDisplay]);

    return priceContent;
});

PriceSection.displayName = 'PriceSection';

/**
 * StatsRow - Hiển thị rating, reviews, sold count
 * Memo riêng vì ít khi thay đổi
 */
const StatsRow = memo<{
    rating: number;
    totalReviews: number;
    totalSold: number;
}>(({ rating, totalReviews, totalSold }) => {
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
            </View>

            <View style={styles.statDivider} />

            {/* Reviews */}
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Đánh giá</Text>
                <Text style={styles.statValue}>{formattedReviews}</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Sold */}
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Đã bán</Text>
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
 * 
 * Performance Optimizations:
 * 1. React.memo - tránh re-render khi parent thay đổi (timer FlashSale)
 * 2. Tách PriceSection, StatsRow thành sub-components với memo riêng
 * 3. useMemo cho badges rendering
 * 4. ProductFlashSaleBar đã được memo sẵn
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
}) => {
    const { theme } = useUnistyles();

    // ============================================
    // MEMOIZED BADGES - Tránh tạo JSX mới mỗi render
    // ============================================
    
    const badgesContent = useMemo(() => (
        <View style={styles.badgeRow}>
            {isMall && (
                <View style={[styles.badge, styles.mallBadge]}>
                    <Text style={styles.mallText}>Mall</Text>
                </View>
            )}
            {isInternational && (
                <View style={[styles.badge, styles.internationalBadge]}>
                    <IconSymbol name="public" size={12} color={theme.colors.primary} />
                    <Text style={styles.internationalText}>Quốc tế</Text>
                </View>
            )}
            {priceDisplay.voucherDiscount && (
                <View style={[styles.badge, styles.voucherBadge]}>
                    <IconSymbol name="confirmation-number" size={12} color={theme.colors.success} />
                    <Text style={styles.voucherText}>
                        Giảm {formatCurrency(priceDisplay.voucherDiscount)}
                    </Text>
                </View>
            )}
        </View>
    ), [isMall, isInternational, priceDisplay.voucherDiscount, theme.colors.primary, theme.colors.success]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Flash Sale Banner - Đã được memo, sẽ tự quản lý countdown */}
            {flashSale?.isActive && (
                <ProductFlashSaleBar
                    flashSale={flashSale}
                    onExpired={onFlashSaleExpired}
                />
            )}

            {/* Price Section - Memo riêng */}
            <PriceSection priceDisplay={priceDisplay} />

            {/* Badges */}
            {badgesContent}

            {/* Title */}
            <Text style={styles.title} numberOfLines={3}>
                {name}
            </Text>

            {/* Stats Row - Memo riêng */}
            <StatsRow
                rating={rating}
                totalReviews={totalReviews}
                totalSold={totalSold}
            />
        </View>
    );
});

ProductInfoSection.displayName = 'ProductInfoSection';

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        marginBottom: theme.margins.sm,
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.error,
    },
    priceRange: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: 14,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.error,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        marginBottom: theme.margins.smd,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    mallBadge: {
        backgroundColor: '#E53935',
    },
    mallText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.surface,
    },
    internationalBadge: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    internationalText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.primary,
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
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 22,
        marginBottom: theme.margins.smd,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
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
