import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { CartResponseSchema } from '@/types/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import z from 'zod';

const CART_QUERY_KEY = ['cart'];

// 1. Hook lấy dữ liệu giỏ hàng (Gọi khi App start hoặc vào màn Cart)
export const useCart = () => {
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const query = useQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: async () => {
            const res = await request(
                { url: API_ROUTES.CART.GET, method: 'GET' },
                z.object({ data: CartResponseSchema })
            );
            return res.data;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.data) {
            setTotalQuantity(query.data.itemCount);
        }
    }, [query.data, setTotalQuantity]);

    return query;
};

// 2. Hook Add to Cart (Optimistic Update - Cập nhật Badge ngay lập tức)
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    const incrementCart = useCartStore((state) => state.increment);
    const setTotalQuantity = useCartStore((state) => state.setTotalQuantity);

    return useMutation({
        mutationFn: (data: { productId: string; variantId: string; quantity: number }) =>
            request(
                {
                    url: API_ROUTES.CART.ADD,
                    method: 'POST',
                    data,
                },
                z.object({ data: CartResponseSchema })
            ),

        // Tăng số trên Badge ngay khi bấm nút (chưa cần server trả về)
        // Tạo cảm giác App cực nhanh (Snappy)
        onMutate: async (variables) => {
            // Cancel các query đang chạy để tránh conflict
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

            // Tăng số lượng trên Badge ngay lập tức
            incrementCart(variables.quantity);
        },
        // Nếu lỗi -> Invalidate để fetch lại đúng số từ server (Cơ chế tự sửa sai)
        onError: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
        // Thành công -> Fetch lại full giỏ hàng ngầm để đồng bộ data mới nhất
        onSuccess: (res) => {
            if (res?.data) {
                setTotalQuantity(res.data.itemCount);
                queryClient.setQueryData(CART_QUERY_KEY, res.data);
            } else {
                queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            }
        },
    });
};