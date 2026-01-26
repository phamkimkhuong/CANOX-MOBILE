/**
 * ==============================================
 * ORDER DETAIL SCREEN - Chi tiết đơn hàng
 * ==============================================
 * Route: /orders/[id]
 * 
 * Features:
 * - Static Timeline (4 steps) for normal orders
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

import {
    OrderAddressCard,
    OrderDetailFooter,
    OrderDetailHeader,
    OrderDetailItemsList,
    OrderDetailPriceSummary,
    OrderTracker,
    ShippingInfoCard,
} from '@/components/orders/detail';
import { StaticOrderDetailShell } from '@/components/order/StaticOrderDetailShell';
import { OrderShopHeader } from '@/components/orders/OrderShopHeader';
import { cartRoutes, chatRoutes, orderRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { OrderItemUI } from '@/types/order/order';
import { Alert as CustomAlertHelper } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InteractionManager, Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type LoadingActionType = 'cancel' | 'confirm' | null;

export default function OrderDetailScreen() {
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

    // ============================================
    // STATE
    // ============================================
    const [loadingAction, setLoadingAction] = useState<LoadingActionType>(null);
    const [refreshing, setRefreshing] = useState(false);

    // DEFERRED RENDERING: Wait for navigation animation to finish
    const [canRenderComplexUI, setCanRenderComplexUI] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setCanRenderComplexUI(true);
        });
        return () => task.cancel();
    }, []);

    // Fetch order detail
    const { data, isLoading, isError, error, refetch } = useOrderDetail(id);

    // Computed values
    const order = data?.ui;
    const rawOrder = data?.raw;

    // Check if any item can be reviewed

    const canReview = useMemo(() => {
        if (!order?.items || order.status !== 'COMPLETED') return false;
        return order.items.some((item) => !item.reviewed);
    }, [order?.items, order?.status]);

    // === HANDLERS ===

    const handleSupport = useCallback(() => {
        // TODO: Navigate to support chat or help center
        Toast.show({
            type: 'info',
            text1: t('profile:menu.support'),
            text2: t('common:status.loading'),
        });
    }, [t]);

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
        }));

        logger.api.info('Contact shop for order:', order.orderId);
    }, [order, prefetchChat, myShopId, t]);

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
                    // TODO: Call confirm received API
                    logger.api.info('Confirm received:', rawOrder.orderId);
                    Toast.show({
                        type: 'success',
                        text1: t('order:detail.confirmReceivedSuccess'),
                    });
                    await refetch();
                } catch (err) {
                    logger.api.error('Confirm received failed:', err);
                    Toast.show({
                        type: 'error',
                        text1: t('order:detail.confirmReceivedError'),
                        text2: t('common:status.error'),
                    });
                } finally {
                    setLoadingAction(null);
                }
            },
        });
    }, [rawOrder, refetch, t]);

    const handleReturnOrder = useCallback(() => {
        if (!rawOrder) return;
        // TODO: Navigate to return request screen
        Toast.show({
            type: 'info',
            text1: t('order:detail.returnRequestTitle'),
            text2: t('order:detail.returnRequestMessage'),
        });
        logger.api.info('Return order request:', rawOrder.orderId);
    }, [rawOrder, t]);

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
        if (!rawOrder) return;
        // Navigator.push(`/review/${rawOrder.orderId}`);
    }, [rawOrder]);

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
        (_item: OrderItemUI) => {
            // Navigator.push(`/review/${rawOrder?.orderId}?itemId=${item.itemId}`);
        },
        []
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
                            {/* Order Tracker */}
                            <OrderTracker
                                status={order.status}
                                createdAt={rawOrder?.createdAt}
                            />

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
                                    email={rawOrder?.shippingAddress?.email}
                                />
                            </View>

                            {/* Order Items & Shop info */}
                            <View style={styles.section}>
                                <OrderShopHeader
                                    shopInfo={rawOrder?.shopInfo}
                                    status={order.status}
                                    onShopPress={handleShopPress}
                                />
                                <OrderDetailItemsList
                                    items={order.items}
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
                                    shippingFee={order.shippingFee}
                                    taxAmount={order.taxAmount}
                                    grandTotal={order.grandTotal}
                                    paymentMethod={order.paymentMethodDisplay}
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
