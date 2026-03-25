/**
 * ==============================================
 * ORDER SUMMARY SNIPPET - Preview đơn hàng rút gọn
 * ==============================================
 * Hiển thị tóm tắt đơn hàng đang huỷ:
 * - Ảnh sản phẩm đầu tiên
 * - Tên sản phẩm + variant
 * - Giá + trạng thái
 * - Mã đơn hàng
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { OrderItemUI, OrderStatus } from '@/types/order/order';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { formatMoney } from '@/utils/format';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderSummarySnippetProps {
    /** Danh sách items trong đơn */
    items: OrderItemUI[];
    /** Tổng tiền đơn hàng */
    grandTotal: number;
    /** ISO 4217 currency code from backend */
    currency: string;
    /** Mã đơn hàng */
    orderNumber: string;
    /** Trạng thái đơn hàng */
    status: OrderStatus;
    /** Tên shop (optional) */
    shopName?: string;
}

export const OrderSummarySnippet: React.FC<OrderSummarySnippetProps> = ({
    items,
    grandTotal,
    currency,
    orderNumber,
    status,
    shopName,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Lấy item đầu tiên để hiển thị
    const firstItem = items[0];
    const statusDisplay = getStatusDisplay(status);
    const remainingCount = items.length - 1;

    if (!firstItem) return null;

    return (
        <View style={styles.container}>
            {/* Shop name (if provided) */}
            {shopName && (
                <View style={styles.shopRow}>
                    <IconSymbol
                        name="store"
                        size={14}
                        color={theme.colors.typographySecondary}
                    />
                    <Text style={styles.shopName} numberOfLines={1}>
                        {shopName}
                    </Text>
                </View>
            )}

            {/* Product Info Row */}
            <View style={styles.productRow}>
                {/* Product Image */}
                <Image
                    source={{ uri: firstItem.imageUrl }}
                    style={styles.productImage}
                    contentFit="cover"
                    placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                    transition={200}
                />

                {/* Product Details */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {firstItem.productName}
                    </Text>

                    {/* Variant + Quantity */}
                    <Text style={styles.productMeta}>
                        {firstItem.variantAttributes
                            ? `${firstItem.variantAttributes} · `
                            : ''}
                        Số lượng: {firstItem.quantity}
                        {remainingCount > 0 && ` (+${remainingCount} sản phẩm khác)`}
                    </Text>

                    {/* Price + Status Badge */}
                    <View style={styles.priceStatusRow}>
                        <Text style={styles.price}>
                            {formatMoney(grandTotal, currency)}
                        </Text>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: statusDisplay.bgColor },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: statusDisplay.color },
                                ]}
                            >
                                {statusDisplay.label}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Order Number */}
            <View style={styles.orderNumberRow}>
                <Text style={styles.orderNumberLabel}>Mã đơn hàng</Text>
                <Text style={styles.orderNumberValue}>{orderNumber}</Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
    },
    shopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: theme.margins.sm,
    },
    shopName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    productRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 20,
    },
    productMeta: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    priceStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.s,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderNumberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.margins.smd,
        paddingTop: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    orderNumberLabel: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    orderNumberValue: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
}));
