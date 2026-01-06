/**
 * Recommended Platform Voucher Types
 * 
 * Used for fetching vouchers from platform context during checkout.
 * API: POST /api/v2/vouchers/recommend/by-platform
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// REQUEST SCHEMAS
// ============================================

export const RecommendPlatformVoucherItemSchema = z.object({
    productId: z.string(),
    shopId: z.string(),
    unitPrice: z.number(),
    quantity: z.number(),
    lineTotal: z.number(),
});

export const RecommendPlatformVoucherRequestSchema = z.object({
    shopId: z.string().optional(),
    totalAmount: z.number(),
    shopIds: z.array(z.string()),
    productIds: z.array(z.string()),
    items: z.array(RecommendPlatformVoucherItemSchema).optional(),
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

export type RecommendPlatformVoucherRequest = z.infer<typeof RecommendPlatformVoucherRequestSchema>;

// ============================================
// RESPONSE DTO SCHEMAS
// ============================================

export const RecommendedVoucherDetailDTOSchema = z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    voucherScope: z.string().optional(), // Flexible string instead of strict enum
    discountType: z.string().optional(), // Flexible string instead of strict enum
    discountValue: z.number().nullable().optional().default(0),
    minOrderAmount: z.number().nullable().optional().default(0),
    maxDiscount: z.number().nullable().optional().default(0),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    creatorType: z.string().nullable().optional(),
    sponsorType: z.string().nullable().optional(),
    purchasable: z.boolean().nullable().optional(),
    price: z.number().nullable().optional(),
    maxUsage: z.number().nullable().optional(),
    validityDays: z.number().nullable().optional(),
    maxPurchasePerShop: z.number().nullable().optional(),
    applyToAllShops: z.boolean().nullable().optional(),
    applyToAllProducts: z.boolean().nullable().optional(),
    applyToAllCustomers: z.boolean().nullable().optional(),
    shopIds: z.array(z.string()).nullable().optional().default([]),
    productIds: z.array(z.string()).nullable().optional().default([]),
    customerIds: z.array(z.string()).nullable().optional().default([]),
    active: z.boolean().nullable().optional(),
    createdDate: z.string().nullable().optional(),
    lastModifiedDate: z.string().nullable().optional(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
});

export const RecommendedPlatformVoucherDTOSchema = z.object({
    voucher: RecommendedVoucherDetailDTOSchema.nullable().optional(),
    applicable: z.boolean().optional().default(false),
    reason: z.string().nullable().optional(),
});

export const RecommendPlatformVoucherDataSchema = z.object({
    productOrderVouchers: z.array(RecommendedPlatformVoucherDTOSchema),
    shippingVouchers: z.array(RecommendedPlatformVoucherDTOSchema),
});

/**
 * Full API response for recommend platform vouchers
 */
export const RecommendPlatformVoucherResponseSchema = ResponseDefaultSchema.extend({
    data: RecommendPlatformVoucherDataSchema,
});

export type RecommendPlatformVoucherResponse = z.infer<typeof RecommendPlatformVoucherResponseSchema>;
export type RecommendedPlatformVoucherDTO = z.infer<typeof RecommendedPlatformVoucherDTOSchema>;
export type RecommendedVoucherDetailDTO = z.infer<typeof RecommendedVoucherDetailDTOSchema>;
