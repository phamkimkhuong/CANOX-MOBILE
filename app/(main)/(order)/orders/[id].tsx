/**
 * ==============================================
 * ORDER DETAIL SCREEN - Chi tiết đơn hàng
 * ==============================================
 * Route: /orders/[id]
 * 
 * Features:
 * - Lifecycle timeline with backend timestamps for normal orders
 * - Abnormal status banner (cancelled, rejected)
 * - Copy tracking number, order number, address
 * - Dynamic action buttons based on status
 * 
 * HYBRID SKELETON PATTERN:
 * - instantNav=true (quick tap < 150ms): Show skeleton with minimum duration
 * - instantNav=false (slow tap >= 150ms): Show skeleton only if data not cached
 * 
 * This prevents:
 * UI "flash" when skeleton appears for < 300ms
 * Perceived lag when user taps quickly
 */

import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { StaticOrderDetailShell } from '@/components/order/StaticOrderDetailShell';
import {
    OrderAddressCard,
    OrderDetailFooter,
    OrderDetailHeader,
    OrderDetailItemsList,
    OrderDetailPriceSummary,
    OrderReturnInfoCard,
    OrderTracker,
    ShippingInfoCard,
} from '@/components/orders/detail';
import { OrderShopHeader } from '@/components/orders/OrderShopHeader';
import { cartRoutes, chatRoutes, orderRoutes, reviewRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { buildHelpCenterRequest, getCachedConversationId, useCreateConversation, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useConfirmReceivedOrder } from '@/hooks/api/order/useConfirmReceivedOrder';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { OrderItemUI } from '@/types/order/order';
import { transformOrder } from '@/utils/adapter/order/orderAdapter';
import { isReturnFlowStatus } from '@/utils/adapter/order/orderReturnInfo';
import { Alert as CustomAlertHelper } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type LoadingActionType = 'cancel' | 'confirm' | null;

export const ErrorBoundary = createRouteErrorBoundary({
    scope: 'screen',
    titleKey: 'common:crash.orderDetail.title',
    messageKey: 'common:crash.orderDetail.message',
});

export default function OrderDetailScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    // Route params - id is required, instantNav is optional (for hybrid pattern)

    const { id } = useLocalSearchParams<{
        id: string;
        instantNav?: 'true';  // Set when user tapped quickly (< 150ms)
    }>();

    const myShopId = useAuthStore((s) => s.shopId);
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common', 'profile', 'product', 'chat']);
    const styles = stylesheet;
    const prefetchChat = usePrefetchShopChat();
    const { mutateAsync: confirmReceived } = useConfirmReceivedOrder();
    const { mutateAsync: createConversation, isPending: isCreatingChat } = useCreateConversation();

    // ============================================
    // STATE
    // ============================================
    const [loadingAction, setLoadingAction] = useState<LoadingActionType>(null);
    const [refreshing, setRefreshing] = useState(false);

    // DEFERRED RENDERING: Wait for navigation animation to finish
    const [canRenderComplexUI, setCanRenderComplexUI] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setCanRenderComplexUI(true);
        }, [])
    );

    // Fetch order detail
    const { data, isLoading, isError, error, refetch } = useOrderDetail(id);

    // Computed values
    const rawOrder = data;
    const order = useMemo(() => (
        rawOrder ? transformOrder(rawOrder) : undefined
    ), [rawOrder]);
    const shouldShowReturnFlow = useMemo(() => (
        Boolean(order?.returnInfo) && Boolean(order?.status && isReturnFlowStatus(order.status))
    ), [order?.returnInfo, order?.status]);

    // Check if any item can be reviewed

    const canReview = useMemo(() => {
        if (!order?.items || order.status !== 'COMPLETED') return false;
        return order.items.some((item) => !item.reviewed);
    }, [order?.items, order?.status]);

    // === HANDLERS ===

    const handleSupport = useCallback(async () => {
        if (isCreatingChat) return; // Prevent double tap

        try {
            showGlobalLoading();
            const request = buildHelpCenterRequest(order?.orderNumber);
            const response = await createConversation(request);
            const conversationId = response.data.id;

            hideGlobalLoading();

            // Navigate to chat with Help Center
            Navigator.push(chatRoutes.detail(conversationId, {
                partnerName: 'CanoX Help Center',
                contextType: 'ORDER',
                orderId: order?.orderId ? String(order.orderId) : undefined,
                orderCode: order?.orderNumber ? String(order.orderNumber) : undefined,
                orderStatus: order?.status ? String(order.status) : undefined,
                productImage: order?.items[0]?.imageUrl || '',
                totalAmount: order?.grandTotal ? String(order.grandTotal) : undefined,
                orderCurrency: order?.currency,
                itemCount: order?.itemCount ? String(order.itemCount) : undefined,
            }));

            logger.api.info('Opened Help Center chat', { conversationId, orderId: order?.orderId });
        } catch (err: unknown) {
            hideGlobalLoading();
            logger.api.error('Failed to open Help Center', err);
            Toast.show({
                type: 'error',
                text1: t('common:status.error'),
                text2: t('chat:error.tryAgainLater'),
            });
        }
    }, [isCreatingChat, order?.orderNumber, order?.orderId, order?.status, order?.currency, order?.grandTotal, order?.itemCount, order?.items, createConversation, t]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleShopPress = useCallback(() => {
        if (!order?.shopId) return;
        Navigator.push(shopRoutes.detail(order.shopId));
    }, [order?.shopId]);

    // === ACTION HANDLERS ===

    const handleCancel = useCallback(() => {
        if (!rawOrder) return;
        Navigator.push(orderRoutes.cancel(rawOrder.orderId, { fromDetail: 'true' }));
    }, [rawOrder]);

    const handleContactShop = useCallback(() => {
        if (!order) return;

        const shopUserId = order.shopUserId;
        const shopName = order.shopName;
        const shopLogoUrl = order.shopLogoUrl;

        if (!shopUserId || !shopName) {
            Toast.show({
                type: 'error',
                text1: t('order:detail.missingShopInfo'),
            });
            return;
        }

        if (order.shopId === myShopId) {
            Toast.show({
                type: 'info',
                text1: t('chat:error.chatWithSelf'),
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                text2: t('chat:error.chatWithSelfDetail' as any), // Fallback if detail key exists or just t()
            });
            return;
        }

        // Prefetch message
        prefetchChat(shopUserId, shopName, shopLogoUrl, order.shopId ?? undefined);

        // Instant navigation with Ghost ID
        const cachedId = getCachedConversationId(shopUserId);
        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
            partnerName: shopName,
            partnerAvatar: shopLogoUrl,
            shopUserId: shopUserId,
            shopId: order.shopId,
            contextType: 'ORDER',
            orderId: String(id), // Use direct id from params
            orderCode: String(order.orderNumber),
            orderStatus: String(order.status),
            productImage: order.items[0]?.imageUrl || '',
            totalAmount: String(order.grandTotal),
            orderCurrency: order.currency,
            itemCount: String(order.itemCount),
        }));

        logger.api.info('Contact shop for order:', order.orderId);
    }, [order, prefetchChat, myShopId, t, id]);

    const handleTrackOrder = useCallback(async () => {
        if (!order?.trackingNumber) {
            Toast.show({
                type: 'info',
                text1: t('order:detail.noTrackingTitle'),
                text2: t('order:detail.noTrackingMessage'),
            });
            return;
        }
        // TODO: Open tracking URL or bottom sheet
        await Clipboard.setStringAsync(order.trackingNumber);
        Toast.show({
            type: 'success',
            text1: t('order:detail.copyTrackingSuccess'),
            text2: order.trackingNumber,
        });
    }, [order?.trackingNumber, t]);

    const handleConfirmReceived = useCallback(() => {
        if (!rawOrder) return;

        CustomAlertHelper.show({
            title: t('order:detail.confirmReceivedTitle'),
            message: t('order:detail.confirmReceivedMessage'),
            type: 'success',
            confirmText: t('common:actions.yes'),
            cancelText: t('common:actions.no'),
            onConfirm: async () => {
                setLoadingAction('confirm');
                try {
                    await confirmReceived({ orderId: rawOrder.orderId });
                    Toast.show({
                        type: 'success',
                        text1: t('order:detail.confirmReceivedSuccess'),
                    });
                } catch (err: unknown) {
                    logger.api.error('Confirm received failed:', err);
                    Toast.show({
                        type: 'error',
                        text1: t('order:detail.confirmReceivedError'),
                        text2: err instanceof Error ? err.message : t('common:status.error'),
                    });
                } finally {
                    setLoadingAction(null);
                }
            },
        });
    }, [confirmReceived, rawOrder, t]);

    const handleReturnOrder = useCallback(() => {
        if (!rawOrder) return;
        Navigator.push(orderRoutes.return(rawOrder.orderId, { fromDetail: 'true' }));
    }, [rawOrder]);

    const { mutateAsync: addToCart } = useAddToCart();
    const handleRebuy = useCallback(async () => {
        if (!order?.items) return;

        showGlobalLoading();
        try {
            await Promise.all(
                order.items.map((item) =>
                    addToCart({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        hideToast: true, // Silent addition
                    })
                )
            );

            logger.api.info('Rebuy successful for order items:', order.items.length);

            // Hide loading overlay before navigation
            hideGlobalLoading();
            Navigator.push(cartRoutes.index({ rebuySuccess: true }));
        } catch (err) {
            hideGlobalLoading();
            logger.api.error('Rebuy failed:', err);

            // Show friendly error message from API if available
            const errorMessage = (err as Error)?.message || t('common:status.error');

            Toast.show({
                type: 'error',
                text1: t('common:status.error'),
                text2: errorMessage,
            });
        }
    }, [order?.items, addToCart, t]);


    const handleReview = useCallback(() => {
        if (!order || !rawOrder) return;
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
            Navigator.push(reviewRoutes.list({ filterOrderId: order.orderId }));
        }
    }, [order, rawOrder]);

    const handlePay = useCallback(() => {
        if (!rawOrder?.payment?.url) {
            Toast.show({
                type: 'error',
                text1: t('order:detail.missingPaymentUrlTitle'),
                text2: t('order:detail.missingPaymentUrlMessage'),
            });
            return;
        }
        Linking.openURL(rawOrder.payment.url);
    }, [rawOrder?.payment?.url, t]);

    const handleReviewItem = useCallback(
        (item: OrderItemUI) => {
            if (!order) return;
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
        },
        [order]
    );


    // === RENDER STATES ===

    // === RENDER ===

    return (
        <View style={styles.container}>
            {/* STAGE 0ms & LOADING: Render Static Shell immediately */}
            {(!canRenderComplexUI || isLoading) ? (
                <StaticOrderDetailShell showShimmer={canRenderComplexUI} />
            ) : (isError || (!order || !rawOrder)) ? (
                // Error State - Only show after animation
                <View style={styles.errorContainer}>
                    <OrderDetailHeader
                        orderNumber={id?.slice(-8) || '...'}
                        onSupportPress={handleSupport}
                    />
                    <View style={styles.errorContent}>
                        <Text style={styles.errorTitle}>{t('product:error.notFound')}</Text>
                        <Text style={styles.errorMessage}>
                            {error?.message || t('product:error.notFoundDetail')}
                        </Text>
                    </View>
                </View>
            ) : (
                // STAGE DATA: Show real UI with smooth FadeIn
                <Animated.View entering={FadeIn.duration(300)} style={styles.flex1}>
                    {/* Header */}
                    <OrderDetailHeader
                        orderNumber={order?.orderNumber || (id?.slice(-8) || '...')}
                        placedAtText={order?.formattedPlacedAt ? t('order:detail.placedAt', { time: order.formattedPlacedAt }) : undefined}
                        onSupportPress={handleSupport}
                    />

                    {/* Main Content */}
                    <View style={styles.flex1}>
                        <ScrollView
                            key={`scroll-${order?.orderId}`}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor={theme.colors.buttonActive}
                                    colors={[theme.colors.buttonActive]}
                                />
                            }
                        >
                            {shouldShowReturnFlow ? (
                                <OrderReturnInfoCard
                                    status={order.status}
                                    statusRaw={order.statusRaw}
                                    returnInfo={order.returnInfo}
                                />
                            ) : (
                                <OrderTracker
                                    status={order.status}
                                    statusRaw={order.statusRaw}
                                    lifecycle={rawOrder}
                                />
                            )}

                            {/* Shipping Info */}
                            {(order.carrier || order.trackingNumber) && (
                                <View style={styles.section}>
                                    <ShippingInfoCard
                                        carrier={order.carrier}
                                        trackingNumber={order.trackingNumber}
                                        onTrackingPress={handleTrackOrder}
                                    />
                                </View>
                            )}

                            {/* Delivery Address */}
                            <View style={styles.section}>
                                <OrderAddressCard
                                    recipientName={order.recipientName}
                                    phoneNumber={order.phoneNumber}
                                    fullAddress={order.fullAddress}
                                />
                            </View>

                            {/* Order Items & Shop info */}
                            <View style={styles.section}>
                                <OrderShopHeader
                                    shopName={order.shopName}
                                    shopLogoUrl={order.shopLogoUrl}
                                    onShopPress={handleShopPress}
                                />
                                <OrderDetailItemsList
                                    items={order.items}
                                    currency={order.currency}
                                    showReviewStatus={order.status === 'COMPLETED'}
                                    onPressReview={handleReviewItem}
                                />
                            </View>

                            {/* Price Summary */}
                            <View style={styles.section}>
                                <OrderDetailPriceSummary
                                    subtotal={order.subtotal}
                                    shopDiscount={order.shopDiscount}
                                    platformDiscount={order.platformDiscount}
                                    shippingDiscount={order.shippingDiscount}
                                    loyaltyDiscount={order.loyaltyDiscount}
                                    platformLoyaltyDiscount={order.platformLoyaltyDiscount}
                                    totalDiscount={order.totalDiscount}
                                    shippingFee={order.shippingFee}
                                    taxAmount={order.taxAmount}
                                    grandTotal={order.grandTotal}
                                    currency={order.currency}
                                    paymentMethod={order.paymentMethod}
                                    orderStatus={order.status}
                                    pointsEarned={order.pointsEarned}
                                    platformPointsEarned={order.platformPointsEarned}
                                />
                            </View>

                            {/* Notes */}
                            {order.customerNote && (
                                <View style={styles.noteSection}>
                                    <Text style={styles.noteLabel}>{t('order:detail.customerNote')}</Text>
                                    <Text style={styles.noteText}>{order.customerNote}</Text>
                                </View>
                            )}

                            {order.cancellationReason && (
                                <View style={styles.cancelSection}>
                                    <Text style={styles.cancelLabel}>{t('order:detail.cancellationReason')}</Text>
                                    <Text style={styles.cancelText}>{order.cancellationReason}</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Sticky Footer */}
                        <OrderDetailFooter
                            key={`footer-${order?.orderId}`}
                            order={order}
                            status={order.status}
                            canReview={canReview}
                            onCancel={handleCancel}
                            onContactShop={handleContactShop}
                            onTrackOrder={handleTrackOrder}
                            onConfirmReceived={handleConfirmReceived}
                            onReturn={handleReturnOrder}
                            onRebuy={handleRebuy}
                            onReview={handleReview}
                            onPay={handlePay}
                            loadingAction={loadingAction}
                        />
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.margins.xl,
    },
    section: {
        marginTop: theme.margins.sm,
    },
    noteSection: {
        marginTop: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        marginBottom: 4,
    },
    noteText: {
        fontSize: 13,
        color: theme.colors.typography,
        lineHeight: 18,
    },
    cancelSection: {
        marginTop: theme.margins.sm,
        backgroundColor: theme.colors.errorLight,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
    },
    cancelLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.error,
        marginBottom: 4,
    },
    cancelText: {
        fontSize: 13,
        color: theme.colors.error,
        lineHeight: 18,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    errorContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.xl,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
