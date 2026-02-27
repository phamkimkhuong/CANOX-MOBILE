/**
 * ==============================================
 * LOYALTY DTO TYPES - API Response Structures
 * ==============================================
 */

// ============================================
// BATCH
// ============================================

/**
 * Individual point batch for a user in a shop
 * GET /buyer/loyalty/shops/{shopId}/batches → data[]
 * GET /buyer/loyalty/shops/{shopId} → data.batches[]
 */
export interface UserShopPointDTO {
    batchId: string;
    remainingAmount: number;
    expiryAt: string; // ISO Date
    status: 'ACTIVE' | 'USED_UP' | 'EXPIRED';
    sourceOrderNumber?: string | null;
    daysUntilExpiry: number;
}

// ============================================
// SHOP SUMMARY (PointBalanceResponse)
// ============================================

/**
 * Comprehensive loyalty info for a single shop
 * GET /buyer/loyalty/shops/{shopId}
 */
export interface PointBalanceDTO {
    totalAvailable: number;
    activeBatchCount: number;
    expiringPoints: number;
    queriedAt: string; // ISO Date
}

// ============================================
// HISTORY (PointHistoryResponse)
// ============================================

/**
 * Transaction history summary + paginated transactions
 * GET /buyer/loyalty/shops/{shopId}/history
 */
export interface PointHistoryDTO {
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    totalExpired: number;
    transactions: PointHistoryPageDTO;
}

export interface PointTransactionDTO {
    type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'REFUNDED';
    amount: number;
    transactionDate: string;
    description: string;
}

export interface PointHistoryPageDTO {
    content: PointTransactionDTO[];
    totalPages: number;
    empty: boolean;
}

// ============================================
// OVERVIEW (LoyaltyOverviewResponse)
// ============================================

/**
 * Dashboard showing points across all shops
 * GET /buyer/loyalty/overview
 */
export interface LoyaltyOverviewDTO {
    totalPointsAllShops: number;
    totalShopsWithPoints: number;
    totalExpiringPoints: number;
    shops: ShopPointSummaryDTO[];
}

export interface ShopPointSummaryDTO {
    shopId: string;
    shopName: string;
    shopLogo: string;
    totalPoints: number;
    expiringPoints: number;
    nearestExpiryDate: string | null; // ISO Date, nullable
    activeBatches: number;
}

// ============================================
// REDEEM
// ============================================

/**
 * Request to redeem points
 * POST /buyer/loyalty/shops/{shopId}/redeem
 */
export interface ConsumePointsRequestDTO {
    shopId: string;
    orderId: string;
    amount: number;
}

/**
 * Response after redeeming points
 */
export interface PointRedeemResponseDTO {
    orderId: string;
    redeemedPoints: number;
    remainingPoints: number;
}
