import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// INDIVIDUAL BATCH SCHEMA
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
// POINT BALANCE SCHEMA
// ============================================

export const PointBalanceSchema = z.object({
    totalAvailable: z.number().default(0),
    activeBatchCount: z.number().default(0),
    expiringPoints: z.number().default(0),
    batches: z.array(UserShopPointSchema).default([]),
    queriedAt: z.string(),
});

// ============================================
// API RESPONSE SCHEMAS
// ============================================

export const PointBalanceResponseSchema = ResponseDefaultSchema.extend({
    data: PointBalanceSchema,
});

export const PointBatchesResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(UserShopPointSchema),
});

/**
 * The GET /api/v1/buyer/loyalty/points/{shopId} returns a Map<String, Object>
 * Usually it's { "totalPoints": number }
 */
export const PointsSummaryResponseSchema = ResponseDefaultSchema.extend({
    data: z.record(z.string(), z.any()),
});
