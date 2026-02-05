import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { SlotDetailResponse, SlotDetailResponseSchema } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get full detail of a specific Flash Sale slot including products
 * GET /api/v1/campaigns/slots/{id}
 */
export const useSlotDetail = (slotId: string | null) => {
    return useQuery({
        queryKey: ['campaigns', 'slots', slotId, 'detail'],
        enabled: !!slotId,
        queryFn: async () => {
            if (!slotId) return null;

            const response = await request<SlotDetailResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.SLOT_DETAIL(slotId),
                    method: 'GET',
                },
                SlotDetailResponseSchema
            );

            const slot = response.data;
            if (!slot) return null;

            // Transform nested products to UI items
            const transformedProducts: FlashSaleItem[] = (slot.products || []).map((p) => {
                const stockLimit = p.stockLimit || 1;
                const stockSold = p.stockSold || 0;
                const progress = Math.min(Math.round((stockSold / stockLimit) * 100), 100);

                return {
                    id: p.id,
                    productId: p.productId,
                    name: p.productName || 'Sản phẩm Flash Sale',
                    image: toPublicUrl(p.productThumbnail),
                    price: p.salePrice || 0,
                    originalPrice: p.originalPrice || 0,
                    discountPercentage: p.discountPercent || 0,
                    soldCount: stockSold,
                    totalStock: stockLimit,
                    stockRemaining: p.stockRemaining || 0,
                    progress: progress,
                    isSoldOut: p.isSoldOut || (p.stockRemaining === 0),
                    purchaseLimitPerUser: p.purchaseLimitPerUser,
                };
            });

            return {
                ...slot,
                transformedProducts,
            };
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};
