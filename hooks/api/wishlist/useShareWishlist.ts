/**
 * ==============================================
 * USE SHARE WISHLIST - Mutation Hook
 * ==============================================
 * Regenerates a share token and returns it.
 * The caller uses the token to build a share URL.
 */

import { wishlistService } from '@/services/api/wishlist';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export const useShareWishlist = () => {
    return useMutation({
        mutationFn: async (wishlistId: string) => {
            return wishlistService.regenerateShareToken(wishlistId);
        },
        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể tạo link chia sẻ. Vui lòng thử lại!',
            });
        },
    });
};
