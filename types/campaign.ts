import { z } from 'zod';
import { ResponseDefaultSchema, createPaginatedResponseSchema } from './responseSchema';

/**
 * Slot Status enum
 */
export enum SlotStatus {
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED'
}

/**
 * Campaign Slot Product Schema
 * Matches GET /api/v1/campaigns/slots/{slotId}/products
 */
export const CampaignSlotProductResponseSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string().nullable().optional().default(''),
    productThumbnail: z.string().nullable().optional().default(''),
    variantId: z.string().nullable().optional(),
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
export const SlotProductsResponseSchema = createPaginatedResponseSchema(CampaignSlotProductResponseSchema);

export type SlotProductsResponse = z.infer<typeof SlotProductsResponseSchema>;

/**
 * Campaign Slot Schema
 * Matches GET /api/v1/campaigns/slots/active
 */
export const CampaignSlotResponseSchema = z.object({
    id: z.string(),
    campaignId: z.string().nullable().optional(),
    slotName: z.string().nullable().optional(),
    slotDate: z.string().nullable().optional(),
    startTime: z.string(),
    endTime: z.string(),
    secondsUntilStart: z.number().nullable().optional().default(0),
    secondsUntilEnd: z.number().nullable().optional().default(0),
    status: z.enum(['UPCOMING', 'ACTIVE', 'ENDED']).nullable().optional().default(SlotStatus.UPCOMING),
    products: z.array(CampaignSlotProductResponseSchema).nullable().optional().default([]),
    approvedProducts: z.number().nullable().optional().default(0),
});

export type CampaignSlotResponse = z.infer<typeof CampaignSlotResponseSchema>;

/**
 * API Wrapper for Active Slots
 */
export const ActiveSlotsResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(CampaignSlotResponseSchema).nullable().optional().default([]),
});

export type ActiveSlotsResponse = z.infer<typeof ActiveSlotsResponseSchema>;

/**
 * API Wrapper for Single Slot Detail
 * GET /api/v1/campaigns/slots/{slotId}
 */
export const SlotDetailResponseSchema = ResponseDefaultSchema.extend({
    data: CampaignSlotResponseSchema.nullable().optional(),
});

export type SlotDetailResponse = z.infer<typeof SlotDetailResponseSchema>;

/**
 * Campaign Detail Schema
 * GET /api/v1/campaigns/{id}
 */
export const CampaignResponseSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    isFeatured: z.boolean().nullable().optional(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

/**
 * API Wrapper for Campaign Detail
 */
export const CampaignDetailResponseSchema = ResponseDefaultSchema.extend({
    data: CampaignResponseSchema.nullable().optional(),
});

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
