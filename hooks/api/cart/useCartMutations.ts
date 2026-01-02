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
import { CartApiResponseSchema, CartUI } from '@/types/cart';
import { transformCart } from '@/utils/adapter/cartAdapter';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

            // Generate idempotency key (UUID v4)
            const idempotencyKey = `update-qty-${itemId}-${Date.now()}-${Math.random()}`;

            // Get current cart to extract version/etag for If-Match
            const currentCart = queryClient.getQueryData<CartUI>(CART_QUERY_KEY);
            const currentItem = currentCart?.shops
                .flatMap(s => s.items)
                .find(i => i.id === itemId);

            const response = await request(
                {
                    url: API_ROUTES.CART.UPDATE(itemId),
                    method: 'PUT',
                    data: { quantity },
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                        'If-Match': currentItem?.version?.toString() || '*', // Use version or wildcard
                    },
                },
                CartApiResponseSchema
            );

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
                                    totalPrice: item.unitPrice * quantity
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
            if (context?.previousCart) {
                queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
            }
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
        mutationFn: async ({ itemId }: RemoveItemParams): Promise<CartUI> => {
            logger.cart.info('Removing item', { itemId });

            const response = await request(
                {
                    url: API_ROUTES.CART.REMOVE(itemId),
                    method: 'DELETE',
                },
                CartApiResponseSchema
            );

            return transformCart(response.data);
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
        },

        onSuccess: (cartUI) => {
            logger.cart.info('Item removed successfully');
            queryClient.setQueryData(CART_QUERY_KEY, cartUI);
        },
    });
};
