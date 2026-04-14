/**
 * ==============================================
 * ORDER CARD - Organism Component
 * ==============================================
 * Wrapper chính chứa toàn bộ thông tin đơn hàng
 * Kết hợp: ShopHeader + ProductPreview + PriceSummary + ActionButtons
 */

import { OrderAction, OrderUI } from '@/types/order/order';
import { hasTracking } from '@/utils/adapter/order/orderActions';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { OrderActionButtons } from './OrderActionButtons';
import { OrderPriceSummary } from './OrderPriceSummary';
import { OrderShopHeader } from './OrderShopHeader';
import { ProductPreviewList } from './ProductPreviewList';
import { TrackingInfoSnippet } from './TrackingInfoSnippet';

interface OrderCardProps {
    order: OrderUI;
    containerStyle?: StyleProp<ViewStyle>;
    onPress?: (orderId: string) => void;
    onPressIn?: (orderId: string) => void;
    onShopPress?: (shopId: string) => void;
    onAction?: (action: OrderAction['action'], order: OrderUI) => void;
    onTrackingPress?: (orderId: string) => void;
}

export const OrderCard = memo<OrderCardProps>(({
    order,
    containerStyle,
    onPress,
    onPressIn,
    onShopPress,
    onAction,
    onTrackingPress,
}) => {
    const styles = stylesheet;
    const { t } = useTranslation('order');

    const handlePress = useCallback(() => {
        onPress?.(order.orderId);
    }, [onPress, order.orderId]);

    const handlePressIn = useCallback(() => {
        onPressIn?.(order.orderId);
    }, [onPressIn, order.orderId]);

    const handleShopPress = useCallback(() => {
        if (order.shopId) {
            onShopPress?.(order.shopId);
        }
    }, [onShopPress, order.shopId]);

    const handleAction = useCallback((action: OrderAction['action'], order: OrderUI) => {
        onAction?.(action, order);
    }, [onAction]);

    const handleTrackingPress = useCallback(() => {
        onTrackingPress?.(order.orderId);
    }, [onTrackingPress, order.orderId]);

    // Hiển thị tracking cho các status đang vận chuyển
    const showTracking = hasTracking(order) && [
        'FULFILLING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'RETURN_APPROVED',
        'RETURNING',
    ].includes(order.status);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                containerStyle,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            delayLongPress={200}
            pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
            unstable_pressDelay={0}
        >
            {/* 1. Shop Header + Status */}
            <OrderShopHeader
                shopName={order.shopName}
                shopLogoUrl={order.shopLogoUrl}
                status={order.status}
                statusRaw={order.statusRaw}
                metaText={order.formattedPlacedAt ? t('list.placedAt', { time: order.formattedPlacedAt }) : undefined}
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
                currency={order.currency}
                maxDisplay={1}
            />

            {/* 4. Price Summary */}
            <OrderPriceSummary
                grandTotal={order.grandTotal}
                itemCount={order.itemCount}
                totalQuantity={order.totalQuantity}
                currency={order.currency}
            />

            {/* 5. Action Buttons */}
            <OrderActionButtons
                order={order}
                onAction={handleAction}
            />
        </Pressable>
    );
});

OrderCard.displayName = 'OrderCard';

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
        opacity: 0.92,
    },
}));
