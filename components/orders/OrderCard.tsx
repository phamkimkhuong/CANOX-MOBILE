/**
 * ==============================================
 * ORDER CARD - Organism Component
 * ==============================================
 * Wrapper chính chứa toàn bộ thông tin đơn hàng
 * Kết hợp: ShopHeader + ProductPreview + PriceSummary + ActionButtons
 */

import { OrderAction, OrderUI } from '@/types/order/order';
import { hasTracking } from '@/utils/adapter/order/orderActions';
import React from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { OrderActionButtons } from './OrderActionButtons';
import { OrderPriceSummary } from './OrderPriceSummary';
import { OrderShopHeader } from './OrderShopHeader';
import { ProductPreviewList } from './ProductPreviewList';
import { TrackingInfoSnippet } from './TrackingInfoSnippet';

interface OrderCardProps {
    order: OrderUI;
    onPress?: (orderId: string) => void;
    onShopPress?: (shopId: string) => void;
    onAction?: (action: OrderAction['action'], order: OrderUI) => void;
    onTrackingPress?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onPress,
    onShopPress,
    onAction,
    onTrackingPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handlePress = () => {
        onPress?.(order.orderId);
    };

    const handleShopPress = () => {
        onShopPress?.(order.shopId);
    };

    const handleAction = (action: OrderAction['action'], order: OrderUI) => {
        onAction?.(action, order);
    };

    const handleTrackingPress = () => {
        onTrackingPress?.(order.orderId);
    };

    // Hiển thị tracking cho các status đang vận chuyển
    const showTracking = hasTracking(order) && [
        'FULFILLING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
    ].includes(order.status);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
        >
            {/* 1. Shop Header + Status */}
            <OrderShopHeader
                shopInfo={order._raw.shopInfo}
                status={order.status}
                onShopPress={handleShopPress}
            />

            {/* 2. Tracking Info (if available) */}
            {showTracking && (
                <TrackingInfoSnippet
                    order={order}
                    onPress={handleTrackingPress}
                />
            )}

            {/* 3. Product Preview List */}
            <ProductPreviewList
                items={order.items}
                maxDisplay={1}
            />

            {/* 4. Price Summary */}
            <OrderPriceSummary
                grandTotal={order.grandTotal}
                itemCount={order.itemCount}
                totalQuantity={order.totalQuantity}
            />

            {/* 5. Action Buttons */}
            <OrderActionButtons
                order={order}
                onAction={handleAction}
            />
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.95,
        transform: [{ scale: 0.995 }],
    },
}));
