/**
 * ==============================================
 * USE PRICE TARGET MET - TanStack Query Hook
 * ==============================================
 * Fetches items that have reached their desired price
 * Key feature for "Price Hunting" functionality
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { PriceTargetMetDTO, WishlistItemUI } from '@/types/wishlist';
import { PriceTargetMetResponseSchema } from '@/types/wishlist';
import { adaptWishlistItem } from '@/utils/adapter/wishlist';
import { useQuery } from '@tanstack/react-query';
import { wishlistKeys } from './useWishlists';

// ============================================
// TYPES
// ============================================

export interface PriceTargetGroupUI {
    wishlistId: string;
    wishlistName: string;
    items: WishlistItemUI[];
}

export interface PriceTargetMetUI {
    groups: PriceTargetGroupUI[];
    totalItems: number;
    totalWishlists: number;
}

// ============================================
// FETCH FUNCTION
// ============================================

/**
 * Fetch items that have met their price target
 */
const fetchPriceTargetMet = async (): Promise<PriceTargetMetDTO> => {
    if (!useAuthStore.getState().isAuthenticated) return { wishlists: [], totalItems: 0, totalWishlists: 0 };
    const response = await apiClient.get(API_ROUTES.WISHLISTS.PRICE_TARGET_MET);
    const validated = PriceTargetMetResponseSchema.parse(response.data);
    return validated.data;
};

// ============================================
// HOOK
// ============================================

/**
 * Hook to fetch items that reached desired price
 * 
 * Used in:
 * - "Săn giá" tab (PriceTargetTab) to show price alerts
 * - TabBar badge (app/(tabs)/_layout.tsx) for instant deal notification
 * 
 * Cache is shared across both consumers via TanStack Query queryKey
 */
export const usePriceTargetMet = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: wishlistKeys.priceTargetMet(),
        queryFn: fetchPriceTargetMet,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: isAuthenticated ? 1000 * 60 * 15 : false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        select: (data): PriceTargetMetUI => {
            const mappedGroups = data.wishlists.filter(w => w.items.some(i => i.isPriceTargetMet)).map(wishlist => ({
                wishlistId: wishlist.id,
                wishlistName: wishlist.name,
                items: wishlist.items.filter(item => item.isPriceTargetMet).map(adaptWishlistItem)
            }));

            return {
                groups: mappedGroups,
                totalItems: data.totalItems,
                totalWishlists: data.totalWishlists,
            };
        },
    });
};

/**
 * Get count of items that met price target
 * Used for badge display
 */
export const usePriceTargetMetCount = () => {
    const { data } = usePriceTargetMet();
    return data?.totalItems ?? 0;
};
