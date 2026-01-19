/**
 * ==============================================
 * REFUND POLICY CARD - Thông báo chính sách hoàn tiền
 * ==============================================
 * Dynamic content based on:
 * - paymentMethod: COD vs PREPAID
 * - status: WAITING_FOR_PAYMENT for unpaid orders
 * - hasVoucher: Show voucher warning
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { OrderStatus, PaymentMethod } from '@/types/order/order';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RefundPolicyCardProps {
    /** Payment method of the order */
    paymentMethod: PaymentMethod;
    /** Current status of the order */
    status: OrderStatus;
    /** Whether order used any voucher (totalDiscount > 0 or appliedVoucherCodes exists) */
    hasVoucher: boolean;
}

export const RefundPolicyCard: React.FC<RefundPolicyCardProps> = ({
    paymentMethod,
    status,
    hasVoucher,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const styles = stylesheet;
    const isActuallyPaid = paymentMethod !== 'COD' && status !== 'AWAITING_PAYMENT';

    const refundMessage = isActuallyPaid
        ? t('cancel.refund.refundInfo')
        : t('cancel.refund.notPaid');

    return (
        <View style={styles.container}>
            {/* Refund Info */}
            <View
                style={[
                    styles.messageCard,
                    isActuallyPaid ? styles.messageCardPrepaid : styles.messageCardCod,
                ]}
            >
                <View style={styles.iconWrapper}>
                    <IconSymbol
                        name={isActuallyPaid ? 'credit-card' : 'info'}
                        size={18}
                        color={isActuallyPaid ? theme.colors.info : theme.colors.success}
                    />
                </View>
                <Text
                    style={[
                        styles.messageText,
                        isActuallyPaid ? styles.messageTextPrepaid : styles.messageTextCod,
                    ]}
                >
                    {refundMessage}
                </Text>
            </View>

            {/* Voucher Warning - Luôn hiện nếu có voucher */}
            {hasVoucher && (
                <View style={styles.voucherWarning}>
                    <View style={styles.iconWrapper}>
                        <IconSymbol
                            name="error-outline"
                            size={18}
                            color={theme.colors.warning}
                        />
                    </View>
                    <Text style={styles.voucherWarningText}>
                        {t('cancel.refund.voucherWarning')}
                    </Text>
                </View>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: theme.margins.smd,
        borderRadius: theme.radius.m,
        gap: theme.margins.sm,
    },
    messageCardCod: {
        backgroundColor: theme.colors.successLight,
        borderWidth: 1,
        borderColor: theme.colors.success + '30',
    },
    messageCardPrepaid: {
        backgroundColor: theme.colors.infoLight,
        borderWidth: 1,
        borderColor: theme.colors.info + '30',
    },
    iconWrapper: {
        marginTop: 1,
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
    },
    messageTextCod: {
        color: theme.colors.success,
    },
    messageTextPrepaid: {
        color: theme.colors.info,
    },
    voucherWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: theme.margins.smd,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.warningLight,
        borderWidth: 1,
        borderColor: theme.colors.warning + '30',
        gap: theme.margins.sm,
    },
    voucherWarningText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: theme.colors.warning,
    },
}));
