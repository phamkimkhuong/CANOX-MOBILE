
/**
 * UI representation of a Point Batch
 */
export interface PointBatchUI {
    id: string;
    amount: number;
    expiryDate: string; // Formatted
    expiryText: string; // e.g., "Hết hạn trong 3 ngày"
    isExpiringSoon: boolean;
    status: 'ACTIVE' | 'USED_UP' | 'EXPIRED';
    source: string; // e.g., "Đơn hàng #123"
}

/**
 * UI representation of Point Balance
 */
export interface PointBalanceUI {
    total: number;
    expiringSoon: number;
    batchCount: number;
    lastUpdated: string;
}
