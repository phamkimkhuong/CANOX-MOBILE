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
    OrderDetailSkeleton,
    OrderTracker,
    ShippingInfoCard,
} from '@/components/orders/detail';
import { OrderShopHeader } from '@/components/orders/OrderShopHeader';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { cartRoutes, chatRoutes, orderRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { MINIMUM_SKELETON_DURATION_MS } from '@/hooks/usePrefetchTiming';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { OrderItemUI } from '@/types/order/order';
import { getOrderActions } from '@/utils/adapter/order';
import { Alert as CustomAlertHelper } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type LoadingActionType = 'cancel' | 'confirm' | null;

export default function OrderDetailScreen() {
    // Route params - id is required, instantNav is optional (for hybrid pattern)
    const { id, instantNav } = useLocalSearchParams<{
        id: string;
        instantNav?: 'true';  // Set when user tapped quickly (< 150ms)
    }>();

    const myShopId = useAuthStore((s) => s.shopId);
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const prefetchChat = usePrefetchShopChat();

    // ============================================
    // STATE
    // ============================================
    const [loadingAction, setLoadingAction] = useState<LoadingActionType>(null);
    const [refreshing, setRefreshing] = useState(false);

    // HYBRID PATTERN: Track if minimum skeleton duration has passed
    // Only relevant when instantNav=true
    const [minimumDurationPassed, setMinimumDurationPassed] = useState(
        instantNav !== 'true'  // If not instant tap, duration is already "passed"
    );

    // Fetch order detail
    const { data, isLoading, isError, error, refetch } = useOrderDetail(id);

    // ============================================
    // HYBRID SKELETON LOGIC
    // ============================================
    const shouldShowSkeleton = isLoading || (instantNav === 'true' && !minimumDurationPassed);

    // Callback when skeleton's minimum duration has passed  
    const handleMinimumDurationReached = useCallback(() => {
        setMinimumDurationPassed(true);
    }, []);

    // Computed values
    const order = data?.ui;
    const rawOrder = data?.raw;
    const actions = useMemo(
        () => (order ? getOrderActions(order) : null),
        [order]
    );

    // Check if any item can be reviewed

    const canReview = useMemo(() => {
        if (!order?.items || order.status !== 'COMPLETED') return false;
        return order.items.some((item) => !item.reviewed);
    }, [order?.items, order?.status]);

    // === HANDLERS ===

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleSupport = useCallback(() => {
        // TODO: Navigate to support chat or help center
        Toast.show({
            type: 'info',
            text1: 'Hỗ trợ',
            text2: 'Tính năng đang phát triển',
        });
    }, []);

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
                text1: 'Thiếu thông tin Shop',
            });
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

        // Prefetch message
        prefetchChat(shopUserId, shopName, shopLogoUrl, order.shopId);

        // Instant navigation with Ghost ID
        const cachedId = getCachedConversationId(shopUserId);
        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
            partnerName: shopName,
            partnerAvatar: shopLogoUrl,
            shopUserId: shopUserId,
            shopId: order.shopId,
        }));

        logger.api.info('Contact shop for order:', order.orderId);
    }, [order, prefetchChat, myShopId]);

    const handleTrackOrder = useCallback(async () => {
        if (!order?.trackingNumber) {
            Toast.show({
                type: 'info',
                text1: 'Chưa có mã vận đơn',
                text2: 'Vui lòng chờ shop giao hàng',
            });
            return;
        }
        // TODO: Open tracking URL or bottom sheet
        await Clipboard.setStringAsync(order.trackingNumber);
        Toast.show({
            type: 'success',
            text1: 'Đã sao chép mã vận đơn',
            text2: order.trackingNumber,
        });
    }, [order?.trackingNumber]);

    const handleConfirmReceived = useCallback(() => {
        if (!rawOrder) return;

        CustomAlertHelper.show({
            title: 'Xác nhận đã nhận hàng',
            message: 'Bạn đã nhận được hàng và hài lòng với đơn hàng?',
            type: 'success',
            confirmText: 'Đã nhận',
            cancelText: 'Chưa',
            onConfirm: async () => {
                setLoadingAction('confirm');
                try {
                    // TODO: Call confirm received API
                    logger.api.info('Confirm received:', rawOrder.orderId);
                    Toast.show({
                        type: 'success',
                        text1: 'Đã xác nhận nhận hàng',
                    });
                    await refetch();
                } catch (err) {
                    logger.api.error('Confirm received failed:', err);
                    Toast.show({
                        type: 'error',
                        text1: 'Xác nhận thất bại',
                        text2: 'Vui lòng thử lại sau',
                    });
                } finally {
                    setLoadingAction(null);
                }
            },
        });
    }, [rawOrder, refetch]);

    const handleReturnOrder = useCallback(() => {
        if (!rawOrder) return;
        // TODO: Navigate to return request screen
        Toast.show({
            type: 'info',
            text1: 'Yêu cầu trả hàng',
            text2: 'Chức năng đang được tích hợp',
        });
        logger.api.info('Return order request:', rawOrder.orderId);
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
        } catch (err: any) {
            hideGlobalLoading();
            logger.api.error('Rebuy failed:', err);

            // Show friendly error message from API if available
            const errorMessage = err?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng';

            Toast.show({
                type: 'error',
                text1: 'Mua lại thất bại',
                text2: errorMessage,
            });
        }
    }, [order?.items, addToCart]);

    const handleReview = useCallback(() => {
        if (!rawOrder) return;
        // Navigator.push(`/review/${rawOrder.orderId}`);
    }, [rawOrder]);

    const handleReviewItem = useCallback(
        (item: OrderItemUI) => {
            // Navigator.push(`/review/${rawOrder?.orderId}?itemId=${item.itemId}`);
        },
        [rawOrder?.orderId]
    );

    // === RENDER STATES ===

    // === RENDER ===

    return (
        <View style={styles.container}>
            {/* Header */}
            <OrderDetailHeader
                orderNumber={order?.orderNumber || (id?.slice(-8) || '...')}
                onSupportPress={handleSupport}
            />

            {shouldShowSkeleton ? (
                // Loading State - with minimum duration for instant taps
                <View style={{ flex: 1 }}>
                    <OrderDetailSkeleton
                        minimumDuration={instantNav === 'true' ? MINIMUM_SKELETON_DURATION_MS : 0}
                        onMinimumReached={handleMinimumDurationReached}
                    />
                </View>
            ) : (isError || !order || !rawOrder) ? (
                // Error State
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
                    <Text style={styles.errorMessage}>
                        {error?.message || 'Đơn hàng không tồn tại hoặc đã bị xoá'}
                    </Text>
                </View>
            ) : (
                // 4. Success State (Main Content)
                <View style={{ flex: 1 }} key="order-detail-content">
                    <ScrollView
                        key={`scroll-${order.orderId}`}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={theme.colors.primary}
                                colors={[theme.colors.primary]}
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
                                email={rawOrder?.email}
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
                                shopDiscount={rawOrder?.shopDiscount || 0}
                                platformDiscount={rawOrder?.platformDiscount || 0}
                                shippingDiscount={rawOrder?.shippingDiscount || 0}
                                shippingFee={order.shippingFee}
                                taxAmount={rawOrder?.taxAmount}
                                grandTotal={order.grandTotal}
                                paymentMethod={order.paymentMethodDisplay}
                            />
                        </View>

                        {/* Notes */}
                        {order.customerNote && (
                            <View style={styles.noteSection}>
                                <Text style={styles.noteLabel}>Ghi chú:</Text>
                                <Text style={styles.noteText}>{order.customerNote}</Text>
                            </View>
                        )}

                        {order.cancellationReason && (
                            <View style={styles.cancelSection}>
                                <Text style={styles.cancelLabel}>Lý do huỷ:</Text>
                                <Text style={styles.cancelText}>{order.cancellationReason}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Sticky Footer */}
                    <OrderDetailFooter
                        key={`footer-${order.orderId}`}
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
                        loadingAction={loadingAction}
                    />
                </View>
            )}
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
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
