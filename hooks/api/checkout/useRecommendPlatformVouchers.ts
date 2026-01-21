/**
 * useRecommendPlatformVouchers - Hook to fetch recommended platform vouchers
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import {
    RecommendPlatformVoucherRequest,
    RecommendPlatformVoucherResponseSchema
} from '@/types/checkout/platformVoucherRecommendation';
import { toPlatformVoucherUIList } from '@/utils/adapter/platformVoucherAdapter';
import { logger } from '@/utils/logger';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key for platform voucher recommendations.
 * Depends on the request parameters.
 */
export const RECOMMEND_PLATFORM_VOUCHERS_KEY = (body: RecommendPlatformVoucherRequest) =>
    ['vouchers', 'recommend', 'platform', body] as const;

/**
 * Hook to fetch recommended platform vouchers.
 * 
 * @param requestBody - Parameters for recommendation
 * @param options - Additional query options
 */
export const useRecommendPlatformVouchers = (
    requestBody: RecommendPlatformVoucherRequest | null,
    options: { enabled?: boolean } = {}
) => {
    return useQuery({

        queryKey: requestBody ? RECOMMEND_PLATFORM_VOUCHERS_KEY(requestBody) : ['vouchers', 'recommend', 'platform', 'empty'],

        queryFn: async () => {
            if (!requestBody) return [];

            logger.api.info('Fetching recommended platform vouchers', {
                totalAmount: requestBody.totalAmount,
                shopCount: requestBody.shopIds.length,
            });
            const response = await request(
                {
                    url: API_ROUTES.VOUCHERS.RECOMMEND_PLATFORM,
                    method: 'POST',
                    data: requestBody,
                },
                RecommendPlatformVoucherResponseSchema
            );

            if (!response.success) {
                // If the API fails but returns success: false, we'll return an empty list
                // rather than throwing an error to keep the checkout experience smooth.
                logger.api.error('Failed to fetch platform vouchers:', response.message);
                return [];
            }
            return toPlatformVoucherUIList(response.data);
        },

        enabled: options.enabled && !!requestBody,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
