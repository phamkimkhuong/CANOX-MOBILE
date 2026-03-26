/**
 * ==============================================
 * USE ORDER DETAIL HOOK - Chi tiết đơn hàng
 * ==============================================
 * TanStack Query hook for fetching single order detail
 * 
 * Features:
 * - Cached with orderKeys.detail(orderId)
 * - Placeholder data from list (if available)
 * - Auto refetch on focus
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { ApiError, request } from '@/services/api/client';
import type { Order } from '@/types/order/order';
import { OrderDetailApiResponseSchema } from '@/types/order/orderSchema';
import { UseQueryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './useOrders';

/**
 * Fetch single order by ID
 */
const fetchOrderDetail = async (orderId: string): Promise<Order> => {
    const response = await request(
        {
            url: API_ROUTES.ORDERS.DETAIL(orderId),
            method: 'GET',
        },
        OrderDetailApiResponseSchema
    );

    if (!response.success) {
        throw new ApiError(
            response.message || 'Failed to fetch order',
            undefined,
            response.code
        );
    }

    return response.data;
};

type UseOrderDetailOptions = Omit<
    UseQueryOptions<Order, Error, Order>,
    'queryKey' | 'queryFn' | 'placeholderData'
> & {
    enabled?: boolean;
};

/**
 * useOrderDetail - Hook to fetch single order detail
 * 
 * @param orderId - Order ID to fetch
 * @param options - Additional query options
 * 
 * Features:
 * - Returns raw Order as the cache/source-of-truth shape
 * - Lets screens derive OrderUI locally for rendering
 * - Caches aggressively since order detail rarely changes
 */
export const useOrderDetail = (
    orderId: string | null,
    options: UseOrderDetailOptions = {}
) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: orderKeys.detail(orderId || ''),

        queryFn: async () => {
            if (!orderId) throw new Error('Order ID is required');
            return fetchOrderDetail(orderId);
        },

        // Cache for 5 minutes - order details don't change often
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,

        // Show cached data while refetching
        placeholderData: () => {
            // Try to find this order in any list cache
            const lists = queryClient.getQueriesData<{
                pages?: Array<{ content?: Order[] }>;
            }>({ queryKey: orderKeys.lists() });

            for (const [, data] of lists) {
                if (!data?.pages) continue;
                for (const page of data.pages) {
                    const found = page.content?.find((o) => o.orderId === orderId);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        },

        // Refetch on window focus (user might have taken action elsewhere)
        refetchOnWindowFocus: true,
        ...options,
        enabled: !!orderId && (options.enabled ?? true),
    });
};

/**
 * Prefetch order detail (for navigation optimization)
 * Call this when user hovers/long-presses on order card
 */
export const usePrefetchOrderDetail = () => {
    const queryClient = useQueryClient();

    return (orderId: string) => {
        queryClient.prefetchQuery({
            queryKey: orderKeys.detail(orderId),
            queryFn: () => fetchOrderDetail(orderId),
            staleTime: 5 * 60 * 1000,
        });
    };
};

/**
 * Invalidate order detail cache (after mutation)
 */
export const useInvalidateOrderDetail = () => {
    const queryClient = useQueryClient();

    return (orderId: string) => {
        queryClient.invalidateQueries({
            queryKey: orderKeys.detail(orderId),
        });
    };
};
