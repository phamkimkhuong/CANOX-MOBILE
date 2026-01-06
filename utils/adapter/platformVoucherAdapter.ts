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
        id: voucher.code,
        code: voucher.code,
        title: voucher.name,
        description: reason || voucher.description || '',
        discountDisplay: formatDiscountDisplay(voucher.discountValue, voucher.discountType),
        minOrderDisplay: voucher.minOrderAmount
            ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
            : 'Mọi đơn hàng',
        isApplicable: applicable,
        expiresAt: voucher.endDate,
    };
};

/**
 * Format discount amount for display.
 */
const formatDiscountDisplay = (value: number, type: 'PERCENTAGE' | 'FIXED_AMOUNT'): string => {
    if (type === 'PERCENTAGE') {
        return `Giảm ${value}%`;
    }
    // For fixed amount, common Vietnamese e-commerce pattern: 15000 -> 15k
    if (value >= 1000) {
        return `Giảm ${Math.round(value / 1000)}k`;
    }
    return `Giảm ${value}đ`;
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
