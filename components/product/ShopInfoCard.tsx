import { shopRoutes } from '@/constants/routes';
import type { ShopUI } from '@/types/product/productDetail';
import type { ShopHeaderUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { SmartNavButton } from '../ui/navigation/SmartNavButton';

const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
const METRIC_PENDING_PLACEHOLDER = '-';

interface ShopInfoCardProps {
    shop: ShopUI;
    publicShop?: ShopHeaderUI | null;
    onViewShopPress?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCount = (count: number): string => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

const formatMetricCount = (count: number | null | undefined): string => {
    return typeof count === 'number' ? formatCount(count) : '-';
};

// ============================================
// MAIN COMPONENT - Memoized
// ============================================

/**
 */
export const ShopInfoCard = memo<ShopInfoCardProps>(({
    shop,
    publicShop,
    onViewShopPress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');

    const displayShopId = publicShop?.id || shop.id;
    const displayShopName = publicShop?.name || shop.shopName;
    const displayAvatar = publicShop?.logoUrl || shop.avatar;
    const displayLocation = publicShop?.location || shop.location;
    const isVerified = publicShop?.isVerified ?? shop.isVerified;
    const publicStats = publicShop?.stats;

    // Memoize handleViewShop để tránh tạo function mới mỗi render
    const handleViewShop = useCallback(() => {
        if (onViewShopPress) {
            onViewShopPress();
        } else {
            Navigator.push(shopRoutes.detail(displayShopId));
        }
    }, [onViewShopPress, displayShopId]);

    // Memoize formatted values
    const ratingMetric = useMemo(() => {
        const rating = publicStats?.rating;
        const reviewCount = publicStats?.reviewCount;
        const hasRating = typeof rating === 'number'
            && rating > 0
            && (reviewCount == null || reviewCount > 0);

        if (!publicStats) {
            return { value: METRIC_PENDING_PLACEHOLDER, isEmpty: true };
        }

        return hasRating
            ? { value: rating.toFixed(1), isEmpty: false }
            : { value: t('shop.notAvailable'), isEmpty: true };
    }, [publicStats, t]);

    const completedOrdersMetric = useMemo(() => {
        const completedOrders = publicStats?.completedOrders;
        const hasCompletedOrders = typeof completedOrders === 'number' && completedOrders > 0;

        if (!publicStats) {
            return { value: METRIC_PENDING_PLACEHOLDER, isEmpty: true };
        }

        return hasCompletedOrders
            ? { value: formatCount(completedOrders), isEmpty: false }
            : { value: t('shop.notAvailable'), isEmpty: true };
    }, [publicStats, t]);

    const formattedJoinedDuration = useMemo(() => {
        const shopAgeDays = publicStats?.shopAgeDays;
        if (typeof shopAgeDays !== 'number') return '-';

        if (shopAgeDays < 30) {
            return t('shop.durationDays', { count: Math.max(1, Math.round(shopAgeDays)) });
        }

        if (shopAgeDays < 365) {
            return t('shop.durationMonths', { count: Math.max(1, Math.round(shopAgeDays / 30)) });
        }

        return t('shop.durationYears', { count: Math.max(1, Math.round(shopAgeDays / 365)) });
    }, [publicStats?.shopAgeDays, t]);

    const formattedProductCount = useMemo(() =>
        formatMetricCount(publicStats?.productCount),
        [publicStats?.productCount]
    );

    return (
        <View style={styles.container}>
            {/* Shop Header */}
            <View style={styles.header}>
                {/* Avatar */}
                <Pressable onPress={handleViewShop}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: displayAvatar ?? undefined }}
                            style={styles.avatar}
                            contentFit="cover"
                            placeholder={IMAGE_PLACEHOLDER}
                            cachePolicy="memory-disk"
                            recyclingKey={`shop-avatar-${displayShopId}`}
                        />
                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <IconSymbol
                                    name="verified-user"
                                    size={12}
                                    color={theme.colors.newPrimary}
                                />
                            </View>
                        )}
                    </View>
                </Pressable>

                {/* Shop Info */}
                <View style={styles.info}>
                    <Pressable onPress={handleViewShop}>
                        <Text
                            style={styles.shopName}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {displayShopName}
                        </Text>
                    </Pressable>
                    {displayLocation && (
                        <View style={styles.locationRow}>
                            <IconSymbol
                                name="location-outline"
                                size={14}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.location} numberOfLines={1}>
                                {displayLocation}
                            </Text>
                        </View>
                    )}
                    {shop.lastOnline && (
                        <Text style={styles.onlineStatus}>
                            {t('shop.online')} {shop.lastOnline}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <SmartNavButton
                        route={onViewShopPress ? undefined : shopRoutes.detail(displayShopId)}
                        onPress={handleViewShop}
                        style={styles.viewShopButton}
                    >
                        {({ pressed }) => (
                            <View style={[styles.viewShopInner, pressed && styles.pressedOpacity]}>
                                <Text style={styles.viewShopText}>{t('shop.viewShop')}</Text>
                            </View>
                        )}
                    </SmartNavButton>
                </View>
            </View>

            {/* Stats Row - Sử dụng memoized values */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, ratingMetric.isEmpty && styles.statValueMuted]}>
                        {ratingMetric.value}
                    </Text>
                    <Text style={styles.statLabel}>{t('shop.rating')}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, completedOrdersMetric.isEmpty && styles.statValueMuted]}>
                        {completedOrdersMetric.value}
                    </Text>
                    <Text style={styles.statLabel}>{t('shop.completedOrders')}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedJoinedDuration}</Text>
                    <Text style={styles.statLabel}>{t('shop.joined')}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedProductCount}</Text>
                    <Text style={styles.statLabel}>{t('shop.products')}</Text>
                </View>
            </View>
        </View>
    );
});

ShopInfoCard.displayName = 'ShopInfoCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
        paddingVertical: theme.margins.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
        marginBottom: theme.margins.sm,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.background,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.newPrimary,
    },
    info: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    shopName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 20,
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        flex: 1,
    },
    onlineStatus: {
        fontSize: 11,
        color: theme.colors.success,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: theme.margins.sm,
    },
    viewShopButton: {
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.newPrimary,
        overflow: 'hidden',
    },
    viewShopInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    viewShopText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.newPrimary,
    },
    pressedOpacity: {
        opacity: 0.7,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.newPrimary,
    },
    statValueMuted: {
        color: theme.colors.typographySecondary,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
    },
}));

export default ShopInfoCard;
