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
    const voucher = dto.voucher;
    const applicable = dto.applicable ?? false;
    const reason = dto.reason;

    if (!voucher) {
        return {
            id: '',
            code: '',
            title: '',
            description: '',
            discountDisplay: '',
            minOrderDisplay: '',
            isApplicable: false,
            expiresAt: null,
        };
    }

    const discountValue = voucher.discountValue ?? 0;
    const isPercentage = voucher.discountType === 'PERCENTAGE';
    const maxDiscount = voucher.maxDiscount ?? null;

    // Format discount display: "Giảm 10%" hoặc "Giảm 50.000 đ"
    const discountDisplay = isPercentage
        ? `Giảm\u00A0${Math.round(discountValue)}%`
        : `Giảm\u00A0${formatCurrency(discountValue)}`;

    // Format max discount display (the main title in some views)
    const maxDiscountDisplay = isPercentage && maxDiscount && maxDiscount > 0
        ? `Giảm tối đa ${formatCurrency(maxDiscount)}`
        : `Giảm ${formatCurrency(discountValue)}`;

    const minOrderDisplay = voucher.minOrderAmount && voucher.minOrderAmount > 1000 // Only show if > 1k
        ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
        : 'Mọi đơn hàng';

    // Determine category from voucherScope
    const category = voucher.voucherScope === 'SHIPPING' ? 'SHIPPING' : 'DISCOUNT';

    return {
        id: voucher.code ?? '',
        code: voucher.code ?? '',
        title: voucher.name ?? '',
        description: reason || voucher.description || '',
        discountDisplay,
        minOrderDisplay,
        isApplicable: applicable,
        expiresAt: voucher.endDate ?? null,
        category,

        // Extended fields for rich display
        discountType: isPercentage ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discountValue,
        maxDiscount,
        maxDiscountDisplay,
        maxUsage: voucher.maxUsage ?? null,
        calculatedDiscount: null, // We don't have this pre-calculated for separate platform recommendations usually
        reason: reason ?? null,
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
