/**
 * ==============================================
 * USE ORDERS HOOK - TanStack Query Integration
 * ==============================================
 * Hook để fetch orders theo status với useInfiniteQuery
 * Mỗi tab là một query riêng biệt (lazy fetch khi cần)
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError } from '@/services/api/client';
import { Order, OrdersApiResponse, OrdersPageResponse, OrderTabStatus } from '@/types/order/order';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 20;

// Query keys factory
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (status: OrderTabStatus) => [...orderKeys.lists(), status] as const,
    detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};

/**
 * Fetch orders by status với pagination
 */
const fetchOrdersByStatus = async (
    status: OrderTabStatus,
    page: number
): Promise<OrdersPageResponse> => {
    const response = await apiClient.get<OrdersApiResponse>(API_ROUTES.ORDERS.LIST, {
        params: {
            status,
            page,
            size: PAGE_SIZE,
        },
    });

    if (!response.data.success) {
        throw new ApiError(response.data.message, response.status, response.data.code);
    }

    return response.data.data;
};

/**
 * useOrderList - Infinite scroll query cho danh sách đơn hàng theo status
 * 
 * @param status - Trạng thái đơn hàng để filter
 * @param enabled - Có enable query không (để lazy load khi chuyển tab)
 */
export const useOrderList = (status: OrderTabStatus, enabled: boolean = true) => {
    return useInfiniteQuery({
        queryKey: orderKeys.list(status),
        queryFn: ({ pageParam }) => fetchOrdersByStatus(status, pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            // Nếu còn trang tiếp theo, trả về page number
            return lastPage.hasNext ? lastPage.nextPage : undefined;
        },
        enabled,
        staleTime: 2 * 60 * 1000, // 2 phút - orders có thể thay đổi nhanh
        gcTime: 10 * 60 * 1000, // 10 phút cache
    });
};

/**
 * Flatten orders từ infinite query pages
 */
export const flattenOrders = (
    data: ReturnType<typeof useOrderList>['data']
): Order[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content);
};

/**
 * Cancel order mutation
 */
export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(API_ROUTES.ORDERS.CANCEL(orderId));
            return response.data;
        },
        onSuccess: () => {
            // Invalidate all order lists to refetch
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        },
    });
};

/**
 * Confirm received order mutation
 */
export const useConfirmReceivedOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(API_ROUTES.ORDERS.CONFIRM_RECEIVED(orderId));
            return response.data;
        },
        onSuccess: () => {
            // Invalidate relevant order lists
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        },
    });
};

/**
 * Get total items count from infinite query (for badges)
 */
export const getTotalOrderCount = (
    data: ReturnType<typeof useOrderList>['data']
): number => {
    if (!data?.pages?.[0]) return 0;
    return data.pages[0].totalElements;
};
