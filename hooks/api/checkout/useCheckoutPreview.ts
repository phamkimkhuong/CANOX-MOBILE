/**
 * useCheckoutPreview - TanStack Query mutation for Checkout Preview API
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type { CheckoutPreviewRequest } from '@/types/checkout/checkoutPreview';
import { CheckoutPreviewResponseSchema } from '@/types/checkout/checkoutPreview';
import {
    CheckoutPreviewUI,
    toCheckoutPreviewAPIRequestBody,
    toCheckoutPreviewUI,
} from '@/utils/adapter/checkoutPreviewAdapter';
import { logger } from '@/utils/logger';
import { useMutation } from '@tanstack/react-query';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
/**
 * Query key for checkout preview.
 * Can be used for cache invalidation if needed.
 */
export const CHECKOUT_PREVIEW_KEY = ['checkout-preview'] as const;

/**
 * Hook to call checkout preview API.
 *
 * Returns a mutation that:
 * - Sends POST request with selected items, shipping, vouchers
 * - Validates response with Zod schema
 * - Transforms DTO to UI-ready types
 */
export const useCheckoutPreview = () => {
    return useMutation({
        mutationKey: CHECKOUT_PREVIEW_KEY,

        /**
         * Call checkout preview API and transform response.
         *
         * @param requestBody - Checkout preview request with shops, address, vouchers
         * @returns Transformed UI-ready preview data
         */
        mutationFn: async (requestBody: CheckoutPreviewRequest): Promise<CheckoutPreviewUI> => {
            const idempotencyKey = uuidv4();
            const apiBody = toCheckoutPreviewAPIRequestBody(requestBody);
            logger.checkout.debug('Checkout Preview Request Body:', apiBody);
            const response = await request(
                {
                    url: API_ROUTES.CART.CHECKOUT_PREVIEW,
                    method: 'POST',
                    data: apiBody,
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                    },
                },
                CheckoutPreviewResponseSchema
            );

            // Check API success flag
            if (!response.success) {
                throw new Error(response.message || 'Checkout preview failed');
            }
            logger.checkout.debug('Checkout preview response:', response);
            const uiData = toCheckoutPreviewUI(response.data);
            return uiData;
        },
    });
};

/**
 * Type for the mutation result.
 * Use this when you need to type the mutation in components.
 */
export type UseCheckoutPreviewResult = ReturnType<typeof useCheckoutPreview>;
