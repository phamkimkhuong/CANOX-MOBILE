/**
 * ==============================================
 * ORDER PRICE SUMMARY - Tổng tiền đơn hàng
 * ==============================================
 * Hiển thị: "Thành tiền (X sản phẩm): ₫Y.YYY.YYY"
 */

import { formatCurrency } from '@/utils/format';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderPriceSummaryProps {
    grandTotal: number;
    itemCount: number;
    totalQuantity: number;
}

export const OrderPriceSummary: React.FC<OrderPriceSummaryProps> = ({
    grandTotal,
    itemCount,
    totalQuantity,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Xác định text hiển thị số lượng
    const quantityText = totalQuantity > 1
        ? `${totalQuantity} sản phẩm`
        : '1 sản phẩm';

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Thành tiền ({quantityText}):</Text>
                <Text style={styles.amount}>{formatCurrency(grandTotal)}</Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    label: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
}));
