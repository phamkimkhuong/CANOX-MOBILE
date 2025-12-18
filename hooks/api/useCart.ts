import { request } from '@/services/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const CartItemSchema = z.object({
    productId: z.number(),
    title: z.string(),
    price: z.number(),
    image: z.string(),
    quantity: z.number(),
});

const CartResponseSchema = z.object({
    items: z.array(CartItemSchema),
    totalQuantity: z.number(),
    totalPrice: z.number(),
});
type CartResponse = z.infer<typeof CartResponseSchema>;

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Call API Add to Cart
        mutationFn: (productId: number) =>
            request({
                url: '/cart/add',
                method: 'POST',
                data: { productId, quantity: 1 }
            }, CartResponseSchema),

        // Optimistic Update before server response
        onMutate: async (newProductId) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['cart'] });
            // Snapshot the previous value
            const previousCart = queryClient.getQueryData(['cart']);
            // Optimistically update to the new value
            queryClient.setQueryData(['cart'], (oldData: any) => {
                // Logic giả lập: Tự cộng số lượng, tự thêm item vào list
                // Để UI hiển thị ngay lập tức
                if (!oldData) return oldData;

                // Ví dụ đơn giản: Tìm item và cộng số lượng
                const existingItem = oldData.items.find((i: any) => i.productId === newProductId);
                let newItems;
                if (existingItem) {
                    newItems = oldData.items.map((i: any) =>
                        i.productId === newProductId ? { ...i, quantity: i.quantity + 1 } : i
                    );
                } else {
                    // Thêm item mới tạm thời (giả dữ liệu để hiển thị)
                    newItems = [...oldData.items, { productId: newProductId, quantity: 1, title: 'Đang thêm...', price: 0 }];
                }
                return {
                    ...oldData,
                    items: newItems,
                    // Tạm thời cộng tổng số lượng để Badge nhảy số
                    totalQuantity: (oldData.totalQuantity || 0) + 1
                };
            });

            // Return snapshot for potential rollback
            return { previousCart };
        },

        // API error => Rollback data cũ
        onError: (err, newProductId, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['cart'], context.previousCart);
            }
        },

        // Fetch data server though success or error
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
        },
    });
};