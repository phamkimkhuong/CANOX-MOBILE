/**
 * ==============================================
 * ORDER PRICE SUMMARY - Tổng tiền đơn hàng
 * ==============================================
 * Hiển thị: "Thành tiền (X sản phẩm): ₫Y.YYY.YYY"
 */

import { formatMoney } from '@/utils/format';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface OrderPriceSummaryProps {
    grandTotal: number;
    itemCount: number;
    totalQuantity: number;
    currency: string;
}

export const OrderPriceSummary: React.FC<OrderPriceSummaryProps> = ({
    grandTotal,
    itemCount: _itemCount,
    totalQuantity,
    currency,
}) => {
    const { t } = useTranslation('order');
    const styles = stylesheet;

    // Xác định text hiển thị số lượng
    const quantityText = t('list.itemCount', { count: totalQuantity });

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>{t('list.totalLabel')} ({quantityText}):</Text>
                <Text style={styles.amount}>{formatMoney(grandTotal, currency)}</Text>
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
