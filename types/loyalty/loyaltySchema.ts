/**
 * ==============================================
 * LOYALTY ZOD SCHEMAS - Runtime Validation
 * ==============================================
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// BATCH SCHEMA
// ============================================

export const UserShopPointSchema = z.object({
    batchId: z.string(),
    initialAmount: z.number().default(0),
    remainingAmount: z.number().default(0),
    earnedAt: z.string(),
    expiryAt: z.string(),
    status: z.enum(['ACTIVE', 'USED_UP', 'EXPIRED']),
    sourceOrderNumber: z.string().nullish(),
    daysUntilExpiry: z.coerce.number().default(0),
});

// ============================================
// SHOP SUMMARY (PointBalanceResponse)
// ============================================

export const PointBalanceSchema = z.object({
    totalAvailable: z.number().default(0),
    activeBatchCount: z.number().default(0),
    expiringPoints: z.number().default(0),
    queriedAt: z.string(),
});

export const PointBalanceResponseSchema = ResponseDefaultSchema.extend({
    data: PointBalanceSchema,
});

// ============================================
// BATCHES LIST
// ============================================

export const PointBatchesResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(UserShopPointSchema),
});

// ============================================
// HISTORY (PointHistoryResponse)
// ============================================

export const PointTransactionSchema = z.object({
    type: z.enum(['EARNED', 'SPENT', 'EXPIRED', 'REFUNDED']),
    amount: z.number().default(0),
    transactionDate: z.string(),
    orderId: z.string().nullish(),
    description: z.string().default(''),
});

const PointHistoryPageSchema = z.object({
    content: z.array(PointTransactionSchema).default([]),
    totalPages: z.number().default(0),
    empty: z.boolean().default(true),
});

export const PointHistorySchema = z.object({
    currentBalance: z.number().default(0),
    totalEarned: z.number().default(0),
    totalSpent: z.number().default(0),
    totalExpired: z.number().default(0),
    transactions: PointHistoryPageSchema,
});

export const PointHistoryResponseSchema = ResponseDefaultSchema.extend({
    data: PointHistorySchema,
});

// ============================================
// OVERVIEW (LoyaltyOverviewResponse)
// ============================================

export const ShopPointSummarySchema = z.object({
    shopId: z.string(),
    shopName: z.string().default(''),
    shopLogo: z.string().default(''),
    totalPoints: z.number().default(0),
    expiringPoints: z.number().default(0),
    nearestExpiryDate: z.string().nullable().default(null),
    activeBatches: z.number().default(0),
});

export const LoyaltyOverviewSchema = z.object({
    totalPointsAllShops: z.number().default(0),
    totalShopsWithPoints: z.number().default(0),
    totalExpiringPoints: z.number().default(0),
    shops: z.array(ShopPointSummarySchema).default([]),
});

export const LoyaltyOverviewResponseSchema = ResponseDefaultSchema.extend({
    data: LoyaltyOverviewSchema,
});

// ============================================
// PUBLIC SHOP POLICY
// ============================================

export const ShopLoyaltyPolicySchema = z.object({
    shopId: z.string(),
    shopName: z.string().default(''),
    shopLogo: z.string().default(''),
    loyaltyEnabled: z.boolean().default(false),
    ruleType: z.string().nullish().default(null),
    ruleValue: z.coerce.number().nullish().default(null),
    expiryDays: z.coerce.number().nullish().default(null),
    maxDiscountPercent: z.coerce.number().nullish().default(null),
    maxPointPerOrder: z.coerce.number().nullish().default(null),
    description: z.string().default(''),
});

export const ShopLoyaltyPolicyResponseSchema = ResponseDefaultSchema.extend({
    data: ShopLoyaltyPolicySchema,
});

// ============================================
// REDEEM (PointRedeemResponse)
// ============================================

export const PointRedeemSchema = z.object({
    orderId: z.string(),
    redeemedPoints: z.number().default(0),
    remainingPoints: z.number().default(0),
});

export const PointRedeemResponseSchema = ResponseDefaultSchema.extend({
    data: PointRedeemSchema,
});
