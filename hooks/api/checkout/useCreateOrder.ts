/**
 * useCreateOrder - TanStack Query mutation for Place Order API
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/checkout/order';
import { CreateOrderResponseSchema } from '@/types/checkout/order';
import { logger } from '@/utils/logger';
import { analytics } from '@/utils/analytics';
import * as Sentry from '@sentry/react-native';
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

            // Add breadcrumb for this checkout step
            Sentry.addBreadcrumb({
                category: 'checkout',
                message: 'Initiating order placement',
                level: 'info',
                data: {
                    paymentMethod: requestBody.paymentMethod,
                    shopCount: requestBody.shops.length,
                },
            });

            const idempotencyKey = uuidv4();

            try {
                // Sentry.startSpan auto-starts, auto-finishes, and auto-captures span errors
                const response = await Sentry.startSpan(
                    {
                        name: 'Create Order Flow',
                        op: 'checkout.create_order',
                    },
                    async (span) => {
                        if (span && typeof span.setAttribute === 'function') {
                            span.setAttribute('payment_method', requestBody.paymentMethod);
                            span.setAttribute('shop_count', requestBody.shops.length);
                        }

                        const res = await request<CreateOrderResponse>(
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
                        if (!res.success) {
                            throw new Error(res.message || 'Đặt hàng thất bại');
                        }

                        return res;
                    }
                );

                logger.checkout.info('Order creation success', {
                    response: response,
                });

                // Track ecommerce purchase in Firebase Analytics
                try {
                    const orders = response.data?.orders || [];
                    const paymentInfo = response.data?.paymentInfo;
                    const items = orders.flatMap(order =>
                        (order.items || []).map(item => ({
                            id: item.productId,
                            name: item.productName || 'Sản phẩm',
                            price: item.unitPrice || 0,
                            quantity: item.quantity || 1,
                        }))
                    );
                    const totalValue = paymentInfo?.amount ||
                        orders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);
                    const transactionId = paymentInfo?.orderCode ||
                        orders[0]?.orderId || 'tx_' + Date.now();

                    analytics.ecommerce.trackPurchase(transactionId, totalValue, items);
                } catch (analyticsErr) {
                    logger.checkout.warn('Firebase Analytics log purchase failed:', analyticsErr);
                }

                return response;
            } catch (error: any) {
                logger.checkout.error('Order creation failed', {
                    error: error?.message || error,
                });

                // Capture failed checkout attempt in Sentry with metadata tags
                Sentry.captureException(error, {
                    tags: {
                        flow: 'payment_checkout',
                        payment_method: requestBody.paymentMethod,
                    },
                    extra: {
                        errorMessage: error?.message || error,
                        requestBody,
                    },
                });

                throw error;
            }
        },
    });
};
