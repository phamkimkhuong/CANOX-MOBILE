/**
 * ==============================================
 * LOYALTY ADAPTER - DTO → UI Transformers
 * ==============================================
 */

import {
    LoyaltyOverviewDTO,
    PointBalanceDTO,
    PointHistoryDTO,
    PointRedeemResponseDTO,
    ShopLoyaltyPolicyDTO,
    ShopPointSummaryDTO,
    UserShopPointDTO,
} from '@/types/loyalty/dto';
import {
    LoyaltyOverviewUI,
    PointBalanceUI,
    PointBatchUI,
    PointHistoryUI,
    PointRedeemUI,
    ShopLoyaltyPolicyUI,
    ShopPointSummaryUI,
} from '@/types/loyalty/ui';
import { formatDate, formatExpiryInDays, formatMessageTime, safeParseDate } from '@/utils/date';

// ============================================
// POINT BALANCE (Single Shop)
// ============================================

export const transformPointBalance = (dto: PointBalanceDTO): PointBalanceUI => {
    const lastUpdatedDate = dto.queriedAt;
    return {
        total: dto.totalAvailable,
        expiringSoon: dto.expiringPoints,
        batchCount: dto.activeBatchCount,
        lastUpdated: `${formatMessageTime(lastUpdatedDate)} ${formatDate(lastUpdatedDate)}`,
    };
};

// ============================================
// POINT BATCH
// ============================================

export const transformPointBatch = (dto: UserShopPointDTO): PointBatchUI => {
    const isExpiringSoon = dto.daysUntilExpiry <= 7 && dto.status === 'ACTIVE';

    return {
        id: dto.batchId,
        initialAmount: dto.initialAmount,
        amount: dto.remainingAmount,
        earnedAt: formatDate(dto.earnedAt),
        expiryDate: formatDate(dto.expiryAt),
        expiryText: formatExpiryInDays(dto.daysUntilExpiry),
        isExpiringSoon,
        status: dto.status,
        source: dto.sourceOrderNumber ? `Đơn hàng #${dto.sourceOrderNumber}` : 'Tích lũy hệ thống',
    };
};

// ============================================
// POINT HISTORY
// ============================================

export const transformPointHistory = (dto: PointHistoryDTO): PointHistoryUI => ({
    currentBalance: dto.currentBalance,
    totalEarned: dto.totalEarned,
    totalSpent: dto.totalSpent,
    totalExpired: dto.totalExpired,
    hasTransactions: !dto.transactions.empty,
    totalPages: dto.transactions.totalPages,
    transactions: dto.transactions.content.map(tx => ({
        id: tx.transactionDate,
        type: tx.type,
        amount: tx.amount,
        date: formatDate(tx.transactionDate),
        orderId: tx.orderId || null,
        description: tx.description,
        isPositive: tx.type === 'EARNED' || tx.type === 'REFUNDED',
    })),
});

// ============================================
// LOYALTY OVERVIEW (All Shops)
// ============================================

const transformShopSummary = (dto: ShopPointSummaryDTO): ShopPointSummaryUI => {
    let expiryWarning: string | null = null;
    if (dto.expiringPoints > 0 && dto.nearestExpiryDate) {
        const nearestExpiryDate = safeParseDate(dto.nearestExpiryDate);
        const daysUntil = Math.ceil(
            ((nearestExpiryDate?.getTime() ?? 0) - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil > 0 && daysUntil <= 30) {
            expiryWarning = formatExpiryInDays(daysUntil);
        }
    }

    return {
        shopId: dto.shopId,
        shopName: dto.shopName,
        shopLogo: dto.shopLogo,
        totalPoints: dto.totalPoints,
        expiringPoints: dto.expiringPoints,
        nearestExpiryDate: dto.nearestExpiryDate ? formatDate(dto.nearestExpiryDate) : '',
        expiryWarning,
        activeBatches: dto.activeBatches,
    };
};

export const transformLoyaltyOverview = (dto: LoyaltyOverviewDTO): LoyaltyOverviewUI => {
    const shops = dto.shops.map(transformShopSummary);
    const hasUrgentPoints = dto.shops.some(s => {
        if (!s.nearestExpiryDate || s.expiringPoints <= 0) return false;
        const date = safeParseDate(s.nearestExpiryDate);
        if (!date) return false;
        const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 15;
    });

    return {
        totalPoints: dto.totalPointsAllShops,
        shopCount: dto.totalShopsWithPoints,
        expiringPoints: dto.totalExpiringPoints,
        hasUrgentPoints,
        shops,
    };
};

// ============================================
// PUBLIC SHOP POLICY
// ============================================

export const transformShopLoyaltyPolicy = (dto: ShopLoyaltyPolicyDTO): ShopLoyaltyPolicyUI => ({
    shopId: dto.shopId,
    shopName: dto.shopName,
    shopLogo: dto.shopLogo,
    isEnabled: dto.loyaltyEnabled,
    ruleType: dto.ruleType ?? '',
    rewardValue: dto.ruleValue ?? 0,
    expiryDays: dto.expiryDays ?? 0,
    maxDiscountPercent: dto.maxDiscountPercent ?? 0,
    maxPointPerOrder: dto.maxPointPerOrder ?? 0,
});

// ============================================
// REDEEM RESULT
// ============================================

export const transformRedeemResult = (dto: PointRedeemResponseDTO): PointRedeemUI => ({
    orderId: dto.orderId,
    redeemed: dto.redeemedPoints,
    remaining: dto.remainingPoints,
});
