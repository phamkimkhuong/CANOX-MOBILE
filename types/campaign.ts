import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

/**
 * Campaign Slot Product Schema
 * Matches GET /api/v1/campaigns/slots/{slotId}/products
 */
export const CampaignSlotProductResponseSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string().nullable().optional().default(''),
    productSlug: z.string().nullable().optional(),
    productThumbnail: z.string().nullable().optional().default(''),
    variantId: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
    originalPrice: z.number().nullable().optional().default(0),
    salePrice: z.number().nullable().optional().default(0),
    discountPercent: z.number().nullable().optional().default(0),
    stockLimit: z.number().nullable().optional().default(0),
    stockSold: z.number().nullable().optional().default(0),
    stockRemaining: z.number().nullable().optional().default(0),
    isSoldOut: z.boolean().nullable().optional().default(false),
    purchaseLimitPerUser: z.number().nullable().optional(),
});

export type CampaignSlotProductResponse = z.infer<typeof CampaignSlotProductResponseSchema>;

/**
 * API Wrapper for Slot Products (Simple List)
 * GET /api/v1/campaigns/slots/{slotId}/products
 */
export const SlotProductsResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(CampaignSlotProductResponseSchema).nullable().optional().default([]),
});

export type SlotProductsResponse = z.infer<typeof SlotProductsResponseSchema>;

/**
 * Campaign Slot Schema
 * Matches GET /api/v1/campaigns/slots/active
 */
export const CampaignSlotResponseSchema = z.object({
    id: z.string(),
    campaignId: z.string().nullable().optional(),
    campaignName: z.string().nullable().optional(),
    slotName: z.string().nullable().optional(),
    startTime: z.string(),
    endTime: z.string(),
    secondsUntilStart: z.number().nullable().optional().default(0),
    secondsUntilEnd: z.number().nullable().optional().default(0),
    status: z.enum(['UPCOMING', 'ACTIVE', 'ENDED']).nullable().optional().default('UPCOMING'),
    products: z.array(CampaignSlotProductResponseSchema).nullable().optional().default([]),
});

export type CampaignSlotResponse = z.infer<typeof CampaignSlotResponseSchema>;

/**
 * API Wrapper for Active Slots
 */
export const ActiveSlotsResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(CampaignSlotResponseSchema).nullable().optional().default([]),
});

export type ActiveSlotsResponse = z.infer<typeof ActiveSlotsResponseSchema>;
