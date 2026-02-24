/**
 * ==============================================
 * USE CREATE WISHLIST - Mutation Hook
 * ==============================================
 * Creates a new wishlist collection.
 * Invalidates list queries on success so chips update.
 */

import { ApiError } from '@/services/api/errors';
import { wishlistService } from '@/services/api/wishlist';
import type { CreateWishlistRequest } from '@/types/wishlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

export const useCreateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateWishlistRequest) => {
            return wishlistService.createWishlist(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: wishlistKeys.lists(),
                exact: true,
            });
        },
        onError: (err: ApiError) => {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: err.message || 'Không thể tạo bộ sưu tập. Vui lòng thử lại!',
            });
        },
    });
};
