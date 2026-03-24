import { wishlistService } from '@/services/api/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { wishlistKeys } from './useWishlists';

/**
 * ==============================================
 * USE CHECK VARIANTS WISHLIST - Hook
 * ==============================================
 * Check a list of Variant IDs to see which ones have been liked
 */
export const useCheckVariantsWishlist = (variantIds: string[]) => {
    // Filter out null IDs
    const validIds = Array.from(new Set(variantIds.filter(Boolean)));
    const syncFavorites = useWishlistStore(state => state.syncFavorites);

    const query = useQuery({
        queryKey: [...wishlistKeys.all, 'check-variants', validIds.sort().join(',')],
        queryFn: () => wishlistService.checkVariants(validIds),
        enabled: validIds.length > 0,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes for like status results
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Sync to Local Zustand Store for fast UI rendering
    useEffect(() => {
        if (query.data) {
            syncFavorites(query.data);
        }
    }, [query.data, syncFavorites]);

    return query;
};
