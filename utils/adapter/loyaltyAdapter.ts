/**
 * ==============================================
 * LOYALTY ADAPTER - DTO → UI Transformers
 * ==============================================
 */

import {
    LoyaltyOverviewDTO,
    PlatformPointBalanceDTO,
    PointBalanceDTO,
    PointHistoryDTO,
    PointRedeemResponseDTO,
    ShopLoyaltyPolicyDTO,
    ShopPointSummaryDTO,
    UserShopPointDTO,
} from '@/types/loyalty/dto';
import {
    LoyaltyNearestExpiryUI,
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
    const nearestExpiryPoints = dto.nearestExpiryPoints ?? dto.expiringPoints;
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
        expiryWindowDays: dto.expiryWindowDays ?? null,
        nearestExpiryDate: dto.nearestExpiryDate ? formatDate(dto.nearestExpiryDate) : '',
        nearestExpiryDateISO: dto.nearestExpiryDate,
        nearestExpiryPoints,
        expiryWarning,
        activeBatches: dto.activeBatches,
    };
};

const getPlatformBalance = (balance: PlatformPointBalanceDTO | null | undefined): number => {
    if (!balance) return 0;
    return balance.balance
        ?? balance.availablePoints
        ?? balance.totalAvailable
        ?? balance.totalPoints
        ?? 0;
};

const toNearestExpiryCandidate = (
    sourceType: LoyaltyNearestExpiryUI['sourceType'],
    sourceName: string,
    nearestExpiryDate: string | null | undefined,
    points: number | null | undefined
): LoyaltyNearestExpiryUI | null => {
    if (!nearestExpiryDate || !points || points <= 0) return null;

    const expiryDate = safeParseDate(nearestExpiryDate);
    if (!expiryDate) return null;

    const daysUntil = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return null;

    return {
        sourceType,
        sourceName,
        points,
        expiryDate: formatDate(nearestExpiryDate),
        expiryDateISO: nearestExpiryDate,
        expiryWarning: formatExpiryInDays(daysUntil),
    };
};

const getNearestExpiry = (
    platformPointBalance: PlatformPointBalanceDTO | null | undefined,
    shops: ShopPointSummaryUI[],
    platformEnabled: boolean
): LoyaltyNearestExpiryUI | null => {
    const candidates: LoyaltyNearestExpiryUI[] = [];

    if (platformEnabled && platformPointBalance) {
        const platformCandidate = toNearestExpiryCandidate(
            'PLATFORM',
            'Xu Canox',
            platformPointBalance.nearestExpiryDate,
            platformPointBalance.nearestExpiryPoints ?? platformPointBalance.expiringPoints
        );
        if (platformCandidate) {
            candidates.push(platformCandidate);
        }
    }

    shops.forEach(shop => {
        const shopCandidate = toNearestExpiryCandidate(
            'SHOP',
            shop.shopName,
            shop.nearestExpiryDateISO,
            shop.nearestExpiryPoints
        );
        if (shopCandidate) {
            candidates.push(shopCandidate);
        }
    });

    return candidates.sort((a, b) => {
        const aDate = safeParseDate(a.expiryDateISO)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate = safeParseDate(b.expiryDateISO)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
    })[0] ?? null;
};

export const transformLoyaltyOverview = (dto: LoyaltyOverviewDTO): LoyaltyOverviewUI => {
    const shops = dto.shops.map(transformShopSummary);
    const totalCombinedBalance = dto.totalCombinedBalance ?? dto.totalPointsAllShops;
    const platformEnabled = dto.platformEnabled ?? false;
    const platformBalance = getPlatformBalance(dto.platformPointBalance);
    const hasPlatformBalanceData = platformEnabled && dto.platformPointBalance != null;
    const displayBalanceKind: LoyaltyOverviewUI['displayBalanceKind'] = hasPlatformBalanceData ? 'PLATFORM' : 'COMBINED';
    const displayBalance = displayBalanceKind === 'PLATFORM' ? platformBalance : totalCombinedBalance;
    const nearestExpiry = getNearestExpiry(dto.platformPointBalance, shops, platformEnabled);
    const hasUrgentPoints = dto.shops.some(s => {
        if (!s.nearestExpiryDate || s.expiringPoints <= 0) return false;
        const date = safeParseDate(s.nearestExpiryDate);
        if (!date) return false;
        const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 15;
    });

    return {
        totalPoints: totalCombinedBalance,
        totalCombinedBalance,
        platformBalance,
        displayBalance,
        displayBalanceKind,
        shopCount: dto.totalShopsWithPoints,
        expiringPoints: dto.totalExpiringPoints,
        platformEnabled,
        platformExpiryDays: dto.platformExpiryDays ?? 30,
        nearestExpiry,
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
