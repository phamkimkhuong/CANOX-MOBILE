import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { SlotDetailResponse, SlotDetailResponseSchema } from '@/types/campaign';
import { transformSlotProductsToFlashSaleItems } from '@/utils/adapter/campaign/flashSaleAdapter';
import { QueryClient, useQuery } from '@tanstack/react-query';

/**
 * Hook to get full detail of a specific Flash Sale slot including grouped products.
 * GET /api/v1/public/campaigns/slots/{id}
 */
export const getSlotDetailQueryOptions = (slotId: string | null) => ({
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

        const transformedProducts = transformSlotProductsToFlashSaleItems(slot);

        return {
            ...slot,
            transformedProducts,
        };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
});

export const prefetchSlotDetail = async (queryClient: QueryClient, slotId: string | null) => {
    if (!slotId) return;

    await queryClient.prefetchQuery(getSlotDetailQueryOptions(slotId));
};

export const useSlotDetail = (slotId: string | null) => {
    return useQuery({
        ...getSlotDetailQueryOptions(slotId),
        queryKey: ['campaigns', 'slots', slotId, 'detail'],
    });
};
