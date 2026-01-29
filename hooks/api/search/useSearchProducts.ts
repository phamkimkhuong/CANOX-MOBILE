/**
 * ==============================================
 * SEARCH PRODUCTS HOOK - useInfiniteQuery
 * ==============================================
 * 
 * Features:
 * - Infinite scroll pagination
 * - Race condition handling with AbortController
 * - Smart caching with query key
 * - Transform API data to lightweight UI model
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { handleQueryRetry } from '@/services/api/queryClient';
import type {
    AdvancedFilters,
    QuickFilterType,
    SearchProductsResponse,
    SearchProductUI,
    SearchSortField,
} from '@/types/search-results';
import { SearchProductsResponseSchema } from '@/types/search-results';
import { toPublicUrl } from '@/utils/url';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

// ============================================
// QUERY KEYS
// ============================================

export const searchProductsKeys = {
    all: ['searchProducts'] as const,
    list: (params: {
        keyword: string;
        sortBy: SearchSortField;
        quickFilters: QuickFilterType[];
        advancedFilters: AdvancedFilters;
        shopId?: string;
        categoryId?: string;
    }) => [...searchProductsKeys.all, params] as const,
};

// ============================================
// TRANSFORMER
// ============================================

/**
 * Transform API response to UI model
 */
const transformSearchProduct = (raw: NonNullable<SearchProductsResponse['data']>['content'][0]): SearchProductUI => {
    // Primary image
    const media = raw.media ?? [];
    const primaryMedia = media.find(m => m.isPrimary) || media[0];

    // Price logic
    const priceMin = raw.priceMin ?? 0;
    const priceBeforeDiscount = raw.priceBeforeDiscount ?? 0;
    const priceAfterVoucher = raw.priceAfterBestVoucher ?? 0;

    // Display price: voucher price > min price
    const displayPrice = priceAfterVoucher > 0 ? priceAfterVoucher : priceMin;
    const originalPrice = priceBeforeDiscount > displayPrice ? priceBeforeDiscount : undefined;

    // Discount percentage
    let discount = 0;
    if (originalPrice && originalPrice > displayPrice) {
        discount = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    } else if (raw.showDiscount && raw.showDiscount > 0) {
        discount = raw.showDiscount;
    }

    // Check for flash sale
    const isFlashSale = raw.activeCampaigns?.some(
        c => c.campaignType === 'FLASH_SALE'
    ) ?? false;

    return {
        id: raw.id,
        title: raw.name ?? '',
        thumbnail: toPublicUrl(primaryMedia?.url ?? ''),
        price: displayPrice,
        originalPrice,
        discountPercentage: discount > 0 ? discount : undefined,
        rating: raw.reviewStatistics?.averageRating ?? 0,
        reviews: raw.reviewStatistics?.totalReviews ?? 0,
        sold: raw.reviewStatistics?.verifiedPurchaseCount ?? 0,
        shopName: raw.shop?.shopName ?? '',
        shopId: raw.shop?.shopId ?? undefined,
        hasVoucher: !!raw.bestShopVoucher,
        isFlashSale,
        categoryName: raw.category?.name ?? undefined,
    };
};

// ============================================
// SORT MAPPING
// ============================================

/**
 * Map sort field to API sort params
 */
const getSortParams = (sortBy: SearchSortField): string[] => {
    switch (sortBy) {
        case 'NEWEST':
            return ['createdDate,desc'];
        case 'BEST_SELLING':
            return ['reviewStatistics.verifiedPurchaseCount,desc'];
        case 'PRICE_ASC':
            return ['priceMin,asc'];
        case 'PRICE_DESC':
            return ['priceMin,desc'];
        case 'RELEVANCE':
        default:
            return []; // Default API sorting
    }
};

// ============================================
// HOOK OPTIONS
// ============================================

export interface UseSearchProductsOptions {
    keyword: string;
    sortBy?: SearchSortField;
    quickFilters?: QuickFilterType[];
    advancedFilters?: AdvancedFilters;
    pageSize?: number;
    enabled?: boolean;
    shopId?: string;
    categoryId?: string;
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * useSearchProducts - Search products with infinite scroll
 * 
 * @param options.keyword - Search keyword (required)
 * @param options.sortBy - Sort field (default: RELEVANCE)
 * @param options.quickFilters - Active quick filters
 * @param options.advancedFilters - Advanced filter options
 * @param options.pageSize - Items per page (default: 20)
 * @param options.enabled - Enable/disable query
 */
export const useSearchProducts = ({
    keyword = '',
    sortBy = 'RELEVANCE',
    quickFilters = [],
    advancedFilters = {},
    pageSize = 20,
    enabled = true,
    shopId,
    categoryId,
}: UseSearchProductsOptions) => {
    // AbortController ref for race condition handling
    const abortControllerRef = useRef<AbortController | null>(null);

    const queryClient = useQueryClient();

    // Build query key
    const queryKey = searchProductsKeys.list({
        keyword,
        sortBy,
        quickFilters,
        advancedFilters,
        shopId,
        categoryId,
    });

    const query = useInfiniteQuery({
        queryKey,
        initialPageParam: 0,
        enabled: enabled && (keyword.trim().length > 0 || !!categoryId || !!shopId),
        queryFn: async ({ pageParam = 0, signal }) => {
            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            // Build final params object
            const params: Record<string, any> = {
                keyword: keyword.trim(),
                page: pageParam,
                size: pageSize,
                validPriceRange: advancedFilters.validPriceRange ?? true,
                ...(shopId && { shopId }),
                ...(categoryId && { categoryId }),
            };

            // Add sorting only if not RELEVANCE
            const sortParams = getSortParams(sortBy);
            if (sortParams.length > 0) {
                params.sort = sortParams;
            }

            // Add Advanced Filters (Price Range)
            if (advancedFilters.minPrice !== undefined) params.minPrice = advancedFilters.minPrice;
            if (advancedFilters.maxPrice !== undefined) params.maxPrice = advancedFilters.maxPrice;

            // Add Quick Filters Mapping
            if (quickFilters.includes('RATING_4PLUS')) {
                params.averageRating = 4;
            }

            const response = await request<SearchProductsResponse>(
                {
                    url: API_ROUTES.PUBLIC_PRODUCTS.SEARCH,
                    method: 'GET',
                    params,
                    signal: abortControllerRef.current.signal,
                },
                SearchProductsResponseSchema
            );

            // Guard: Check response data
            if (!response.data) {
                return {
                    items: [] as SearchProductUI[],
                    nextPage: undefined,
                    totalElements: 0,
                    totalPages: 0,
                    isEmpty: true,
                };
            }

            // Transform products
            const items = response.data.content.map(transformSearchProduct);

            return {
                items,
                nextPage: response.data.hasNext ? response.data.page + 1 : undefined,
                totalElements: response.data.totalElements ?? 0,
                totalPages: response.data.totalPages,
                isEmpty: response.data.empty ?? items.length === 0,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 2, // 2 minutes cache
        gcTime: 1000 * 60 * 10,   // Keep in garbage collection for 10 minutes
        retry: (count, error) => handleQueryRetry(count, error, 1),
    });

    /**
     * Reset search (clear cache and refetch)
     */
    const resetSearch = useCallback(() => {
        queryClient.removeQueries({ queryKey: searchProductsKeys.all });
    }, [queryClient]);

    /**
     * Get flattened products list
     */
    const products = query.data?.pages.flatMap(page => page.items) ?? [];

    /**
     * Get total count
     */
    const totalCount = query.data?.pages[0]?.totalElements ?? 0;

    /**
     * Check if truly empty (not loading, has data, but data is empty)
     */
    const isEmpty = !query.isLoading && products.length === 0;

    return {
        ...query,
        products,
        totalCount,
        isEmpty,
        resetSearch,
    };
};

/**
 * Prefetch search results (for navigation optimization)
 */
export const usePrefetchSearchProducts = () => {
    const queryClient = useQueryClient();

    return useCallback((keyword: string) => {
        if (!keyword.trim()) return;

        const queryKey = searchProductsKeys.list({
            keyword,
            sortBy: 'RELEVANCE',
            quickFilters: [],
            advancedFilters: {},
        });

        queryClient.prefetchInfiniteQuery({
            queryKey,
            initialPageParam: 0,
            queryFn: async () => {
                const response = await request<SearchProductsResponse>(
                    {
                        url: API_ROUTES.PUBLIC_PRODUCTS.SEARCH,
                        method: 'GET',
                        params: {
                            keyword: keyword.trim(),
                            page: 0,
                            size: 20,
                            validPriceRange: true,
                        },
                    },
                    SearchProductsResponseSchema
                );

                if (!response.data) {
                    return { items: [], nextPage: undefined, totalElements: 0, totalPages: 0, isEmpty: true };
                }

                return {
                    items: response.data.content.map(transformSearchProduct),
                    nextPage: response.data.hasNext ? 1 : undefined,
                    totalElements: response.data.totalElements ?? 0,
                    totalPages: response.data.totalPages,
                    isEmpty: response.data.empty ?? false,
                };
            },
            staleTime: 1000 * 60 * 2,
        });
    }, [queryClient]);
};
