/**
 * ==============================================
 * ORDER LIST TAB - Generic Tab Screen
 * ==============================================
 * Component màn hình chung cho mỗi tab
 * Nhận props: status để fetch đơn hàng theo trạng thái
 * Sử dụng FlashList để render danh sách với performance cao
 */

import { flattenOrders, useOrderList } from '@/hooks/api/useOrders';
import { Order, OrderAction, OrderTabStatus } from '@/types/order/order';
import { logger } from '@/utils/logger';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { EmptyOrderState } from './EmptyOrderState';
import { OrderCard } from './OrderCard';
import { OrderListSkeleton } from './OrderCardSkeleton';

interface OrderListTabProps {
    status: OrderTabStatus;
}

export const OrderListTab: React.FC<OrderListTabProps> = ({ status }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    // Fetch orders với useInfiniteQuery
    const {
        data,
        isLoading,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useOrderList(status);

    // Flatten pages thành array orders
    const orders = flattenOrders(data);

    // Handlers
    const handleOrderPress = useCallback((orderId: string) => {
        router.push({
            pathname: '/(main)/(order)/order/[id]',
            params: { id: orderId },
        });
    }, [router]);

    const handleShopPress = useCallback((shopId: string) => {
        // Navigate to shop page
        router.push({
            pathname: '/(main)/(shop)/shop/[id]',
            params: { id: shopId },
        });
    }, [router]);

    const handleAction = useCallback((action: OrderAction['action'], orderId: string) => {
        switch (action) {
            case 'cancel':
                // TODO: Show confirmation modal then call cancel API
                logger.orders.info('Cancel order:', orderId);
                break;
            case 'track':
                // TODO: Navigate to tracking screen
                router.push({
                    pathname: '/(main)/(order)/order/[id]',
                    params: { id: orderId },
                });
                break;
            case 'received':
                // TODO: Call confirm received API
                logger.orders.info('Confirm received:', orderId);
                break;
            case 'review':
                // TODO: Navigate to review screen
                logger.orders.info('Review order:', orderId);
                break;
            case 'return':
                // TODO: Navigate to return request screen
                logger.orders.info('Return request:', orderId);
                break;
            case 'rebuy':
                // TODO: Add items to cart
                logger.orders.info('Rebuy order:', orderId);
                break;
            case 'contact':
                // TODO: Open chat with shop
                logger.orders.info('Contact shop for order:', orderId);
                break;
            case 'pay':
                // TODO: Navigate to payment
                logger.orders.info('Pay for order:', orderId);
                break;
            default:
                break;
        }
    }, [router]);

    const handleTrackingPress = useCallback((orderId: string) => {
        router.push({
            pathname: '/(main)/(order)/order/[id]',
            params: { id: orderId },
        });
    }, [router]);

    const handleShopNow = useCallback(() => {
        router.push('/(tabs)');
    }, [router]);

    // Load more khi scroll đến cuối
    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Render item
    const renderItem: ListRenderItem<Order> = useCallback(({ item }) => (
        <OrderCard
            order={item}
            onPress={handleOrderPress}
            onShopPress={handleShopPress}
            onAction={handleAction}
            onTrackingPress={handleTrackingPress}
        />
    ), [handleOrderPress, handleShopPress, handleAction, handleTrackingPress]);

    // Key extractor
    const keyExtractor = useCallback((item: Order) => item.orderId, []);

    // Loading state
    if (isLoading) {
        return <OrderListSkeleton count={3} />;
    }

    // Empty state
    if (orders.length === 0) {
        return (
            <EmptyOrderState
                status={status}
                onShopNow={handleShopNow}
            />
        );
    }

    return (
        <View style={styles.container}>
            <FlashList<Order>
                data={orders}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={refetch}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.footer}>
                            <ActivityIndicator color={theme.colors.primary} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.xl,
    },
    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
}));
