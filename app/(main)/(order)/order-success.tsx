/**
 * ==============================================
 * ORDER SUCCESS SCREEN
 * ==============================================
 * Màn hình hiển thị sau khi đặt hàng thành công.
 * 
 * Sự khác biệt:
 * - 1 đơn: Chi tiết (mã đơn, ảnh, payment, thời gian, tổng tiền)
 * - 2+ đơn: Danh sách đơn hàng với link đến chi tiết
 */

import '@/constants/unistyles';

import { PushNotificationSoftAsk } from '@/components/notifications/PushNotificationSoftAsk';
import { IconSymbol } from '@/components/ui/Icon';
import { orderRoutes, ROUTES } from '@/constants/routes';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { AuthorizationStatus, getMessaging, hasPermission } from '@react-native-firebase/messaging';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * Order info structure passed from checkout
 */
interface OrderInfo {
    orderId: string;
    orderNumber: string;
    shopName: string;
    grandTotal?: number;
    paymentMethod?: string;
    createdAt?: string;
    itemCount?: number;
    productImages?: string[];
}

/**
 * Format payment method to localized display
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPaymentMethod = (method: string | undefined, t: any): string => {
    if (!method) return t('checkout:payment.cod.name');
    switch (method.toUpperCase()) {
        case 'COD':
            return t('checkout:payment.cod.name');
        case 'BANK_TRANSFER':
            return t('checkout:payment.bankTransfer.name');
        case 'CREDIT_CARD':
            return t('order:statusLabel.paid'); // Defaulting to paid label or method name
        default:
            return method;
    }
};

/**
 * Format datetime string to Vietnamese format
 */
const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
        return '';
    }
};

export default function OrderSuccessScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { t } = useTranslation(['order', 'checkout']);
    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // Get params from navigation
    const params = useLocalSearchParams<{
        orderCount: string;
        orders: string;
    }>();

    // Parse order data
    const orderCount = parseInt(params.orderCount || '1', 10);
    const orders: OrderInfo[] = useMemo(() => {
        try {
            return params.orders ? JSON.parse(params.orders) : [];
        } catch {
            return [];
        }
    }, [params.orders]);

    const isMultipleOrders = orderCount > 1;
    const singleOrder = !isMultipleOrders && orders.length > 0 ? orders[0] : null;

    // --- PUSH NOTIFICATION SOFT ASK LOGIC ---
    const { requestPermission } = usePushNotifications();
    const [showPushModal, setShowPushModal] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            // Kiểm tra xem đã có quyền chưa trước khi hiện Soft Ask
            const messagingInstance = getMessaging();
            const authStatus = await hasPermission(messagingInstance);
            if (authStatus === AuthorizationStatus.NOT_DETERMINED) {
                setShowPushModal(true);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleAcceptPush = async () => {
        setShowPushModal(false);
        const granted = await requestPermission();
        if (granted) {
            Toast.show({
                type: 'success',
                text1: t('order:success.toast.pushEnabled'),
                visibilityTime: 2000,
            });
        }
    };
    // ----------------------------------------

    /**
     * Copy order number to clipboard
     */
    const handleCopyOrderNumber = useCallback(async (orderNumber: string) => {
        await Clipboard.setStringAsync(orderNumber);
        Toast.show({
            type: 'success',
            text1: t('order:success.toast.copySuccess', { orderNumber }),
            visibilityTime: 1500,
        });
    }, [t]);

    /**
     * Navigate to order history/list
     */
    const handleGoToOrdersList = useCallback(() => {
        Navigator.replace(ROUTES.ORDERS.LIST as never);
    }, []);

    /**
     * Navigate back to home
     */
    const handleGoToHome = useCallback(() => {
        Navigator.replace(ROUTES.TABS.HOME as never);
    }, []);

    /**
     * Continue shopping (also goes to home or search)
     */
    const handleContinueShopping = useCallback(() => {
        Navigator.replace(ROUTES.TABS.HOME as never);
    }, []);

    /**
     * Navigate to specific order detail
     */
    const handleViewOrderDetail = useCallback((orderId: string) => {
        Navigator.push(orderRoutes.detail(orderId));
    }, []);

    /**
     * Render Single Order Card
     * - Order code with copy button
     * - Product thumbnails grid
     * - Payment method, time, total
     */
    const renderSingleOrderCard = () => {
        if (!singleOrder) return null;

        const extraItemCount = (singleOrder.itemCount || 0) - (singleOrder.productImages?.length || 0);

        return (
            <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                style={styles.orderCard}
            >
                {/* Order Number Row */}
                <View style={styles.orderNumberRow}>
                    <Text style={styles.orderNumberLabel}>{t('order:success.orderNumberLabel')}</Text>
                    <View style={styles.orderNumberValue}>
                        <Text style={styles.orderNumberText}>
                            {singleOrder.orderNumber}
                        </Text>
                        <Pressable
                            onPress={() => handleCopyOrderNumber(singleOrder.orderNumber)}
                            hitSlop={8}
                        >
                            <IconSymbol
                                name="content-copy"
                                size={14}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Product Thumbnails */}
                {singleOrder.productImages && singleOrder.productImages.length > 0 && (
                    <View style={styles.thumbnailsRow}>
                        {singleOrder.productImages.map((imageUrl, index) => (
                            <View key={index} style={styles.thumbnailContainer}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.thumbnailImage}
                                    contentFit="cover"
                                    transition={200}
                                />
                            </View>
                        ))}
                        {extraItemCount > 0 && (
                            <View style={styles.thumbnailExtra}>
                                <Text style={styles.thumbnailExtraText}>
                                    +{extraItemCount}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Order Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('order:success.paymentLabel')}</Text>
                        <Text style={styles.detailValue}>
                            {formatPaymentMethod(singleOrder.paymentMethod, t)}
                        </Text>
                    </View>
                    {singleOrder.createdAt && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('order:success.timeLabel')}</Text>
                            <Text style={styles.detailValue}>
                                {formatDateTime(singleOrder.createdAt)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.detailLabel}>{t('order:success.totalLabel')}</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(singleOrder.grandTotal || 0)}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    /**
     * Render Multiple Orders Card
     * - List of orders with shop name and order number
     * - Link to each order detail
     */
    const renderMultipleOrdersCard = () => (
        <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.orderCard}
        >
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <Pressable
                        key={order.orderId}
                        style={({ pressed }) => [
                            styles.orderItem,
                            index < orders.length - 1 && styles.orderItemBorder,
                            pressed && styles.orderItemPressed,
                        ]}
                        onPress={() => handleViewOrderDetail(order.orderId)}
                    >
                        <View style={styles.orderItemLeft}>
                            <View style={styles.orderBadge}>
                                <Text style={styles.orderBadgeText}>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={styles.orderItemInfo}>
                                <Text style={styles.shopName} numberOfLines={1}>
                                    {order.shopName}
                                </Text>
                                <Text style={styles.orderItemNumber}>
                                    {t('order:success.multiOrders.orderItemTitle', { orderNumber: order.orderNumber })}
                                </Text>
                            </View>
                        </View>
                        <IconSymbol
                            name="chevron-right"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </Pressable>
                ))
            ) : (
                <View style={styles.orderItemFallback}>
                    <IconSymbol
                        name="check-circle"
                        size={24}
                        color={theme.colors.success}
                    />
                    <Text style={styles.fallbackText}>
                        {t('order:success.multiOrders.fallback', { count: orderCount })}
                    </Text>
                </View>
            )}
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 40 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon */}
                <Animated.View
                    entering={FadeIn.delay(100).duration(400)}
                    style={styles.iconContainer}
                >
                    <View style={styles.successCircle}>
                        <IconSymbol
                            name="check-circle"
                            size={64}
                            color={theme.colors.success}
                        />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.Text
                    entering={FadeInUp.delay(200).duration(400)}
                    style={styles.title}
                >
                    {t('order:success.title')}!
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.subtitle}
                >
                    {t('order:success.subtitle')}
                </Animated.Text>

                {/* Order Card - Different content based on order count */}
                {isMultipleOrders ? renderMultipleOrdersCard() : renderSingleOrderCard()}

                {/* Unified Buttons Section */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(400)}
                    style={styles.actionsSection}
                >
                    {/* Primary Action - View Order Detail/History */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            if (isMultipleOrders) {
                                handleGoToOrdersList();
                            } else if (singleOrder) {
                                handleViewOrderDetail(singleOrder.orderId);
                            }
                        }}
                    >
                        <IconSymbol
                            name="receipt-long"
                            size={20}
                            color={theme.colors.surface}
                        />
                        <Text style={styles.primaryButtonText}>
                            {isMultipleOrders ? t('order:success.actions.viewHistory') : t('order:success.orderTitle')}
                        </Text>
                    </Pressable>

                    {/* Secondary Action - Continue Shopping */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.outlineButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleContinueShopping}
                    >
                        <IconSymbol
                            name="shopping-bag"
                            size={20}
                            color={theme.colors.newPrimary}
                        />
                        <Text style={styles.outlineButtonText}>
                            {t('order:success.actions.continue')}
                        </Text>
                    </Pressable>

                    {/* Link - Back to Home */}
                    <Pressable
                        style={styles.linkButton}
                        onPress={handleGoToHome}
                    >
                        <Text style={styles.linkButtonText}>
                            {t('order:success.actions.home')}
                        </Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>

            <PushNotificationSoftAsk
                isVisible={showPushModal}
                onClose={() => setShowPushModal(false)}
                onAccept={handleAcceptPush}
            />
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
        paddingHorizontal: theme.margins.lg,
        paddingTop: 80,
    },

    iconContainer: {
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },

    successCircle: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: theme.colors.successSoft,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },

    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: theme.margins.xl,
        paddingHorizontal: theme.margins.md,
    },
    orderCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.margins.lg,
        marginBottom: theme.margins.lg,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    orderNumberRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        paddingBottom: theme.margins.md,
        marginBottom: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        borderStyle: 'dashed',
    },

    orderNumberLabel: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    orderNumberValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    orderNumberText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },

    // ============================================
    // SINGLE ORDER - THUMBNAILS
    // ============================================
    thumbnailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
        marginBottom: theme.margins.md,
    },

    thumbnailContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },

    thumbnailImage: {
        width: '100%',
        height: '100%',
    },

    thumbnailExtra: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    thumbnailExtraText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
    },
    detailsSection: {
        gap: theme.margins.md,
    },

    detailRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
    },

    detailLabel: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: theme.margins.sm,
    },

    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.newPrimary,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.smd,
    },

    orderItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    orderItemPressed: {
        opacity: 0.7,
    },

    orderItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.margins.smd,
    },

    orderBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.activeSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },

    orderBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.newPrimary,
    },

    orderItemInfo: {
        flex: 1,
    },

    shopName: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
        marginBottom: 2,
    },

    orderItemNumber: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },

    orderItemFallback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.sm,
    },

    fallbackText: {
        fontSize: 14,
        color: theme.colors.typography,
    },
    actionsSection: {
        gap: theme.margins.smd,
    },

    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.activeLight,
        ...theme.shadows.small,
    },

    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.newPrimary,
    },

    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.newPrimary,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.xl,
        ...theme.shadows.medium,
    },

    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.surface,
    },

    linkButton: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },

    linkButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },

    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
}));
