/**
 * ==============================================
 * USE MY REVIEWS - Lịch sử đánh giá
 * ==============================================
 * API không hỗ trợ filter theo rating, nên lọc ở client
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { apiClient, ApiError } from '@/services/api/client';
import {
    MyReviewUI,
    RatingFilter,
    ReviewApiResponseDTO,
    ReviewPageDTO,
} from '@/types/review';
import { toMyReviewUI } from '@/utils/adapter/review/reviewAdapter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reviewKeys, REVIEWS_PAGE_SIZE } from './useReviews';

/**
 * Fetch all reviews (no server-side filtering)
 */
const fetchMyReviews = async (page: number): Promise<ReviewPageDTO> => {
    const response = await apiClient.get<ReviewApiResponseDTO<ReviewPageDTO>>(
        API_ROUTES.REVIEWS.MY_REVIEWS,
        { params: { page, size: REVIEWS_PAGE_SIZE } }
    );

    if (!response.data.success) {
        throw new ApiError(response.data.message, response.status, response.data.code);
    }

    return response.data.data;
};

/**
 * Apply client-side filter to reviews
 */
const applyFilter = (reviews: MyReviewUI[], filter: RatingFilter): MyReviewUI[] => {
    if (filter === 'all') return reviews;
    if (filter === 'with-media') return reviews.filter((r) => r.media && r.media.length > 0);
    if (filter === 'with-response') return reviews.filter((r) => r.hasSellerResponse);
    if (typeof filter === 'number') return reviews.filter((r) => r.rating === filter);
    return reviews;
};

/**
 * useMyReviews - Fetch and filter reviews on client side
 */
export const useMyReviews = (filter: RatingFilter = 'all') => {
    // Always fetch ALL reviews (no filter param to API)
    const query = useInfiniteQuery({
        queryKey: reviewKeys.myReviews(), // Same key for all filters
        queryFn: async ({ pageParam }) => {
            const data = await fetchMyReviews(pageParam);
            return {
                ...data,
                content: data.content.map(toMyReviewUI),
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextPage : undefined),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    // All reviews from all pages
    const allReviews = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.content);
    }, [query.data?.pages]);

    // Apply client-side filter
    const reviews = useMemo(() => {
        return applyFilter(allReviews, filter);
    }, [allReviews, filter]);

    const totalCount = query.data?.pages?.[0]?.totalElements ?? 0;

    return {
        ...query,
        reviews,
        totalCount,
        // Filtered count for UI display
        filteredCount: reviews.length,
    };
};

export const useRefreshMyReviews = () => {
    return useSmartRefresh(reviewKeys.myReviews());
};

export const flattenReviews = (
    data: ReturnType<typeof useMyReviews>['data']
): MyReviewUI[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content);
};
