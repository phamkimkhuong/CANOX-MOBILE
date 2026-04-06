import { request } from '@/services/api/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Schema for product feed 
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
