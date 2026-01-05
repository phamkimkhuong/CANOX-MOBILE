import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { PaginatedProductResponseSchema, ProductFeedItem, ProductResponseItem } from '@/types/product/product';
import { PaginatedResponse } from '@/types/responseSchema';
import { transformProduct } from '@/utils/adapter/productAdapter';
import { useInfiniteQuery } from '@tanstack/react-query';

// Types for Feeds
export type FeedType = 'new' | 'sale' | 'featured' | 'promoted';

// 1. Helper to get URL by Tab
const getApiUrl = (type: FeedType) => {
    switch (type) {
        case 'sale': return API_ROUTES.PUBLIC_PRODUCTS.SALE;
        case 'new': return API_ROUTES.PUBLIC_PRODUCTS.NEW;
        case 'featured': return API_ROUTES.PUBLIC_PRODUCTS.FEATURED;
        default: return API_ROUTES.PUBLIC_PRODUCTS.PROMOTED;
    }
};

// 2. Main Hook
export const useProductFeed = (type: FeedType) => {
    return useInfiniteQuery({
        queryKey: ['products', type],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const url = getApiUrl(type);
            const response = await request<PaginatedResponse<ProductResponseItem>>(
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

            // TRANSFORM DATA RIGHT HERE
            // Helps React Query Cache be lighter
            const items: ProductFeedItem[] = response.data.content.map(transformProduct);

            return {
                items,
                nextPage: response.data.hasNext ? response.data.page + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        placeholderData: (previousData) => previousData, // Keep old data while refetching to avoid flicker due to loading
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });
};