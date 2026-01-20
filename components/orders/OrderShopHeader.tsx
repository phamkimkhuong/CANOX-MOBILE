/**
 * ==============================================
 * ORDER SHOP HEADER - Hiển thị thông tin Shop
 * ==============================================
 * Hiển thị: Logo + Tên Shop (Left) | Trạng thái đơn hàng (Right)
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { OrderShopInfo, OrderStatus } from '@/types/order/order';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { toPublicUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderShopHeaderProps {
    shopInfo: OrderShopInfo | null;
    status: OrderStatus;
    onShopPress?: () => void;
}

export const OrderShopHeader: React.FC<OrderShopHeaderProps> = ({
    shopInfo,
    status,
    onShopPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (!shopInfo) return null;
    const statusDisplay = getStatusDisplay(status);

    return (
        <View style={styles.container}>
            {/* Left: Shop Info */}
            <Pressable style={styles.shopInfo} onPress={onShopPress}>
                <View style={styles.logoWrapper}>
                    {shopInfo.logoUrl ? (
                        <Image
                            source={{ uri: toPublicUrl(shopInfo.logoUrl) }}
                            style={styles.logo}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <IconSymbol
                            name="store"
                            size={18}
                            color={theme.colors.primary}
                        />
                    )}
                </View>
                <Text style={styles.shopName} numberOfLines={1}>
                    {shopInfo.shopName}
                </Text>
                <IconSymbol
                    name="chevron-right"
                    size={16}
                    color={theme.colors.typographySecondary}
                />
            </Pressable>

            {/* Right: Status Badge */}
            <View style={[
                styles.statusBadge,
                {
                    backgroundColor: statusDisplay.bgColor,
                    gap: (status !== 'FULFILLING' && status !== 'DELIVERED') ? 4 : 0,
                }
            ]}>
                {status !== 'FULFILLING' && status !== 'DELIVERED' && (
                    <IconSymbol
                        name={statusDisplay.icon as IconSymbolName}
                        size={14}
                        color={statusDisplay.color}
                    />
                )}
                <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                    {statusDisplay.label}
                </Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.margins.sm,
        gap: 4,
    },
    logoWrapper: {
        width: 28,
        height: 28,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundSurface,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: 28,
        height: 28,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginLeft: theme.margins.sm,
        maxWidth: 150,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.m,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
}));
