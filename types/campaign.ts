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
    variantImagePath: z.string().nullable().optional(),
    originalPrice: z.number().nullable().optional().default(0),
    salePrice: z.number().nullable().optional().default(0),
    discountPercent: z.number().nullable().optional().default(0),
    stockLimit: z.number().nullable().optional().default(0),
    stockSold: z.number().nullable().optional().default(0),
    stockRemaining: z.number().nullable().optional().default(0),
    isSoldOut: z.boolean().nullable().optional().default(false),
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
 * Matches GET /api/v1/public/campaigns/slots
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
    approvedProducts: z.number().nullable().optional().default(0),
});

export type CampaignSlotResponse = z.infer<typeof CampaignSlotResponseSchema>;

/**
 * API Wrapper for Slot List responses
 * { code, success, data: { content: CampaignSlotResponse[], ...pagination } }
 */
export const ActiveSlotsResponseSchema = createPaginatedResponseSchema(CampaignSlotResponseSchema);

export type ActiveSlotsResponse = z.infer<typeof ActiveSlotsResponseSchema>;

/**
 * Public Slot Variant Schema
 * Matches GET /api/v1/public/campaigns/slots/{slotId}
 */
export const PublicSlotVariantResponseSchema = z.object({
    variantImagePath: z.string().nullable().optional(),
    originalPrice: z.number().nullable().optional().default(0),
    salePrice: z.number().nullable().optional().default(0),
    discountPercent: z.number().nullable().optional().default(0),
    stockLimit: z.number().nullable().optional().default(0),
    stockSold: z.number().nullable().optional().default(0),
    stockRemaining: z.number().nullable().optional().default(0),
    isSoldOut: z.boolean().nullable().optional().default(false),
});

export type PublicSlotVariantResponse = z.infer<typeof PublicSlotVariantResponseSchema>;

/**
 * Public Slot Product Schema
 * Matches GET /api/v1/public/campaigns/slots/{slotId}
 */
export const PublicSlotProductResponseSchema = z.object({
    productId: z.string(),
    productName: z.string().nullable().optional(),
    productThumbnailUrl: z.string().nullable().optional(),
    variants: z.array(PublicSlotVariantResponseSchema).nullable().optional().default([]),
});

export type PublicSlotProductResponse = z.infer<typeof PublicSlotProductResponseSchema>;

/**
 * Single Slot Detail payload
 * Matches GET /api/v1/public/campaigns/slots/{slotId}
 */
export const SlotDetailDataSchema = z.object({
    campaignId: z.string().nullable().optional(),
    endTime: z.string(),
    secondsUntilStart: z.number().nullable().optional().default(0),
    secondsUntilEnd: z.number().nullable().optional().default(0),
    products: z.array(PublicSlotProductResponseSchema).nullable().optional().default([]),
});

export type SlotDetailData = z.infer<typeof SlotDetailDataSchema>;

/**
 * API Wrapper for Single Slot Detail
 * GET /api/v1/public/campaigns/slots/{slotId}
 */
export const SlotDetailResponseSchema = ResponseDefaultSchema.extend({
    data: SlotDetailDataSchema.nullable().optional(),
});

export type SlotDetailResponse = z.infer<typeof SlotDetailResponseSchema>;

/**
 * Campaign Detail Schema
 * GET /api/v1/campaigns/{id}
 */
export const CampaignResponseSchema = z.object({
    id: z.string().optional(),
    name: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const CampaignListResponseSchema = createPaginatedResponseSchema(CampaignResponseSchema);

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignProductResponseSchema = z.object({
    id: z.string(),
    campaignId: z.string().nullable().optional(),
    productId: z.string().nullable().optional(),
    variantId: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    productName: z.string().nullable().optional(),
    originalPrice: z.number().nullable().optional().default(0),
    salePrice: z.number().nullable().optional().default(0),
    isSoldOut: z.boolean().nullable().optional().default(false),
});

export type CampaignProductResponse = z.infer<typeof CampaignProductResponseSchema>;

export const CampaignProductsResponseSchema =
    createPaginatedResponseSchema(CampaignProductResponseSchema);

export type CampaignProductsResponse = z.infer<typeof CampaignProductsResponseSchema>;

/**
 * API Wrapper for Campaign Detail
 */
export const CampaignDetailResponseSchema = ResponseDefaultSchema.extend({
    data: CampaignResponseSchema.nullable().optional(),
});

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
