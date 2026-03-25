/**
 * ==============================================
 * WISHLIST ADAPTER - Transform DTO to UI Types
 * ==============================================
 * 
 * Responsibilities:
 * 1. Transform raw API data to lightweight UI models
 * 2. Handle nullable fields with safe fallbacks
 */

import type { WishlistCardUI } from '@/types/wishlist/ui';
import type { WishlistSummarySchemaType } from '@/types/wishlist/wishlistSchema';
import { formatDate } from '@/utils/date';
import { toPublicUrl } from '@/utils/url';

/**
 * Transform WishlistSummary → WishlistCardUI
 * 
 * @param dto - Zod-validated API response
 * @returns UI-ready wishlist card object
 */
export const toWishlistUI = (dto: WishlistSummarySchemaType): WishlistCardUI => {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description || null,
        isPublic: dto.isPublic,
        isDefault: dto.isDefault,
        itemCount: dto.itemCount,
        buyerName: dto.buyerName,
        formattedDate: formatDate(dto.createdDate),
        coverImageUrl: toPublicUrl(dto.imagePath) || null,
    };
};

/**
 * Transform array of WishlistSummary → WishlistCardUI[]
 * 
 * @param dtos - Array of Zod-validated API responses
 * @returns Array of UI-ready wishlist card objects
 */
export const toWishlistsUI = (dtos: WishlistSummarySchemaType[]): WishlistCardUI[] => {
    return dtos.map(toWishlistUI);
};

