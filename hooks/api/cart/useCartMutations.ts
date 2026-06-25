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
import { CartUI } from '@/types/cart';
import { ResponseDefaultSchema } from '@/types/responseSchema';
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
        mutationFn: async ({ itemId, quantity }: UpdateQuantityParams): Promise<void> => {
            logger.cart.info('Updating quantity', { itemId, quantity });

            const idempotencyKey = uuidv4();

            await request(
                {
                    url: API_ROUTES.CART.UPDATE(itemId),
                    method: 'PUT',
                    data: { quantity },
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        'If-Match': "0"
                    },
                },
                ResponseDefaultSchema
            );
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
        meta: { handledLocally: true },

        onSuccess: () => {
            logger.cart.info('Quantity updated successfully');
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
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
            const idempotencyKey = uuidv4();

            await request(
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
        meta: { handledLocally: true },

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
                itemCount: 0,
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
                    (sum, shop) => sum + shop.items.length,
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
        meta: { handledLocally: true },

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
        meta: { handledLocally: true },

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

// ==============================================
// MUTATION: Move Items to Wishlist
// ==============================================

interface MoveToWishlistParams {
    items: { itemId: string; variantId: string; productId: string; quantity: number }[];
}

import { wishlistKeys } from '@/hooks/api/wishlist/useWishlists';
import { wishlistService } from '@/services/api/wishlist';

/**
 * Move multiple cart items to the default wishlist
 * 1. Calls addToDefaultWishlist for each item
 * 2. Calls BATCH_REMOVE to delete from cart
 */
export const useMoveCartItemsToWishlist = () => {
    const queryClient = useQueryClient();
    const { setSelectedItemIds } = useCartStore();

    return useMutation<{ successCount: number; failedCount: number }, Error, MoveToWishlistParams>({
        mutationFn: async ({ items }): Promise<{ successCount: number; failedCount: number }> => {
            logger.cart.info('Moving items to wishlist', { count: items.length });

            const isSingle = items.length === 1;

            if (isSingle) {
                const item = items[0];
                // For single item, let any error throw directly to be caught by onError
                await wishlistService.addToDefaultWishlist({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: 1,
                    priority: 0,
                });

                const idempotencyKey = uuidv4();
                await request(
                    {
                        url: API_ROUTES.CART.BATCH_REMOVE,
                        method: 'DELETE',
                        data: { itemIds: [item.itemId] },
                        headers: {
                            'Idempotency-Key': idempotencyKey,
                            'If-Match': '0',
                        },
                    },
                    ResponseDefaultSchema
                );

                return { successCount: 1, failedCount: 0 };
            } else {
                // For multiple items, handle settled results
                const results = await Promise.allSettled(
                    items.map(item =>
                        wishlistService.addToDefaultWishlist({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: 1,
                            priority: 0,
                        })
                    )
                );

                const itemsToRemove: typeof items = [];
                const itemsToKeep: typeof items = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let lastError: any = null;

                results.forEach((res, index) => {
                    const item = items[index];
                    if (res.status === 'fulfilled') {
                        itemsToRemove.push(item);
                    } else {
                        itemsToKeep.push(item);
                        lastError = res.reason;
                    }
                });

                // If ALL items failed, throw the last error to activate onError
                if (itemsToRemove.length === 0) {
                    if (lastError) {
                        throw lastError;
                    }
                    throw new Error('Không thể lưu bất kỳ sản phẩm nào vào yêu thích');
                }

                // Delete only successfully added items
                const itemIds = itemsToRemove.map(i => i.itemId);
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

                return {
                    successCount: itemsToRemove.length,
                    failedCount: itemsToKeep.length,
                };
            }
        },

        onError: (error) => {
            logger.cart.warn('Move to wishlist failed', { error });
            const errorMessage = error instanceof Error ? error.message : 'Không thể lưu vào yêu thích';
            Toast.show({
                type: 'error',
                text1: 'Lưu thất bại',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        },
        meta: { handledLocally: true },

        onSuccess: (data) => {
            logger.cart.info('Items moved to wishlist completed with results', data);
            
            // Invalidate queries to reload fresh data from server
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: wishlistKeys.default() });
            queryClient.invalidateQueries({ queryKey: [...wishlistKeys.all, 'check-variants'] });

            // Clear selection
            setSelectedItemIds(new Set());

            // Always show success toast for successful operations (including partial success)
            Toast.show({
                type: 'success',
                text1: 'Đã lưu vào bộ sưu tập',
                text2: 'Đồng thời xóa sản phẩm khỏi giỏ hàng.',
                position: 'top',
                visibilityTime: 2500,
            });
        },
    });
};
