/**
 * ==============================================
 * WISHLIST API HOOKS - TanStack Query Implementation
 * ==============================================
 * 
 * Hooks:
 * 1. useWishlists - Fetch user's wishlists (paginated)
 * 2. useWishlistSummary - Get total count for profile display
 * 
 * Features:
 * - Zod validation for type safety
 * - Adapter transformation to UI types
 * - Proper query keys for cache management
 * - Auth-gated queries
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { WishlistQueryParams } from '@/types/wishlist/request';
import type { WishlistCardUI } from '@/types/wishlist/ui';
import { WishlistListResponseSchema } from '@/types/wishlist/wishlistSchema';
import { toWishlistsUI } from '@/utils/adapter/wishlistAdapter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';

type WishlistsResponse = z.infer<typeof WishlistListResponseSchema>;

// ============================================
// QUERY KEYS
// ============================================

export const wishlistQueryKeys = {
    all: ['wishlists'] as const,
    list: (params?: WishlistQueryParams) => [...wishlistQueryKeys.all, 'list', params] as const,
    summary: () => [...wishlistQueryKeys.all, 'summary'] as const,
    detail: (wishlistId: string) => [...wishlistQueryKeys.all, 'detail', wishlistId] as const,
    items: (wishlistId: string) => [...wishlistQueryKeys.all, 'items', wishlistId] as const,
};

// ============================================
// DEFAULT PARAMS
// ============================================

const DEFAULT_PARAMS: WishlistQueryParams = {
    page: 0,
    size: 100,
    sortBy: 'createdDate',
    sortDir: 'desc',
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user's wishlists
 * 
 * Features:
 * - Paginated response support
 * - Zod validation
 * - Adapter transformation to UI types
 * - Auth-gated (only fetches when authenticated)
 * 
 * @param params - Optional filter/sort params
 * @returns Query result with wishlists array
 */
export const useWishlists = (params?: WishlistQueryParams) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const mergedParams = { ...DEFAULT_PARAMS, ...params };

    return useQuery({
        queryKey: wishlistQueryKeys.list(mergedParams),
        queryFn: async (): Promise<{
            items: WishlistCardUI[];
            totalElements: number;
            hasNext: boolean;
        }> => {
            const response = await request<WishlistsResponse>(
                {
                    url: API_ROUTES.WISHLISTS.LIST,
                    method: 'GET',
                    params: mergedParams,
                },
                WishlistListResponseSchema
            );

            // Guard: Check response.data exists
            if (!response.data) {
                return { items: [], totalElements: 0, hasNext: false };
            }

            return {
                items: toWishlistsUI(response.data.content),
                totalElements: response.data.totalElements ?? 0,
                hasNext: response.data.hasNext,
            };
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes - wishlists don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
};

/**
 * Hook to get wishlist summary for profile display
 * Returns total count and default wishlist info
 * 
 * @returns Query result with summary data
 */
export const useWishlistSummary = () => {
    const { data, isLoading, error } = useWishlists();

    // Derived data from wishlists
    const totalCount = data?.totalElements ?? 0;
    const defaultWishlist = data?.items.find((w) => w.isDefault);
    const totalItems = data?.items.reduce((sum, w) => sum + w.itemCount, 0) ?? 0;

    return {
        /** Total number of wishlists */
        wishlistCount: totalCount,
        /** Total items across all wishlists */
        totalItems,
        /** Default wishlist (if exists) */
        defaultWishlist,
        /** Loading state */
        isLoading,
        /** Error state */
        error,
    };
};

/**
 * Hook to invalidate wishlists cache
 * Call after adding/removing items from wishlist
 */
export const useInvalidateWishlists = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
    };

    return { invalidate };
};

/**
 * Hook to prefetch wishlists
 * Useful for preloading before navigating to favorites screen
 */
export const usePrefetchWishlists = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const prefetch = () => {
        if (!isAuthenticated) return;

        queryClient.prefetchQuery({
            queryKey: wishlistQueryKeys.list(DEFAULT_PARAMS),
            queryFn: async () => {
                const response = await request<WishlistsResponse>(
                    {
                        url: API_ROUTES.WISHLISTS.LIST,
                        method: 'GET',
                        params: DEFAULT_PARAMS,
                    },
                    WishlistListResponseSchema
                );

                // Guard: Check response.data exists
                if (!response.data) {
                    return { items: [], totalElements: 0, hasNext: false };
                }

                return {
                    items: toWishlistsUI(response.data.content),
                    totalElements: response.data.totalElements ?? 0,
                    hasNext: response.data.hasNext,
                };
            },
            staleTime: 1000 * 60 * 5,
        });
    };

    return { prefetch };
};
