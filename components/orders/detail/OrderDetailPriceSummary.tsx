/**
 * ==============================================
 * ORDER DETAIL PRICE SUMMARY - Bảng tính tiền chi tiết
 * ==============================================
 * Hiển thị breakdown chi tiết:
 * - Tạm tính
 * - Giảm giá (Shop + Platform)
 * - Phí vận chuyển
 * - Tổng thanh toán
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PriceRowProps {
    label: string;
    value: number;
    isDiscount?: boolean;
    isTotal?: boolean;
    icon?: string;
}

const PriceRow: React.FC<PriceRowProps> = ({
    label,
    value,
    isDiscount = false,
    isTotal = false,
    icon,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={[styles.priceRow, isTotal && styles.priceRowTotal]}>
            <View style={styles.labelContainer}>
                {icon && (
                    <IconSymbol
                        name={icon as never}
                        size={14}
                        color={theme.colors.typographySecondary}
                    />
                )}
                <Text style={[styles.label, isTotal && styles.labelTotal]}>
                    {label}
                </Text>
            </View>
            <Text
                style={[
                    styles.value,
                    isDiscount && styles.valueDiscount,
                    isTotal && styles.valueTotal,
                ]}
            >
                {isDiscount && value > 0 ? '-' : ''}
                {formatCurrency(value)}
            </Text>
        </View>
    );
};

interface OrderDetailPriceSummaryProps {
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    shippingFee: number;
    taxAmount?: number;
    grandTotal: number;
    paymentMethod: string;
}

export const OrderDetailPriceSummary: React.FC<OrderDetailPriceSummaryProps> = ({
    subtotal,
    shopDiscount,
    platformDiscount,
    shippingDiscount,
    shippingFee,
    taxAmount = 0,
    grandTotal,
    paymentMethod,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const totalDiscount = shopDiscount + platformDiscount + shippingDiscount;
    const hasDiscount = totalDiscount > 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <IconSymbol
                        name="receipt"
                        size={18}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={styles.headerTitle}>Chi tiết thanh toán</Text>
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceList}>
                <PriceRow label="Tạm tính" value={subtotal} />

                {shopDiscount > 0 && (
                    <PriceRow
                        label="Giảm giá Shop"
                        value={shopDiscount}
                        isDiscount
                    />
                )}

                {platformDiscount > 0 && (
                    <PriceRow
                        label="Giảm giá sàn"
                        value={platformDiscount}
                        isDiscount
                    />
                )}

                {shippingDiscount > 0 && (
                    <PriceRow
                        label="Giảm phí vận chuyển"
                        value={shippingDiscount}
                        isDiscount
                    />
                )}

                <PriceRow
                    label="Phí vận chuyển"
                    value={shippingFee}
                />

                {taxAmount > 0 && (
                    <PriceRow label="Thuế" value={taxAmount} />
                )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Total */}
            <PriceRow label="Tổng thanh toán" value={grandTotal} isTotal />

            {/* Savings Badge */}
            {hasDiscount && (
                <View style={styles.savingsBadge}>
                    <IconSymbol
                        name="percent"
                        size={14}
                        color={theme.colors.success}
                    />
                    <Text style={styles.savingsText}>
                        Tiết kiệm {formatCurrency(totalDiscount)}
                    </Text>
                </View>
            )}

            {/* Payment Method */}
            <View style={styles.paymentRow}>
                <IconSymbol
                    name="card"
                    size={14}
                    color={theme.colors.typographySecondary}
                />
                <Text style={styles.paymentLabel}>Phương thức thanh toán</Text>
                <Text style={styles.paymentValue}>{paymentMethod}</Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.smd,
        gap: theme.margins.sm,
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    priceList: {
        paddingHorizontal: theme.margins.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    priceRowTotal: {
        paddingTop: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    labelTotal: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    value: {
        fontSize: 13,
        color: theme.colors.typography,
    },
    valueDiscount: {
        color: theme.colors.success,
    },
    valueTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.sm,
    },
    savingsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: theme.margins.md,
        marginTop: 4,
        gap: 4,
    },
    savingsText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.success,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginTop: theme.margins.md,
        gap: 6,
    },
    paymentLabel: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    paymentValue: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
}));
