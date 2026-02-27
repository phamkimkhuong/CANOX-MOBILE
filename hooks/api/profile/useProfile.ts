import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { OrdersApiResponse } from '@/types/order/order';
import { OrderCountResponseSchema } from '@/types/order/orderCount';
import {
    FollowedShop,
    OrderStats,
    UserProfile,
    WalletBalance,
    WalletBalanceSchema
} from '@/types/profile/profile';
import { UserMeResponseSchema } from '@/types/user';
import { transformOrderCount } from '@/utils/adapter/order/orderCountAdapter';
import { transformUserMe } from '@/utils/adapter/userAdapter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const MOCK_WALLET: WalletBalance = {
    balance: 500000,
    coins: 1200,
    vouchers: 12,
};

const MOCK_FOLLOWED_SHOPS: FollowedShop[] = [
    { id: 'shop1', name: 'Shop A', avatar: 'https://i.pravatar.cc/100?img=1', isPreferred: true },
    { id: 'shop2', name: 'Shop B', avatar: 'https://i.pravatar.cc/100?img=2', isPreferred: false },
    { id: 'shop3', name: 'Shop C Store', avatar: 'https://i.pravatar.cc/100?img=3', isPreferred: true },
    { id: 'shop4', name: 'Shop D Official', avatar: 'https://i.pravatar.cc/100?img=4', isPreferred: false },
    { id: 'shop5', name: 'Shop E Global', avatar: 'https://i.pravatar.cc/100?img=5', isPreferred: false },
];

// ============================================
// QUERY KEYS
// ============================================

export const profileQueryKeys = {
    all: ['profile'] as const,
    user: () => [...profileQueryKeys.all, 'user'] as const,
    orderStats: () => [...profileQueryKeys.all, 'order-stats'] as const,
    wallet: () => [...profileQueryKeys.all, 'wallet'] as const,
    followedShops: () => [...profileQueryKeys.all, 'followed-shops'] as const,
    pendingReviews: () => [...profileQueryKeys.all, 'pending-reviews'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user profile (avatar, name, level)
 * Cache: Long (30 minutes) - static data
 */
export const useUserProfile = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const setShopId = useAuthStore((state) => state.setShopId);

    return useQuery({
        queryKey: profileQueryKeys.user(),
        queryFn: async (): Promise<UserProfile> => {
            const response = await request(
                {
                    url: API_ROUTES.PROFILE.USER_ME,
                    method: 'GET',
                },
                UserMeResponseSchema
            );

            const profile = transformUserMe(response.data);

            // Sync shopId to store
            if (response.data.shopId) {
                setShopId(response.data.shopId);
            }

            return profile;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

/**
 * Hook to fetch order statistics (badge counts)
 * Cache: Short (2 minutes) - dynamic data
 * Auto refetch on window focus
 */
export const useOrderStats = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: profileQueryKeys.orderStats(),
        queryFn: async (): Promise<OrderStats> => {
            const response = await request(
                {
                    url: API_ROUTES.PROFILE.ORDER_STATS,
                    method: 'GET',
                },
                OrderCountResponseSchema
            );
            return transformOrderCount(response.data);
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: true,
    });
};

/**
 * Hook to fetch pending reviews count for SmartInsightBanner
 * Cache: Short (2 minutes)
 */
export const usePendingReviewsCount = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: profileQueryKeys.pendingReviews(),
        queryFn: async (): Promise<number> => {
            const response = await apiClient.get<OrdersApiResponse>(API_ROUTES.ORDERS.LIST, {
                params: {
                    status: 'UI_COMPLETED',
                    page: 0,
                    size: 20, // Only fetch first 20 for optimization
                },
            });

            // Calculate unreviewed items count 
            let unreviewedCount = 0;
            response.data.data?.content?.forEach((order) => {
                order.items?.forEach((item) => {
                    if (item.reviewed === false) {
                        unreviewedCount++;
                    }
                });
            });
            return unreviewedCount;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to fetch wallet balance (coins, vouchers)
 * Cache: Medium (5 minutes)
 */
export const useWalletBalance = () => {
    return useQuery({
        queryKey: profileQueryKeys.wallet(),
        queryFn: async (): Promise<WalletBalance> => {
            await new Promise((r) => setTimeout(r, 600));
            return WalletBalanceSchema.parse(MOCK_WALLET);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });
};

/**
 * Hook to fetch followed shops
 */
export const useFollowedShops = () => {
    return useQuery({
        queryKey: profileQueryKeys.followedShops(),
        queryFn: async (): Promise<FollowedShop[]> => {
            await new Promise((r) => setTimeout(r, 700));
            return MOCK_FOLLOWED_SHOPS;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to invalidate all profile queries (for pull-to-refresh)
 */
export const useRefreshProfile = () => {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: profileQueryKeys.user() }),
                queryClient.invalidateQueries({ queryKey: profileQueryKeys.orderStats() }),
                queryClient.invalidateQueries({ queryKey: profileQueryKeys.wallet() }),
                queryClient.invalidateQueries({ queryKey: profileQueryKeys.followedShops() }),
                queryClient.invalidateQueries({ queryKey: profileQueryKeys.pendingReviews() }),
                queryClient.invalidateQueries({ queryKey: ['wishlists'] }),
                queryClient.invalidateQueries({ queryKey: ['loyalty'] }),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    return { refresh, isRefreshing };
};

/**
 * Invalidate order stats - call after placing an order
 */
export const useInvalidateOrderStats = () => {
    const queryClient = useQueryClient();
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.orderStats() });
    };
    return { invalidate };
};
