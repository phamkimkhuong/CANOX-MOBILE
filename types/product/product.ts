import { z } from 'zod';
import { createPaginatedResponseSchema } from '../responseSchema';

// 1. Media Schema & Type
export const ProductMediaRawSchema = z.object({
    id: z.string(),
    imagePath: z.string().nullable().optional(),
    url: z.string().nullable().optional().default(''),
    isPrimary: z.boolean().nullable().optional().default(false),
});
export type ProductMediaRaw = z.infer<typeof ProductMediaRawSchema>;

//Review Stats Schema & Type
export const ReviewStatsRawSchema = z.object({
    averageRating: z.number().nullable().optional().default(0),
    totalReviews: z.number().nullable().optional().default(0),
    verifiedPurchaseCount: z.number().nullable().optional().default(0),
});
export type ReviewStatsRaw = z.infer<typeof ReviewStatsRawSchema>;

// Product Item Schema & Type
// Variant Schema — Zod Pruning: only parse `id` for favorite check
const VariantMinimalSchema = z.object({
    id: z.string(),
});

export const ProductResponseItemSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional().default(''),
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    priceAfterBestVoucher: z.number().nullable().optional().default(0),
    media: z.array(ProductMediaRawSchema).nullable().optional().default([]),
    reviewStatistics: ReviewStatsRawSchema.nullable().optional(),
    shop: z.object({
        shop_location: z.string().nullable().optional().default(''),
    }).nullable().optional(),
    availableRegions: z.array(z.string()).nullable().optional().default([]),
    variants: z.array(VariantMinimalSchema).nullable().optional().default([]),
});
export type ProductResponseItem = z.infer<typeof ProductResponseItemSchema>;

// Paginated Product Response (Schema dùng cho validator)
export const PaginatedProductResponseSchema = createPaginatedResponseSchema(ProductResponseItemSchema);

// DOMAIN MODEL
export interface ProductFeedItem {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviews: number;
    sold: number;
    location: string;
    isMall?: boolean;
    isInternational?: boolean;
    /** First variant ID — used for wishlist favorite check */
    defaultVariantId?: string;
}

/**
 * BASE DTO interface for transformation logic
 */
export interface BaseProductDTO {
    id: string;
    name?: string | null;
    priceBeforeDiscount?: number | null;
    priceAfterBestVoucher?: number | null;
    media?: {
        imagePath?: string | null;
        url?: string | null;
        isPrimary?: boolean | null;
    }[] | null;
    reviewStatistics?: {
        averageRating?: number | null;
        totalReviews?: number | null;
        verifiedPurchaseCount?: number | null;
    } | null;
    shop?: {
        shop_location?: string | null;
    } | null;
    availableRegions?: string[] | null;
    variants?: { id: string }[] | null;
}