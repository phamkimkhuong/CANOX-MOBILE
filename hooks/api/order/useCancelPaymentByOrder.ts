import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { profileQueryKeys } from '../profile/useProfile';
import { orderKeys } from './useOrders';

const PaymentStatusDataSchema = z.object({
    paymentId: z.string().nullish(),
    orderId: z.string().nullish(),
    status: z.string().nullish(),
    amount: z.coerce.number().nullish(),
    currency: z.string().nullish(),
    method: z.string().nullish(),
}).passthrough();

const CancelPaymentByOrderResponseSchema = z.object({
    code: z.coerce.number().nullish().transform((val) => val ?? 0),
    success: z.boolean().nullish().transform((val) => val ?? false),
    message: z.string().nullish().transform((val) => val ?? ''),
    data: PaymentStatusDataSchema.nullish(),
});

type CancelPaymentByOrderResponse = z.infer<typeof CancelPaymentByOrderResponseSchema>;

interface UseCancelPaymentByOrderOptions {
    onSuccess?: (response: CancelPaymentByOrderResponse) => void;
    onError?: (error: Error) => void;
}

export const useCancelPaymentByOrder = (
    options: UseCancelPaymentByOrderOptions = {}
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['cancel-payment-by-order'],
        meta: { handledLocally: true },
        mutationFn: async ({ orderId }: { orderId: string }) => {
            logger.orders.info('Cancelling payment by order', { orderId });

            const response = await request<CancelPaymentByOrderResponse>(
                {
                    url: API_ROUTES.PAYMENTS.ORDER_CANCEL(orderId),
                    method: 'POST',
                },
                CancelPaymentByOrderResponseSchema
            );

            if (!response.success) {
                throw new Error(response.message || 'Huỷ thanh toán thất bại');
            }

            return response;
        },
        onSuccess: (response, variables) => {
            Toast.show({
                type: 'success',
                text1: 'Đã huỷ thanh toán',
                text2: 'Bạn có thể tạo lại giao dịch mới khi cần',
            });

            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });
            queryClient.invalidateQueries({
                queryKey: orderKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: profileQueryKeys.orderStats(),
            });
            queryClient.invalidateQueries({
                queryKey: ['notifications', 'unread-count'],
            });

            options.onSuccess?.(response);
        },
        onError: (error: Error) => {
            logger.orders.error('Cancel payment by order failed', { error: error.message });

            Toast.show({
                type: 'error',
                text1: 'Huỷ thanh toán thất bại',
                text2: error.message || 'Vui lòng thử lại sau',
            });

            options.onError?.(error);
        },
    });
};
