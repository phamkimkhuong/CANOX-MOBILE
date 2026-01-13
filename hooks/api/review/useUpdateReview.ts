/**
 * ==============================================
 * USE UPDATE REVIEW - Cập nhật đánh giá
 * ==============================================
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError } from '@/services/api/client';
import type { MyReviewDTO, ReviewApiResponseDTO, UpdateReviewRequest } from '@/types/review';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewKeys } from './useReviews';

interface UpdateReviewParams {
    reviewId: string;
    payload: UpdateReviewRequest;
}

const updateReview = async ({ reviewId, payload }: UpdateReviewParams): Promise<ReviewApiResponseDTO<MyReviewDTO>> => {
    logger.api.info('[updateReview] Updating review:', { reviewId, rating: payload.rating });

    const response = await apiClient.put<ReviewApiResponseDTO<MyReviewDTO>>(
        API_ROUTES.REVIEWS.UPDATE(reviewId),
        payload
    );

    if (!response.data.success) {
        throw new ApiError(response.data.message, response.status, response.data.code);
    }

    return response.data;
};

export const useUpdateReview = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateReview,
        onSuccess: (data) => {
            logger.api.info('[updateReview] Success:', data.data.id);
            queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
            queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.data.id) });
            options?.onSuccess?.();
        },
        onError: (error) => {
            logger.api.error('[updateReview] Error:', error);
            options?.onError?.(error as Error);
        },
    });
};
