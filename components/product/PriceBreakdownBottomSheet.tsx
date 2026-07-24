import { PriceBreakdown } from '@/types/product/productDetail';
import { formatCurrency } from '@/utils/format';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

interface PriceBreakdownBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    breakdown?: PriceBreakdown;
}

/**
 * PriceBreakdownBottomSheet - Shows detailed price calculation (base, vouchers, final)
 */
export const PriceBreakdownBottomSheet = memo<PriceBreakdownBottomSheetProps>(({
    visible,
    onClose,
    breakdown,
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['product', 'voucher']);

    const formatVoucherDesc = useCallback((voucher?: PriceBreakdown['shopVoucher']) => {
        if (!voucher) return null;
        const { discountType, discountValue, maxDiscount } = voucher;

        if (discountType === 'PERCENTAGE') {
            const percentStr = `${t('voucher:card.discount')} ${discountValue}%`;
            const maxStr = maxDiscount && maxDiscount > 0
                ? ` ${t('voucher:card.maxDiscount').toLowerCase()} ${formatCurrency(maxDiscount)}`
                : '';
            return `${percentStr}${maxStr}`;
        } else if (discountType === 'FIXED_AMOUNT') {
            return `${t('voucher:card.discount')} ${formatCurrency(discountValue ?? 0)}`;
        }

        return null;
    }, [t]);

    if (!breakdown) return null;

    const containerStyle = [
        styles.container,
        { paddingBottom: insets.bottom + 16 },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={containerStyle}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Handle indicator */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t('product:priceBreakdown.title')}</Text>
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <IconSymbol name="close" size={24} color={theme.colors.typography} />
                        </Pressable>
                    </View>

                    {/* Breakdown Content */}
                    <View style={styles.content}>
                        {/* Base Price */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{t('product:priceBreakdown.basePrice')}</Text>
                            <Text style={styles.value}>{formatCurrency(breakdown.basePrice)}</Text>
                        </View>

                        {/* Product Discount (Promotion/Flash Sale) */}
                        {breakdown.productDiscount && breakdown.productDiscount.amount > 0 && (
                            <View style={styles.voucherRow}>
                                <View style={styles.voucherHeader}>
                                    <View style={styles.voucherLabelContainer}>
                                        <Text style={styles.voucherLabel}>{breakdown.productDiscount.name}</Text>
                                    </View>
                                    <View style={styles.discountValueContainer}>
                                        <Text style={styles.minus}>-</Text>
                                        <Text style={styles.discountValue}>{formatCurrency(breakdown.productDiscount.amount)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.shopVoucherDesc}>
                                    {breakdown.productDiscount.campaignType ? breakdown.productDiscount.campaignType.replace('_', ' ') : ''}
                                    {breakdown.productDiscount.percentage ? ` ${t('product:info.discount').toLowerCase()} ${breakdown.productDiscount.percentage}%` : ''}
                                </Text>
                            </View>
                        )}

                        {/* Shop Voucher */}
                        {breakdown.shopVoucher && breakdown.shopVoucher.amount > 0 && (
                            <View style={styles.voucherRow}>
                                <View style={styles.voucherHeader}>
                                    <View style={styles.voucherLabelContainer}>
                                        <Text style={styles.voucherLabel}>{t('product:priceBreakdown.shopVoucher')}</Text>
                                    </View>
                                    <View style={styles.discountValueContainer}>
                                        <Text style={styles.minus}>-</Text>
                                        <Text style={styles.discountValue}>{formatCurrency(breakdown.shopVoucher.amount)}</Text>
                                    </View>
                                </View>
                                {formatVoucherDesc(breakdown.shopVoucher) && (
                                    <Text style={styles.shopVoucherDesc}>{formatVoucherDesc(breakdown.shopVoucher)}</Text>
                                )}
                            </View>
                        )}

                        {/* Platform Voucher (TCano) */}
                        {breakdown.platformVoucher && breakdown.platformVoucher.amount > 0 && (
                            <View style={styles.voucherRow}>
                                <View style={styles.voucherHeader}>
                                    <View style={styles.voucherLabelContainer}>
                                        <Text style={styles.platformVoucherLabel}>{t('product:priceBreakdown.platformVoucher')}</Text>
                                    </View>
                                    <View style={styles.discountValueContainer}>
                                        <Text style={styles.minus}>-</Text>
                                        <Text style={styles.discountValue}>{formatCurrency(breakdown.platformVoucher.amount)}</Text>
                                    </View>
                                </View>
                                {formatVoucherDesc(breakdown.platformVoucher) && (
                                    <Text style={styles.voucherDesc}>{formatVoucherDesc(breakdown.platformVoucher)}</Text>
                                )}
                            </View>
                        )}

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Final Subtotal */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t('product:priceBreakdown.finalSubtotal')}</Text>
                            <Text style={styles.totalValue}>{formatCurrency(breakdown.finalPrice)}</Text>
                        </View>

                        {/* Legal Note */}
                        <Text style={styles.note}>
                            {t('product:priceBreakdown.legalNote')}
                        </Text>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

PriceBreakdownBottomSheet.displayName = 'PriceBreakdownBottomSheet';

const styles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: theme.margins.md,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    content: {
        paddingVertical: theme.margins.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    label: {
        fontSize: 15,
        color: theme.colors.typography,
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    voucherRow: {
        marginTop: theme.margins.sm,
        marginBottom: theme.margins.md,
    },
    voucherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voucherLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    voucherLabel: {
        fontSize: 15,
        color: theme.colors.typography,
    },
    platformVoucherLabel: {
        fontSize: 15,
        color: theme.colors.typography,
    },
    discountValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    minus: {
        color: theme.colors.error,
        fontWeight: '600',
        marginRight: 2,
    },
    discountValue: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.error,
    },
    voucherDesc: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginLeft: 0,
        marginTop: 2,
    },
    shopVoucherDesc: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginLeft: 0,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.margins.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.error,
    },
    note: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontStyle: 'italic',
        marginTop: theme.margins.sm,
    },
}));
