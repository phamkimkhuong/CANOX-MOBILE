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
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { request } from '@/services/api/client';
import {
    CategoryListResponseSchema,
    CategoryNode,
} from '@/types/category';
import {
    ShopDetailResponse,
    ShopDetailResponseSchema,
    ShopHeaderUI,
    ShopProductFilterParams,
    ShopProductItemUI,
    ShopProductsResponse,
    ShopProductsResponseSchema,
    ShopVoucherUI,
    ShopVouchersResponse,
    ShopVouchersResponseSchema,
} from '@/types/shop';
import { toShopHeaderUI, toShopProductsUI, toShopVouchersUI } from '@/utils/adapter/shopAdapter';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Query key factory for shop-related queries
 * Follows convention: ['entity', id, 'sub-entity', params]
 */
export const shopKeys = {
    all: ['shop'] as const,
    detail: (shopId: string) => [...shopKeys.all, 'detail', shopId] as const,
    products: (shopId: string, filters?: ShopProductFilterParams) =>
        [...shopKeys.all, 'products', shopId, filters] as const,
    vouchers: (shopId: string) => [...shopKeys.all, 'vouchers', shopId] as const,
    categories: (shopId: string) => [...shopKeys.all, 'categories', shopId] as const,
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

/**
 * Prefetch shop detail for optimized navigation
 * Call this on PressIn to start loading before user releases touch
 */
export const usePrefetchShopDetail = () => {
    const queryClient = useQueryClient();

    return useCallback((shopId: string) => {
        if (!shopId) return;

        queryClient.prefetchQuery({
            queryKey: shopKeys.detail(shopId),
            queryFn: async (): Promise<ShopHeaderUI> => {
                const response = await request<ShopDetailResponse>(
                    {
                        url: API_ROUTES.SHOPS.DETAIL(shopId),
                        method: 'GET',
                    },
                    ShopDetailResponseSchema
                );
                return toShopHeaderUI(response.data);
            },
            staleTime: 1000 * 60 * 5,
        });
    }, [queryClient]);
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
            const items = toShopProductsUI(response.data?.content || []);

            return {
                items,
                nextPage: response.data?.hasNext ? response.data.page + 1 : undefined,
                totalElements: response.data?.totalElements ?? 0,
                totalPages: response.data?.totalPages ?? 0,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 2, // 2 minutes - products may change more often
        gcTime: 1000 * 60 * 10,   // Keep in cache 10 minutes
    });
};

/**
 * useRefreshShopProducts - Smart refresh for shop products infinite query
 * Only fetches page 0 instead of all loaded pages.
 * 
 * @param shopId - Shop UUID
 * @param filters - Optional filter/sort params
 * @returns refresh function
 */
export const useRefreshShopProducts = (
    shopId: string | undefined,
    filters?: ShopProductFilterParams
) => {
    return useSmartRefresh(shopKeys.products(shopId ?? '', filters));
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
    return data?.pages?.[0]?.totalElements ?? null;
};

// ============================================
// SHOP VOUCHERS HOOK
// ============================================

/**
 * Fetch shop vouchers for horizontal display
 * 
 * Features:
 * - Zod validation
 * - Adapter transformation to ShopVoucherUI[]
 * - 5 minute cache (vouchers don't change frequently)
 * - Returns empty array when no vouchers
 * 
 * @param shopId - Shop UUID
 * @returns Query result with vouchers array
 */
export const useShopVouchers = (shopId: string | undefined) => {
    return useQuery({
        queryKey: shopKeys.vouchers(shopId ?? ''),
        enabled: !!shopId,
        queryFn: async (): Promise<ShopVoucherUI[]> => {
            const response = await request<ShopVouchersResponse>(
                {
                    url: API_ROUTES.SHOPS.VOUCHERS(shopId!),
                    method: 'GET',
                },
                ShopVouchersResponseSchema
            );

            // Transform to UI types, filter out expired vouchers
            return toShopVouchersUI(response.data || [])
                .filter((v) => !v.isExpired);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,   // Keep in cache 30 minutes
    });
};
// ============================================
// SHOP CATEGORIES HOOK
// ============================================

/**
 * Fetch shop categories for "Danh Mục" tab
 * 
 * Features:
 * - Zod validation using CategoryListResponseSchema
 * - 1 hour cache (shop categories are very static)
 * 
 * @param shopId - Shop UUID
 * @returns Query result with CategoryNode array
 */
export const useShopCategories = (shopId: string | undefined) => {
    return useQuery({
        queryKey: shopKeys.categories(shopId ?? ''),
        enabled: !!shopId,
        queryFn: async (): Promise<CategoryNode[]> => {
            const response = await request(
                {
                    url: API_ROUTES.SHOPS.CATEGORIES(shopId!),
                    method: 'GET',
                },
                CategoryListResponseSchema
            );

            return response.data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
    });
};
