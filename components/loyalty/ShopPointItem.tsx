/**
 * ShopPointItem - Shop-scoped loyalty point row.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopPointSummaryUI } from '@/types/loyalty/ui';
import { toSizedImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopPointItemProps {
    shop: ShopPointSummaryUI;
    index: number;
    onPress: (shopId: string, shopName?: string, shopLogo?: string) => void;
}

export const ShopPointItem: React.FC<ShopPointItemProps> = memo(({ shop, index, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');
    const logoUrl = toSizedImageUrl(shop.shopLogo, null, 'thumb') ?? shop.shopLogo;

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(200 + index * 80)}>
            <Pressable
                style={({ pressed }) => [styles.shopItem, pressed && styles.shopItemPressed]}
                onPress={() => onPress(shop.shopId, shop.shopName, shop.shopLogo)}
            >
                <View style={styles.shopAvatar}>
                    {shop.shopLogo ? (
                        <Image
                            source={{ uri: logoUrl }}
                            style={styles.shopAvatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <IconSymbol name="storefront" size={26} color={theme.colors.sunsetOrange} />
                    )}
                </View>

                <View style={styles.shopInfo}>
                    <Text style={styles.shopName} numberOfLines={1}>
                        {shop.shopName}
                    </Text>
                    <View style={styles.pointRow}>
                        <Text style={styles.shopPoints}>
                            {shop.totalPoints.toLocaleString('vi-VN')} {t('overviewDashboard.shopPoints.unit')}
                        </Text>
                        <View style={styles.scopeBadge}>
                            <Text style={styles.scopeBadgeText}>{t('overviewDashboard.shopPoints.shopOnlyBadge')}</Text>
                        </View>
                    </View>
                    {shop.expiryWarning ? (
                        <View style={styles.expiryRow}>
                            <IconSymbol name="time" size={14} color={theme.colors.typographySecondary} />
                            <Text style={styles.expiryText} numberOfLines={1}>
                                {shop.expiryWarning}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <IconSymbol name="chevron-right" size={20} color={theme.colors.inkBlack} />
            </Pressable>
        </Animated.View>
    );
});

ShopPointItem.displayName = 'ShopPointItem';

const stylesheet = StyleSheet.create((theme) => ({
    shopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        marginBottom: theme.margins.sm,
        shadowColor: theme.colors.inkBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 0.5,
    },
    shopItemPressed: {
        opacity: 0.86,
    },
    shopAvatar: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.warningSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: theme.margins.md,
    },
    shopAvatarImage: {
        width: 50,
        height: 50,
    },
    shopInfo: {
        flex: 1,
        gap: theme.margins.xs,
    },
    shopName: {
        fontSize: theme.fontSizes.md,
        lineHeight: 20,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        flexWrap: 'wrap',
    },
    shopPoints: {
        lineHeight: 20,
        fontWeight: '800',
        color: theme.colors.buttonActive,
    },
    scopeBadge: {
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        backgroundColor: theme.colors.warningSubtle,
        borderRadius: theme.radius.l,
        paddingHorizontal: theme.margins.sm,
    },
    scopeBadgeText: {
        fontSize: theme.fontSizes.xsm,
        lineHeight: 14,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.sunsetOrange,
    },
    expiryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
    },
    expiryText: {
        flex: 1,
        fontSize: theme.fontSizes.sm,
        lineHeight: 16,
        color: theme.colors.typographySecondary,
    },
}));
