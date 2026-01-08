import { z } from 'zod';
import { createPaginatedResponseSchema } from '../responseSchema';

// 1. Media Schema & Type
export const ProductMediaRawSchema = z.object({
    id: z.string(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    isPrimary: z.boolean(),
});
export type ProductMediaRaw = z.infer<typeof ProductMediaRawSchema>;

//Review Stats Schema & Type
export const ReviewStatsRawSchema = z.object({
    averageRating: z.number(),
    totalReviews: z.number(),
    verifiedPurchaseCount: z.number(),
});
export type ReviewStatsRaw = z.infer<typeof ReviewStatsRawSchema>;

// Product Item Schema & Type
export const ProductResponseItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    basePrice: z.number(),
    priceMin: z.number(),
    priceMax: z.number(),
    priceAfterBestVoucher: z.number(),
    isFeatured: z.boolean(),
    media: z.array(ProductMediaRawSchema),
    reviewStatistics: ReviewStatsRawSchema,
    variants: z.array(z.object({
        id: z.string(),
        inventory: z.object({
            stock: z.number(),
        }).optional(),
    })).optional(),
    shop: z.object({
        shopName: z.string(),
        username: z.string(),
    }),
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
    name: string;
    basePrice: number;
    priceMin?: number | null;
    priceMax?: number | null;
    priceAfterBestVoucher?: number | null;
    media: {
        url: string;
        isPrimary: boolean;
    }[];
    reviewStatistics?: {
        averageRating: number;
        totalReviews: number;
        verifiedPurchaseCount?: number | null;
    } | null;
    shop: {
        shopName: string;
    };
}