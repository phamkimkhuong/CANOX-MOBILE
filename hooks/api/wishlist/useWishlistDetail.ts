/**
 * ==============================================
 * USE WISHLIST DETAIL - TanStack Query Hook
 * ==============================================
 * Fetches single wishlist with all items
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import type { WishlistDetailDTO, WishlistDetailUI } from '@/types/wishlist';
import { WishlistDetailResponseSchema } from '@/types/wishlist';
import { adaptWishlistDetail } from '@/utils/adapter/wishlist';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistKeys } from './useWishlists';

// ============================================
// FETCH FUNCTIONS
// ============================================

/**
 * Fetch wishlist detail with items
 */
const fetchWishlistDetail = async (wishlistId: string): Promise<WishlistDetailDTO> => {
    const response = await apiClient.get(API_ROUTES.WISHLISTS.DETAIL(wishlistId));
    const validated = WishlistDetailResponseSchema.parse(response.data);
    return validated.data;
};

/**
 * Fetch default wishlist
 */
const fetchDefaultWishlist = async (): Promise<WishlistDetailDTO> => {
    const response = await apiClient.get(API_ROUTES.WISHLISTS.DEFAULT);
    const validated = WishlistDetailResponseSchema.parse(response.data);
    return validated.data;
};

// ============================================
// HOOKS
// ============================================

interface UseWishlistDetailOptions {
    enabled?: boolean;
}

/**
 * Hook to fetch wishlist detail by ID
 * 
 * @param wishlistId - Wishlist ID to fetch
 * @param options - Query options
 * 
 * @example
 * const { data, isLoading } = useWishlistDetail('123');
 */
export const useWishlistDetail = (
    wishlistId: string | null,
    options: UseWishlistDetailOptions = {}
) => {
    const { enabled = true } = options;

    return useQuery({
        queryKey: wishlistKeys.detail(wishlistId || ''),
        queryFn: () => fetchWishlistDetail(wishlistId!),
        enabled: enabled && !!wishlistId,
        staleTime: 1000 * 60 * 3, // 3 minutes
        select: (data): WishlistDetailUI => adaptWishlistDetail(data),
    });
};

/**
 * Hook to fetch default wishlist
 * 
 * @example
 * const { data } = useDefaultWishlist();
 */
export const useDefaultWishlist = (options: UseWishlistDetailOptions = {}) => {
    const { enabled = true } = options;

    return useQuery({
        queryKey: wishlistKeys.default(),
        queryFn: fetchDefaultWishlist,
        enabled,
        staleTime: 1000 * 60 * 3,
        select: (data): WishlistDetailUI => adaptWishlistDetail(data),
    });
};

/**
 * Hook to prefetch wishlist detail
 */
export const usePrefetchWishlistDetail = () => {
    const queryClient = useQueryClient();

    return (wishlistId: string) => {
        queryClient.prefetchQuery({
            queryKey: wishlistKeys.detail(wishlistId),
            queryFn: () => fetchWishlistDetail(wishlistId),
            staleTime: 1000 * 60 * 3,
        });
    };
};
