/**
 * ==============================================
 * useSmartRefresh - Smart Pull-to-Refresh for Infinite Queries
 * ==============================================
 * 
 * Problem:
 * Default `refetch()` on useInfiniteQuery refetches ALL loaded pages.
 * If user scrolled to page 50, pull-to-refresh would call 51 API requests!
 * 
 * Solution:
 * This hook resets the query to initial state and only fetches page 0.
 * When user scrolls down again, it will load more pages as needed.
 * 
 * Usage:
 * ```tsx
 * const { data, isRefetching } = useInfiniteQuery({ queryKey: ['orders', status], ... });
 * const { refresh } = useSmartRefresh(['orders', status]);
 * 
 * <RefreshControl
 *   refreshing={isRefetching}
 *   onRefresh={refresh}
 * />
 * ```
 */

import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseSmartRefreshOptions {
    /**
     * If true, uses exact match for query key.
     * Set to false if you want to reset all queries that START with this key.
     * @default true
     */
    exact?: boolean;
}

interface UseSmartRefreshReturn {
    /**
     * Call this function to reset the infinite query and refetch page 0 only.
     * Safe to use as RefreshControl's onRefresh prop.
     */
    refresh: () => Promise<void>;
}

/**
 * Smart refresh hook for infinite queries.
 * Resets all cached pages and triggers a fresh fetch of page 0 only.
 * 
 * @param queryKey - The query key of the infinite query to refresh
 * @param options - Optional configuration
 * @returns Object containing the refresh function
 * 
 * @example
 * // In your component
 * const { refresh } = useSmartRefresh(['orders', 'CREATED']);
 * 
 * // In RefreshControl
 * <RefreshControl onRefresh={refresh} refreshing={isRefetching} />
 */
export const useSmartRefresh = (
    queryKey: QueryKey,
    options: UseSmartRefreshOptions = {}
): UseSmartRefreshReturn => {
    const { exact = true } = options;
    const queryClient = useQueryClient();

    const refresh = useCallback(async () => {
        // resetQueries will:
        // Remove all cached data for this query
        // If the query is currently being observed (active), it will refetch
        // For infinite queries, this means only page 0 will be fetched
        await queryClient.resetQueries({
            queryKey,
            exact,
        });
    }, [queryClient, queryKey, exact]);

    return { refresh };
};

/**
 * Factory function to create a typed smart refresh hook for a specific feature.
 * Useful when you want to encapsulate the query key logic within a feature module.
 * 
 * @example
 * // In hooks/api/order/useOrders.ts
 * export const useRefreshOrderList = createSmartRefreshHook(
 *   (status: OrderTabStatus) => orderKeys.list(status)
 * );
 * 
 * // In component
 * const { refresh } = useRefreshOrderList('CREATED');
 */
export const createSmartRefreshHook = <TParams extends unknown[]>(
    getQueryKey: (...params: TParams) => QueryKey,
    defaultOptions: UseSmartRefreshOptions = {}
) => {
    return (...params: TParams) => {
        const queryKey = getQueryKey(...params);
        return useSmartRefresh(queryKey, defaultOptions);
    };
};
