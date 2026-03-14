/**
 * ==============================================
 * PRODUCT REVIEW TYPES - All Reviews Screen
 * ==============================================
 * Types and Zod schemas for the "View All Reviews" feature
 * Following the DTO → Adapter → UI pattern
 */

import { z } from 'zod';
import { createPaginatedResponseSchema, ResponseDefaultSchema } from '../responseSchema';

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type ProductReviewSortOption = 'newest' | 'helpful' | 'rating_high' | 'rating_low' | 'oldest';

export type ProductReviewFilterType = 'all' | 1 | 2 | 3 | 4 | 5 | 'with-media' | 'with-response';

// ============================================
// ZOD SCHEMAS - API VALIDATION
// ============================================

/**
 * Media item schema
 */
export const ProductReviewMediaSchema = z.object({
    id: z.string(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    sortOrder: z.number().optional().default(0),
    thumbnailUrl: z.string().optional().nullable(),
    duration: z.number().optional().nullable(),
});

/**
 * Seller response schema
 */
export const SellerResponseSchema = z.object({
    comment: z.string(),
    respondedAt: z.string().nullable().optional(),
    respondedBy: z.string().nullable().optional(),
});

/**
 * Single review DTO schema from API
 */
export const ProductReviewDTOSchema = z.object({
    id: z.string(),
    reviewableId: z.string(),

    // Audit fields
    createdDate: z.string().optional().nullable(),

    // User info
    userId: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    userAvatar: z.string().optional().nullable(),

    // Buyer info
    buyerId: z.string().optional().nullable(),
    buyerName: z.string().optional().nullable(),

    // Rating & Content
    rating: z.number().min(0).max(5),
    comment: z.string(),

    // Variant info
    variantId: z.string().optional().nullable(),
    variantAttributes: z.string().optional().nullable(),

    // Purchase verification
    verifiedPurchase: z.boolean().optional().default(false),

    // Media
    media: z.array(ProductReviewMediaSchema).optional().default([]),

    // Seller response
    hasResponse: z.boolean().optional().default(false),
    sellerResponse: z.string().optional().nullable(),
    sellerResponseDate: z.string().optional().nullable(),

    // Engagement
    helpfulCount: z.number().optional().default(0),
    userHasVotedHelpful: z.boolean().optional().default(false),
});

/**
 * Variant filter option schema
 */
export const VariantFilterOptionSchema = z.object({
    variantId: z.string(),
    label: z.string(), // "Màu Đỏ - Size L"
    reviewCount: z.number(),
});

/**
 * Review statistics schema (returned on first page)
 */
export const ProductReviewStatisticsSchema = z.object({
    averageRating: z.number(),
    totalReviews: z.number(),
    ratingDistribution: z.record(z.string(), z.number()).optional(), // { "5": 100, "4": 50 }
    ratingPercentage: z.record(z.string(), z.number()).optional(),
    mediaReviewCount: z.number().optional().default(0),
    responseReviewCount: z.number().optional().default(0),
    variantOptions: z.array(VariantFilterOptionSchema).optional().default([]),
});

/**
 * Paginated response with statistics (optional on page 0)
 */
export const ProductReviewsResponseSchema = createPaginatedResponseSchema(ProductReviewDTOSchema).extend({
    data: z.object({
        content: z.array(ProductReviewDTOSchema).default([]),
        page: z.number().catch(0),
        size: z.number().catch(20),
        totalElements: z.number().optional().catch(0),
        totalPages: z.number().catch(0),
        hasNext: z.boolean().catch(false),
        hasPrevious: z.boolean().optional().catch(false),
        first: z.boolean().optional().catch(true),
        last: z.boolean().optional().catch(false),
        empty: z.boolean().optional().catch(true),
        nextPage: z.number().optional().catch(0),
        previousPage: z.number().optional().catch(0),
        // Statistics only on first page
        statistics: ProductReviewStatisticsSchema.optional().nullable(),
    }).nullable().optional(),
});

export const ProductReviewStatisticsApiResponseSchema = ResponseDefaultSchema.extend({
    data: ProductReviewStatisticsSchema,
});

// ============================================
// DTO TYPES (Inferred from Zod)
// ============================================

export type ProductReviewMediaDTO = z.infer<typeof ProductReviewMediaSchema>;
export type ProductReviewDTO = z.infer<typeof ProductReviewDTOSchema>;
export type VariantFilterOptionDTO = z.infer<typeof VariantFilterOptionSchema>;
export type ProductReviewStatisticsDTO = z.infer<typeof ProductReviewStatisticsSchema>;
export type ProductReviewsResponse = z.infer<typeof ProductReviewsResponseSchema>;
export type ProductReviewStatisticsApiResponse = z.infer<typeof ProductReviewStatisticsApiResponseSchema>;

// ============================================
// UI TYPES (Component-ready)
// ============================================

/**
 * Media item for UI display
 */
export interface ProductReviewMediaUI {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    thumbnailUrl?: string;
    duration?: number; // seconds, for video
}

/**
 * Seller response for UI display
 */
export interface SellerResponseUI {
    shopName: string;
    comment: string;
    respondedAt: string;
    formattedDate: string; // "2 ngày trước"
}

/**
 * Single review for UI display
 */
export interface ProductReviewUI {
    id: string;

    // User info
    userId: string;
    userName: string;       // Already masked: "n*****a"
    userAvatar: string | null;
    isVerifiedPurchase: boolean;

    // Rating
    rating: number;         // 1-5

    // Variant info
    variantId: string | null;
    variantAttributes: string; // "Màu: Đỏ, Size: L" or ""
    hasVariantInfo: boolean;

    // Content
    comment: string;

    // Media
    media: ProductReviewMediaUI[];
    hasMedia: boolean;
    imageCount: number;
    videoCount: number;

    // Seller response
    hasSellerResponse: boolean;
    sellerResponse: SellerResponseUI | null;

    // Engagement
    helpfulCount: number;
    isHelpful: boolean;     // Current user voted

    // Timestamps
    createdDate: string;
    formattedDate: string;  // "2 ngày trước"
}

/**
 * Statistics for header UI
 */
export interface ProductReviewStatisticsUI {
    averageRating: number;
    formattedRating: string; // "4.9"
    totalReviews: number;
    formattedTotal: string;  // "1.2k"
    ratingDistribution: Record<string, number>;
    ratingPercentage: Record<string, number>;
    mediaReviewCount: number;
    responseReviewCount: number;
    variantOptions: VariantFilterOptionUI[];
}

/**
 * Variant filter option for dropdown
 */
export interface VariantFilterOptionUI {
    variantId: string;
    label: string;
    reviewCount: number;
    formattedCount: string; // "(50)"
}

// ============================================
// REQUEST/FILTER TYPES
// ============================================

/**
 * Filter params for API request
 */
export interface ProductReviewFilterParams {
    productId: string;
    rating?: number;
    mediaFilter?: 'IMAGE' | 'VIDEO' | 'ALL';
    hasResponse?: boolean;
    variantId?: string;
    sortBy?: 'NEWEST' | 'OLDEST' | 'HELPFUL';
    page: number;
    size: number;
    sort?: string[]; // array[string] as per swagger
}

/**
 * Filter state for UI
 */
export interface ProductReviewFilterState {
    activeFilter: ProductReviewFilterType;
    selectedVariantId: string | null;
    sortOption: ProductReviewSortOption;
}

// ============================================
// PAGE DATA TYPE (Infinite Query)
// ============================================

/**
 * Single page data from infinite query
 */
export interface ProductReviewPageData {
    reviews: ProductReviewUI[];
    statistics: ProductReviewStatisticsUI | null; // Only on first page
    pagination: {
        page: number;
        hasNext: boolean;
        totalElements: number;
        totalPages: number;
    };
}

// ============================================
// EMPTY STATE CONFIG
// ============================================

export interface ReviewEmptyStateConfig {
    icon: string;
    title: string;
    subtitle: string;
    isPositive: boolean;
}
