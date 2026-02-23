/**
 * ==============================================
 * WISHLIST REQUEST TYPES - API Request Bodies
 * ==============================================
 * Types for sending data TO the backend
 * Used in mutation hooks (POST, PUT, DELETE)
 */

import type { WishlistItemPriority } from './dto';

// ============================================
// REQUEST TYPES (Client → Server)
// ============================================

/**
 * Create new wishlist
 * 
 * POST /api/v1/wishlists
 */
export interface CreateWishlistRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
    isDefault?: boolean;
    coverImageAssetId?: string;
}

/**
 * Update wishlist
 * 
 * PUT /api/v1/wishlists/{id}
 */
export interface UpdateWishlistRequest {
    name?: string;
    description?: string;
    isPublic?: boolean;
    isDefault?: boolean;
    coverImageAssetId?: string;
}

/**
 * Add item to wishlist
 * 
 * POST /api/v1/wishlists/{id}/items
 */
export interface AddWishlistItemRequest {
    wishlistId: string;
    variantId: string;
    quantity?: number;
    notes?: string;
    priority?: WishlistItemPriority;
    desiredPrice?: number;
}

/**
 * Update wishlist item
 * 
 * PUT /api/v1/wishlists/{wishlistId}/items/{itemId}
 */
export interface UpdateWishlistItemRequest {
    quantity?: number;
    notes?: string;
    priority?: WishlistItemPriority;
    desiredPrice?: number;
}

// ============================================
// QUERY PARAMS (for GET requests)
// ============================================

export interface WishlistQueryParams {
    page?: number;
    size?: number;
    sortBy?: 'createdDate' | 'name' | 'itemCount';
    sortDir?: 'asc' | 'desc';
}

export interface PublicWishlistSearchParams extends WishlistQueryParams {
    keyword?: string;
}
