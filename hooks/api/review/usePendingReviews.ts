/**
 * ==============================================
 * USE PENDING REVIEWS - Sản phẩm chờ đánh giá
 * ==============================================
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError } from '@/services/api/client';
import { OrdersApiResponse, OrdersPageResponse } from '@/types/order/order';
import { extractPendingReviews } from '@/utils/adapter/review/reviewAdapter';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { reviewKeys } from './useReviews';

const PAGE_SIZE = 20;

/**
 * Fetch orders that may contain unreviewed items
 */
const fetchCompletedOrders = async (page: number): Promise<OrdersPageResponse> => {
    const response = await apiClient.get<OrdersApiResponse>(API_ROUTES.ORDERS.LIST, {
        params: { status: 'UI_COMPLETED', page, size: PAGE_SIZE },
    });

    if (!response.data.success) {
        throw new ApiError(response.data.message, response.status, response.data.code);
    }

    return response.data.data;
};

/**
 * usePendingReviews - Fetch items awaiting review
 */
export const usePendingReviews = () => {
    const query = useInfiniteQuery({
        queryKey: reviewKeys.pending(),
        queryFn: async ({ pageParam }) => {
            const data = await fetchCompletedOrders(pageParam);
            return {
                ...data,
                groups: extractPendingReviews(data.content),
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => (lastPage.hasNext ? (lastPage.page ?? 0) + 1 : undefined),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const pendingGroups = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.groups);
    }, [query.data?.pages]);

    const pendingCount = useMemo(() => {
        return pendingGroups.reduce((sum, group) => sum + group.items.length, 0);
    }, [pendingGroups]);

    return {
        ...query,
        pendingGroups,
        pendingCount,
    };
};

export const useRefreshPendingReviews = () => {
    const queryClient = useQueryClient();
    const refresh = useCallback(() => {
        return queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    }, [queryClient]);
    return { refresh };
};
