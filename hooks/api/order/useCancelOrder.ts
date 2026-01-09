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
import type { CancelOrderPayload, CancelOrderResponse } from '@/types/order/cancel';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Đã huỷ đơn hàng',
                text2: 'Đơn hàng của bạn đã được huỷ thành công',
            });

            queryClient.resetQueries({
                queryKey: orderKeys.lists(),
            });

            // Invalidate order counts (badges in Profile/Tabs)
            queryClient.invalidateQueries({
                queryKey: profileQueryKeys.orderStats(),
            });

            // Call custom onSuccess
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
    });
};
