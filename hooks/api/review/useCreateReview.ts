/**
 * ==============================================
 * USE CREATE REVIEW - Tạo đánh giá mới
 * ==============================================
 * Mutation hook for creating a new review
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError } from '@/services/api/client';
import type { CreateReviewRequest, MyReviewDTO, ReviewApiResponseDTO } from '@/types/review';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { orderKeys } from '../order/useOrders';
import { reviewKeys } from './useReviews';

/**
 * Create a new review
 */
const createReview = async (payload: CreateReviewRequest): Promise<ReviewApiResponseDTO<MyReviewDTO>> => {
    const idempotencyKey = uuidv4();

    logger.api.info('[createReview] Creating review:', {
        productId: payload.reviewableId,
        rating: payload.rating,
        mediaCount: payload.mediaAssetIds.length,
    });

    const response = await apiClient.post<ReviewApiResponseDTO<MyReviewDTO>>(
        API_ROUTES.REVIEWS.CREATE,
        payload,
        {
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
        }
    );

    if (!response.data.success) {
        throw new ApiError(
            response.data.message,
            response.status,
            response.data.code
        );
    }

    return response.data;
};

interface UseCreateReviewOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * useCreateReview - Mutation hook for creating reviews
 */
export const useCreateReview = (options?: UseCreateReviewOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (data) => {
            logger.api.info('[createReview] Success:', data.data.id);

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
            queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });

            if (data.data.orderId) {
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.data.orderId) });
            }
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            options?.onSuccess?.();
        },
        onError: (error) => {
            logger.api.error('[createReview] Error:', error);
            options?.onError?.(error as Error);
        },
    });
};
