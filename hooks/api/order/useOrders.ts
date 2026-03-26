/**
 * ==============================================
 * USE ORDERS HOOK - TanStack Query Integration
 * ==============================================
 * Hook để fetch orders theo status với useInfiniteQuery
 * Mỗi tab là một query riêng biệt (lazy fetch khi cần)
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { apiClient, ApiError, request } from '@/services/api/client';
import { Order, OrdersApiResponse, OrdersPageResponse, OrderTabStatus, OrderUI } from '@/types/order/order';
import { OrdersApiResponseSchema } from '@/types/order/orderSchema';
import { transformOrder } from '@/utils/adapter/order/orderAdapter';
import { ORDER_TABS } from '@/utils/adapter/order/orderStatusMapper';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 20;

// Query keys factory
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (status: OrderTabStatus) => [...orderKeys.lists(), status] as const,
    byShop: (shopId: string) => [...orderKeys.lists(), 'shop', shopId] as const,
    detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};

/**
 * Fetch orders by status với pagination
 */
const fetchOrdersByStatus = async (
    status: OrderTabStatus,
    page: number
): Promise<OrdersPageResponse> => {
    const tabConfig = ORDER_TABS.find((t) => t.key === status);
    const apiStatus = tabConfig ? tabConfig.apiStatus : status;

    const response = await request<OrdersApiResponse>(
        {
            url: API_ROUTES.ORDERS.LIST,
            method: 'GET',
            params: {
                status: apiStatus,
                page,
                size: PAGE_SIZE,
            },
        },
        OrdersApiResponseSchema
    );

    if (!response.success) {
        throw new ApiError(response.message, undefined, response.code);
    }

    return response.data;
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
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Fetch orders by shop với pagination
 */
const fetchShopOrders = async (
    shopId: string,
    page: number
): Promise<OrdersPageResponse> => {
    const response = await request<OrdersApiResponse>(
        {
            url: API_ROUTES.ORDERS.BY_SHOP(shopId),
            method: 'GET',
            params: {
                page,
                size: PAGE_SIZE,
            },
        },
        OrdersApiResponseSchema
    );

    if (!response.success) {
        throw new ApiError(response.message, undefined, response.code);
    }

    return response.data;
};

/**
 * useShopOrders - Get list of orders of buyer at shop
 */
export const useShopOrders = (shopId: string | undefined, enabled: boolean = true) => {
    return useInfiniteQuery({
        queryKey: orderKeys.byShop(shopId || ''),
        queryFn: async ({ pageParam }) => {
            if (!shopId) return { content: [], page: 0, totalElements: 0, hasNext: false, nextPage: 0 };
            return fetchShopOrders(shopId, pageParam);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.nextPage : undefined,
        enabled: !!shopId && enabled,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * useRefreshOrderList - Smart refresh for order infinite query
 * Uses the generic useSmartRefresh hook under the hood.
 * 
 * @param status - Order status to refresh
 * @returns refresh function
 */
export const useRefreshOrderList = (status: OrderTabStatus) => {
    return useSmartRefresh(orderKeys.list(status));
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
 * Build transformed orders for UI rendering from raw query data.
 */
const buildOrderUIs = (
    data: ReturnType<typeof useOrderList>['data'] | ReturnType<typeof useShopOrders>['data']
): OrderUI[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content.map(transformOrder));
};

/**
 * useOrderListUI - Memoized UI projection of raw order list query.
 * Rebuilds OrderUI[] only when underlying query pages change.
 */
export const useOrderListUI = (status: OrderTabStatus, enabled: boolean = true) => {
    const query = useOrderList(status, enabled);
    const orders = useMemo(() => buildOrderUIs(query.data), [query.data?.pages]);

    return {
        query,
        orders,
    };
};

/**
 * useShopOrdersUI - Memoized UI projection of raw shop orders query.
 * Rebuilds OrderUI[] only when underlying query pages change.
 */
export const useShopOrdersUI = (shopId: string | undefined, enabled: boolean = true) => {
    const query = useShopOrders(shopId, enabled);
    const orders = useMemo(() => buildOrderUIs(query.data), [query.data?.pages]);

    return {
        query,
        orders,
    };
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
