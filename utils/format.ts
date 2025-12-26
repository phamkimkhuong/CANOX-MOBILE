/**
 * Formats currency for display
 * - Hiển thị đầy đủ số với dấu phân cách hàng nghìn
 * - Ký hiệu đ nằm sau số
 */
export const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')} đ`;
};

/**
 * Formats sold count for display
 * - Dưới 1000: hiển thị số gốc (999)
 * - Đúng 1000: 1K
 * - 1001-1999: 1K+
 * - 2500: 2K+
 * - 10000: 10K
 * - 10500: 10K+
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