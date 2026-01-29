/**
 * ==============================================
 * CART MUTATIONS
 * ==============================================
 * API mutations for cart operations:
 * - Update quantity (validates against stock)
 * - Remove item
 * 
 * Note: Selection is CLIENT-SIDE (Zustand) - backend doesn't support it
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useCartStore } from '@/store/useCartStore';
import { CartApiResponseSchema, CartUI } from '@/types/cart';
import { ResponseDefaultSchema } from '@/types/responseSchema';
import { transformCart } from '@/utils/adapter/cartAdapter';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

const CART_QUERY_KEY = ['cart'];

// ==============================================
// MUTATION: Update Item Quantity
// ==============================================

interface UpdateQuantityParams {
    itemId: string;
    quantity: number;
}

/**
 * Update item quantity via API
 * Server validates against availableStock
 */
export const useUpdateCartItemQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId, quantity }: UpdateQuantityParams): Promise<CartUI> => {
            logger.cart.info('Updating quantity', { itemId, quantity });

            // Get current cart to extract version for If-Match 
            const currentCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);
            const currentItem = currentCart?.shops
                .flatMap(s => s.items)
                .find(i => i.id === itemId);
            const idempotencyKey = uuidv4();
            const version = currentItem?.version;

            const response = await request(
                {
                    url: API_ROUTES.CART.UPDATE(itemId),
                    method: 'PUT',
                    data: { quantity },
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        'If-Match': "0"
                    },
                },
                CartApiResponseSchema
            );

            if (!response.data) {
                throw new Error('Đã xảy ra lỗi khi cập nhật số lượng');
            }
            return transformCart(response.data);
        },

        // Optimistic update for instant UI feedback
        onMutate: async ({ itemId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

            const previousCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);

            if (previousCart) {
                const optimisticCart: CartUI = {
                    ...previousCart,
                    shops: previousCart.shops.map(shop => ({
                        ...shop,
                        items: shop.items.map(item =>
                            item.id === itemId
                                ? {
                                    ...item,
                                    quantity,
                                }
                                : item
                        ),
                    })),
                };

                queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);
            }

            return { previousCart };
        },

        onError: (error, variables, context) => {
            logger.cart.warn('Quantity update failed, rolling back', { error });
            // Rollback optimistic update
            if (context?.previousCart) {
                queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
            }
            const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật số lượng';
            Toast.show({
                type: 'error',
                text1: 'Cập nhật thất bại',
                text2: errorMessage.includes('version') || errorMessage.includes('refresh')
                    ? 'Giỏ hàng đã được cập nhật. Vui lòng làm mới trang.'
                    : 'Vui lòng kiểm tra lại số lượng và thử lại.',
                position: 'top',
                visibilityTime: 3000,
            });
        },

        onSuccess: (cartUI) => {
            logger.cart.info('Quantity updated successfully');
            queryClient.setQueryData(CART_QUERY_KEY, cartUI);
        },
    });
};

// ==============================================
// MUTATION: Remove Item
// ==============================================

interface RemoveItemParams {
    itemId: string;
}

/**
 * Remove item from cart via API
 */
export const useRemoveCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId }: RemoveItemParams): Promise<void> => {
            logger.cart.info('Removing item', { itemId });

            // Get current cart to extract version for If-Match
            const currentCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);
            const currentItem = currentCart?.shops
                .flatMap(s => s.items)
                .find(i => i.id === itemId);

            const version = currentItem?.version;
            const idempotencyKey = uuidv4();

            const response = await request(
                {
                    url: API_ROUTES.CART.REMOVE(itemId),
                    method: 'DELETE',
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        // 'If-Match': version ? version.toString(),
                        'If-Match': '0',
                    },
                },
                ResponseDefaultSchema
            );

        },

        // Optimistic update
        onMutate: async ({ itemId }) => {
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

            const previousCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);

            if (previousCart) {
                const optimisticCart: CartUI = {
                    ...previousCart,
                    shops: previousCart.shops
                        .map(shop => ({
                            ...shop,
                            items: shop.items.filter(item => item.id !== itemId),
                        }))
                        .filter(shop => shop.items.length > 0), // Remove empty shops
                };

                queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);
            }

            return { previousCart };
        },

        onError: (error, variables, context) => {
            logger.cart.warn('Item removal failed, rolling back', { error });
            if (context?.previousCart) {
                queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
            }
            const errorMessage = error instanceof Error ? error.message : 'Không thể xóa sản phẩm';
            Toast.show({
                type: 'error',
                text1: 'Xóa thất bại',
                text2: errorMessage.includes('version') || errorMessage.includes('refresh')
                    ? 'Giỏ hàng đã được cập nhật. Vui lòng làm mới trang.'
                    : 'Vui lòng kiểm tra lại số lượng và thử lại.',
                position: 'top',
                visibilityTime: 3000,
            });
        },


        onSuccess: () => {
            logger.cart.info('Item removed successfully');
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
    });
};

// ==============================================
// MUTATION: Clear Cart (Remove All Items)
// ==============================================

/**
 * Clear all items from cart via API
 * 
 * API: DELETE /api/v1/cart/items
 * Headers: Idempotency-Key (required), If-Match (required)
 * Response: { code, success, message, data: {} }
 */
export const useClearCart = () => {
    const queryClient = useQueryClient();
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);

    return useMutation({
        mutationFn: async (): Promise<void> => {
            logger.cart.info('Clearing cart');

            const idempotencyKey = uuidv4();

            await request(
                {
                    url: API_ROUTES.CART.CLEAR,
                    method: 'DELETE',
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        'If-Match': '0',
                    },
                },
                ResponseDefaultSchema
            );
        },

        // Optimistic update - clear cart immediately
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

            const previousCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);

            // Set empty cart optimistically
            const emptyCart: CartUI = {
                shops: [],
                platformVouchers: previousCart?.platformVouchers ?? [],
                appliedPlatformVoucherId: null,
            };
            queryClient.setQueryData(CART_QUERY_KEY, emptyCart);

            // Reset badge count
            setTotalQuantity(0);

            return { previousCart };
        },

        onError: (error, variables, context) => {
            logger.cart.warn('Clear cart failed, rolling back', { error });

            // Rollback to previous state
            if (context?.previousCart) {
                queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
                const totalItems = context.previousCart.shops.reduce(
                    (sum, shop) => sum + shop.itemCount,
                    0
                );
                setTotalQuantity(totalItems);
            }

            const errorMessage = error instanceof Error ? error.message : 'Không thể xóa giỏ hàng';
            Toast.show({
                type: 'error',
                text1: 'Xóa giỏ hàng thất bại',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        },

        onSuccess: () => {
            logger.cart.info('Cart cleared successfully');
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

            Toast.show({
                type: 'success',
                text1: 'Đã xóa giỏ hàng',
                position: 'top',
                visibilityTime: 2000,
            });
        },
    });
};

// ==============================================
// MUTATION: Batch Remove Items
// ==============================================

interface BatchRemoveParams {
    itemIds: string[];
}

/**
 * Remove multiple items from cart via API
 */
export const useBatchRemoveCartItems = () => {
    const queryClient = useQueryClient();
    const { setSelectedItemIds } = useCartStore();

    return useMutation({
        mutationFn: async ({ itemIds }: BatchRemoveParams): Promise<void> => {
            logger.cart.info('Removing multiple items', { count: itemIds.length });

            const idempotencyKey = uuidv4();

            await request(
                {
                    url: API_ROUTES.CART.BATCH_REMOVE,
                    method: 'DELETE',
                    data: { itemIds },
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        'If-Match': '0',
                    },
                },
                ResponseDefaultSchema
            );
        },

        // Optimistic update
        onMutate: async ({ itemIds }) => {
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

            const previousCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);

            if (previousCart) {
                const itemIdsSet = new Set(itemIds);
                const optimisticCart: CartUI = {
                    ...previousCart,
                    shops: previousCart.shops
                        .map(shop => ({
                            ...shop,
                            items: shop.items.filter(item => !itemIdsSet.has(item.id)),
                        }))
                        .filter(shop => shop.items.length > 0),
                };

                queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);
            }

            return { previousCart };
        },

        onError: (error, variables, context) => {
            logger.cart.warn('Batch removal failed, rolling back', { error });
            if (context?.previousCart) {
                queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
            }
            const errorMessage = error instanceof Error ? error.message : 'Không thể xóa các sản phẩm đã chọn';
            Toast.show({
                type: 'error',
                text1: 'Xóa thất bại',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        },

        onSuccess: () => {
            logger.cart.info('Items removed successfully');
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            // Clear selection after successful removal
            setSelectedItemIds(new Set());

            Toast.show({
                type: 'success',
                text1: 'Đã xóa các sản phẩm được chọn',
                position: 'top',
                visibilityTime: 2000,
            });
        },
    });
};
