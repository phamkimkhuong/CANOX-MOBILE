/**
 * ==============================================
 * USE REMOVE WISHLIST ITEM - Mutation Hook
 * ==============================================
 * Handles removing an item from wishlist.
 * Uses optimistic update to instantly hide item on UI.
 * Supports undo by rolling back the cache.
 */

import { wishlistService } from '@/services/api/wishlist';
import type { WishlistDetailDTO } from '@/types/wishlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistKeys } from './useWishlists';

interface RemoveItemParams {
    wishlistId: string;
    itemId: string;
    variantId: string;
}

/**
 * Hook to remove an item from a wishlist
 * 
 * @example
 * const { mutate: removeItem } = useRemoveWishlistItem();
 * removeItem({ wishlistId: '...', itemId: '...', variantId: '...' });
 */
export const useRemoveWishlistItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ wishlistId, itemId }: RemoveItemParams) => {
            return wishlistService.removeFromWishlist(wishlistId, itemId);
        },
        onMutate: async ({ wishlistId, itemId }) => {
            // Cancel running queries to avoid overwriting optimistic update
            await queryClient.cancelQueries({
                queryKey: wishlistKeys.detail(wishlistId),
            });

            // Snapshot previous data for rollback
            const previousDetail = queryClient.getQueryData<WishlistDetailDTO>(
                wishlistKeys.detail(wishlistId)
            );

            // Optimistic: remove item from cache
            if (previousDetail) {
                queryClient.setQueryData<WishlistDetailDTO>(
                    wishlistKeys.detail(wishlistId),
                    {
                        ...previousDetail,
                        items: previousDetail.items.filter(i => i.id !== itemId),
                        itemCount: Math.max(0, previousDetail.itemCount - 1),
                    }
                );
            }

            return { previousDetail };
        },
        onError: (_err, { wishlistId }, context) => {
            // Rollback on error
            if (context?.previousDetail) {
                queryClient.setQueryData(
                    wishlistKeys.detail(wishlistId),
                    context.previousDetail
                );
            }
        },
        onSettled: (_data, _error, { wishlistId }) => {
            queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(wishlistId) });
            queryClient.invalidateQueries({ queryKey: [...wishlistKeys.all, 'check-variants'] });
        },
    });
};
