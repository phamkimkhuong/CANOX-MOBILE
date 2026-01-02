import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { CartApiResponseSchema, CartUI } from '@/types/cart';
import { transformCart } from '@/utils/adapter/cartAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const CART_QUERY_KEY = ['cart'];

/**
 * Hook to fetch cart data
 * Returns CartUI (UI-ready format) instead of raw API response
 */
export const useCart = () => {
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const query = useQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: async (): Promise<CartUI> => {
            const response = await request(
                { url: API_ROUTES.CART.GET, method: 'GET' },
                CartApiResponseSchema
            );
            return transformCart(response.data);
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Sync cart count to Zustand badge
    useEffect(() => {
        if (query.data) {
            const totalItems = query.data.shops.reduce(
                (sum, shop) => sum + shop.totalQuantity,
                0
            );
            setTotalQuantity(totalItems);
        }
    }, [query.data, setTotalQuantity]);

    return query;
};

/**
 * Hook to add item to cart
 * Uses optimistic update for instant UI feedback
 */
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    const incrementCart = useCartStore((state) => state.increment);
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);

    return useMutation({
        mutationFn: async (data: { productId: string; variantId: string; quantity: number }) => {
            const response = await request(
                {
                    url: API_ROUTES.CART.ADD,
                    method: 'POST',
                    data,
                },
                CartApiResponseSchema
            );

            return transformCart(response.data);
        },

        // Optimistic update: Increment badge immediately
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
            incrementCart(variables.quantity);
        },

        // On error: Invalidate to refetch correct data from server
        onError: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },

        // On success: Update cache with transformed data
        onSuccess: (cartUI) => {
            if (cartUI) {
                const totalItems = cartUI.shops.reduce(
                    (sum, shop) => sum + shop.totalQuantity,
                    0
                );
                setTotalQuantity(totalItems);
                queryClient.setQueryData(CART_QUERY_KEY, cartUI);
            } else {
                queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            }
        },
    });
};