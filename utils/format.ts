/**
 * ==============================================
 * FORMAT UTILITIES - Single Source of Truth
 * ==============================================
 * Centralized formatting functions for the app
 */

/**
 * Formats currency for display (Standard Vietnamese format)
 * Output: "100.000 đ"
 * 
 * @recommended - Use this for most cases
 */
export const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')} đ`;
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

    // Nếu là số chẵn nghìn thì không có dấu +
    if (remainder === 0) {
        return `${thousands}K`;
    }

    // Nếu có dư thì thêm dấu +
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