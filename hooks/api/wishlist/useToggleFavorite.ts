import { wishlistService } from '@/services/api/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

/**
 * ==============================================
 * USE TOGGLE FAVORITE - Optimistic Mutation
 * ==============================================
 * Handle the heart-beat action:
 * 1. Instantly change the UI color RED/WHITE (Local State - Zustand).
 * 2. Call API in the background:
 *    - Like (Add): \`POST /default/items\`
 *    - Unlike (Remove): Get Default Wishlist first to find \`itemId\` then \`DELETE /wishlists/{wl}/items/{id}\`.
 * 3. If network error -> Return the color back to the original (Rollback UI).
 */
export const useToggleFavorite = () => {
    const queryClient = useQueryClient();
    const store = useWishlistStore();

    return useMutation({
        mutationFn: async ({ variantId, isCurrentlyLiked }: { variantId: string, isCurrentlyLiked: boolean }) => {
            const toggleTarget = !isCurrentlyLiked;

            if (toggleTarget) {
                // ACTION: ADD TO DEFAULT WISHLIST
                await wishlistService.addToDefaultWishlist({
                    variantId,
                    quantity: 1,
                    priority: 0,
                });
                return { action: 'added' };
            } else {
                // ACTION: REMOVE FROM DEFAULT WISHLIST
                const defaultWl = await wishlistService.getDefaultWishlist();
                const itemToRemove = defaultWl.items?.find(i => i.variantId === variantId);

                if (itemToRemove && itemToRemove.id) {
                    await wishlistService.removeFromWishlist(defaultWl.id, itemToRemove.id);
                    return { action: 'removed' };
                } else {
                    // If it was liked but located in another Wishlist Folder (Custom Wishlist)
                    throw new Error('Not found in default wishlist to remove');
                }
            }
        },
        onMutate: async ({ variantId, isCurrentlyLiked }) => {
            // Cancel running requests to avoid conflict
            await queryClient.cancelQueries({ queryKey: wishlistKeys.default() });

            // Optimistic Update: Instantly change the heart color without waiting for the server
            store.toggleFavoriteLocal(variantId);

            return { previousState: isCurrentlyLiked };
        },
        onError: (err, { variantId }, context) => {
            // Network error => Revert the heart color back to the original!
            if (context?.previousState !== undefined) {
                store.setFavoriteState(variantId, context.previousState);
            }
            Toast.show({
                type: 'error',
                text1: 'Lỗi đồng bộ',
                text2: 'Không thể cập nhật danh sách Yêu thích lúc này!',
            });
            console.error('[useToggleFavorite]', err);
        },
        onSuccess: (data) => {
            // Toast báo xịn
            if (data.action === 'added') {
                Toast.show({
                    type: 'success',
                    text1: 'Đã lưu',
                    text2: 'Sản phẩm đã nằm trong Bộ sưu tập của bạn 💖'
                });
            }
        },
        onSettled: () => {
            // Force API to re-check the latest array to sync with Server
            queryClient.invalidateQueries({ queryKey: wishlistKeys.default() });
            queryClient.invalidateQueries({ queryKey: [...wishlistKeys.all, 'check-variants'] });
        },
    });
};
