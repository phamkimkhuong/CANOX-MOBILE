import { z } from 'zod';
import { createPaginatedResponseSchema } from '../responseSchema';

// 1. Media Schema & Type
export const ProductMediaRawSchema = z.object({
    id: z.string(),
    url: z.string().nullable().optional().default(''),
    type: z.string().nullable().optional().default('IMAGE'),
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
export const ProductResponseItemSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional().default(''),
    slug: z.string().nullable().optional().default(''),
    priceMin: z.number().nullable().optional().default(0),
    priceMax: z.number().nullable().optional().default(0),
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    priceAfterBestVoucher: z.number().nullable().optional().default(0),
    isFeatured: z.boolean().nullable().optional().default(false),
    media: z.array(ProductMediaRawSchema).nullable().optional().default([]),
    reviewStatistics: ReviewStatsRawSchema.nullable().optional(),
    variants: z.array(z.object({
        id: z.string().nullable().optional(),
        inventory: z.object({
            stock: z.number().nullable().optional().default(0),
        }).nullable().optional(),
    })).nullable().optional().default([]),
    shop: z.object({
        shopName: z.string().nullable().optional().default(''),
        username: z.string().nullable().optional().default(''),
    }).nullable().optional(),
});
export type ProductResponseItem = z.infer<typeof ProductResponseItemSchema>;

// Paginated Product Response (Schema dùng cho validator)
export const PaginatedProductResponseSchema = createPaginatedResponseSchema(ProductResponseItemSchema);

// DOMAIN MODEL (Dữ liệu rút gọn cho UI)
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
    shopName: string;
    isMall?: boolean;
}

/**
 * BASE DTO interface for transformation logic
 * Both ProductResponseItem (Home) and ShopProductDTO (Shop) satisfy this
 */
export interface BaseProductDTO {
    id: string;
    name?: string | null;
    basePrice?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    priceBeforeDiscount?: number | null;
    priceAfterBestVoucher?: number | null;
    media?: {
        url?: string | null;
        isPrimary?: boolean | null;
    }[] | null;
    reviewStatistics?: {
        averageRating?: number | null;
        totalReviews?: number | null;
        verifiedPurchaseCount?: number | null;
    } | null;
    shop?: {
        shopName?: string | null;
    } | null;
}