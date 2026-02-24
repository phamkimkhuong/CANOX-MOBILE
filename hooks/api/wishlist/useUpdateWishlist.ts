/**
 * ==============================================
 * USE UPDATE WISHLIST - Mutation Hook
 * ==============================================
 * Updates wishlist name, isPublic, description, etc.
 * Used for Rename and Toggle Public/Private.
 */

import { ApiError } from '@/services/api/errors';
import { wishlistService } from '@/services/api/wishlist';
import type { UpdateWishlistRequest, WishlistDetailDTO, WishlistPageDTO, WishlistSummaryDTO } from '@/types/wishlist';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

interface UpdateWishlistParams {
    wishlistId: string;
    data: UpdateWishlistRequest;
}

export const useUpdateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ wishlistId, data }: UpdateWishlistParams) => {
            return wishlistService.updateWishlist(wishlistId, data);
        },
        onSuccess: (response, variables) => {
            const updatedData = response.data || response;

            // 1. Update the detail cache directly
            queryClient.setQueryData<WishlistDetailDTO>(wishlistKeys.detail(variables.wishlistId), (oldDetail) => {
                if (!oldDetail) return oldDetail;
                return {
                    ...oldDetail,
                    ...updatedData,
                };
            });

            // 2. Update the item in the lists cache (Infinite Query)
            queryClient.setQueriesData<InfiniteData<WishlistPageDTO>>({ queryKey: wishlistKeys.lists() }, (oldData) => {
                if (!oldData?.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: WishlistPageDTO) => ({
                        ...page,
                        content: page.content.map((item: WishlistSummaryDTO) =>
                            item.id === variables.wishlistId
                                ? { ...item, ...updatedData }
                                : item
                        ),
                    })),
                };
            });
        },
        onError: (error: ApiError) => {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || 'Không thể cập nhật bộ sưu tập. Vui lòng thử lại!',
            });
        },
    });
};
