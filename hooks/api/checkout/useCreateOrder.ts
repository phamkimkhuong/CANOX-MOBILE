/**
 * useCreateOrder - TanStack Query mutation for Place Order API
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/checkout/order';
import { CreateOrderResponseSchema } from '@/types/checkout/order';
import { logger } from '@/utils/logger';
import { useMutation } from '@tanstack/react-query';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to call Create Order API.
 */
export const useCreateOrder = () => {
    return useMutation({
        mutationKey: ['create-order'],
        meta: { handledLocally: true },

        /**
         * Call Create Order API.
         *
         * @param requestBody - Order request data
         * @returns Order creation response
         */
        mutationFn: async (requestBody: CreateOrderRequest): Promise<CreateOrderResponse> => {
            logger.checkout.info('Calling Create Order API', {
                shopCount: requestBody.shops.length,
                paymentMethod: requestBody.paymentMethod,
            });
            logger.checkout.debug('Create Order Request Body:', requestBody);
            logger.checkout.debug('Create Order Request Body:', JSON.stringify(requestBody));

            const idempotencyKey = uuidv4();

            const response = await request<CreateOrderResponse>(
                {
                    url: API_ROUTES.ORDERS.LIST, // POST /api/v1/buyer/orders
                    method: 'POST',
                    data: requestBody,
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                    },
                },
                CreateOrderResponseSchema
            );

            // Check API success flag
            if (!response.success) {
                throw new Error(response.message || 'Đặt hàng thất bại');
            }

            logger.checkout.info('Order creation success', {
                response: response,
            });

            return response;
        },
    });
};
