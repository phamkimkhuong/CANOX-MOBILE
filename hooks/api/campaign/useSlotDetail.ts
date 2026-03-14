import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { SlotDetailResponse, SlotDetailResponseSchema } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get full detail of a specific Flash Sale slot including grouped products.
 * GET /api/v1/public/campaigns/slots/{id}
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

            // One product card per product; use the first variant as the representative item.
            const transformedProducts: FlashSaleItem[] = (slot.products || []).flatMap((product) => {
                const representativeVariant = product.variants?.[0];
                if (!representativeVariant) return [];

                const stockLimit = representativeVariant.stockLimit || 1;
                const stockSold = representativeVariant.stockSold || 0;
                const stockRemaining = representativeVariant.stockRemaining || 0;
                const progress = Math.min(Math.round((stockSold / stockLimit) * 100), 100);

                return [{
                    id: product.productId,
                    productId: product.productId,
                    name: product.productName || 'San pham Flash Sale',
                    image: toPublicUrl(product.productThumbnailUrl || representativeVariant.variantImagePath),
                    price: representativeVariant.salePrice || 0,
                    originalPrice: representativeVariant.originalPrice || 0,
                    discountPercentage: representativeVariant.discountPercent || 0,
                    soldCount: stockSold,
                    totalStock: stockLimit,
                    stockRemaining,
                    progress,
                    isSoldOut: representativeVariant.isSoldOut || stockRemaining === 0,
                }];
            });

            return {
                ...slot,
                transformedProducts,
            };
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};
