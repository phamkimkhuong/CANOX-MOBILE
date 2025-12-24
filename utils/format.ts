/**
 * Formats currency for display
 */
export const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M đ`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K đ`;
    }
    // return `${amount.toLocaleString('vi-VN')} đ`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};