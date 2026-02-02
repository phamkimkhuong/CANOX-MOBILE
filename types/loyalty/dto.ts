/**
 * ==============================================
 * LOYALTY DTO TYPES - API Response Structures
 * ==============================================
 */

/**
 * Individual point batch for a user in a shop
 */
export interface UserShopPointDTO {
    batchId: string;
    initialAmount: number;
    remainingAmount: number;
    earnedAt: string; // ISO Date
    expiryAt: string; // ISO Date
    status: 'ACTIVE' | 'USED_UP' | 'EXPIRED';
    sourceOrderNumber?: string | null;
    daysUntilExpiry: number;
}

/**
 * Summary of points in a shop
 */
export interface PointBalanceDTO {
    totalAvailable: number;
    activeBatchCount: number;
    expiringPoints: number;
    batches: UserShopPointDTO[];
    queriedAt: string; // ISO Date
}

/**
 * Request to consume points
 */
export interface ConsumePointsRequestDTO {
    shopId: string;
    orderId: string;
    amount: number;
}
