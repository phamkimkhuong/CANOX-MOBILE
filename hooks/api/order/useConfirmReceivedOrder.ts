import { API_ROUTES } from '@/constants/apiRoutes';
import { ApiError, request } from '@/services/api/client';
import type { Order, OrdersPageResponse } from '@/types/order/order';
import { logger } from '@/utils/logger';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { profileQueryKeys } from '../profile/useProfile';
import { orderKeys } from './useOrders';

const ConfirmReceivedResponseSchema = z.object({
    code: z.coerce.number().nullish().transform((value) => value ?? 0),
    success: z.boolean().nullish().transform((value) => value ?? false),
    message: z.string().nullish().transform((value) => value ?? ''),
    data: z.unknown().optional(),
});

type ConfirmReceivedResponse = z.infer<typeof ConfirmReceivedResponseSchema>;
type OrdersInfiniteData = InfiniteData<OrdersPageResponse, number>;

interface UseConfirmReceivedOrderOptions {
    onSuccess?: (response: ConfirmReceivedResponse) => void;
    onError?: (error: Error) => void;
}

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

const replaceOrderInPages = (
    data: OrdersInfiniteData,
    nextOrder: Order
): OrdersInfiniteData => ({
    ...data,
    pages: data.pages.map((page) => ({
        ...page,
        content: page.content.map((order) => (
            order.orderId === nextOrder.orderId
                ? nextOrder
                : order
        )),
    })),
});

export const useConfirmReceivedOrder = (
    options: UseConfirmReceivedOrderOptions = {}
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['confirm-order-received'],
        meta: { handledLocally: true },
        mutationFn: async ({ orderId }: { orderId: string }) => {
            logger.orders.info('Confirming received order', { orderId });

            const response = await request<ConfirmReceivedResponse>(
                {
                    url: API_ROUTES.ORDERS.CONFIRM_RECEIVED(orderId),
                    method: 'PUT',
                },
                ConfirmReceivedResponseSchema
            );

            if (!response.success) {
                throw new ApiError(
                    response.message || 'Xác nhận nhận hàng thất bại',
                    undefined,
                    response.code
                );
            }

            return response;
        },
        onSuccess: (response, variables) => {
            const currentOrder = findOrderSnapshot(queryClient, variables.orderId);
            const completedOrder = currentOrder
                ? {
                    ...currentOrder,
                    status: 'COMPLETED' as const,
                    statusRaw: 'COMPLETED',
                }
                : undefined;

            if (completedOrder) {
                queryClient.setQueryData<Order>(orderKeys.detail(variables.orderId), completedOrder);
            }

            if (completedOrder) {
                queryClient.setQueryData<OrdersInfiniteData | undefined>(
                    orderKeys.list('ALL'),
                    (cachedData) => {
                        if (!cachedData?.pages?.length) return cachedData;
                        return replaceOrderInPages(cachedData, completedOrder);
                    }
                );
            }

            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });

            queryClient.invalidateQueries({
                queryKey: orderKeys.list('ALL'),
                exact: true,
            });

            queryClient.invalidateQueries({
                queryKey: orderKeys.list('POST_DELIVERY'),
                exact: true,
            });

            if (currentOrder?.shopId) {
                queryClient.invalidateQueries({
                    queryKey: orderKeys.byShop(currentOrder.shopId),
                    exact: true,
                });
            }

            queryClient.invalidateQueries({
                queryKey: profileQueryKeys.orderStats(),
            });

            options.onSuccess?.(response);
        },
        onError: (error: Error, variables) => {
            logger.orders.error('Confirm received failed', {
                orderId: variables.orderId,
                error: error.message,
            });
            options.onError?.(error);
        },
    });
};
