/**
 * ==============================================
 * USE INFINITE PRODUCT REVIEWS
 * ==============================================
 * Infinite scroll hook for "All Reviews" screen
 * Features: Filtering, Sorting, Pagination, Statistics
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { request } from '@/services/api/client';
import {
    ProductReviewFilterType,
    ProductReviewPageData,
    ProductReviewSortOption,
    ProductReviewsResponseSchema,
    ProductReviewStatisticsApiResponseSchema,
    ProductReviewStatisticsSchema
} from '@/types/review/productReview';
import {
    parseProductReviewFilter,
    toProductReviewPageData,
    toProductReviewStatisticsUI,
} from '@/utils/adapter/review/productReviewAdapter';
import { createLogger } from '@/utils/logger';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const log = createLogger('ProductReviews');

// ============================================
// CONSTANTS
// ============================================

const PAGE_SIZE = 20;
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

// ============================================
// QUERY KEYS
// ============================================

export const productReviewKeys = {
    all: ['product-reviews'] as const,

    list: (productId: string) =>
        [...productReviewKeys.all, 'list', productId] as const,

    filtered: (
        productId: string,
        filter: ProductReviewFilterType,
        variantId: string | null,
        sort: ProductReviewSortOption
    ) => [...productReviewKeys.list(productId), { filter, variantId, sort }] as const,

    helpful: (reviewId: string) =>
        [...productReviewKeys.all, 'helpful', reviewId] as const,

    statistics: (productId: string) =>
        [...productReviewKeys.all, 'statistics', productId] as const,
};

// ============================================
// FETCH FUNCTION
// ============================================

interface FetchProductReviewsParams {
    productId: string;
    filter: ProductReviewFilterType;
    variantId: string | null;
    sort: ProductReviewSortOption;
    page: number;
    size?: number;
    shopName?: string;
}

const fetchProductReviews = async ({
    productId,
    filter,
    variantId,
    sort,
    page,
    size = PAGE_SIZE,
    shopName,
}: FetchProductReviewsParams): Promise<ProductReviewPageData> => {
    const filterParams = parseProductReviewFilter(filter, sort);

    const params: Record<string, unknown> = {
        page,
        size,
        ...filterParams,
    };

    // Add variant filter if specified
    if (variantId) {
        params.variantId = variantId;
    }

    log.info('Fetching reviews:', { productId, page, filter, variantId, sort });

    const response = await request(
        {
            url: API_ROUTES.REVIEWS.LIST('PRODUCT', productId),
            method: 'GET',
            params,
        },
        ProductReviewsResponseSchema
    );

    return toProductReviewPageData(response, shopName);
};

// ============================================
// INFINITE QUERY HOOK
// ============================================

export interface UseInfiniteProductReviewsOptions {
    filter?: ProductReviewFilterType;
    variantId?: string | null;
    sort?: ProductReviewSortOption;
    shopName?: string;
    enabled?: boolean;
}

export const useInfiniteProductReviews = (
    productId: string,
    options: UseInfiniteProductReviewsOptions = {}
) => {
    const {
        filter = 'all',
        variantId = null,
        sort = 'newest',
        shopName,
        enabled = true,
    } = options;

    return useInfiniteQuery({
        queryKey: productReviewKeys.filtered(productId, filter, variantId, sort),

        queryFn: async ({ pageParam = 0 }) => {
            return fetchProductReviews({
                productId,
                filter,
                variantId,
                sort,
                page: pageParam,
                shopName,
            });
        },

        initialPageParam: 0,

        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.hasNext) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },

        enabled: enabled && !!productId,
        staleTime: STALE_TIME,

        // Keep previous data while fetching new filter results
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Smart refresh for product reviews
 */
export const useRefreshProductReviews = (
    productId: string,
    filter: ProductReviewFilterType,
    variantId: string | null,
    sort: ProductReviewSortOption
) => {
    return useSmartRefresh(productReviewKeys.filtered(productId, filter, variantId, sort));
};

// ============================================
// STATISTICS HOOK
// ============================================


export const useProductReviewStatistics = (productId: string, enabled = true) => {
    return useQuery({
        queryKey: productReviewKeys.statistics(productId),
        queryFn: async () => {
            log.info('Fetching review statistics:', productId);
            const response = await request(
                {
                    url: API_ROUTES.REVIEWS.STATISTICS('PRODUCT', productId),
                    method: 'GET',
                },
                ProductReviewStatisticsApiResponseSchema
            );
            return toProductReviewStatisticsUI(response.data);
        },
        enabled: enabled && !!productId,
        staleTime: STALE_TIME,
    });
};

// ============================================
// DERIVED DATA HOOKS
// ============================================

/**
 * Get flattened reviews from all pages
 */
export const useProductReviewsList = (
    productId: string,
    options?: UseInfiniteProductReviewsOptions
) => {
    const query = useInfiniteProductReviews(productId, options);
    const statsQuery = useProductReviewStatistics(productId, options?.enabled);

    const reviews = query.data?.pages.flatMap(page => page.reviews) ?? [];
    const statistics = statsQuery.data ?? null;
    const totalReviews = statistics?.totalReviews ?? 0;

    return {
        ...query,
        reviews,
        statistics,
        totalReviews,
        isStatsLoading: statsQuery.isLoading,
    };
};

// ============================================
// MARK HELPFUL MUTATION
// ============================================

interface MarkHelpfulParams {
    reviewId: string;
    productId: string;
}

const ToggleHelpfulResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        voted: z.boolean(),
    }),
});

export const useMarkReviewHelpful = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId }: MarkHelpfulParams) => {
            log.info('Mark review helpful:', reviewId);
            return request(
                {
                    url: API_ROUTES.REVIEWS.HELPFUL(reviewId),
                    method: 'POST'
                },
                ToggleHelpfulResponseSchema
            );
        },

        onMutate: async ({ reviewId, productId }) => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: productReviewKeys.list(productId)
            });

            // Update cache optimistically
            queryClient.setQueriesData(
                { queryKey: productReviewKeys.list(productId) },
                (old: { pages: ProductReviewPageData[] } | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            reviews: page.reviews.map(review =>
                                review.id === reviewId
                                    ? {
                                        ...review,
                                        isHelpful: !review.isHelpful,
                                        helpfulCount: review.isHelpful
                                            ? review.helpfulCount - 1
                                            : review.helpfulCount + 1,
                                    }
                                    : review
                            ),
                        })),
                    };
                }
            );
        },

        onError: (error, { productId }) => {
            log.error('Failed to mark helpful:', error);
            // Rollback on error
            queryClient.invalidateQueries({
                queryKey: productReviewKeys.list(productId)
            });
        },
    });
};

// ============================================
// PREFETCH HELPER
// ============================================

export const prefetchProductReviews = async (
    queryClient: ReturnType<typeof useQueryClient>,
    productId: string,
    shopName?: string
) => {
    await queryClient.prefetchInfiniteQuery({
        queryKey: productReviewKeys.filtered(productId, 'all', null, 'newest'),
        queryFn: () => fetchProductReviews({
            productId,
            filter: 'all',
            variantId: null,
            sort: 'newest',
            page: 0,
            shopName,
        }),
        initialPageParam: 0,
    });
};
