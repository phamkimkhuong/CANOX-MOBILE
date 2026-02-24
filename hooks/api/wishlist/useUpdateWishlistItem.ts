/**
 * ==============================================
 * USE UPDATE WISHLIST ITEM - Mutation Hook
 * ==============================================
 * Handles updating a wishlist item's:
 * - desiredPrice (target price)
 * - notes (personal memo)
 * - priority (Normal / Urgent)
 */

import { wishlistService } from '@/services/api/wishlist';
import type { UpdateWishlistItemRequest, WishlistDetailDTO } from '@/types/wishlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistKeys } from './useWishlists';

interface UpdateItemParams {
    wishlistId: string;
    itemId: string;
    data: UpdateWishlistItemRequest;
}

/**
 * Hook to update a wishlist item
 * 
 * @example
 * const { mutate: updateItem } = useUpdateWishlistItem();
 * updateItem({
 *     wishlistId: '...',
 *     itemId: '...',
 *     data: { desiredPrice: 100000, notes: 'Đợi sale', priority: 2 }
 * });
 */
export const useUpdateWishlistItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ wishlistId, itemId, data }: UpdateItemParams) => {
            return wishlistService.updateWishlistItem(wishlistId, itemId, data);
        },
        onMutate: async ({ wishlistId, itemId, data }) => {
            // Cancel running queries to avoid overwriting optimistic update
            await queryClient.cancelQueries({
                queryKey: wishlistKeys.detail(wishlistId),
            });

            // Snapshot previous data for rollback
            const previousDetail = queryClient.getQueryData<WishlistDetailDTO>(
                wishlistKeys.detail(wishlistId)
            );

            // Optimistic: update item in cache
            if (previousDetail) {
                queryClient.setQueryData<WishlistDetailDTO>(
                    wishlistKeys.detail(wishlistId),
                    {
                        ...previousDetail,
                        items: previousDetail.items.map(item =>
                            item.id === itemId
                                ? { ...item, ...data }
                                : item
                        ),
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
            // Refetch after mutation settles to sync with server
            queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(wishlistId) });
        },
    });
};
