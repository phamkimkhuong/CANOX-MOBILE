import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import {
    ProductDetailAPIResponseSchema,
    type ProductDetailUI,
} from '@/types/productDetail';
import { transformProductDetail } from '@/utils/adapter/productDetailAdapter';
import { useQuery } from '@tanstack/react-query';

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
const fetchProductDetail = async (productId: string): Promise<ProductDetailUI> => {
    const response = await request(
        {
            url: API_ROUTES.PRODUCTS.DETAIL(productId),
            method: 'GET',
        },
        ProductDetailAPIResponseSchema
    );

    // Transform API response to UI model
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
 * 
 * Features:
 * - Zod validation cho API response
 * - Transform data thành UI-ready format
 * - Optimized caching với TanStack Query
 * - TypeScript strict typing
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useProductDetail('product-123');
 * 
 * if (isLoading) return <ProductDetailSkeleton />;
 * if (error) return <ErrorState />;
 * 
 * return <ProductDetailContent data={data} />;
 * ```
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
 * Hook để prefetch product detail (dùng cho optimization)
 */
export const usePrefetchProductDetail = () => {
    // This would need QueryClient access
    // Implementation depends on your setup
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
