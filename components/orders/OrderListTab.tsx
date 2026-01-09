/**
 * ==============================================
 * ORDER LIST TAB - Generic Tab Screen
 * ==============================================
 * Component màn hình chung cho mỗi tab
 * Nhận props: status để fetch đơn hàng theo trạng thái
 * Sử dụng FlashList để render danh sách với performance cao
 */

import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { chatRoutes, orderRoutes } from '@/constants/routes';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { flattenOrders, useOrderList, useRefreshOrderList } from '@/hooks/api/order/useOrders';
import { useAuthStore } from '@/store/useAuthStore';
import { OrderAction, OrderTabStatus, OrderUI } from '@/types/order/order';
import { logger } from '@/utils/logger';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import Toast from 'react-native-toast-message';
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
    const myShopId = useAuthStore((s) => s.shopId);
    const prefetchChat = usePrefetchShopChat();

    // Fetch orders với useInfiniteQuery
    const {
        data,
        isLoading,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useOrderList(status);

    // Smart refresh: Reset to page 0 only (not refetch ALL loaded pages)
    const { refresh: smartRefresh } = useRefreshOrderList(status);

    // Flatten pages thành array orders
    const orders = flattenOrders(data);

    // Handlers
    const handleOrderPress = useCallback((orderId: string) => {
        router.push(orderRoutes.detail(orderId));
    }, [router]);

    const handleShopPress = useCallback((shopId: string) => {
        // Navigate to shop page
        router.push({
            pathname: '/(main)/(shop)/shop/[id]',
            params: { id: shopId },
        });
    }, [router]);

    const handleAction = useCallback((action: OrderAction['action'], order: OrderUI) => {
        const orderId = order.orderId;

        switch (action) {
            case 'cancel':
                router.push(orderRoutes.cancel(orderId));
                break;
            case 'track':
                router.push(orderRoutes.detail(orderId));
                break;
            case 'received':
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
            case 'contact': {
                const shopUserId = order._raw.shopInfo.userId;
                const shopName = order.shopName;
                const shopLogoUrl = order.shopLogoUrl;

                if (!shopUserId || !shopName) {
                    logger.orders.warn('Missing shop info for chat');
                    return;
                }

                if (order.shopId === myShopId) {
                    Toast.show({
                        type: 'info',
                        text1: CHAT_STRINGS.error.chatWithSelf,
                        text2: 'Bạn đang ở trong shop của chính mình',
                    });
                    return;
                }

                // Prefetch logic (on press)
                prefetchChat(shopUserId, shopName, shopLogoUrl, order.shopId);

                // Instant Navigation Logic (Ghost ID)
                const cachedId = getCachedConversationId(shopUserId);
                router.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
                    partnerName: shopName,
                    partnerAvatar: shopLogoUrl,
                    shopUserId: shopUserId,
                    shopId: order.shopId,
                }));

                logger.orders.info('Contact shop for order:', orderId);
                break;
            }
            case 'pay':
                // TODO: Navigate to payment
                logger.orders.info('Pay for order:', orderId);
                break;
            default:
                break;
        }
    }, [router, prefetchChat]);

    const handleTrackingPress = useCallback((orderId: string) => {
        router.push(orderRoutes.detail(orderId));
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
    const renderItem: ListRenderItem<OrderUI> = useCallback(({ item }) => (
        <OrderCard
            order={item}
            onPress={handleOrderPress}
            onShopPress={handleShopPress}
            onAction={handleAction}
            onTrackingPress={handleTrackingPress}
        />
    ), [handleOrderPress, handleShopPress, handleAction, handleTrackingPress]);

    // Key extractor
    const keyExtractor = useCallback((item: OrderUI) => item.orderId, []);

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
            <FlashList<OrderUI>
                data={orders}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={smartRefresh}
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
