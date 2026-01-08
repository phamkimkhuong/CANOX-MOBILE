/**
 * ==============================================
 * ORDER SUCCESS SCREEN
 * ==============================================
 * Màn hình hiển thị sau khi đặt hàng thành công.
 * Xử lý 2 trường hợp:
 * 1. Đơn lẻ (1 shop): Hiển thị mã đơn hàng cụ thể
 * 2. Đa đơn (nhiều shop): Hiển thị số lượng đơn, không hiện mã cụ thể
 */

import '@/constants/unistyles';

import { IconSymbol } from '@/components/ui/Icon';
import { orderRoutes, ROUTES } from '@/constants/routes';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderInfo {
    orderId: string;
    orderNumber: string;
    shopName: string;
}

export default function OrderSuccessScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();
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

    const handleViewOrders = useCallback(() => {
        // Navigate to order history/list
        router.replace(ROUTES.ORDERS.LIST as never);
    }, [router]);

    const handleContinueShopping = useCallback(() => {
        // Navigate back to home
        router.replace(ROUTES.TABS.HOME as never);
    }, [router]);

    const handleViewSingleOrder = useCallback((orderId: string) => {
        // Navigate to specific order detail
        router.push(orderRoutes.detail(orderId));
    }, [router]);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    gestureEnabled: false, // Prevent swipe back
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 },
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
                            name="check"
                            size={48}
                            color={theme.colors.surface}
                        />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.Text
                    entering={FadeInUp.delay(200).duration(400)}
                    style={styles.title}
                >
                    Đặt hàng thành công!
                </Animated.Text>

                {/* Subtitle - Dynamic based on order count */}
                <Animated.Text
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.subtitle}
                >
                    {isMultipleOrders
                        ? `Bạn đã đặt thành công ${orderCount} đơn hàng\ntừ ${orderCount} shop khác nhau`
                        : 'Đơn hàng của bạn đã được tạo thành công'}
                </Animated.Text>

                {/* Order Info Card */}
                <Animated.View
                    entering={FadeInDown.delay(400).duration(400)}
                    style={styles.orderCard}
                >
                    <View style={styles.cardHeader}>
                        <IconSymbol
                            name="local-shipping"
                            size={20}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.cardTitle}>
                            Thông tin đơn hàng
                        </Text>
                    </View>

                    <View style={styles.cardContent}>
                        {orders.length > 0 ? (
                            // Show order list
                            orders.map((order, index) => (
                                <Pressable
                                    key={order.orderId}
                                    style={[
                                        styles.orderItem,
                                        index < orders.length - 1 && styles.orderItemBorder,
                                    ]}
                                    onPress={() => handleViewSingleOrder(order.orderId)}
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
                                            <Text style={styles.orderNumber}>
                                                {order.orderNumber}
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
                            // Fallback when no order details
                            <View style={styles.orderItemFallback}>
                                <IconSymbol
                                    name="check-circle"
                                    size={24}
                                    color={theme.colors.success}
                                />
                                <Text style={styles.fallbackText}>
                                    {isMultipleOrders
                                        ? `${orderCount} đơn hàng đã được tạo`
                                        : 'Đơn hàng đã được tạo'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Shipping Notice */}
                    <View style={styles.shippingNotice}>
                        <IconSymbol
                            name="info"
                            size={16}
                            color={theme.colors.info}
                        />
                        <Text style={styles.shippingNoticeText}>
                            Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất
                        </Text>
                    </View>
                </Animated.View>

                {/* Payment Method Reminder (for COD) */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(400)}
                    style={styles.reminderCard}
                >
                    <IconSymbol
                        name="wallet"
                        size={20}
                        color={theme.colors.warning}
                    />
                    <Text style={styles.reminderText}>
                        Vui lòng chuẩn bị tiền mặt khi nhận hàng
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Bottom Actions */}
            <Animated.View
                entering={FadeInUp.delay(600).duration(400)}
                style={[styles.bottomActions, { paddingBottom: insets.bottom + theme.margins.md }]}
            >
                {/* Primary Button */}
                <Pressable
                    style={styles.primaryButton}
                    onPress={handleViewOrders}
                >
                    <IconSymbol
                        name="receipt-long"
                        size={20}
                        color={theme.colors.surface}
                    />
                    <Text style={styles.primaryButtonText}>
                        {isMultipleOrders ? 'Xem lịch sử mua hàng' : 'Xem đơn hàng'}
                    </Text>
                </Pressable>

                {/* Secondary Button */}
                <Pressable
                    style={styles.secondaryButton}
                    onPress={handleContinueShopping}
                >
                    <IconSymbol
                        name="shopping-bag"
                        size={20}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.secondaryButtonText}>
                        Tiếp tục mua sắm
                    </Text>
                </Pressable>
            </Animated.View>
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

    // Success Icon
    iconContainer: {
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },

    successCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },

    // Typography
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },

    subtitle: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: theme.margins.xl,
    },

    // Order Card
    orderCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        marginBottom: theme.margins.md,
        ...theme.shadows.small,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.md,
        paddingBottom: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    cardContent: {
        gap: 0,
    },

    // Order Item
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

    orderItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.margins.smd,
    },

    orderBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },

    orderBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },

    orderItemInfo: {
        flex: 1,
    },

    shopName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        marginBottom: 2,
    },

    orderNumber: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },

    // Fallback
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

    // Shipping Notice
    shippingNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginTop: theme.margins.md,
        paddingTop: theme.margins.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },

    shippingNoticeText: {
        fontSize: 13,
        color: theme.colors.info,
        flex: 1,
    },

    // Reminder Card
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.warningSoft,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        marginBottom: theme.margins.md,
    },

    reminderText: {
        fontSize: 13,
        color: theme.colors.warning,
        flex: 1,
    },

    // Bottom Actions
    bottomActions: {
        paddingHorizontal: theme.margins.lg,
        paddingTop: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.margins.smd,
    },

    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
    },

    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.surface,
    },

    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.primarySoft,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
    },

    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));
