/**
 * ==============================================
 * RECOMMENDED PRODUCTS HOOK
 * ==============================================
 * 
 * Fetches recommended products when search returns empty.
 * Uses the same API without keyword filter to get general products.
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type { SearchProductsResponse, SearchProductUI } from '@/types/search-results';
import { SearchProductsResponseSchema } from '@/types/search-results';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const recommendedProductsKeys = {
    all: ['recommendedProducts'] as const,
    list: (size: number) => [...recommendedProductsKeys.all, { size }] as const,
};

// ============================================
// TRANSFORMER
// ============================================

const transformProduct = (raw: NonNullable<SearchProductsResponse['data']>['content'][0]): SearchProductUI => {
    const media = raw.media ?? [];
    const primaryMedia = media.find(m => m.isPrimary) || media[0];

    // Price logic: priceBeforeDiscount = giá gốc, priceAfterBestVoucher = giá bán
    const originalPrice = raw.priceBeforeDiscount ?? 0;
    const sellingPrice = raw.priceAfterBestVoucher ?? 0;

    const hasDiscount = sellingPrice > 0 && sellingPrice < originalPrice;
    const displayPrice = hasDiscount ? sellingPrice : originalPrice;

    // Discount: tính từ giá gốc vs giá bán, fallback sang showDiscount
    let discount = 0;
    if (hasDiscount) {
        discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
    } else if (raw.showDiscount && raw.showDiscount > 0) {
        discount = raw.showDiscount;
    }

    const isFlashSale = raw.activeCampaigns?.some(
        c => c.campaignType === 'FLASH_SALE'
    ) ?? false;

    return {
        id: raw.id,
        title: raw.name ?? '',
        thumbnail: toPublicUrl(primaryMedia?.url ?? ''),
        price: displayPrice,
        originalPrice: hasDiscount ? originalPrice : undefined,
        discountPercentage: discount > 0 ? discount : undefined,
        rating: raw.reviewStatistics?.averageRating ?? 0,
        reviews: raw.reviewStatistics?.totalReviews ?? 0,
        sold: raw.reviewStatistics?.verifiedPurchaseCount ?? 0,
        shopName: raw.shop?.shopName ?? '',
        shopId: raw.shop?.shopId ?? undefined,
        location: raw.shop?.place ?? undefined,
        hasVoucher: !!raw.bestShopVoucher,
        isFlashSale,
        categoryName: raw.category?.name ?? undefined,
    };
};

// ============================================
// HOOK OPTIONS
// ============================================

export interface UseRecommendedProductsOptions {
    enabled?: boolean;
    pageSize?: number;
}

// ============================================
// MAIN HOOK
// ============================================

export const useRecommendedProducts = ({
    enabled = true,
    pageSize = 20,
}: UseRecommendedProductsOptions = {}) => {
    const query = useQuery({
        queryKey: recommendedProductsKeys.list(pageSize),
        enabled,
        queryFn: async () => {
            const response = await request<SearchProductsResponse>(
                {
                    url: API_ROUTES.PUBLIC_PRODUCTS.SEARCH,
                    method: 'GET',
                    params: {
                        page: 0,
                        size: pageSize,
                        validPriceRange: true,
                    },
                },
                SearchProductsResponseSchema
            );

            if (!response.data) {
                return [] as SearchProductUI[];
            }

            return response.data.content.map(transformProduct);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        gcTime: 1000 * 60 * 15,   // Keep in garbage collection for 15 minutes
    });

    return {
        products: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};
