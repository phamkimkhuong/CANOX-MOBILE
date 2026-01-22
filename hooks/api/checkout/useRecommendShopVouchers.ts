/**
 * useRecommendShopVouchers - Hook to fetch recommended shop vouchers
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { VoucherUI } from '@/types/cart';
import {
    RecommendShopVoucherRequest,
    RecommendShopVoucherResponseSchema,
    RecommendedShopVoucherDTO
} from '@/types/checkout/shopVoucherRecommendation';
import { transformVoucherDTOToUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { logger } from '@/utils/logger';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key for shop voucher recommendations.
 * Depends on the shopId and request body.
 */
export const RECOMMEND_SHOP_VOUCHERS_KEY = (shopId: string, body: RecommendShopVoucherRequest) =>
    ['vouchers', 'recommend', 'shop', shopId, body] as const;

/**
 * Hook to fetch recommended shop vouchers.
 * 
 * @param shopId - The shop ID to get recommendations for
 * @param requestBody - Parameters for recommendation
 * @param options - Additional query options
 */
export const useRecommendShopVouchers = (
    shopId: string | null,
    requestBody: RecommendShopVoucherRequest | null,
    options: { enabled?: boolean } = {}
) => {
    return useQuery({
        queryKey: (shopId && requestBody)
            ? RECOMMEND_SHOP_VOUCHERS_KEY(shopId, requestBody)
            : ['vouchers', 'recommend', 'shop', 'empty'],

        queryFn: async () => {
            if (!shopId || !requestBody) return [];

            logger.api.info('Fetching recommended shop vouchers', {
                shopId,
                totalAmount: requestBody.totalAmount,
            });

            const response = await request(
                {
                    url: API_ROUTES.VOUCHERS.RECOMMEND_SHOP,
                    method: 'POST',
                    data: requestBody,
                },
                RecommendShopVoucherResponseSchema
            );

            if (!response.success) {
                logger.api.error('Failed to fetch shop vouchers:', response.message);
                return [];
            }
            const vouchers = response.data
                .filter((item): item is RecommendedShopVoucherDTO & { voucher: NonNullable<RecommendedShopVoucherDTO['voucher']> } => !!item.voucher)
                .map((item): VoucherUI => {
                    return transformVoucherDTOToUI(
                        item.voucher,
                        item.applicable,
                        item.reason,
                        item.calculatedDiscount
                    );
                })
                .sort((a, b) => {
                    // Applicable vouchers first
                    if (a.isApplicable !== b.isApplicable) {
                        return a.isApplicable ? -1 : 1;
                    }
                    // Then sort by calculatedDiscount descending
                    const discountA = a.calculatedDiscount ?? 0;
                    const discountB = b.calculatedDiscount ?? 0;
                    return discountB - discountA;
                });

            return vouchers;
        },

        enabled: options.enabled && !!shopId && !!requestBody,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
