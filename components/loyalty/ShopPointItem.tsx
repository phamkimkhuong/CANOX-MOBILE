/**
 * ShopPointItem - Hiển thị xu tích lũy từng shop
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopPointSummaryUI } from '@/types/loyalty/ui';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopPointItemProps {
    shop: ShopPointSummaryUI;
    index: number;
    onPress: (shopId: string) => void;
}

export const ShopPointItem: React.FC<ShopPointItemProps> = memo(({ shop, index, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(200 + index * 80)}>
            <Pressable
                style={({ pressed }) => [styles.shopItem, pressed && styles.shopItemPressed]}
                onPress={() => onPress(shop.shopId)}
            >
                {/* Shop Avatar */}
                <View style={styles.shopAvatar}>
                    {shop.shopLogo ? (
                        <Image
                            source={{ uri: shop.shopLogo }}
                            style={styles.shopAvatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <IconSymbol name="storefront" size={24} color={theme.colors.secondary} />
                    )}
                </View>

                {/* Shop Info */}
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName} numberOfLines={1}>
                        {shop.shopName}
                    </Text>
                    {shop.expiryWarning && (
                        <View style={styles.expiryBadge}>
                            <IconSymbol name="time" size={12} color={theme.colors.warning} />
                            <Text style={styles.expiryText}>{shop.expiryWarning}</Text>
                        </View>
                    )}
                </View>

                {/* Points */}
                <View style={styles.shopPointsContainer}>
                    <Text style={styles.shopPoints}>
                        {shop.totalPoints.toLocaleString('vi-VN')}
                    </Text>
                </View>

                <IconSymbol name="chevron-right" size={18} color={theme.colors.secondary} />
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: theme.margins.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    shopItemPressed: {
        opacity: 0.85,
    },
    shopAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    shopAvatarImage: {
        width: 44,
        height: 44,
    },
    shopInfo: {
        flex: 1,
        marginLeft: 12,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    expiryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    expiryText: {
        fontSize: 11,
        color: theme.colors.warning,
        fontWeight: '500',
    },
    shopPointsContainer: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    shopPoints: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
}));
