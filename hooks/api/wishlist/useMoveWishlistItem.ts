import { wishlistService } from '@/services/api/wishlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

export const useMoveWishlistItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            itemId,
            variantId,
            sourceWishlistId,
            targetWishlistId,
            data
        }: {
            itemId: string;
            variantId: string;
            sourceWishlistId: string;
            targetWishlistId: string;
            data: {
                desiredPrice?: number;
                notes?: string;
                priority?: 0 | 1 | 2;
            };
        }) => {
            // STEP 1: Add item to target wishlist
            await wishlistService.addToWishlist(targetWishlistId, {
                variantId,
                quantity: 1,
                priority: data.priority ?? 0,
                desiredPrice: data.desiredPrice,
                notes: data.notes,
            });

            // STEP 2: Delete item from source wishlist
            await wishlistService.removeFromWishlist(sourceWishlistId, itemId);

            return { sourceWishlistId, targetWishlistId };
        },
        onSuccess: (data) => {
            Toast.show({
                type: 'success',
                text1: 'Đã chuyển',
                text2: 'Sản phẩm đã được chuyển sang bộ sưu tập mới.',
            });
            // Invalidate both wishlists' details & all wishlists to update counts
            queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(data.sourceWishlistId) });
            queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(data.targetWishlistId) });
            queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
        },
        onError: (error) => {
            console.error('[useMoveWishlistItem]', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể chuyển sản phẩm lúc này.',
            });
        },
    });
};
