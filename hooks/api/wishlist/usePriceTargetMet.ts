/**
 * ==============================================
 * USE PRICE TARGET MET - TanStack Query Hook
 * ==============================================
 * Fetches items that have reached their desired price
 * Key feature for "Price Hunting" functionality
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
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
 * Used in "Săn giá" tab to show price alerts
 */
export const usePriceTargetMet = () => {
    return useQuery({
        queryKey: wishlistKeys.priceTargetMet(),
        queryFn: fetchPriceTargetMet,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes for price updates
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
