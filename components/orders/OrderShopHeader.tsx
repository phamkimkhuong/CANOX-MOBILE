/**
 * ==============================================
 * ORDER SHOP HEADER - Hiển thị thông tin Shop
 * ==============================================
 * Hiển thị: Logo + Tên Shop (Left) | Trạng thái đơn hàng (Right)
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { OrderStatus } from '@/types/order/order';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderShopHeaderProps {
    shopName: string;
    shopLogoUrl?: string | null;
    status: OrderStatus;
    metaText?: string;
    onShopPress?: () => void;
}

export const OrderShopHeader: React.FC<OrderShopHeaderProps> = ({
    shopName,
    shopLogoUrl,
    status,
    metaText,
    onShopPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const statusDisplay = getStatusDisplay(status);

    return (
        <View style={styles.container}>
            {/* Left: Shop Info */}
            <Pressable style={styles.shopInfo} onPress={onShopPress}>
                <View style={styles.logoWrapper}>
                    {shopLogoUrl ? (
                        <Image
                            source={{ uri: shopLogoUrl }}
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
                <View style={styles.textContent}>
                    <Text style={styles.shopName} numberOfLines={1}>
                        {shopName}
                    </Text>
                    {metaText ? (
                        <Text style={styles.metaText} numberOfLines={1}>
                            {metaText}
                        </Text>
                    ) : null}
                </View>
                <IconSymbol
                    name="chevron-right"
                    size={16}
                    color={theme.colors.typographySecondary}
                />
            </Pressable>

            {/* Right: Status Badge */}
            <View style={[
                styles.statusBadge,
                styles.dynamicStatusBadge(statusDisplay.bgColor, (status !== 'FULFILLING' && status !== 'DELIVERED') ? 4 : 0)
            ]}>
                {status !== 'FULFILLING' && status !== 'DELIVERED' && (
                    <IconSymbol
                        name={statusDisplay.icon as IconSymbolName}
                        size={14}
                        color={statusDisplay.color}
                    />
                )}
                <Text style={[styles.statusText, styles.dynamicStatusColor(statusDisplay.color)]}>
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
    textContent: {
        flex: 1,
        marginLeft: theme.margins.sm,
        minWidth: 0,
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
    },
    metaText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.m,
    },
    dynamicStatusBadge: (backgroundColor: string, gap: number) => ({
        backgroundColor,
        gap,
    }),
    dynamicStatusColor: (color: string) => ({
        color,
    }),
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
}));
