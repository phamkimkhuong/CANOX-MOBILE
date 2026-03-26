/**
 * ==============================================
 * ORDER LIST TAB - Generic Tab Screen
 * ==============================================
 * Component màn hình chung cho mỗi tab
 * Nhận props: status để fetch đơn hàng theo trạng thái
 * Sử dụng FlashList để render danh sách với performance cao
 */

import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { cartRoutes, chatRoutes, orderRoutes, reviewRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useConfirmReceivedOrder } from '@/hooks/api/order/useConfirmReceivedOrder';
import { usePrefetchOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useOrderListUI, useRefreshOrderList } from '@/hooks/api/order/useOrders';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { OrderAction, OrderTabStatus, OrderUI } from '@/types/order/order';
import { Alert as CustomAlertHelper } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, RefreshControl, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DataGuard } from '../common/DataGuard';
import { EmptyOrderState } from './EmptyOrderState';
import { OrderCard } from './OrderCard';
import { OrderListSkeleton } from './OrderCardSkeleton';

interface OrderListTabProps {
    status: OrderTabStatus;
}


export const OrderListTab: React.FC<OrderListTabProps> = ({ status }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const myShopId = useAuthStore((s) => s.shopId);
    const prefetchChat = usePrefetchShopChat();
    const prefetchOrderDetail = usePrefetchOrderDetail();
    const { mutateAsync: addToCart } = useAddToCart();
    const { mutateAsync: confirmReceived, isPending: isConfirmingReceived } = useConfirmReceivedOrder();
    const { t } = useTranslation(['order', 'common']);

    const pressTimingMap = useRef<Map<string, number>>(new Map());

    // Fetch orders với useInfiniteQuery
    const { query, orders } = useOrderListUI(status);
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

    // Smart refresh: Reset to page 0 only (not refetch ALL loaded pages)
    const { refresh: smartRefresh } = useRefreshOrderList(status);

    /**
     * HYBRID PATTERN: PressIn Handler
     */
    const handleOrderPressIn = useCallback((orderId: string) => {
        // Record timestamp
        pressTimingMap.current.set(orderId, Date.now());

        // Start prefetch immediately
        prefetchOrderDetail(orderId);
    }, [prefetchOrderDetail]);

    /**
     * HYBRID PATTERN: Press Handler
     */
    const handleOrderPress = useCallback((orderId: string) => {
        const pressInTime = pressTimingMap.current.get(orderId) || 0;
        const elapsed = pressInTime ? Date.now() - pressInTime : 0;
        pressTimingMap.current.delete(orderId);
        const isInstantTap = elapsed > 0 && elapsed < PREFETCH_GRACE_PERIOD_MS;
        Navigator.push(orderRoutes.detail(orderId, { instantNav: isInstantTap }));
    }, []);

    const handleShopPress = useCallback((shopId: string) => {
        Navigator.push({
            pathname: '/(main)/(shop)/shop/[id]',
            params: { id: shopId },
        });
    }, []);

    const handleAction = useCallback(async (action: OrderAction['action'], order: OrderUI) => {
        const orderId = order.orderId;

        switch (action) {
            case 'cancel':
                Navigator.push(orderRoutes.cancel(orderId));
                break;
            case 'track':
                Navigator.push(orderRoutes.detail(orderId));
                break;
            case 'received':
                if (isConfirmingReceived) return;

                CustomAlertHelper.show({
                    title: t('order:detail.confirmReceivedTitle'),
                    message: t('order:detail.confirmReceivedMessage'),
                    type: 'success',
                    confirmText: t('common:actions.yes'),
                    cancelText: t('common:actions.no'),
                    onConfirm: async () => {
                        showGlobalLoading();
                        try {
                            await confirmReceived({ orderId });
                            Toast.show({
                                type: 'success',
                                text1: t('order:detail.confirmReceivedSuccess'),
                            });
                        } catch (err: unknown) {
                            logger.orders.error('Confirm received failed from list', err);
                            Toast.show({
                                type: 'error',
                                text1: t('order:detail.confirmReceivedError'),
                                text2: err instanceof Error ? err.message : t('common:status.error'),
                            });
                        } finally {
                            hideGlobalLoading();
                        }
                    },
                });
                break;
            case 'review': {
                const unreviewedItems = (order.items || []).filter((i) => !i.reviewed);

                if (unreviewedItems.length === 1) {
                    // One product: direct to write review
                    const item = unreviewedItems[0];
                    Navigator.push(
                        reviewRoutes.write(item.itemId || item.productId, {
                            orderId: order.orderId,
                            productId: item.productId,
                            productName: item.productName,
                            productImage: item.imageUrl,
                            variantAttributes: item.variantAttributes,
                            orderNumber: order.orderNumber,
                            shopName: order.shopName,
                            shopLogo: order.shopLogoUrl || undefined,
                        })
                    );
                } else {
                    // Multiple products: go to list with filter
                    Navigator.push(reviewRoutes.list({ filterOrderId: orderId }));
                }
                break;
            }
            case 'return':
                // TODO: Navigate to return request screen
                logger.orders.info('Return request:', orderId);
                break;
            case 'rebuy': {
                if (!order.items || order.items.length === 0) return;

                showGlobalLoading();
                try {
                    await Promise.all(
                        order.items.map((item) =>
                            addToCart({
                                variantId: item.variantId,
                                quantity: item.quantity,
                                hideToast: true,
                            })
                        )
                    );

                    logger.orders.info('Rebuy successful for order:', orderId);
                    hideGlobalLoading();
                    Navigator.push(cartRoutes.index({ rebuySuccess: true }));
                } catch (err: unknown) {
                    hideGlobalLoading();
                    const message = err instanceof Error ? err.message : t('common:status.error');
                    logger.orders.error('Rebuy failed:', err);

                    Toast.show({
                        type: 'error',
                        text1: t('common:status.error'),
                        text2: message,
                    });
                }
                break;
            }
            case 'contact': {
                const shopUserId = order.shopUserId;
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
                prefetchChat(shopUserId, shopName, shopLogoUrl ?? undefined, order.shopId ?? undefined);

                // Instant Navigation Logic (Ghost ID)
                const cachedId = getCachedConversationId(shopUserId);
                Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
                    partnerName: shopName,
                    partnerAvatar: shopLogoUrl,
                    shopUserId: shopUserId,
                    shopId: order.shopId,
                    contextType: 'ORDER',
                    orderId: String(order.orderId),
                    orderCode: String(order.orderNumber),
                    orderStatus: String(order.status),
                    productImage: order.items[0]?.imageUrl || '',
                    totalAmount: String(order.grandTotal),
                    orderCurrency: order.currency,
                    itemCount: String(order.itemCount),
                }));

                logger.orders.info('Contact shop for order:', orderId);
                break;
            }
            case 'pay':
                if (order.paymentUrl) {
                    Linking.openURL(order.paymentUrl);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Không tìm thấy liên kết thanh toán',
                        text2: 'Vui lòng thử lại sau hoặc liên hệ shop',
                    });
                }
                break;
            default:
                break;
        }
    }, [myShopId, prefetchChat, addToCart, confirmReceived, isConfirmingReceived, t]);

    const handleTrackingPress = useCallback((orderId: string) => {
        Navigator.push(orderRoutes.detail(orderId));
    }, []);

    const handleShopNow = useCallback(() => {
        Navigator.push('/(tabs)');
    }, []);

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
            onPressIn={handleOrderPressIn}
            onShopPress={handleShopPress}
            onAction={handleAction}
            onTrackingPress={handleTrackingPress}
        />
    ), [handleOrderPress, handleOrderPressIn, handleShopPress, handleAction, handleTrackingPress]);

    // Key extractor
    const keyExtractor = useCallback((item: OrderUI) => item.orderId, []);

    return (
        <DataGuard
            query={query}
            skeleton={<OrderListSkeleton count={3} />}
            isDataEmpty={() => false}
            onSecondaryAction={handleShopNow}
        >
            {(_guardData, meta) => {
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
                            removeClippedSubviews={true}
                            refreshControl={
                                <RefreshControl
                                    refreshing={meta.isRefetching && !isFetchingNextPage}
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
            }}
        </DataGuard>
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
