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

// Review Stats Schema & Type
export const ReviewStatsRawSchema = z.object({
    averageRating: z.coerce.number().nullish().transform(val => val ?? 0),
    totalReviews: z.coerce.number().nullish().transform(val => val ?? 0),
    verifiedPurchaseCount: z.coerce.number().nullish().transform(val => val ?? 0),
});
export type ReviewStatsRaw = z.infer<typeof ReviewStatsRawSchema>;

// Product Item Schema & Type
// Variant Schema — Zod Pruning: only parse `id` for favorite check
const VariantMinimalSchema = z.object({
    id: z.string(),
    inventory: z.object({
        soldCount: z.coerce.number().nullish().transform(val => val ?? 0),
    }).nullish(),
});

export const ProductResponseItemSchema = z.object({
    id: z.string().nullish().transform(val => val ?? ''),
    name: z.string().nullish().transform(val => val ?? ''),
    priceBeforeDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    priceAfterBestVoucher: z.coerce.number().nullish().transform(val => val ?? 0),
    media: z.array(ProductMediaRawSchema).nullish().transform(val => val ?? []),
    reviewStatistics: ReviewStatsRawSchema.nullish().transform(val => val ?? { averageRating: 0, totalReviews: 0, verifiedPurchaseCount: 0 }),
    shop: z.object({
        shop_location: z.string().nullish().transform(val => val ?? ''),
    }).nullish().transform(val => val ?? { shop_location: '' }),
    availableRegions: z.array(z.string()).nullish().transform(val => val ?? []),
    variants: z.array(VariantMinimalSchema).nullish().transform(val => val ?? []),
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
    defaultVariantId?: string;
    allVariantIds?: string[];
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
    variants?: { 
        id: string;
        inventory?: {
            soldCount?: number | null;
        } | null;
    }[] | null;
}