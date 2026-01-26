/**
 * ==============================================
 * WISHLIST ADAPTER - Transform DTO to UI Types
 * ==============================================
 * 
 * Responsibilities:
 * 1. Transform raw API data to lightweight UI models
 * 2. Handle nullable fields with safe fallbacks
 */

import { WishlistDTO, WishlistUI } from '@/types/profile/wishlist';
import { toSizedImageUrl } from '@/utils/url';

/**
 * Transform WishlistDTO → WishlistUI
 * 
 * @param dto - Raw API response
 * @returns UI-ready wishlist object
 */
export const toWishlistUI = (dto: WishlistDTO): WishlistUI => {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description || null,
        isPublic: dto.isPublic,
        isDefault: dto.isDefault,
        itemCount: dto.itemCount,
        createdAt: dto.createdDate,
        thumbnailUrl: toSizedImageUrl(dto.imageBasePath, dto.imageExtension) ?? null,
    };
};

/**
 * Transform array of WishlistDTO → WishlistUI[]
 * 
 * @param dtos - Array of raw API responses
 * @returns Array of UI-ready wishlist objects
 */
export const toWishlistsUI = (dtos: WishlistDTO[]): WishlistUI[] => {
    return dtos.map(toWishlistUI);
};
