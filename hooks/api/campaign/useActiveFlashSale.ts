import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ActiveSlotsResponse, ActiveSlotsResponseSchema, CampaignSlotResponse, SlotDetailResponse, SlotDetailResponseSchema } from '@/types/campaign';
import { FlashSaleData, FlashSaleItem } from '@/types/home';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Transform slot detail products into FlashSaleItem[]
 */
const transformSlotProducts = (slot: SlotDetailResponse['data']): FlashSaleItem[] => {
    if (!slot?.products) return [];

    return slot.products.flatMap((product) => {
        const representativeVariant = product.variants?.[0];
        if (!representativeVariant) return [];

        const stockLimit = representativeVariant.stockLimit || 1;
        const stockSold = representativeVariant.stockSold || 0;
        const stockRemaining = representativeVariant.stockRemaining || 0;
        const progress = Math.min(Math.round((stockSold / stockLimit) * 100), 100);

        return [{
            id: product.productId,
            productId: product.productId,
            name: product.productName || 'Sản phẩm Flash Sale',
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
};

/**
 * Select the best slot from a list using priority logic:
 * 1. Today's slots first
 * 2. Earlier endTime (for active) or startTime (for upcoming)
 */
const selectBestSlot = (slots: CampaignSlotResponse[]): CampaignSlotResponse | null => {
    if (slots.length === 0) return null;

    const todayStr = new Date().toISOString().split('T')[0];

    const sorted = [...slots].sort((a, b) => {
        const dateA = a.slotDate || a.startTime.split('T')[0];
        const dateB = b.slotDate || b.startTime.split('T')[0];

        const isAToday = dateA === todayStr;
        const isBToday = dateB === todayStr;

        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;

        // Closer to start/end comes first
        return (a.secondsUntilEnd || 0) - (b.secondsUntilEnd || 0);
    });

    return sorted[0];
};

/**
 * Hook get active flash sale for Home screen
 * Logic:
 * 1. Fetch active slots → if found, show best active slot with countdown to endTime
 * 2. If NO active slot → fallback to upcoming (24h) with approvedProducts > 0
 *    → show nearest upcoming slot with countdown to startTime
 */
export const useActiveFlashSale = () => {
    return useQuery({
        queryKey: ['campaigns', 'slots', 'active-or-upcoming'],
        queryFn: async (): Promise<FlashSaleData | null> => {
            // Step 1: Get active slots
            const activeResponse = await request<ActiveSlotsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.ACTIVE_SLOTS,
                    method: 'GET',
                },
                ActiveSlotsResponseSchema
            );

            const activeSlots = activeResponse.data?.content || [];

            // Step 2: If active slots found, use the best one (original logic)
            if (activeSlots.length > 0) {
                const slot = selectBestSlot(activeSlots);
                if (!slot) return null;

                // Fetch slot detail (includes products grouped by product)
                const detailResponse = await request<SlotDetailResponse>(
                    {
                        url: API_ROUTES.CAMPAIGNS.SLOT_DETAIL(slot.id),
                        method: 'GET',
                    },
                    SlotDetailResponseSchema
                );

                const items = transformSlotProducts(detailResponse.data);
                if (items.length === 0) return null;

                return {
                    slot: {
                        id: slot.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        label: slot.slotName || 'Đang diễn ra',
                        isUpcoming: false,
                    },
                    items,
                };
            }

            // Step 3: No active slot → fallback to upcoming (24h) with approvedProducts > 0
            const upcomingResponse = await request<ActiveSlotsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.UPCOMING_SLOTS,
                    method: 'GET',
                    params: { hours: 24 },
                },
                ActiveSlotsResponseSchema
            );

            const upcomingSlots = (upcomingResponse.data?.content || [])
                .filter(s => (s.approvedProducts || 0) > 0);

            if (upcomingSlots.length === 0) return null;

            // Select nearest upcoming slot (smallest secondsUntilStart)
            const nearestUpcoming = [...upcomingSlots].sort(
                (a, b) => (a.secondsUntilStart || 0) - (b.secondsUntilStart || 0)
            )[0];

            // Fetch slot detail for products
            const detailResponse = await request<SlotDetailResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.SLOT_DETAIL(nearestUpcoming.id),
                    method: 'GET',
                },
                SlotDetailResponseSchema
            );

            const items = transformSlotProducts(detailResponse.data);
            if (items.length === 0) return null;

            return {
                slot: {
                    id: nearestUpcoming.id,
                    startTime: nearestUpcoming.startTime,
                    endTime: nearestUpcoming.endTime,
                    label: nearestUpcoming.slotName || 'Sắp diễn ra',
                    isUpcoming: true,
                },
                items,
            };
        },
        staleTime: 1000 * 60 * 1, // Refresh 1 minute
    });
};
