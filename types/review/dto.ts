/**
 * ==============================================
 * REVIEW DTOs - API Layer
 * ==============================================
 * Raw data structures from the backend API
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

/**
 * Review type enum
 */
export type ReviewType = 'PRODUCT' | 'SHOP' | 'ORDER';

/**
 * Review status
 */
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

/**
 * Media type (IMAGE, VIDEO)
 */
export type ReviewMediaType = 'IMAGE' | 'VIDEO';

/**
 * Media item in review response
 */
export interface ReviewMediaDTO {
    id: string;
    url: string;
    type: ReviewMediaType;
    sortOrder?: number;
}

/**
 * My review item from API response
 */
export interface MyReviewDTO {
    id: string;
    reviewType: ReviewType;
    reviewableId: string;
    rating: number;
    comment: string;
    userId: string;
    username: string;
    userAvatar?: string | null;
    buyerId: string;
    buyerName: string;
    verifiedPurchase: boolean;
    orderId: string;
    status: ReviewStatus;
    rejectionReason?: string;
    helpfulCount: number;
    hasResponse?: boolean;
    sellerResponse?: string | null;
    sellerResponseDate?: string | null;
    sellerResponseBy?: string | null;
    media?: ReviewMediaDTO[];
    createdDate?: string | null;
    updatedAt?: string;
}

/**
 * Paginated response for reviews from backend
 */
export interface ReviewPageDTO {
    content: MyReviewDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
}

/**
 * API Response wrapper
 */
export interface ReviewApiResponseDTO<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}

// ============================================
// ZOD SCHEMAS - Minimal FE-consumed contracts
// ============================================

export const ReviewMediaDTOSchema = z.object({
    id: z.string(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    sortOrder: z.number().optional(),
});

export const MyReviewDTOSchema = z.object({
    id: z.string(),
    reviewType: z.enum(['PRODUCT', 'SHOP', 'ORDER']),
    reviewableId: z.string(),
    rating: z.number(),
    comment: z.string(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']),
    helpfulCount: z.number().catch(0).default(0),
    hasResponse: z.boolean().optional().default(false),
    sellerResponse: z.string().nullable().optional(),
    sellerResponseDate: z.string().nullable().optional(),
    media: z.array(ReviewMediaDTOSchema).optional().default([]),
    createdDate: z.string().nullable().optional(),
});

export const ReviewPageDTOSchema = z.object({
    content: z.array(MyReviewDTOSchema).default([]),
    page: z.number().catch(0),
    size: z.number().catch(20),
    totalElements: z.number().catch(0),
    totalPages: z.number().catch(0),
    hasNext: z.boolean().catch(false),
    hasPrevious: z.boolean().optional().catch(false),
    previousPage: z.number().optional().catch(0),
    nextPage: z.number().optional().catch(0),
    empty: z.boolean().optional(),
    first: z.boolean().optional(),
    last: z.boolean().optional(),
});

export const MyReviewsResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().optional(),
    data: ReviewPageDTOSchema,
});

export type MyReviewsListItemDTO = z.infer<typeof MyReviewDTOSchema>;
export type MyReviewsPageDTO = z.infer<typeof ReviewPageDTOSchema>;
