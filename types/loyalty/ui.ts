/**
 * ==============================================
 * LOYALTY UI TYPES - Frontend Display Types
 * ==============================================
 */

// ============================================
// POINT BATCH
// ============================================

export interface PointBatchUI {
    id: string;
    initialAmount: number;
    amount: number;
    earnedAt: string; // Formatted
    expiryDate: string; // Formatted
    expiryText: string; // e.g., "Hết hạn trong 3 ngày"
    isExpiringSoon: boolean;
    status: 'ACTIVE' | 'USED_UP' | 'EXPIRED';
    source: string; // e.g., "Đơn hàng #123"
}

// ============================================
// POINT BALANCE (Single Shop)
// ============================================

export interface PointBalanceUI {
    total: number;
    expiringSoon: number;
    batchCount: number;
    lastUpdated: string;
}

// ============================================
// POINT HISTORY
// ============================================

export interface PointTransactionUI {
    id: string;
    type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'REFUNDED';
    amount: number;
    date: string;
    orderId: string | null;
    description: string;
    isPositive: boolean;
}

export interface PointHistoryUI {
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    totalExpired: number;
    hasTransactions: boolean;
    totalPages: number;
    transactions: PointTransactionUI[];
}

// ============================================
// LOYALTY OVERVIEW (All Shops Dashboard)
// ============================================

export interface LoyaltyOverviewUI {
    totalPoints: number;
    shopCount: number;
    expiringPoints: number;
    hasUrgentPoints?: boolean;
    shops: ShopPointSummaryUI[];
}

export interface ShopPointSummaryUI {
    shopId: string;
    shopName: string;
    shopLogo: string;
    totalPoints: number;
    expiringPoints: number;
    nearestExpiryDate: string; // Formatted
    expiryWarning: string | null; // e.g., "5 ngày nữa hết hạn"
    activeBatches: number;
}

// ============================================
// PUBLIC SHOP POLICY
// ============================================

export interface ShopLoyaltyPolicyUI {
    shopId: string;
    shopName: string;
    shopLogo: string;
    isEnabled: boolean;
    ruleType: string;
    rewardValue: number;
    expiryDays: number;
    maxDiscountPercent: number;
    maxPointPerOrder: number;
}

// ============================================
// REDEEM RESULT
// ============================================

export interface PointRedeemUI {
    orderId: string;
    redeemed: number;
    remaining: number;
}
