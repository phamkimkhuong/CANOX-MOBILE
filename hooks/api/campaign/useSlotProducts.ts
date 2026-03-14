import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { SlotProductsResponse, SlotProductsResponseSchema } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get products in a specific Flash Sale slot
 */
export const useSlotProducts = (slotId: string | null) => {
    return useQuery({
        queryKey: ['campaigns', 'slots', slotId, 'products'],
        enabled: !!slotId,
        queryFn: async (): Promise<FlashSaleItem[]> => {
            if (!slotId) return [];

            const response = await request<SlotProductsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.SLOT_PRODUCTS(slotId),
                    method: 'GET',
                    params: {
                        page: 0,
                        size: 50, // Get more products for the list
                    }
                },
                SlotProductsResponseSchema
            );

            const products = response.data?.content || [];

            // Transform to UI items
            return products.map((p) => {
                const stockLimit = p.stockLimit || 1;
                const stockSold = p.stockSold || 0;
                const progress = Math.min(Math.round((stockSold / stockLimit) * 100), 100);

                return {
                    id: p.id,
                    productId: p.productId,
                    name: p.productName || 'Sản phẩm Flash Sale',
                    image: toPublicUrl(p.productThumbnail || p.variantImagePath),
                    price: p.salePrice || 0,
                    originalPrice: p.originalPrice || 0,
                    discountPercentage: p.discountPercent || 0,
                    soldCount: stockSold,
                    totalStock: stockLimit,
                    stockRemaining: p.stockRemaining || 0,
                    progress: progress,
                    isSoldOut: p.isSoldOut || (p.stockRemaining === 0),
                };
            });
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};
