/**
 * ==============================================
 * FORMAT UTILITIES - Single Source of Truth
 * ==============================================
 * Centralized formatting functions for the app
 */

import { getPreferredLocale } from '@/utils/date';

const CURRENCY_SYMBOL_OVERRIDES: Record<string, string> = {
    USD: '$',
    VND: 'đ',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
};

/**
 * Formats currency for display (Standard Vietnamese format)
 * Output: "100.000 đ"
 * 
 * @recommended - Use this for most cases
 */
export const formatCurrency = (amount: number): string => {
    // Làm tròn số và format theo chuẩn vi-VN, không hiển thị số lẻ
    const roundedAmount = Math.round(amount);
    return `${roundedAmount.toLocaleString('vi-VN')}\u00A0đ`;
};

/**
 * Formats money using a backend-provided ISO 4217 currency code.
 * This is used for multi-currency surfaces such as international orders.
 */
export const formatMoney = (
    amount: number,
    currency: string,
    options?: Intl.NumberFormatOptions
): string => {
    const normalizedAmount = Number.isFinite(amount) ? amount : 0;
    const normalizedCurrency = currency?.trim().toUpperCase() || 'VND';
    const locale = getPreferredLocale();

    try {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: normalizedCurrency,
            currencyDisplay: 'narrowSymbol',
            ...options,
        });

        const parts = formatter.formatToParts(normalizedAmount);
        const symbolOverride = CURRENCY_SYMBOL_OVERRIDES[normalizedCurrency];

        if (parts.length > 0) {
            return parts
                .map((part) =>
                    part.type === 'currency' && symbolOverride
                        ? symbolOverride
                        : part.value
                )
                .join('');
        }

        return formatter.format(normalizedAmount);
    } catch {
        if (normalizedCurrency === 'VND') {
            return formatCurrency(normalizedAmount);
        }

        const fallbackNumber = new Intl.NumberFormat(locale, {
            maximumFractionDigits: 2,
            minimumFractionDigits: normalizedCurrency === 'VND' ? 0 : 2,
        }).format(normalizedAmount);

        return `${fallbackNumber}\u00A0${normalizedCurrency}`;
    }
};

/**
 * Formats price in short form (for badges, cards)
 * - >= 1M: "1.5tr"
 * - >= 1K: "500k"
 * - < 1K: "999"
 */
export const formatPriceShort = (price: number): string => {
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}tr`;
    }
    if (price >= 1000) {
        return `${Math.round(price / 1000)}k`;
    }
    return price.toString();
};

/**
 * Formats sold count for display
 * - < 1000: "999"
 * - 1000: "1K"
 * - 1001-1999: "1K+"
 * - 2500: "2K+"
 * - 10000: "10K"
 */
export const formatSoldCount = (count: number): string => {
    if (count < 1000) {
        return count.toString();
    }

    const thousands = Math.floor(count / 1000);
    const remainder = count % 1000;

    // If exact thousands, no + sign
    if (remainder === 0) {
        return `${thousands}K`;
    }

    // If remainder, add + sign
    return `${thousands}K+`;
};

/**
 * Format sold count (simplified - for compact display)
 * - >= 1K: "1.5k"
 * - < 1K: "999"
 */
export const formatSoldCountSimple = (count: number): string => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

/**
 * Format Vietnamese phone number for display
 * Input: "0901234567" or "+84901234567"
 * Output: "(+84) 901 234 567"
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle +84 prefix
    let normalized = digits;
    if (digits.startsWith('84') && digits.length > 9) {
        normalized = digits.slice(2);
    } else if (digits.startsWith('0')) {
        normalized = digits.slice(1);
    }

    // Format as (+84) xxx xxx xxx
    if (normalized.length === 9) {
        return `(+84) ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
    }

    // Fallback: return original if can't parse
    return phone;
};
