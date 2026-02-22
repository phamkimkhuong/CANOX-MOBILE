/**
 * ==============================================
 * LOYALTY HOOKS - TanStack Query Integration
 * ==============================================
 * Endpoints:
 * GET  /buyer/loyalty/shops/{shopId}          → useShopLoyalty
 * GET  /buyer/loyalty/shops/{shopId}/batches   → usePointBatches
 * GET  /buyer/loyalty/shops/{shopId}/history   → usePointHistory
 * POST /buyer/loyalty/shops/{shopId}/redeem    → useRedeemPoints
 * GET  /buyer/loyalty/overview                 → useLoyaltyOverview
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, ApiError, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { ConsumePointsRequestDTO } from '@/types/loyalty/dto';
import {
    LoyaltyOverviewResponseSchema,
    PointBalanceResponseSchema,
    PointBatchesResponseSchema,
    PointHistoryResponseSchema,
    PointRedeemResponseSchema,
} from '@/types/loyalty/loyaltySchema';
import {
    LoyaltyOverviewUI,
    PointBalanceUI,
    PointBatchUI,
    PointHistoryUI,
    PointRedeemUI,
} from '@/types/loyalty/ui';
import {
    transformLoyaltyOverview,
    transformPointBalance,
    transformPointBatch,
    transformPointHistory,
    transformRedeemResult,
} from '@/utils/adapter/loyaltyAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const loyaltyQueryKeys = {
    all: ['loyalty'] as const,
    shopSummary: (shopId: string) => [...loyaltyQueryKeys.all, 'shop', shopId] as const,
    batches: (shopId: string) => [...loyaltyQueryKeys.all, 'batches', shopId] as const,
    history: (shopId: string) => [...loyaltyQueryKeys.all, 'history', shopId] as const,
    overview: () => [...loyaltyQueryKeys.all, 'overview'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * GET /buyer/loyalty/shops/{shopId}
 * Comprehensive loyalty info: total points, active batches, expiry details
 */
export const useShopLoyalty = (shopId: string | undefined) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.shopSummary(shopId || ''),
        queryFn: async (): Promise<PointBalanceUI> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.SHOP_SUMMARY(shopId!),
                    method: 'GET',
                },
                PointBalanceResponseSchema
            );
            return transformPointBalance(response.data);
        },
        enabled: isAuthenticated && !!shopId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * GET /buyer/loyalty/shops/{shopId}/batches
 * Active point batches with FIFO ordering
 */
export const usePointBatches = (shopId: string | undefined) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.batches(shopId || ''),
        queryFn: async (): Promise<PointBatchUI[]> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.BATCHES(shopId!),
                    method: 'GET',
                },
                PointBatchesResponseSchema
            );
            return response.data.map(transformPointBatch);
        },
        enabled: isAuthenticated && !!shopId,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * GET /buyer/loyalty/shops/{shopId}/history
 * Paginated transaction history (earned, spent, expired, refunded)
 */
export const usePointHistory = (
    shopId: string | undefined,
    options?: {
        type?: 'EARNED' | 'SPENT' | 'EXPIRED' | 'REFUNDED';
        from?: string;
        to?: string;
        page?: number;
        size?: number;
    }
) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: [...loyaltyQueryKeys.history(shopId || ''), options] as const,
        queryFn: async (): Promise<PointHistoryUI> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.HISTORY(shopId!),
                    method: 'GET',
                    params: {
                        type: options?.type,
                        from: options?.from,
                        to: options?.to,
                        page: options?.page ?? 0,
                        size: options?.size ?? 20,
                    },
                },
                PointHistoryResponseSchema
            );
            return transformPointHistory(response.data);
        },
        enabled: isAuthenticated && !!shopId,
        staleTime: 1000 * 60 * 2, // 2 minutes - history changes more frequently
    });
};

/**
 * GET /buyer/loyalty/overview
 * Dashboard showing points across all shops
 */
export const useLoyaltyOverview = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.overview(),
        queryFn: async (): Promise<LoyaltyOverviewUI> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.OVERVIEW,
                    method: 'GET',
                },
                LoyaltyOverviewResponseSchema
            );
            return transformLoyaltyOverview(response.data);
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * POST /buyer/loyalty/shops/{shopId}/redeem
 * Use loyalty points for order discount
 */
export const useRedeemPoints = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: ConsumePointsRequestDTO): Promise<PointRedeemUI> => {
            const response = await apiClient.post(
                API_ROUTES.LOYALTY.REDEEM(params.shopId),
                {
                    shopId: params.shopId,
                    amount: params.amount,
                    orderId: params.orderId,
                }
            );

            if (!response.data.success) {
                throw new ApiError(response.data.message, response.status, response.data.code);
            }

            const validated = PointRedeemResponseSchema.parse(response.data);
            return transformRedeemResult(validated.data);
        },
        onSuccess: (_data, variables) => {
            // Invalidate affected queries
            queryClient.invalidateQueries({
                queryKey: loyaltyQueryKeys.shopSummary(variables.shopId),
            });
            queryClient.invalidateQueries({
                queryKey: loyaltyQueryKeys.batches(variables.shopId),
            });
            queryClient.invalidateQueries({
                queryKey: loyaltyQueryKeys.overview(),
            });
        },
        meta: { handledLocally: true },
    });
};
