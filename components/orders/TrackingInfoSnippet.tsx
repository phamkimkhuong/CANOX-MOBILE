/**
 * ==============================================
 * TRACKING INFO SNIPPET - Thông tin vận chuyển
 * ==============================================
 * Hiển thị khi đơn hàng đang giao (có tracking)
 */

import { IconSymbol } from '@/components/ui/Icon';
import { Order } from '@/types/order/order';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface TrackingInfoSnippetProps {
    order: Order;
    onPress?: () => void;
}

export const TrackingInfoSnippet: React.FC<TrackingInfoSnippetProps> = ({
    order,
    onPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Chỉ hiển thị nếu có tracking number
    if (!order.trackingNumber) return null;

    // Map carrier sang tên hiển thị
    const carrierName: Record<string, string> = {
        GHN: 'Giao Hàng Nhanh',
        SUPERSHIP: 'SuperShip',
        GHTK: 'Giao Hàng Tiết Kiệm',
        VIETTEL_POST: 'Viettel Post',
    };

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name="truck-fast"
                    size={18}
                    color={theme.colors.success}
                />
            </View>
            <View style={styles.infoWrapper}>
                <Text style={styles.statusText}>
                    Đang vận chuyển bởi {order.carrier ? carrierName[order.carrier] || order.carrier : 'Đơn vị vận chuyển'}
                </Text>
                <Text style={styles.trackingText}>
                    Mã vận đơn: {order.trackingNumber}
                </Text>
            </View>
            <IconSymbol
                name="chevron-right"
                size={16}
                color={theme.colors.typographySecondary}
            />
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        gap: theme.margins.sm,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoWrapper: {
        flex: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
    },
    trackingText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
}));
