import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { PaginatedProductResponseSchema, ProductFeedItem } from '@/types/product/product';
import { transformProduct } from '@/utils/adapter/product/productAdapter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSmartRefresh } from '../useSmartRefresh';

// Types for Feeds
export type FeedType = 'new' | 'sale' | 'featured' | 'promoted';

// 1. Helper to get URL by Tab
const getApiUrl = (type: FeedType) => {
    switch (type) {
        // case 'sale': return API_ROUTES.PUBLIC_PRODUCTS.SALE;
        // case 'new': return API_ROUTES.PUBLIC_PRODUCTS.NEW;
        // case 'featured': return API_ROUTES.PUBLIC_PRODUCTS.FEATURED;
        // case 'promoted': return API_ROUTES.PUBLIC_PRODUCTS.PROMOTED;
        // default: return API_ROUTES.PUBLIC_PRODUCTS.SALE;
        case 'sale': return API_ROUTES.PUBLIC_PRODUCTS.SEARCH;
        case 'new': return API_ROUTES.PUBLIC_PRODUCTS.SEARCH;
        case 'featured': return API_ROUTES.PUBLIC_PRODUCTS.SEARCH;
        case 'promoted': return API_ROUTES.PUBLIC_PRODUCTS.SEARCH;
        default: return API_ROUTES.PUBLIC_PRODUCTS.SEARCH;
    }
};

// 2. Main Hook
export const useProductFeed = (type: FeedType) => {
    return useInfiniteQuery({
        queryKey: ['products', type],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const url = getApiUrl(type);
            const response = await request(
                {
                    url,
                    method: 'GET',
                    params: {
                        page: pageParam,
                        size: 20,
                    }
                },
                PaginatedProductResponseSchema
            );

            // Guard: Check response.data exists
            if (!response.data) {
                return { items: [], nextPage: undefined };
            }

            // TRANSFORM DATA RIGHT HERE
            // Helps React Query Cache be lighter
            const items: ProductFeedItem[] = response.data.content.map(transformProduct);

            return {
                items,
                nextPage: response.data.hasNext ? response.data.page + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });
};

/**
 * Smart refresh for product feed
 */
export const useRefreshProductFeed = (type: FeedType) => {
    return useSmartRefresh(['products', type]);
};

