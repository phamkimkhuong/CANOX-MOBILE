/**
 * Voucher Adapter - Transform API response to UI model
 * 
 * Responsibilities:
 * - Parse API response
 * - Determine voucher type from data
 * - Calculate progress percentage
 * - Format expiry text
 * - Determine voucher status
 */

import i18n from '@/constants/i18n';
import { VOUCHER_STRINGS as VOUCHER_STRINGS_EN } from '@/constants/i18n/en/voucher';
import { VOUCHER_STRINGS as VOUCHER_STRINGS_VI } from '@/constants/i18n/vi/voucher';
import type {
    VoucherResponse,
    VoucherStatus,
    VoucherType,
    VoucherUI,
} from '@/types/voucher';
import { formatExpiryCountdown, safeParseDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

const getVoucherStrings = () =>
    (i18n.resolvedLanguage || i18n.language || '').startsWith('vi')
        ? VOUCHER_STRINGS_VI
        : VOUCHER_STRINGS_EN;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine voucher type from API data
 */
export const determineVoucherType = (voucher: VoucherResponse): VoucherType => {
    const { discountType, voucherScope, tags } = voucher;

    // Check tags first
    if (tags?.includes('FREESHIP') || tags?.includes('SHIPPING')) {
        return 'shipping';
    }
    if (tags?.includes('INTERNATIONAL') || tags?.includes('GLOBAL')) {
        return 'international';
    }
    if (tags?.includes('LIVE')) {
        return 'live';
    }
    if (tags?.includes('CASHBACK') || tags?.includes('XU')) {
        return 'cashback';
    }

    // Check discount type
    if (discountType === 'SHIPPING') {
        return 'shipping';
    }

    // Check scope
    if (voucherScope === 'SHOP_ORDER' && voucher.shopId) {
        return 'shop';
    }

    return 'discount';
};

/**
 * Calculate usage percentage
 */
export const calculateUsagePercentage = (voucher: VoucherResponse): number => {
    const { totalQuantity, usedQuantity } = voucher;

    if (!totalQuantity || totalQuantity === 0) return 0;
    if (!usedQuantity) return 0;

    return Math.round((usedQuantity / totalQuantity) * 100);
};

/**
 * Determine voucher status based on API data
 */
export const determineVoucherStatus = (voucher: VoucherResponse): VoucherStatus => {
    const { isCollected, isUsed, endDate, remainingQuantity } = voucher;

    // Already used
    if (isUsed) {
        return 'use';
    }

    // Check if expired
    if (endDate) {
        const expiry = safeParseDate(endDate);
        if (expiry && expiry.getTime() < Date.now()) {
            return 'expired';
        }
    }

    // Check if soldout
    if (remainingQuantity !== undefined && remainingQuantity !== null && remainingQuantity <= 0) {
        return 'soldout';
    }

    // Already collected
    if (isCollected) {
        return 'use'; // Show "Dùng ngay" when collected
    }

    // Live voucher special case
    if (voucher.tags?.includes('LIVE')) {
        const now = new Date();
        const startDate = voucher.startDate ? safeParseDate(voucher.startDate) : null;
        if (startDate && startDate.getTime() > now.getTime()) {
            return 'reminder';
        }
    }

    return 'collect';
};

/**
 * Format expiry date to display text
 */
export const formatExpiryText = (
    endDate?: string | null
): string => {
    if (!endDate) return '';
    const strings = getVoucherStrings();
    return formatExpiryCountdown(endDate, strings.card.expiry);
};

/**
 * Check if voucher is expiring soon (< 24h)
 */
export const isExpiringSoon = (endDate?: string | null): boolean => {
    if (!endDate) return false;

    const expiry = safeParseDate(endDate);
    if (!expiry) return false;
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 0 && diffHours < 24;
};

/**
 * Format voucher title based on type
 */
export const formatVoucherTitle = (voucher: VoucherResponse): string => {
    const { discountType, discountValue, maxDiscount, name } = voucher;
    const strings = getVoucherStrings();

    if (name) return name;

    switch (discountType) {
        case 'SHIPPING':
            return strings.card.freeShipping;

        case 'PERCENTAGE':
            if (maxDiscount) {
                return `${strings.card.discountUpTo} ${formatCurrency(maxDiscount)}`;
            }
            return `${strings.card.discount} ${discountValue}%`;

        case 'FIXED_AMOUNT':
            return `${strings.card.discount} ${formatCurrency(discountValue)}`;

        default:
            return `${strings.card.discount} ${formatCurrency(discountValue)}`;
    }
};

/**
 * Format voucher subtitle (conditions)
 */
export const formatVoucherSubtitle = (voucher: VoucherResponse): string => {
    const parts: string[] = [];
    const strings = getVoucherStrings();

    // Min order value
    if (voucher.minOrderValue) {
        parts.push(`${strings.card.minOrder} ${formatCurrency(voucher.minOrderValue)}`);
    } else {
        parts.push(`${strings.card.minOrder} ₫0`);
    }

    // Max discount for percentage
    if (voucher.discountType === 'PERCENTAGE' && voucher.maxDiscount) {
        parts.push(`${strings.card.maxDiscount} ${formatCurrency(voucher.maxDiscount)}`);
    }

    return parts.join(' - ');
};

// ============================================
// MAIN TRANSFORM FUNCTION
// ============================================

/**
 * Transform VoucherResponse to VoucherUI
 */
export const transformVoucher = (voucher: VoucherResponse): VoucherUI => {
    const type = determineVoucherType(voucher);
    const status = determineVoucherStatus(voucher);
    const percentageUsed = calculateUsagePercentage(voucher);
    const expiringSoon = isExpiringSoon(voucher.endDate);

    return {
        id: voucher.id,
        code: voucher.code,
        type,
        title: formatVoucherTitle(voucher),
        subtitle: formatVoucherSubtitle(voucher),
        description: voucher.description ?? undefined,
        brandLogo: voucher.brandLogo ?? null,
        brandName: (voucher.brandName ?? voucher.shopName) ?? undefined,
        percentageUsed,
        showProgress: percentageUsed > 50,
        expiryDate: voucher.endDate ?? undefined,
        expiryText: formatExpiryText(voucher.endDate),
        isExpiringSoon: expiringSoon,
        status,
        tags: voucher.tags ?? [],
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscount: voucher.maxDiscount ?? undefined,
        minOrderValue: voucher.minOrderValue ?? undefined,
    };
};

/**
 * Transform array of vouchers
 */
export const transformVoucherList = (vouchers: VoucherResponse[]): VoucherUI[] => {
    return vouchers.map(transformVoucher);
};

/**
 * Filter vouchers by type
 */
export const filterVouchersByType = (
    vouchers: VoucherUI[],
    type?: VoucherType
): VoucherUI[] => {
    if (!type) return vouchers;
    return vouchers.filter(v => v.type === type);
};

/**
 * Sort vouchers by popularity/expiry
 */
export const sortVouchers = (
    vouchers: VoucherUI[],
    sortBy: 'popular' | 'newest' | 'expiring' = 'popular'
): VoucherUI[] => {
    const sorted = [...vouchers];

    switch (sortBy) {
        case 'expiring':
            return sorted.sort((a, b) => {
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return (
                    (safeParseDate(a.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) -
                    (safeParseDate(b.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER)
                );
            });

        case 'newest':
            // Assuming newer vouchers have higher IDs
            return sorted.sort((a, b) => b.id.localeCompare(a.id));

        case 'popular':
        default:
            // Sort by usage percentage (more used = more popular)
            return sorted.sort((a, b) => b.percentageUsed - a.percentageUsed);
    }
};

