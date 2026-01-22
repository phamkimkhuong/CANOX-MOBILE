/**
 * Recommended Shop Voucher Types
 * 
 * Used for fetching vouchers from a specific shop context during checkout.
 * API: POST /api/v2/vouchers/recommend/by-shop
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';
import { RecommendedVoucherDetailDTOSchema } from './platformVoucherRecommendation';

// ============================================
// REQUEST SCHEMAS
// ============================================

export const RecommendShopVoucherItemSchema = z.object({
    productId: z.string(),
    shopId: z.string(),
    unitPrice: z.number(),
    quantity: z.number(),
    lineTotal: z.number(),
});

export const RecommendShopVoucherRequestSchema = z.object({
    shopId: z.string(), // Required for by-shop
    totalAmount: z.number(),
    shopIds: z.array(z.string()),
    productIds: z.array(z.string()),
    items: z.array(RecommendShopVoucherItemSchema).optional(),
    shippingFee: z.number().optional(),
    shippingMethod: z.string().optional(),
    shippingProvince: z.string().optional(),
    shippingDistrict: z.string().optional(),
    shippingWard: z.string().optional(),
    cartId: z.string().optional(),
    failedVoucherCodes: z.array(z.string()).default([]),
    preferences: z.object({
        scopes: z.array(z.string()).default(['SHOP_ORDER', 'SHIPPING']),
        limit: z.number().default(10),
    }),
});

export type RecommendShopVoucherRequest = z.infer<typeof RecommendShopVoucherRequestSchema>;

// ============================================
// RESPONSE DTO SCHEMAS
// ============================================

export const RecommendedShopVoucherDTOSchema = z.object({
    voucher: RecommendedVoucherDetailDTOSchema.nullable().optional(),
    applicable: z.boolean().optional().default(false),
    reason: z.string().nullable().optional(),
    calculatedDiscount: z.number().nullable().optional(),
});

/**
 * Full API response for recommend shop vouchers
 * Note: by-shop returns an array of vouchers directly in 'data'
 */
export const RecommendShopVoucherResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(RecommendedShopVoucherDTOSchema),
});

export type RecommendShopVoucherResponse = z.infer<typeof RecommendShopVoucherResponseSchema>;
export type RecommendedShopVoucherDTO = z.infer<typeof RecommendedShopVoucherDTOSchema>;
