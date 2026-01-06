/**
 * Platform Voucher Adapter
 * 
 * Transforms RecommendedPlatformVoucherDTO to VoucherUI.
 */

import type { VoucherUI } from '@/types/cart';
import type { RecommendedPlatformVoucherDTO } from '@/types/checkout/platformVoucherRecommendation';
import { formatCurrency } from '@/utils/format';

const DEFAULT_IMAGE = 'https://via.placeholder.com/96';

/**
 * Transform a recommended platform voucher DTO to UI type.
 * Maps to the simplified VoucherUI used in checkout.
 */
export const toPlatformVoucherUI = (dto: RecommendedPlatformVoucherDTO): VoucherUI => {
    const { voucher, applicable, reason } = dto;

    return {
        id: voucher?.code ?? '',
        code: voucher?.code ?? '',
        title: voucher?.name ?? '',
        description: reason || voucher?.description || '',
        discountDisplay: formatDiscountDisplay(voucher?.discountValue ?? 0, (voucher?.discountType as any) || 'FIXED_AMOUNT'),
        minOrderDisplay: voucher?.minOrderAmount
            ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
            : 'Mọi đơn hàng',
        isApplicable: applicable ?? false,
        expiresAt: voucher?.endDate ?? null,
        category: voucher?.voucherScope === 'SHIPPING' ? 'SHIPPING' : 'DISCOUNT',
    };
};

/**
 * Format discount amount for display.
 */
const formatDiscountDisplay = (value: number, type: 'PERCENTAGE' | 'FIXED_AMOUNT'): string => {
    if (type === 'PERCENTAGE') {
        const roundedValue = Math.round(value);
        return `Giảm\u00A0${roundedValue}%`;
    }
    return `Giảm\u00A0${formatCurrency(value)}`;
};

/**
 * Transform the entire recommendation data to a flat list of VoucherUI.
 */
export const toPlatformVoucherUIList = (data: {
    productOrderVouchers: RecommendedPlatformVoucherDTO[];
    shippingVouchers: RecommendedPlatformVoucherDTO[];
}): VoucherUI[] => {
    const combined = [
        ...data.productOrderVouchers,
        ...data.shippingVouchers,
    ];

    return combined.map(toPlatformVoucherUI);
};
