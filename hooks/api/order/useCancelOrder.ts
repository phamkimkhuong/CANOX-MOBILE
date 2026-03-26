/**
 * ==============================================
 * USE CANCEL ORDER - TanStack Mutation Hook
 * ==============================================
 * Mutation để huỷ đơn hàng
 * 
 * Features:
 * - Optimistic UI update (optional)
 * - Auto invalidate order queries on success
 * - Toast feedback
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError } from '@/services/api/client';
import type { Order, OrdersPageResponse, OrderTabStatus } from '@/types/order/order';
import type { CancelOrderPayload, CancelOrderResponse } from '@/types/order/cancel';
import { logger } from '@/utils/logger';
import { InfiniteData, QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { profileQueryKeys } from '../profile/useProfile';
import { orderKeys } from './useOrders';

// Re-export orderKeys counts for invalidation
// Note: counts key is from useOrderCount hook if exists

/**
 * API call to cancel order
 */
const cancelOrder = async (
    orderId: string,
    payload: CancelOrderPayload
): Promise<CancelOrderResponse> => {
    const response = await apiClient.put<CancelOrderResponse>(
        API_ROUTES.ORDERS.CANCEL(orderId),
        payload
    );

    if (!response.data.success) {
        throw new ApiError(
            response.data.message || 'Huỷ đơn hàng thất bại',
            response.status,
            response.data.code
        );
    }

    return response.data;
};

interface UseCancelOrderOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

type OrdersInfiniteData = InfiniteData<OrdersPageResponse, number>;

const getListStatusFromKey = (queryKey: QueryKey): OrderTabStatus | null => {
    if (queryKey.length !== 3) return null;
    if (queryKey[0] !== 'orders' || queryKey[1] !== 'list') return null;

    const status = queryKey[2];
    if (
        status === 'AWAITING_PAYMENT' ||
        status === 'CREATED' ||
        status === 'FULFILLING' ||
        status === 'DELIVERED' ||
        status === 'COMPLETED' ||
        status === 'CANCELLED'
    ) {
        return status;
    }

    return null;
};

const isByShopQueryKey = (queryKey: QueryKey): boolean => (
    queryKey.length === 4 &&
    queryKey[0] === 'orders' &&
    queryKey[1] === 'list' &&
    queryKey[2] === 'shop'
);

const removeOrderFromPages = (
    data: OrdersInfiniteData,
    orderId: string
): { data: OrdersInfiniteData; changed: boolean } => {
    let removedCount = 0;

    const pages = data.pages.map((page) => {
        const nextContent = page.content.filter((order) => order.orderId !== orderId);
        removedCount += page.content.length - nextContent.length;
        return {
            ...page,
            content: nextContent,
        };
    });

    if (removedCount === 0) {
        return { data, changed: false };
    }

    const nextPages = pages.map((page) => ({
        ...page,
        totalElements: Math.max(0, page.totalElements - removedCount),
    }));

    return {
        data: {
            ...data,
            pages: nextPages,
        },
        changed: true,
    };
};

const replaceOrderInPages = (
    data: OrdersInfiniteData,
    nextOrder: Order
): { data: OrdersInfiniteData; changed: boolean } => {
    let changed = false;

    const nextPages = data.pages.map((page) => {
        let pageChanged = false;
        const nextContent = page.content.map((order) => {
            if (order.orderId !== nextOrder.orderId) return order;
            pageChanged = true;
            return nextOrder;
        });

        changed = changed || pageChanged;
        return pageChanged
            ? { ...page, content: nextContent }
            : page;
    });

    if (!changed) {
        return { data, changed: false };
    }

    return {
        data: {
            ...data,
            pages: nextPages,
        },
        changed: true,
    };
};

const upsertCancelledOrder = (
    data: OrdersInfiniteData,
    nextOrder: Order
): { data: OrdersInfiniteData; changed: boolean } => {
    const replaced = replaceOrderInPages(data, nextOrder);
    if (replaced.changed) {
        return replaced;
    }

    if (!data.pages.length) {
        return { data, changed: false };
    }

    const firstPage = data.pages[0];
    const nextPages = data.pages.map((page, index) => {
        const nextTotalElements = page.totalElements + 1;
        if (index !== 0) {
            return {
                ...page,
                totalElements: nextTotalElements,
            };
        }

        return {
            ...page,
            totalElements: nextTotalElements,
            content: [nextOrder, ...page.content],
        };
    });

    return {
        data: {
            ...data,
            pages: nextPages,
        },
        changed: true,
    };
};

const findOrderSnapshot = (
    queryClient: ReturnType<typeof useQueryClient>,
    orderId: string
): Order | undefined => {
    const detailOrder = queryClient.getQueryData<Order>(orderKeys.detail(orderId));
    if (detailOrder) return detailOrder;

    const lists = queryClient.getQueriesData<OrdersInfiniteData>({
        queryKey: orderKeys.lists(),
    });

    for (const [, data] of lists) {
        if (!data?.pages) continue;
        for (const page of data.pages) {
            const found = page.content.find((order) => order.orderId === orderId);
            if (found) return found;
        }
    }

    return undefined;
};

/**
 * useCancelOrder - Mutation hook for cancelling orders
 */
export const useCancelOrder = (options: UseCancelOrderOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orderId,
            reason,
        }: {
            orderId: string;
            reason: string;
        }) => {
            return cancelOrder(orderId, { reason });
        },

        onSuccess: (data, variables) => {
            logger.api.info('Order cancelled successfully:', variables.orderId);

            const currentOrder = findOrderSnapshot(queryClient, variables.orderId);
            const cancelledOrder = currentOrder
                ? {
                    ...currentOrder,
                    status: 'CANCELLED' as const,
                    cancellationReason: variables.reason,
                  }
                : undefined;

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Đã huỷ đơn hàng',
                text2: 'Đơn hàng của bạn đã được huỷ thành công',
            });

            const affectedListKeys: QueryKey[] = [];

            if (cancelledOrder) {
                queryClient.setQueryData(orderKeys.detail(variables.orderId), cancelledOrder);
            }

            const listQueries = queryClient.getQueriesData<OrdersInfiniteData>({
                queryKey: orderKeys.lists(),
            });

            for (const [queryKey, cachedData] of listQueries) {
                if (!cachedData?.pages?.length) continue;

                let nextDataResult: { data: OrdersInfiniteData; changed: boolean } | null = null;

                if (isByShopQueryKey(queryKey)) {
                    if (!cancelledOrder) continue;
                    nextDataResult = replaceOrderInPages(cachedData, cancelledOrder);
                } else {
                    const status = getListStatusFromKey(queryKey);
                    if (!status) continue;

                    if (status === 'CANCELLED') {
                        if (!cancelledOrder) continue;
                        nextDataResult = upsertCancelledOrder(cachedData, cancelledOrder);
                    } else {
                        nextDataResult = removeOrderFromPages(cachedData, variables.orderId);
                    }
                }

                if (nextDataResult?.changed) {
                    queryClient.setQueryData(queryKey, nextDataResult.data);
                    affectedListKeys.push(queryKey);
                }
            }

            // Invalidate the specific order detail so it's fresh if user somehow lands back there
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });

            for (const queryKey of affectedListKeys) {
                queryClient.invalidateQueries({
                    queryKey,
                    exact: true,
                });
            }

            queryClient.invalidateQueries({
                queryKey: orderKeys.list('CANCELLED'),
                exact: true,
            });

            queryClient.invalidateQueries({
                queryKey: profileQueryKeys.orderStats(),
            });

            queryClient.invalidateQueries({
                queryKey: ['notifications', 'unread-count'],
            });

            options.onSuccess?.();
        },

        onError: (error: Error, variables) => {
            logger.api.error('Cancel order failed:', error, variables.orderId);

            // Show error toast
            Toast.show({
                type: 'error',
                text1: 'Huỷ đơn thất bại',
                text2: error.message || 'Vui lòng thử lại sau',
            });

            // Call custom onError
            options.onError?.(error);
        },
        meta: { handledLocally: true },
    });
};
