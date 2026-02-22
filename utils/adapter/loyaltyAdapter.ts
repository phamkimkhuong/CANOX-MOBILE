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
    ShopPointSummaryDTO,
    UserShopPointDTO,
} from '@/types/loyalty/dto';
import {
    LoyaltyOverviewUI,
    PointBalanceUI,
    PointBatchUI,
    PointHistoryUI,
    PointRedeemUI,
    ShopPointSummaryUI,
} from '@/types/loyalty/ui';
import { formatDate, formatMessageTime } from '@/utils/date';

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
        amount: dto.remainingAmount,
        expiryDate: formatDate(dto.expiryAt),
        expiryText: dto.daysUntilExpiry > 0
            ? `Hết hạn sau ${dto.daysUntilExpiry} ngày`
            : 'Đã hết hạn',
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
});

// ============================================
// LOYALTY OVERVIEW (All Shops)
// ============================================

const transformShopSummary = (dto: ShopPointSummaryDTO): ShopPointSummaryUI => {
    let expiryWarning: string | null = null;
    if (dto.expiringPoints > 0 && dto.nearestExpiryDate) {
        const daysUntil = Math.ceil(
            (new Date(dto.nearestExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil > 0 && daysUntil <= 30) {
            expiryWarning = `${daysUntil} ngày nữa hết hạn`;
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

export const transformLoyaltyOverview = (dto: LoyaltyOverviewDTO): LoyaltyOverviewUI => ({
    totalPoints: dto.totalPointsAllShops,
    shopCount: dto.totalShopsWithPoints,
    expiringPoints: dto.totalExpiringPoints,
    shops: dto.shops.map(transformShopSummary),
});

// ============================================
// REDEEM RESULT
// ============================================

export const transformRedeemResult = (dto: PointRedeemResponseDTO): PointRedeemUI => ({
    orderId: dto.orderId,
    redeemed: dto.redeemedPoints,
    remaining: dto.remainingPoints,
});
