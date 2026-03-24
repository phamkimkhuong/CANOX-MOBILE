import type { VoucherUI } from '@/types/product/productDetail';
import { formatCurrency } from '@/utils/format';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

type VoucherSponsorType = 'SHOP' | 'PLATFORM';

export interface ProductVoucherSheetData {
    sponsorType: VoucherSponsorType;
    title: string;
    appliedAmount: number;
    code?: string;
    description?: string | null;
    discountType?: VoucherUI['discountType'];
    discountValue?: number | null;
    maxDiscount?: number | null;
    minOrderValue?: number;
    endDate?: string | null;
}

interface ProductVoucherDetailSheetProps {
    visible: boolean;
    onClose: () => void;
    detail?: ProductVoucherSheetData | null;
}

const InfoRow = memo<{
    label: string;
    value: string;
}>(({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
));

InfoRow.displayName = 'InfoRow';

const formatDateSafe = (value: string | null | undefined, locale: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat(locale.startsWith('vi') ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export const ProductVoucherDetailSheet = memo<ProductVoucherDetailSheetProps>(({
    visible,
    onClose,
    detail,
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation(['voucher']);

    const benefitValue = useMemo(() => {
        if (!detail) return null;

        if (detail.discountType === 'PERCENTAGE' && (detail.discountValue ?? 0) > 0) {
            return t('voucher:pdp.benefitPercent', {
                percent: detail.discountValue,
            });
        }

        if (detail.discountType === 'FIXED_AMOUNT' && (detail.discountValue ?? 0) > 0) {
            return t('voucher:pdp.benefitFixed', {
                amount: formatCurrency(detail.discountValue ?? 0),
            });
        }

        return null;
    }, [detail, t]);

    const formattedExpiry = useMemo(
        () => formatDateSafe(detail?.endDate, i18n.language),
        [detail?.endDate, i18n.language]
    );

    if (!detail) return null;

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
                    onPress={(event) => event.stopPropagation()}
                >
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {detail.sponsorType === 'PLATFORM'
                                ? t('voucher:pdp.sheetTitlePlatform')
                                : t('voucher:pdp.sheetTitleShop')}
                        </Text>
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <IconSymbol name="close" size={24} color={theme.colors.typography} />
                        </Pressable>
                    </View>

                    <View style={styles.heroCard}>
                        <View style={styles.heroIconWrap}>
                            <IconSymbol name="ticket" size={18} color={theme.colors.success} />
                        </View>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroLabel} numberOfLines={2}>
                                {detail.title}
                            </Text>
                            <Text style={styles.heroValue}>
                                {t('voucher:pdp.sheetAppliedValue', {
                                    amount: formatCurrency(detail.appliedAmount),
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        {detail.code ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetCode')}
                                value={detail.code}
                            />
                        ) : null}

                        {benefitValue ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetBenefit')}
                                value={benefitValue}
                            />
                        ) : null}

                        {detail.maxDiscount != null && detail.maxDiscount > 0 ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetMaxDiscount')}
                                value={formatCurrency(detail.maxDiscount)}
                            />
                        ) : null}

                        {detail.minOrderValue != null && detail.minOrderValue > 0 ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetMinOrder')}
                                value={formatCurrency(detail.minOrderValue)}
                            />
                        ) : null}

                        {formattedExpiry ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetExpiry')}
                                value={formattedExpiry}
                            />
                        ) : null}

                        {detail.description ? (
                            <InfoRow
                                label={t('voucher:pdp.sheetDescription')}
                                value={detail.description}
                            />
                        ) : null}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

ProductVoucherDetailSheet.displayName = 'ProductVoucherDetailSheet';

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
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
        marginTop: theme.margins.lg,
        padding: theme.margins.md,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.successLight,
        borderWidth: 1,
        borderColor: theme.colors.successLight,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.successSoft,
    },
    heroContent: {
        flex: 1,
    },
    heroLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
        marginBottom: 2,
    },
    heroValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    content: {
        paddingVertical: theme.margins.lg,
        gap: theme.margins.md,
    },
    row: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typography,
    },
}));
