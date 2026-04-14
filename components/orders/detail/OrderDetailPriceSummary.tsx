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
import { OrderStatus, PaymentMethod } from '@/types/order/order';
import { getPaymentMethodDisplayName } from '@/utils/adapter/order/paymentMethodLabel';
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
    loyaltyDiscount?: number;
    platformLoyaltyDiscount?: number;
    totalDiscount?: number;
    shippingFee: number;
    taxAmount?: number;
    grandTotal: number;
    currency: string;
    paymentMethod: PaymentMethod | string;
    orderStatus: OrderStatus;
    pointsEarned?: number;
    platformPointsEarned?: number;
}

export const OrderDetailPriceSummary: React.FC<OrderDetailPriceSummaryProps> = ({
    subtotal,
    shopDiscount,
    platformDiscount,
    shippingDiscount,
    loyaltyDiscount = 0,
    platformLoyaltyDiscount = 0,
    totalDiscount = 0,
    shippingFee,
    taxAmount = 0,
    grandTotal,
    currency,
    paymentMethod,
    orderStatus,
    pointsEarned = 0,
    platformPointsEarned = 0,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;

    const knownDiscountTotal =
        shopDiscount +
        platformDiscount +
        shippingDiscount +
        loyaltyDiscount +
        platformLoyaltyDiscount;
    const otherDiscount = Math.max(totalDiscount - knownDiscountTotal, 0);

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

                {loyaltyDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.loyaltyDiscount')}
                        value={loyaltyDiscount}
                        currency={currency}
                        isDiscount
                    />
                )}

                {platformLoyaltyDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.platformLoyaltyDiscount')}
                        value={platformLoyaltyDiscount}
                        currency={currency}
                        isDiscount
                    />
                )}

                {otherDiscount > 0 && (
                    <PriceRow
                        label={t('order:detail.summary.otherDiscount')}
                        value={otherDiscount}
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

            {/* Payment Method */}
            <View style={styles.paymentRow}>
                <IconSymbol
                    name="card"
                    size={14}
                    color={theme.colors.typographySecondary}
                />
                <Text style={styles.paymentLabel}>{t('order:detail.paymentMethod')}</Text>
                <Text style={styles.paymentValue}>
                    {t(`order:paymentMethods.${paymentMethod}` as never, {
                        defaultValue: getPaymentMethodDisplayName(paymentMethod),
                    })}
                </Text>
            </View>

            {/* Loyalty Points Earned */}
            {(pointsEarned > 0 || platformPointsEarned > 0) && (
                <>
                    <View style={styles.xuDivider} />
                    <View style={styles.xuSection}>
                        <View style={styles.xuHeader}>
                            <IconSymbol
                                name="star"
                                size={14}
                                color={orderStatus === 'COMPLETED' ? theme.colors.warning : theme.colors.typographySecondary}
                            />
                            <Text style={[
                                styles.xuHeaderText,
                                orderStatus === 'COMPLETED' && { color: theme.colors.warning },
                            ]}>
                                {orderStatus === 'COMPLETED'
                                    ? t('order:detail.loyalty.earned')
                                    : t('order:detail.loyalty.willEarn')}
                            </Text>
                        </View>
                        {pointsEarned > 0 && (
                            <View style={styles.xuRow}>
                                <Text style={styles.xuLabel}>
                                    {t('order:detail.loyalty.shopPoints')}
                                </Text>
                                <Text style={[
                                    styles.xuValue,
                                    orderStatus === 'COMPLETED' && styles.xuValueEarned,
                                ]}>
                                    +{pointsEarned} {t('order:detail.loyalty.pointsUnit')}
                                </Text>
                            </View>
                        )}
                        {platformPointsEarned > 0 && (
                            <View style={styles.xuRow}>
                                <Text style={styles.xuLabel}>
                                    {t('order:detail.loyalty.platformPoints')}
                                </Text>
                                <Text style={[
                                    styles.xuValue,
                                    orderStatus === 'COMPLETED' && styles.xuValueEarned,
                                ]}>
                                    +{platformPointsEarned} {t('order:detail.loyalty.pointsUnit')}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            )}
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
    xuDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.md,
        opacity: 0.5,
    },
    xuSection: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
    },
    xuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    xuHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    xuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 3,
    },
    xuLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    xuValue: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    xuValueEarned: {
        color: theme.colors.warning,
        fontWeight: '600',
    },
}));
