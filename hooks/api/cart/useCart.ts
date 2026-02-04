import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { AddToCartApiResponseSchema, AddToCartResponse, CartApiResponseSchema, CartUI } from '@/types/cart';
import { transformCart } from '@/utils/adapter/cartAdapter';
import { logger } from '@/utils/logger';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

export const CART_QUERY_KEY = ['cart'];

/**
 * Fetch cart data from API and transform it for UI
 */
export const fetchCart = async (): Promise<CartUI> => {
    const response = await request(
        { url: API_ROUTES.CART.GET, method: 'GET' },
        CartApiResponseSchema
    );
    if (!response.data) {
        throw new Error('Đã xảy ra lỗi khi tải giỏ hàng');
    }
    return transformCart(response.data);
};

/**
 * Hook to fetch cart data
 * Returns CartUI (UI-ready format) instead of raw API response
 */
export const useCart = () => {
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const query = useQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: fetchCart,
        enabled: isAuthenticated,
        staleTime: 1000 * 10,
        gcTime: 1000 * 60 * 10,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Sync cart count to Zustand badge
    useEffect(() => {
        if (query.data) {
            const totalItems = query.data.shops.reduce(
                (sum, shop) => sum + shop.itemCount,
                0
            );
            setTotalQuantity(totalItems);
        }
    }, [query.data, setTotalQuantity]);

    return query;
};

/**
 * Hook cung cấp hàm prefetch cho giỏ hàng.
 */
export const usePrefetchCart = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const prefetch = useCallback(() => {
        if (isAuthenticated) {
            queryClient.prefetchQuery({
                queryKey: CART_QUERY_KEY,
                queryFn: fetchCart,
                staleTime: 1000 * 10,
            });
        }
    }, [isAuthenticated, queryClient]);

    return prefetch;
};

// ==============================================
// Add to Cart Input/Output types
// ==============================================

export interface AddToCartInput {
    variantId: string;
    quantity: number;
    hideToast?: boolean;
}

export interface AddToCartResult {
    success: boolean;
    cart?: CartUI;
    message?: string;
}

/**
 * Hook to add item to cart
 * 
 * API: POST /api/v1/cart/items
 * Headers: Idempotency-Key (required)
 * Body: { variantId: string, quantity: number }
 * 
 * Uses optimistic update for instant UI feedback
 */
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    const incrementCart = useCartStore((state) => state.increment);
    const { t } = useTranslation('cart');

    return useMutation({
        mutationFn: async ({ variantId, quantity }: AddToCartInput): Promise<AddToCartResponse | null> => {
            logger.cart.info('Adding to cart', { variantId, quantity });

            // Generate unique idempotency key for this request
            const idempotencyKey = uuidv4();

            const response = await request(
                {
                    url: API_ROUTES.CART.ADD,
                    method: 'POST',
                    data: {
                        variantId,
                        quantity,
                    },
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                    },
                },
                AddToCartApiResponseSchema
            );

            return response.data ?? null;
        },

        // Show loading overlay immediately when mutation starts
        onMutate: async ({ quantity }) => {
            showGlobalLoading();

            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
            // Optimistically increment badge count by quantity
            incrementCart(quantity);
        },

        // On error: Rollback, hide loading, and show error message
        onError: (error, variables) => {
            hideGlobalLoading();

            logger.cart.warn('Add to cart failed', { error });
            // Invalidate to refetch correct data from server
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

            if (!variables.hideToast) {
                const errorMessage = error instanceof Error ? error.message : t('status.addFailed');
                Toast.show({
                    type: 'error',
                    text1: t('status.addFailed'),
                    text2: errorMessage,
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        },
        meta: { handledLocally: true },

        // On success: Hide loading, update cache, and show success message
        onSuccess: (data, variables) => {
            hideGlobalLoading();

            logger.cart.info('Added to cart successfully', { cartItemId: data?.id });

            // Invalidate to refetch full cart data from server since POST only returns cartItemId
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

            if (!variables.hideToast) {
                Toast.show({
                    type: 'success',
                    text1: t('status.addSuccess'),
                    position: 'top',
                    visibilityTime: 2000,
                });
            }
        },
    });
};
