import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { PaginatedProductResponseSchema } from '@/types/product/product';
import {
    ProductDetailAPIResponseSchema,
    type ProductDetailUI,
} from '@/types/product/productDetail';
import { transformProduct } from '@/utils/adapter/product/productAdapter';
import { transformProductDetail } from '@/utils/adapter/product/productDetailAdapter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// ============================================
// QUERY KEYS
// ============================================
export const PRODUCT_DETAIL_QUERY_KEYS = {
    all: ['product-detail'] as const,
    detail: (id: string) => [...PRODUCT_DETAIL_QUERY_KEYS.all, id] as const,
    reviews: (id: string) => [...PRODUCT_DETAIL_QUERY_KEYS.detail(id), 'reviews'] as const,
    related: (id: string) => [...PRODUCT_DETAIL_QUERY_KEYS.detail(id), 'related'] as const,
};

// ============================================
// FETCH FUNCTIONS
// ============================================

/**
 * Fetch product detail from API
 */
export const fetchProductDetail = async (productId: string): Promise<ProductDetailUI> => {
    const response = await request(
        {
            url: API_ROUTES.PRODUCTS.DETAIL(productId),
            method: 'GET',
        },
        ProductDetailAPIResponseSchema
    );
    return transformProductDetail(response.data);
};

// ============================================
// HOOKS
// ============================================

interface UseProductDetailOptions {
    /** Enable/disable the query */
    enabled?: boolean;
    /** Stale time in milliseconds (default: 5 minutes) */
    staleTime?: number;
}

/**
 * Hook để fetch và quản lý Product Detail data
 */
export const useProductDetail = (
    productId: string,
    options: UseProductDetailOptions = {}
) => {
    const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

    return useQuery({
        queryKey: PRODUCT_DETAIL_QUERY_KEYS.detail(productId),
        queryFn: () => fetchProductDetail(productId),
        enabled: enabled && !!productId,
        staleTime,
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });
};

/**
 * Fetch related products from API
 */
const fetchRelatedProducts = async (productId: string) => {
    const response = await request(
        {
            url: API_ROUTES.PUBLIC_PRODUCTS.RELATED(productId),
            method: 'GET',
            params: { page: 0, size: 20 },
        },
        PaginatedProductResponseSchema
    );

    // Guard: Check response.data exists
    if (!response.data) {
        return { content: [], page: 0, size: 0, totalPages: 0, hasNext: false };
    }

    return {
        ...response.data,
        content: response.data.content.map(transformProduct),
    };
};

/**
 * Hook to fetch related products
 */
export const useRelatedProducts = (productId: string) => {
    return useQuery({
        queryKey: PRODUCT_DETAIL_QUERY_KEYS.related(productId),
        queryFn: () => fetchRelatedProducts(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook để prefetch product detail
 */
export const usePrefetchProductDetail = () => {
    const queryClient = useQueryClient();

    const prefetch = useCallback((productId: string) => {
        if (!productId) return;

        queryClient.prefetchQuery({
            queryKey: PRODUCT_DETAIL_QUERY_KEYS.detail(productId),
            queryFn: () => fetchProductDetail(productId),
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    return prefetch;
};

// ============================================
// MUTATION HOOKS (Add to Cart, etc.)
// ============================================

// These will be implemented in useCart.ts
// Just exporting types for reference

export interface AddToCartInput {
    productId: string;
    variantId: string;
    quantity: number;
}

export interface AddToCartResult {
    success: boolean;
    cartItemId?: string;
    message?: string;
}
