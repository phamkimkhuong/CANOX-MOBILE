import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { request } from '@/services/api/client';
import { PaginatedProductResponseSchema, ProductFeedItem } from '@/types/product/product';
import { transformProduct } from '@/utils/adapter/product/productAdapter';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * Hook to fetch international products specifically.
 * Temporarily uses the global search API since a specific international endpoint is not yet available.
 */
export const useInternationalProducts = () => {
    return useInfiniteQuery({
        queryKey: ['products', 'international'],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const response = await request(
                {
                    url: API_ROUTES.PUBLIC_PRODUCTS.SEARCH,
                    method: 'GET',
                    params: {
                        page: pageParam,
                        size: 20,
                        // isInternational: true
                    }
                },
                PaginatedProductResponseSchema
            );

            // Guard: Check response.data exists
            if (!response.data) {
                return { items: [], nextPage: undefined };
            }

            // TRANSFORM DATA
            // Help reduce cache size and map DTO to UI types
            const items: ProductFeedItem[] = response.data.content.map(transformProduct);

            return {
                items,
                nextPage: response.data.hasNext ? response.data.page + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Smart refresh for international product feed
 */
export const useRefreshInternationalProducts = () => {
    return useSmartRefresh(['products', 'international']);
};
