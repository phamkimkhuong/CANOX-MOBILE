/**
 * ==============================================
 * WISHLIST SERVICES - API Calls
 * ==============================================
 * Core functions to fetch from Backend
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import i18n from '@/constants/i18n';
import { useAuthStore } from '@/store/useAuthStore';
import {
    WishlistCheckVariantsResponseSchema,
    WishlistDetailResponseSchema,
    WishlistItemMutationResponseSchema,
    WishlistItemsResponseSchema,
    WishlistListResponseSchema,
    type AddWishlistItemRequest,
    type CreateWishlistRequest,
    type UpdateWishlistItemRequest,
    type UpdateWishlistRequest,
    type WishlistQueryParams
} from '@/types/wishlist';
import { apiClient } from './client';
import { ApiError } from './errors';

const DEFAULT_WISHLIST_NOT_FOUND_CODE = 3006;
let ensureDefaultWishlistPromise: Promise<void> | null = null;

const isDefaultWishlistNotFoundError = (error: unknown) => (
    error instanceof ApiError &&
    error.status === 404 &&
    error.code === DEFAULT_WISHLIST_NOT_FOUND_CODE
);

const getLocalizedDefaultWishlistName = () => {
    const translatedName = i18n.t('wishlist:defaultName', { defaultValue: 'My Favorites' });
    return typeof translatedName === 'string' && translatedName.trim().length > 0
        ? translatedName.trim()
        : 'My Favorites';
};

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
        return WishlistCheckVariantsResponseSchema.parse(response.data).data;
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
        return WishlistItemMutationResponseSchema.parse(response.data).data;
    },

    /** Ensure the buyer has a default wishlist before first favorite write. */
    ensureDefaultWishlist: async () => {
        if (!ensureDefaultWishlistPromise) {
            ensureDefaultWishlistPromise = (async () => {
                try {
                    await wishlistService.createWishlist({
                        name: getLocalizedDefaultWishlistName(),
                        isDefault: true,
                        isPublic: false,
                    });
                } catch (createError) {
                    try {
                        await wishlistService.getDefaultWishlist();
                    } catch {
                        throw createError;
                    }
                }
            })().finally(() => {
                ensureDefaultWishlistPromise = null;
            });
        }

        return ensureDefaultWishlistPromise;
    },

    /** Add to default wishlist, lazily creating the default collection if backend reports it missing. */
    addToDefaultWishlistEnsured: async (data: Omit<AddWishlistItemRequest, 'wishlistId'>) => {
        try {
            return await wishlistService.addToDefaultWishlist(data);
        } catch (error) {
            if (!isDefaultWishlistNotFoundError(error)) {
                throw error;
            }

            await wishlistService.ensureDefaultWishlist();
            return wishlistService.addToDefaultWishlist(data);
        }
    },

    /** Add a Variant to Wishlist */
    addToWishlist: async (wishlistId: string, data: Omit<AddWishlistItemRequest, 'wishlistId'>) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.ADD_ITEM(wishlistId), data);
        return WishlistItemMutationResponseSchema.parse(response.data).data;
    },

    /** Remove a Variant / Item from Wishlist */
    removeFromWishlist: async (wishlistId: string, itemId: string) => {
        const response = await apiClient.delete(API_ROUTES.WISHLISTS.UPDATE_ITEM(wishlistId, itemId));
        return response.data;
    },

    /** Update Item (Note, quantity, price target...) */
    updateWishlistItem: async (wishlistId: string, itemId: string, data: UpdateWishlistItemRequest) => {
        const response = await apiClient.put(API_ROUTES.WISHLISTS.UPDATE_ITEM(wishlistId, itemId), data);
        return WishlistItemMutationResponseSchema.parse(response.data).data;
    },

    /** Regenerate share token for a wishlist */
    regenerateShareToken: async (wishlistId: string) => {
        const response = await apiClient.post(API_ROUTES.WISHLISTS.REGENERATE_TOKEN(wishlistId));
        return response.data;
    },
};
