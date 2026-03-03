/**
 * ==============================================
 * WISHLIST SERVICES - API Calls
 * ==============================================
 * Core functions to fetch from Backend
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useAuthStore } from '@/store/useAuthStore';
import {
    WishlistDetailResponseSchema,
    WishlistItemsResponseSchema,
    WishlistListResponseSchema,
    type AddWishlistItemRequest,
    type CreateWishlistRequest,
    type UpdateWishlistItemRequest,
    type UpdateWishlistRequest,
    type WishlistQueryParams
} from '@/types/wishlist';
import { z } from 'zod';
import { apiClient } from './client';

// Check variants schema response
const CheckVariantsResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: z.record(z.string(), z.boolean()),
});

export const wishlistService = {
    // ============================================
    // QUERIES 
    // ============================================

    /** Get list Wishlist */
    getWishlists: async (params?: WishlistQueryParams) => {
        const response = await apiClient.get(API_ROUTES.WISHLISTS.LIST, { params });
        return WishlistListResponseSchema.parse(response.data).data;
    },

    /** Get Wishlist by ID */
    getWishlistDetail: async (id: string) => {
        const response = await apiClient.get(API_ROUTES.WISHLISTS.DETAIL(id));
        return WishlistDetailResponseSchema.parse(response.data).data;
    },

    /** Get Default Wishlist */
    getDefaultWishlist: async () => {
        const response = await apiClient.get(API_ROUTES.WISHLISTS.DEFAULT);
        return WishlistDetailResponseSchema.parse(response.data).data;
    },

    /** Get Items in a Wishlist */
    getWishlistItems: async (id: string) => {
        const response = await apiClient.get(API_ROUTES.WISHLISTS.ITEMS(id));
        return WishlistItemsResponseSchema.parse(response.data).data;
    },

    /** Kiểm tra trạng thái thích của mảng Variant IDs */
    checkVariants: async (variantIds: string[]) => {
        if (!useAuthStore.getState().isAuthenticated) return {};
        // Gửi danh sách qua query array: ?variantIds=1&variantIds=2
        const response = await apiClient.get(API_ROUTES.WISHLISTS.CHECK_VARIANTS, {
            params: { variantIds },
            paramsSerializer: { indexes: null }, // format as variantIds=a&variantIds=b
        });
        return CheckVariantsResponseSchema.parse(response.data).data;
    },

    // ============================================
    // MUTATIONS
    // ============================================

    /** Create Wishlist */
    createWishlist: async (data: CreateWishlistRequest) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.CREATE, data);
        return response.data;
    },

    /** Update Wishlist */
    updateWishlist: async (id: string, data: UpdateWishlistRequest) => {
        const response = await apiClient.put(API_ROUTES.WISHLISTS.UPDATE(id), data);
        return response.data;
    },

    /** Delete Wishlist */
    deleteWishlist: async (id: string) => {
        const response = await apiClient.delete(API_ROUTES.WISHLISTS.DELETE(id));
        return response.data;
    },

    /** Set Wishlist as Default */
    setAsDefault: async (id: string) => {
        const response = await apiClient.put(API_ROUTES.WISHLISTS.SET_DEFAULT(id));
        return response.data;
    },

    /** Add a Variant to Default Wishlist */
    addToDefaultWishlist: async (data: Omit<AddWishlistItemRequest, 'wishlistId'>) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.ADD_ITEM_DEFAULT, data);
        return response.data;
    },

    /** Add a Variant to Wishlist */
    addToWishlist: async (wishlistId: string, data: Omit<AddWishlistItemRequest, 'wishlistId'>) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.ADD_ITEM(wishlistId), data);
        return response.data;
    },

    /** Remove a Variant / Item from Wishlist */
    removeFromWishlist: async (wishlistId: string, itemId: string) => {
        const response = await apiClient.delete(API_ROUTES.WISHLISTS.UPDATE_ITEM(wishlistId, itemId));
        return response.data;
    },

    /** Update Item (Note, quantity, price target...) */
    updateWishlistItem: async (wishlistId: string, itemId: string, data: UpdateWishlistItemRequest) => {
        const response = await apiClient.put(API_ROUTES.WISHLISTS.UPDATE_ITEM(wishlistId, itemId), data);
        return response.data;
    },

    /** Regenerate share token for a wishlist */
    regenerateShareToken: async (wishlistId: string) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.REGENERATE_TOKEN(wishlistId));
        return response.data;
    },
};
