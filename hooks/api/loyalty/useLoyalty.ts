import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    PointBalanceResponseSchema,
    PointBatchesResponseSchema,
    PointsSummaryResponseSchema
} from '@/types/loyalty/loyaltySchema';
import { PointBalanceUI, PointBatchUI } from '@/types/loyalty/ui';
import { transformPointBalance, transformPointBatch } from '@/utils/adapter/loyaltyAdapter';
import { useQuery } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const loyaltyQueryKeys = {
    all: ['loyalty'] as const,
    points: (shopId: string) => [...loyaltyQueryKeys.all, 'points', shopId] as const,
    details: (shopId: string) => [...loyaltyQueryKeys.all, 'details', shopId] as const,
    batches: (shopId: string) => [...loyaltyQueryKeys.all, 'batches', shopId] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch total points at a shop (Quick balance)
 */
export const useShopPoints = (shopId: string = 'GLOBAL') => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.points(shopId),
        queryFn: async () => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.POINTS(shopId),
                    method: 'GET',
                },
                PointsSummaryResponseSchema
            );

            // Extract total amount from map - adjustments depends on real response
            return Number(response.data.totalAvailable || response.data.points || 0);
        },
        enabled: isAuthenticated && !!shopId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to fetch detailed point balance (with expiring points)
 */
export const usePointDetails = (shopId: string = 'GLOBAL') => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.details(shopId),
        queryFn: async (): Promise<PointBalanceUI> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.POINTS_DETAILS(shopId),
                    method: 'GET',
                },
                PointBalanceResponseSchema
            );
            return transformPointBalance(response.data);
        },
        enabled: isAuthenticated && !!shopId,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook to fetch point batches (history/breakdown)
 */
export const usePointBatches = (shopId: string = 'GLOBAL') => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: loyaltyQueryKeys.batches(shopId),
        queryFn: async (): Promise<PointBatchUI[]> => {
            const response = await request(
                {
                    url: API_ROUTES.LOYALTY.POINTS_BATCHES(shopId),
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
