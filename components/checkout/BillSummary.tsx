/**
 * BillSummary Component
 * 
 * Displays the payment breakdown:
 * - Subtotal (items)
 * - Shipping fee
 * - Shop voucher discount
 * - Platform voucher discount
 * - Total
 * 
 * Follows the design: Chi tiết thanh toán section
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { CheckoutCalculationResult } from '@/types/checkout';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface BillSummaryProps {
    calculation: CheckoutCalculationResult;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ calculation }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Section Title */}
            <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                    <IconSymbol
                        name="receipt"
                        size={18}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={styles.title}>Chi tiết thanh toán</Text>
            </View>

            {/* Summary Rows */}
            <View style={styles.summaryContainer}>
                {/* Subtotal */}
                <View style={styles.row}>
                    <Text style={styles.label}>
                        Tổng tiền hàng ({calculation.totalItemCount} sản phẩm)
                    </Text>
                    <Text style={styles.value}>
                        {formatCurrency(calculation.subtotal)}
                    </Text>
                </View>

                {/* Shipping */}
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng tiền vận chuyển</Text>
                    {calculation.isCalculatingShipping ? (
                        <Text style={styles.loadingText}>Đang tính...</Text>
                    ) : (
                        <Text style={styles.value}>
                            {formatCurrency(calculation.totalShippingFee)}
                        </Text>
                    )}
                </View>

                {/* Shop Voucher Discount (if any) */}
                {calculation.totalShopVoucherDiscount > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Giảm giá từ Shop</Text>
                        <Text style={styles.discountValue}>
                            -{formatCurrency(calculation.totalShopVoucherDiscount)}
                        </Text>
                    </View>
                )}

                {/* Platform Voucher Discount (if any) */}
                {calculation.platformVoucherDiscount > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Voucher </Text>
                        <Text style={styles.discountValue}>
                            -{formatCurrency(calculation.platformVoucherDiscount)}
                        </Text>
                    </View>
                )}

                {/* Shipping Discount (if any) */}
                {calculation.shippingDiscount > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Giảm phí vận chuyển</Text>
                        <Text style={styles.discountValue}>
                            -{formatCurrency(calculation.shippingDiscount)}
                        </Text>
                    </View>
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalValue}>
                        {formatCurrency(calculation.totalAmount)}
                    </Text>
                </View>

                {/* Savings (if any) */}
                {calculation.totalSavings > 0 && (
                    <View style={styles.savingsRow}>
                        <View style={styles.savingsBadge}>
                            <IconSymbol
                                name="check-circle"
                                size={14}
                                color={theme.colors.success}
                            />
                            <Text style={styles.savingsText}>
                                Tiết kiệm {formatCurrency(calculation.totalSavings)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.sm,
        gap: theme.margins.sm,
    },

    titleIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    summaryContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },

    label: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    value: {
        fontSize: 14,
        color: theme.colors.typography,
    },

    loadingText: {
        fontSize: 14,
        color: theme.colors.secondary,
        fontStyle: 'italic',
    },

    discountValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },

    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.margins.sm,
    },

    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },

    totalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.error,
    },

    savingsRow: {
        alignItems: 'flex-end',
        marginTop: 8,
    },

    savingsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10B98112',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 6,
        borderRadius: 8,
    },

    savingsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
}));

export default BillSummary;
