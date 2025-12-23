import {
    FollowedShop,
    MemberLevel,
    OrderStats,
    OrderStatsSchema,
    UserProfile,
    UserProfileSchema,
    WalletBalance,
    WalletBalanceSchema,
} from '@/types/profile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

// MOCK DATA

const MOCK_PROFILE: UserProfile = {
    id: 'u1',
    username: 'nguyenvana',
    fullName: 'Nguyen Van A',
    email: 'nguyenvana@gmail.com',
    avatar: 'https://i.pravatar.cc/300',
    memberLevel: MemberLevel.GOLD,
    isVerified: true,
    totalOrders: 12,
    favoriteCount: 8,
    recentViewCount: 5,
    followingShops: 5,
};

const MOCK_ORDER_STATS: OrderStats = {
    pendingPayment: 1,
    processing: 0,
    shipping: 2,
    review: 0,
};

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
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user profile (avatar, name, level)
 * Cache: Long (30 minutes) - static data
 */
export const useUserProfile = () => {
    return useQuery({
        queryKey: profileQueryKeys.user(),
        queryFn: async (): Promise<UserProfile> => {
            // Simulate network delay
            await new Promise((r) => setTimeout(r, 800));
            // Validate with Zod
            return UserProfileSchema.parse(MOCK_PROFILE);
        },
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
    return useQuery({
        queryKey: profileQueryKeys.orderStats(),
        queryFn: async (): Promise<OrderStats> => {
            await new Promise((r) => setTimeout(r, 500));
            return OrderStatsSchema.parse(MOCK_ORDER_STATS);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: true,
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