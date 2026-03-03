/**
 * ==============================================
 * USE WISHLISTS - TanStack Query Hook
 * ==============================================
 * Fetches user's wishlist collection
 * Supports infinite scrolling and pagination
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type {
    WishlistCardUI,
    WishlistQueryParams
} from '@/types/wishlist';
import { WishlistListResponseSchema } from '@/types/wishlist';
import { adaptWishlistList } from '@/utils/adapter/wishlist';
import {
    useInfiniteQuery,
    useQueryClient
} from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const wishlistKeys = {
    all: ['wishlists'] as const,
    lists: () => [...wishlistKeys.all, 'list'] as const,
    list: (params: WishlistQueryParams) => [...wishlistKeys.lists(), params] as const,
    details: () => [...wishlistKeys.all, 'detail'] as const,
    detail: (id: string) => [...wishlistKeys.details(), id] as const,
    items: (wishlistId: string) => [...wishlistKeys.all, 'items', wishlistId] as const,
    default: () => [...wishlistKeys.all, 'default'] as const,
    popular: () => [...wishlistKeys.all, 'popular'] as const,
    latest: () => [...wishlistKeys.all, 'latest'] as const,
    search: (keyword: string) => [...wishlistKeys.all, 'search', keyword] as const,
    priceTargetMet: () => [...wishlistKeys.all, 'price-target-met'] as const,
};

// ============================================
// FETCH FUNCTIONS
// ============================================

interface WishlistListParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
}

/**
 * Fetch user's wishlists with pagination
 */
const fetchWishlists = async (params: WishlistListParams = {}) => {
    if (!useAuthStore.getState().isAuthenticated) return { content: [], hasNext: false, page: 0, size: 20, totalElements: 0, totalPages: 0 };

    const { page = 0, size = 20, sortBy = 'createdDate', sortDir = 'desc' } = params;

    const response = await apiClient.get(API_ROUTES.WISHLISTS.LIST, {
        params: { page, size, sortBy, sortDir },
    });

    const validated = WishlistListResponseSchema.parse(response.data);
    return validated.data;
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user's wishlists with infinite scroll
 * 
 * @example
 * const { data, fetchNextPage, hasNextPage } = useWishlists();
 */
export const useWishlists = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useInfiniteQuery({
        queryKey: wishlistKeys.lists(),
        queryFn: ({ pageParam = 0 }) => fetchWishlists({ page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNext) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 0,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => ({
            pages: data.pages.map(page => ({
                ...page,
                content: adaptWishlistList(page.content),
            })),
            pageParams: data.pageParams,
        }),
    });
};

/**
 * Flatten paginated wishlists into single array
 */
export const flattenWishlists = (
    data: ReturnType<typeof useWishlists>['data']
): WishlistCardUI[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.content);
};

/**
 * Hook to prefetch wishlists
 */
export const usePrefetchWishlists = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchInfiniteQuery({
            queryKey: wishlistKeys.lists(),
            queryFn: ({ pageParam = 0 }) => fetchWishlists({ page: pageParam }),
            initialPageParam: 0,
        });
    };
};
