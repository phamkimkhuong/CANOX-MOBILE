import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ActiveSlotsResponse, ActiveSlotsResponseSchema, SlotProductsResponse, SlotProductsResponseSchema } from '@/types/campaign';
import { FlashSaleData, FlashSaleItem } from '@/types/home';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook get active flash sale
 */
export const useActiveFlashSale = () => {
    return useQuery({
        queryKey: ['campaigns', 'slots', 'active'],
        queryFn: async (): Promise<FlashSaleData | null> => {
            // Get active slots
            const slotResponse = await request<ActiveSlotsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.ACTIVE_SLOTS,
                    method: 'GET',
                },
                ActiveSlotsResponseSchema
            );

            const activeSlots = slotResponse.data || [];
            if (activeSlots.length === 0) return null;

            // Select the "Best Slot" using priority logic:
            const todayStr = new Date().toISOString().split('T')[0];

            const sortedSlots = [...activeSlots].sort((a, b) => {
                // Fallback to startTime if slotDate is missing
                const dateA = a.slotDate || a.startTime.split('T')[0];
                const dateB = b.slotDate || b.startTime.split('T')[0];

                const isAToday = dateA === todayStr;
                const isBToday = dateB === todayStr;

                // Today's slots come first
                if (isAToday && !isBToday) return -1;
                if (!isAToday && isBToday) return 1;

                // Earlier end time (secondsUntilEnd asc)
                return (a.secondsUntilEnd || 0) - (b.secondsUntilEnd || 0);
            });

            const slot = sortedSlots[0];

            // Fetch products for this slot
            const productsResponse = await request<SlotProductsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.SLOT_PRODUCTS(slot.id),
                    method: 'GET',
                    params: {
                        page: 0,
                        size: 10,
                    }
                },
                SlotProductsResponseSchema
            );

            const products = productsResponse.data?.content || [];
            if (products.length === 0) return null;

            // Transform data
            const transformedItems: FlashSaleItem[] = products.map((p) => {
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
                };
            });

            return {
                slot: {
                    id: slot.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    label: slot.slotName || 'Đang diễn ra',
                },
                items: transformedItems,
            };
        },
        staleTime: 1000 * 60 * 1, // Refresh 1 minute
    });
};
