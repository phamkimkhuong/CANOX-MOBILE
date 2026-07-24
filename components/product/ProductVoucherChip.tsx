import type { PriceBreakdown, VoucherUI } from '@/types/product/productDetail';
import { formatCurrency } from '@/utils/format';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { ProductVoucherDetailSheet, type ProductVoucherSheetData } from './ProductVoucherDetailSheet';

type VoucherSponsorType = 'SHOP' | 'PLATFORM';
type BreakdownVoucher = NonNullable<PriceBreakdown['shopVoucher']>;

interface ProductVoucherChipProps {
    sponsorType: VoucherSponsorType;
    summary?: PriceBreakdown['shopVoucher'];
    vouchers?: VoucherUI[];
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const resolveVoucher = (
    summary: BreakdownVoucher,
    vouchers: VoucherUI[],
    sponsorType: VoucherSponsorType
): VoucherUI | undefined => {
    const exactById = summary.id
        ? vouchers.find((voucher) => voucher.id === summary.id)
        : undefined;
    if (exactById) return exactById;

    const exactByName = summary.name
        ? vouchers.find((voucher) => normalize(voucher.name) === normalize(summary.name))
        : undefined;
    if (exactByName) return exactByName;

    return vouchers.find((voucher) => {
        const voucherSponsor = voucher.sponsorType ?? 'SHOP';
        return voucherSponsor === sponsorType
            && voucher.discountType === summary.discountType
            && (voucher.discountValue ?? 0) === (summary.discountValue ?? 0)
            && (voucher.maxDiscount ?? null) === (summary.maxDiscount ?? null);
    });
};

export const ProductVoucherChip = memo<ProductVoucherChipProps>(({
    sponsorType,
    summary,
    vouchers = [],
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['product']);
    const [visible, setVisible] = useState(false);

    const detail = useMemo<ProductVoucherSheetData | null>(() => {
        if (!summary || summary.amount <= 0) return null;

        const resolvedVoucher = resolveVoucher(summary, vouchers, sponsorType);

        return {
            sponsorType,
            title: resolvedVoucher?.name || summary.name || (sponsorType === 'PLATFORM' ? 'TCano Voucher' : 'Shop Voucher'),
            appliedAmount: summary.amount,
            code: resolvedVoucher?.code,
            description: resolvedVoucher?.description,
            discountType: resolvedVoucher?.discountType ?? summary.discountType,
            discountValue: resolvedVoucher?.discountValue ?? summary.discountValue,
            maxDiscount: resolvedVoucher?.maxDiscount ?? summary.maxDiscount,
            minOrderValue: resolvedVoucher?.minOrderValue,
            endDate: resolvedVoucher?.endDate,
        };
    }, [sponsorType, summary, vouchers]);

    if (!detail) return null;

    return (
        <>
            <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                ]}
                onPress={() => setVisible(true)}
                android_ripple={{ color: theme.colors.successLight }}
            >
                <IconSymbol name="ticket" size={12} color={theme.colors.success} />
                <Text style={styles.text} numberOfLines={1}>
                    {t('product:info.discount')} -{formatCurrency(detail.appliedAmount)}
                </Text>
            </Pressable>

            <ProductVoucherDetailSheet
                visible={visible}
                onClose={() => setVisible(false)}
                detail={detail}
            />
        </>
    );
});

ProductVoucherChip.displayName = 'ProductVoucherChip';

const styles = StyleSheet.create((theme) => ({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.successLight,
    },
    chipPressed: {
        opacity: 0.85,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.success,
        flexShrink: 1,
    },
}));
