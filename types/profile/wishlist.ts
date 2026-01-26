/**
 * ==============================================
 * WISHLIST TYPES - Single Source of Truth
 * ==============================================
 * 
 * API Endpoints:
 * - GET /wishlists → WishlistsResponse (paginated)
 * - GET /wishlists/{id} → WishlistDetailResponse
 * - GET /wishlists/{id}/items → WishlistItemsResponse
 * 
 * Adapter: @/utils/adapter/wishlistAdapter.ts
 */

import { z } from 'zod';
import { createPaginatedResponseSchema } from '../responseSchema';

// ============================================
// DTO SCHEMAS (API Response)
// ============================================

/**
 * Wishlist Item DTO - Matches API response exactly
 * All fields are nullable/optional for new users
 */
export const WishlistDTOSchema = z.object({
    id: z.string().nullish().transform((val) => val ?? ''),
    name: z.string().nullish().transform((val) => val ?? 'Untitled Wishlist'),
    description: z.string().nullable().optional(),
    isPublic: z.coerce.boolean().nullish().transform(val => val ?? false),
    isDefault: z.coerce.boolean().nullish().transform(val => val ?? false),
    buyerId: z.string().nullish().transform((val) => val ?? ''),
    buyerName: z.string().nullable().optional(),
    itemCount: z.coerce.number().nullish().transform((val) => val ?? 0),
    createdDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    lastModifiedDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
});

export type WishlistDTO = z.infer<typeof WishlistDTOSchema>;

/**
 * Paginated Wishlists Response Schema
 */
export const WishlistsResponseSchema = createPaginatedResponseSchema(WishlistDTOSchema);

export type WishlistsResponse = z.infer<typeof WishlistsResponseSchema>;

// ============================================
// UI TYPES (Transformed for display)
// ============================================

/**
 * Wishlist UI Type - Optimized for display
 */
export interface WishlistUI {
    /** Unique ID */
    id: string;
    /** Wishlist name */
    name: string;
    /** Optional description */
    description: string | null;
    /** Is visible to others */
    isPublic: boolean;
    /** Default wishlist for quick add */
    isDefault: boolean;
    /** Number of items in wishlist */
    itemCount: number;
    /** Formatted created date (MM/YYYY) */
    createdAt: string;
    /** Full thumbnail URL or null */
    thumbnailUrl: string | null;
}

// ============================================
// FILTER PARAMS
// ============================================

export interface WishlistFilterParams {
    page?: number;
    size?: number;
    sortBy?: 'createdDate' | 'name' | 'itemCount';
    sortDir?: 'asc' | 'desc';
}
