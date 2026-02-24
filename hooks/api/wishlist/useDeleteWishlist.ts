/**
 * ==============================================
 * USE DELETE WISHLIST - Mutation Hook
 * ==============================================
 * Deletes a wishlist collection (NOT the default one).
 * Invalidates list queries on success.
 */

import { wishlistService } from '@/services/api/wishlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wishlistId: string) => {
            return wishlistService.deleteWishlist(wishlistId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: wishlistKeys.lists(),
                exact: true,
            });
        },
        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xoá bộ sưu tập. Vui lòng thử lại!',
            });
        },
    });
};
