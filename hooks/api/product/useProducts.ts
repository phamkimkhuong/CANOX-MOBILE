import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Schema validate từng sản phẩm
const ProductSchema = z.object({
    id: z.number(),
    title: z.string(),
    price: z.number(),
    thumbnail: z.string(),
});
const ResponseSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number(),
});
export const useProductDetail = (productId: string) => {
    return useInfiniteQuery({
        queryKey: ['product', productId],
        queryFn: () =>
            request({
                url: API_ROUTES.PRODUCTS.DETAIL(productId),
                method: 'GET'
            }, ProductSchema),
        getNextPageParam: () => undefined, // Không phân trang cho chi tiết sản phẩm
        initialPageParam: undefined, // Không phân trang cho chi tiết sản phẩm
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
export const useProductFeed = () => {
    return useInfiniteQuery({
        queryKey: ['products', 'feed'],
        queryFn: ({ pageParam = 0 }) =>
            request({
                url: `/products?limit=20&skip=${pageParam}`,
                method: 'GET'
            }, ResponseSchema),
        getNextPageParam: (lastPage) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            return nextSkip < lastPage.total ? nextSkip : undefined;
        },
        initialPageParam: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
