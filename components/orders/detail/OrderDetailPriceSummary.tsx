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
import { PaymentMethod } from '@/types/order/order';
import { formatMoney } from '@/utils/format';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PriceRowProps {
    label: string;
    value: number;
    currency: string;
    isDiscount?: boolean;
    isTotal?: boolean;
    icon?: string;
}

const PriceRow = memo<PriceRowProps>(({
    label,
    value,
    currency,
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
                {formatMoney(value, currency)}
            </Text>
        </View>
    );
});

PriceRow.displayName = 'PriceRow';

interface OrderDetailPriceSummaryProps {
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    shippingFee: number;
    taxAmount?: number;
    grandTotal: number;
    currency: string;
    paymentMethod: PaymentMethod | string;
}

export const OrderDetailPriceSummary: React.FC<OrderDetailPriceSummaryProps> = ({
    subtotal,
    shopDiscount,
    platformDiscount,
    shippingDiscount,
    shippingFee,
    taxAmount = 0,
    grandTotal,
    currency,
    paymentMethod,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
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
                <Text style={styles.headerTitle}>{t('order:detail.paymentSummary')}</Text>
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceList}>
                <PriceRow label={t('order:detail.summary.subtotal')} value={subtotal} currency={currency} />

                {shopDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.shopDiscount')}
                        value={shopDiscount}
                        currency={currency}
                        isDiscount
                    />
                )}

                {platformDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.platformDiscount')}
                        value={platformDiscount}
                        currency={currency}
                        isDiscount
                    />
                )}

                {shippingDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.shippingDiscount')}
                        value={shippingDiscount}
                        currency={currency}
                        isDiscount
                    />
                )}

                <PriceRow
                    label={t('order:detail.summary.shipping')}
                    value={shippingFee}
                    currency={currency}
                />

                {taxAmount > 0 && (
                    <PriceRow label={t('order:detail.summary.tax')} value={taxAmount} currency={currency} />
                )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Total */}
            <PriceRow label={t('order:detail.summary.total')} value={grandTotal} currency={currency} isTotal />

            {/* Savings Badge */}
            {hasDiscount && (
                <View style={styles.savingsBadge}>
                    <IconSymbol
                        name="percent"
                        size={14}
                        color={theme.colors.success}
                    />
                    <Text style={styles.savingsText}>
                        {t('order:detail.summary.savings', { amount: formatMoney(totalDiscount, currency) })}
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
                <Text style={styles.paymentLabel}>{t('order:detail.paymentMethod')}</Text>
                <Text style={styles.paymentValue}>
                    {/* Translate if known payment method, else render fallback string */}
                    {t(`order:paymentMethods.${paymentMethod}` as never, { defaultValue: paymentMethod })}
                </Text>
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
        color: theme.colors.error,
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
