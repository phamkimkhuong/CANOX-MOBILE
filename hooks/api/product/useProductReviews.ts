import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ProductReviewUI, ProductReviewsResponseSchema } from '@/types/review/productReview';
import { toProductReviewsUI } from '@/utils/adapter/review/productReviewAdapter';
import { useQuery } from '@tanstack/react-query';

/**
 * Query keys for product reviews
 */
export const PRODUCT_REVIEW_KEYS = {
    all: ['product-reviews'] as const,
    list: (productId: string, type: string = 'PRODUCT') => [...PRODUCT_REVIEW_KEYS.all, type, productId] as const,
};

/**
 * Fetch product reviews from API
 */
export const fetchProductReviews = async (
    productId: string,
    type: string = 'PRODUCT',
    page: number = 0,
    size: number = 2
): Promise<ProductReviewUI[]> => {
    const response = await request(
        {
            url: API_ROUTES.REVIEWS.LIST(type, productId),
            method: 'GET',
            params: { page, size },
        },
        ProductReviewsResponseSchema
    );

    // Transform DTOs to UI models
    return toProductReviewsUI(response.data?.content || []);
};

/**
 * Hook to fetch product reviews
 */
export const useProductReviews = (
    productId: string,
    options: {
        type?: string;
        size?: number;
        enabled?: boolean;
    } = {}
) => {
    const { type = 'PRODUCT', size = 2, enabled = true } = options;

    return useQuery({
        queryKey: PRODUCT_REVIEW_KEYS.list(productId, type),
        queryFn: () => fetchProductReviews(productId, type, 0, size),
        enabled: enabled && !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
