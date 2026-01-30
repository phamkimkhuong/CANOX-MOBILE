import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { shopRoutes } from '@/constants/routes';
import type { ShopUI } from '@/types/product/productDetail';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { SmartNavButton } from '../ui/navigation/SmartNavButton';

const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface ShopInfoCardProps {
    shop: ShopUI;
    onViewShopPress?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatResponseTime = (time?: string): string => {
    if (!time) return PRODUCT_STRINGS.shop.defaultResponseTime;
    return time;
};

const formatCount = (count?: number): string => {
    if (!count) return '0';
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

// ============================================
// MAIN COMPONENT - Memoized
// ============================================

/**
 */
export const ShopInfoCard = memo<ShopInfoCardProps>(({
    shop,
    onViewShopPress,
}) => {
    const { theme } = useUnistyles();

    // Memoize handleViewShop để tránh tạo function mới mỗi render
    const handleViewShop = useCallback(() => {
        if (onViewShopPress) {
            onViewShopPress();
        } else {
            Navigator.push(shopRoutes.detail(shop.id));
        }
    }, [onViewShopPress, shop.id]);

    // Memoize formatted values
    const formattedRating = useMemo(() =>
        shop.rating?.toFixed(1) ?? '-',
        [shop.rating]
    );

    const formattedResponseRate = useMemo(() =>
        shop.responseRate ? `${shop.responseRate}%` : '-',
        [shop.responseRate]
    );

    const formattedResponseTime = useMemo(() =>
        formatResponseTime(shop.responseTime),
        [shop.responseTime]
    );

    const formattedProductCount = useMemo(() =>
        formatCount(shop.productCount),
        [shop.productCount]
    );

    return (
        <View style={styles.container}>
            {/* Shop Header */}
            <View style={styles.header}>
                {/* Avatar */}
                <Pressable onPress={handleViewShop}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: shop.avatar ?? undefined }}
                            style={styles.avatar}
                            contentFit="cover"
                            placeholder={IMAGE_PLACEHOLDER}
                            cachePolicy="memory-disk"
                            recyclingKey={`shop-avatar-${shop.id}`}
                        />
                        {shop.isVerified && (
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
                            {shop.shopName}
                        </Text>
                    </Pressable>
                    {shop.location && (
                        <View style={styles.locationRow}>
                            <IconSymbol
                                name="location-outline"
                                size={14}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.location} numberOfLines={1}>
                                {shop.location}
                            </Text>
                        </View>
                    )}
                    {shop.lastOnline && (
                        <Text style={styles.onlineStatus}>
                            {PRODUCT_STRINGS.shop.online} {shop.lastOnline}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <SmartNavButton
                        route={onViewShopPress ? undefined : shopRoutes.detail(shop.id)}
                        onPress={handleViewShop}
                        style={styles.viewShopButton}
                    >
                        {({ pressed }) => (
                            <View style={[styles.viewShopInner, pressed && styles.pressedOpacity]}>
                                <IconSymbol
                                    name="storefront-outline"
                                    size={18}
                                    color={theme.colors.newPrimary}
                                />
                                <Text style={styles.viewShopText}>{PRODUCT_STRINGS.shop.viewShop}</Text>
                            </View>
                        )}
                    </SmartNavButton>
                </View>
            </View>

            {/* Stats Row - Sử dụng memoized values */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedRating}</Text>
                    <Text style={styles.statLabel}>{PRODUCT_STRINGS.shop.rating}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedResponseRate}</Text>
                    <Text style={styles.statLabel}>{PRODUCT_STRINGS.shop.responseRate}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedResponseTime}</Text>
                    <Text style={styles.statLabel}>{PRODUCT_STRINGS.shop.responseTime}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formattedProductCount}</Text>
                    <Text style={styles.statLabel}>{PRODUCT_STRINGS.shop.products}</Text>
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
        gap: 4,
        paddingHorizontal: 12,
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
