/**
 * ==============================================
 * USE PUBLIC WISHLISTS - TanStack Query Hooks
 * ==============================================
 * Fetches public wishlists for discovery feature
 * Includes popular, latest, and search
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import type { PublicWishlistSearchParams, WishlistCardUI } from '@/types/wishlist';
import { WishlistListResponseSchema } from '@/types/wishlist';
import { adaptWishlistList } from '@/utils/adapter/wishlist';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { wishlistKeys } from './useWishlists';

// ============================================
// FETCH FUNCTIONS
// ============================================

interface PublicWishlistParams {
    page?: number;
    size?: number;
}

/**
 * Fetch popular public wishlists
 */
const fetchPopularWishlists = async (params: PublicWishlistParams = {}) => {
    const { page = 0, size = 10 } = params;
    const response = await apiClient.get(API_ROUTES.WISHLISTS.POPULAR, {
        params: { page, size },
    });
    const validated = WishlistListResponseSchema.parse(response.data);
    return validated.data;
};

/**
 * Fetch latest public wishlists
 */
const fetchLatestWishlists = async (params: PublicWishlistParams = {}) => {
    const { page = 0, size = 10 } = params;
    const response = await apiClient.get(API_ROUTES.WISHLISTS.LATEST, {
        params: { page, size },
    });
    const validated = WishlistListResponseSchema.parse(response.data);
    return validated.data;
};

/**
 * Search public wishlists by keyword
 */
const searchPublicWishlists = async (params: PublicWishlistSearchParams) => {
    const { keyword = '', page = 0, size = 10 } = params;
    const response = await apiClient.get(API_ROUTES.WISHLISTS.SEARCH, {
        params: { keyword, page, size },
    });
    const validated = WishlistListResponseSchema.parse(response.data);
    return validated.data;
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch popular wishlists
 * 
 * @example
 * const { data } = usePopularWishlists();
 */
export const usePopularWishlists = () => {
    return useQuery({
        queryKey: wishlistKeys.popular(),
        queryFn: () => fetchPopularWishlists({ size: 10 }),
        staleTime: 1000 * 60 * 10, // 10 minutes - public data can be cached longer
        select: (data) => ({
            ...data,
            content: adaptWishlistList(data.content),
        }),
    });
};

/**
 * Hook to fetch latest wishlists
 * 
 * @example
 * const { data } = useLatestWishlists();
 */
export const useLatestWishlists = () => {
    return useQuery({
        queryKey: wishlistKeys.latest(),
        queryFn: () => fetchLatestWishlists({ size: 10 }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => ({
            ...data,
            content: adaptWishlistList(data.content),
        }),
    });
};

/**
 * Hook to search public wishlists with infinite scroll
 * 
 * @param keyword - Search keyword
 * @param enabled - Whether to enable the query
 * 
 * @example
 * const { data, fetchNextPage } = useSearchWishlists('đồ điện tử');
 */
export const useSearchWishlists = (keyword: string, enabled = true) => {
    return useInfiniteQuery({
        queryKey: wishlistKeys.search(keyword),
        queryFn: ({ pageParam = 0 }) => searchPublicWishlists({ keyword, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNext) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 0,
        enabled: enabled && keyword.length >= 2,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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
 * Flatten search results into single array
 */
export const flattenSearchResults = (
    data: ReturnType<typeof useSearchWishlists>['data']
): WishlistCardUI[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.content);
};
