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
    id: z.string(),
    code: z.string(),
    name: z.string(),
    description: z.string(),
    voucherScope: z.enum(['SHOP_ORDER', 'SHIPPING', 'PRODUCT']),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number(),
    minOrderAmount: z.number().nullable().optional(),
    maxDiscount: z.number().nullable().optional(),
    startDate: z.string(),
    endDate: z.string(),
    creatorType: z.string().optional(),
    sponsorType: z.string().optional(),
    purchasable: z.boolean().optional(),
    price: z.number().optional(),
    maxUsage: z.number().optional(),
    validityDays: z.number().nullable().optional(),
    maxPurchasePerShop: z.number().nullable().optional(),
    applyToAllShops: z.boolean().optional(),
    applyToAllProducts: z.boolean().optional(),
    applyToAllCustomers: z.boolean().optional(),
    shopIds: z.array(z.string()).nullable().optional(),
    productIds: z.array(z.string()).nullable().optional(),
    customerIds: z.array(z.string()).nullable().optional(),
    active: z.boolean().optional(),
    createdDate: z.string().optional(),
    lastModifiedDate: z.string().optional(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
});

export const RecommendedPlatformVoucherDTOSchema = z.object({
    voucher: RecommendedVoucherDetailDTOSchema,
    applicable: z.boolean(),
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
