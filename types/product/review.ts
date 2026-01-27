import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// MEDIA SCHEMA
// ============================================

export const ReviewMediaSchema = z.object({
    id: z.string(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    sortOrder: z.number().optional(),
});

export type ReviewMediaDTO = z.infer<typeof ReviewMediaSchema>;

// ============================================
// REVIEW DTO SCHEMA
// ============================================

export const ReviewDTOSchema = z.object({
    id: z.string(),
    reviewType: z.enum(['PRODUCT', 'SHOP', 'ORDER']),
    reviewableId: z.string(),
    rating: z.number(),
    comment: z.string(),
    username: z.string().optional(),
    userAvatar: z.string().nullable().optional(),
    buyerName: z.string().optional(),
    verifiedPurchase: z.boolean().optional(),
    orderId: z.string().optional(),
    hasResponse: z.boolean().optional(),
    sellerResponse: z.string().nullable().optional(),
    sellerResponseDate: z.string().nullable().optional(),
    media: z.array(ReviewMediaSchema).optional().default([]),
    createdAt: z.string().optional(),
});

export type ReviewDTO = z.infer<typeof ReviewDTOSchema>;

// ============================================
// PAGINATED REVIEW RESPONSE SCHEMA
// ============================================

export const ReviewPaginatedDataSchema = z.object({
    content: z.array(ReviewDTOSchema),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
});

export const ReviewPaginatedResponseSchema = ResponseDefaultSchema.extend({
    data: ReviewPaginatedDataSchema,
});

export type ReviewPaginatedResponse = z.infer<typeof ReviewPaginatedResponseSchema>;

// ============================================
// UI MODELS
// ============================================

export interface ReviewMediaUI {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
}

export interface ReviewUI {
    id: string;
    rating: number;
    comment: string;
    username: string;
    userAvatar?: string | null;
    buyerName?: string;
    verifiedPurchase: boolean;
    createdAt: string;
    media: ReviewMediaUI[];
    sellerResponse?: {
        comment: string;
        date: string;
    } | null;
}
