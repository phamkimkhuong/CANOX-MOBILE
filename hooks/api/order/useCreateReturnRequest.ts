import { API_ROUTES } from '@/constants/apiRoutes';
import { ApiError, request } from '@/services/api/client';
import { ResponseDefaultSchema } from '@/types/responseSchema';
import type { CreateReturnRequestPayload } from '@/types/order/request';
import type { Order, OrdersPageResponse } from '@/types/order/order';
import { logger } from '@/utils/logger';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { profileQueryKeys } from '../profile/useProfile';
import { orderKeys } from './useOrders';

const CreateReturnRequestResponseSchema = ResponseDefaultSchema.extend({
    data: z.unknown().optional(),
});

type CreateReturnRequestResponse = z.infer<typeof CreateReturnRequestResponseSchema>;
type OrdersInfiniteData = InfiniteData<OrdersPageResponse, number>;

interface UseCreateReturnRequestOptions {
    onSuccess?: (response: CreateReturnRequestResponse) => void;
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

export const useCreateReturnRequest = (
    options: UseCreateReturnRequestOptions = {}
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['create-return-request'],
        meta: { handledLocally: true },
        mutationFn: async ({
            orderId,
            payload,
        }: {
            orderId: string;
            payload: CreateReturnRequestPayload;
        }) => {
            logger.orders.info('Creating return request', {
                orderId,
                reasonCode: payload.reasonCode,
            });

            const response = await request<CreateReturnRequestResponse>(
                {
                    url: API_ROUTES.ORDERS.RETURN_REQUEST(orderId),
                    method: 'PUT',
                    data: payload,
                },
                CreateReturnRequestResponseSchema
            );

            if (!response.success) {
                throw new ApiError(
                    response.message || 'Gửi yêu cầu trả hàng thất bại',
                    undefined,
                    response.code
                );
            }

            return response;
        },
        onSuccess: (response, variables) => {
            const currentOrder = findOrderSnapshot(queryClient, variables.orderId);
            const returnRequestedOrder = currentOrder
                ? {
                    ...currentOrder,
                    status: 'RETURN_REQUESTED' as const,
                    statusRaw: 'RETURN_REQUESTED',
                    returnInfo: {
                        returnId: currentOrder.returnInfo?.returnId ?? '',
                        buyerInfo: currentOrder.returnInfo?.buyerInfo ?? null,
                        status: 'REQUESTED',
                        reasonCode: variables.payload.reasonCode,
                        reason: variables.payload.reason,
                        description: variables.payload.description,
                        images: currentOrder.returnInfo?.images ?? [],
                        evidenceVideos: currentOrder.returnInfo?.evidenceVideos ?? [],
                        trackingNumber: currentOrder.returnInfo?.trackingNumber ?? null,
                        carrier: currentOrder.returnInfo?.carrier ?? null,
                        rejectedReason: null,
                        requestedAt: currentOrder.returnInfo?.requestedAt ?? new Date().toISOString(),
                        approvedAt: null,
                        rejectedAt: null,
                        returnedAt: null,
                    },
                }
                : undefined;

            if (returnRequestedOrder) {
                queryClient.setQueryData<Order>(orderKeys.detail(variables.orderId), returnRequestedOrder);
            }

            if (returnRequestedOrder) {
                queryClient.setQueryData<OrdersInfiniteData | undefined>(
                    orderKeys.list('ALL'),
                    (cachedData) => {
                        if (!cachedData?.pages?.length) return cachedData;
                        return replaceOrderInPages(cachedData, returnRequestedOrder);
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
                queryKey: orderKeys.list('RETURN_REFUND'),
                exact: true,
            });

            if (currentOrder?.shopInfo?.shopId) {
                queryClient.invalidateQueries({
                    queryKey: orderKeys.byShop(currentOrder.shopInfo.shopId),
                    exact: true,
                });
            }

            queryClient.invalidateQueries({
                queryKey: profileQueryKeys.orderStats(),
            });

            options.onSuccess?.(response);
        },
        onError: (error: Error, variables) => {
            logger.orders.error('Create return request failed', {
                orderId: variables.orderId,
                error: error.message,
            });
            options.onError?.(error);
        },
    });
};
