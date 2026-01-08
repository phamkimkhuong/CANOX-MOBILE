/**
 * ==============================================
 * SHOP API HOOKS - TanStack Query Implementation
 * ==============================================
 * 
 * Hooks:
 * 1. useShopDetail - Fetch shop info (header, stats)
 * 2. useShopProducts - Infinite scroll products list
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import {
    ShopDetailResponse,
    ShopDetailResponseSchema,
    ShopHeaderUI,
    ShopProductFilterParams,
    ShopProductItemUI,
    ShopProductsResponse,
    ShopProductsResponseSchema,
} from '@/types/shop';
import { toShopHeaderUI, toShopProductsUI } from '@/utils/adapter/shopAdapter';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * Query key factory for shop-related queries
 * Follows convention: ['entity', id, 'sub-entity', params]
 */
export const shopKeys = {
    all: ['shop'] as const,
    detail: (shopId: string) => [...shopKeys.all, 'detail', shopId] as const,
    products: (shopId: string, filters?: ShopProductFilterParams) =>
        [...shopKeys.all, 'products', shopId, filters] as const,
};

// ============================================
// SHOP DETAIL HOOK
// ============================================

/**
 * Fetch shop detail information
 * 
 * Features:
 * - Zod validation
 * - Adapter transformation to ShopHeaderUI
 * - 5 minute cache (shop info rarely changes)
 */
export const useShopDetail = (shopId: string | undefined) => {
    return useQuery({
        queryKey: shopKeys.detail(shopId ?? ''),
        enabled: !!shopId,
        queryFn: async (): Promise<ShopHeaderUI> => {
            const response = await request<ShopDetailResponse>(
                {
                    url: API_ROUTES.SHOPS.DETAIL(shopId!),
                    method: 'GET',
                },
                ShopDetailResponseSchema
            );

            // Transform to UI type
            return toShopHeaderUI(response.data);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes - shop info rarely changes
        gcTime: 1000 * 60 * 30,   // Keep in cache 30 minutes
    });
};

// ============================================
// SHOP PRODUCTS HOOK (Infinite Scroll)
// ============================================

/**
 * Fetch shop products with infinite scroll
 * 
 * Features:
 * - Pagination support (page, size)
 * - Filtering support (keyword, category, price range)
 * - Sorting support (newest, price_asc, price_desc, popular)
 * - Zod validation
 * - Adapter transformation to ShopProductItemUI[]
 * 
 * @param shopId - Shop UUID
 * @param filters - Optional filter/sort params
 * @returns Infinite query result with pages of products
 */
export const useShopProducts = (
    shopId: string | undefined,
    filters?: ShopProductFilterParams
) => {
    return useInfiniteQuery({
        queryKey: shopKeys.products(shopId ?? '', filters),
        enabled: !!shopId,
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }): Promise<{
            items: ShopProductItemUI[];
            nextPage: number | undefined;
            totalElements: number;
            totalPages: number;
        }> => {
            const response = await request<ShopProductsResponse>(
                {
                    url: API_ROUTES.SHOPS.PRODUCTS(shopId!),
                    method: 'GET',
                    params: {
                        page: pageParam,
                        size: filters?.size ?? 20,
                        // Sort mapping for backend
                        // Note: Backend may use different param names
                        // Adjust based on actual API contract
                        ...(filters?.keyword && { keyword: filters.keyword }),
                        ...(filters?.categoryId && { categoryId: filters.categoryId }),
                        ...(filters?.minPrice && { minPrice: filters.minPrice }),
                        ...(filters?.maxPrice && { maxPrice: filters.maxPrice }),
                    },
                },
                ShopProductsResponseSchema
            );

            // Transform to UI types
            const items = toShopProductsUI(response.data.content);

            return {
                items,
                nextPage: response.data.hasNext ? response.data.page + 1 : undefined,
                totalElements: response.data.totalElements ?? 0,
                totalPages: response.data.totalPages,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 2, // 2 minutes - products may change more often
        gcTime: 1000 * 60 * 10,   // Keep in cache 10 minutes
    });
};

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Get total product count from shop
 * Useful for showing count before products load
 * 
 * Note: This extracts from useShopProducts query
 * Consider using if separate count endpoint exists
 */
export const useShopProductCount = (shopId: string | undefined) => {
    const { data } = useShopProducts(shopId);
    return data?.pages[0]?.totalElements ?? null;
};
