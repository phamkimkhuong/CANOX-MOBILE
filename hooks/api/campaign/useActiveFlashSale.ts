import {
    filterApprovedFlashSaleSlots,
    refreshFlashSaleQueries,
    selectPrimaryFlashSaleSlot,
    useActiveFlashSaleSlots,
    useUpcomingFlashSaleSlots,
} from '@/hooks/api/campaign/useFlashSaleDataSource';
import { SlotDetailResponse } from '@/types/campaign';
import { FlashSaleData, FlashSaleItem } from '@/types/home';
import { buildImageUrl } from '@/utils/url';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useSlotDetail } from './useSlotDetail';

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
            image: buildImageUrl(product.productThumbnailUrl || representativeVariant.variantImagePath, null, 'thumb'),
            rating: product.averageRating || 0,
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
 * Hook get active flash sale for Home screen
 * Logic:
 * 1. Fetch active slots → if found, show best active slot with countdown to endTime
 * 2. If NO active slot → fallback to upcoming (24h) with approvedProducts > 0
 *    → show nearest upcoming slot with countdown to startTime
 */
export const useActiveFlashSale = () => {
    const queryClient = useQueryClient();
    const activeQuery = useActiveFlashSaleSlots();
    const upcomingQuery = useUpcomingFlashSaleSlots(24);

    const activeSlots = useMemo(() => {
        return filterApprovedFlashSaleSlots(activeQuery.data || []);
    }, [activeQuery.data]);

    const upcomingSlots = useMemo(() => {
        return filterApprovedFlashSaleSlots(upcomingQuery.data || []);
    }, [upcomingQuery.data]);

    const primarySlot = useMemo(() => {
        return selectPrimaryFlashSaleSlot(activeSlots, upcomingSlots);
    }, [activeSlots, upcomingSlots]);

    const selectedSlot = primarySlot?.slot ?? null;
    const selectedSlotId = selectedSlot?.id ?? null;
    const slotDetailQuery = useSlotDetail(selectedSlotId);

    const data = useMemo<FlashSaleData | null>(() => {
        if (!selectedSlot || !slotDetailQuery.data) return null;

        const items = slotDetailQuery.data.transformedProducts || transformSlotProducts(slotDetailQuery.data);
        if (items.length === 0) return null;

        return {
            slot: {
                id: selectedSlot.id,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                label: selectedSlot.slotName || (primarySlot?.isUpcoming ? 'Sắp diễn ra' : 'Đang diễn ra'),
                secondsUntilStart: selectedSlot.secondsUntilStart || 0,
                secondsUntilEnd: selectedSlot.secondsUntilEnd || 0,
                isUpcoming: primarySlot?.isUpcoming ?? false,
            },
            items,
        };
    }, [primarySlot?.isUpcoming, selectedSlot, slotDetailQuery.data]);

    const refetch = useCallback(async () => {
        await refreshFlashSaleQueries(queryClient, {
            slotId: selectedSlotId,
            hours: 24,
        });
    }, [queryClient, selectedSlotId]);

    return {
        data,
        isLoading: (activeQuery.isLoading || upcomingQuery.isLoading) || (!!selectedSlotId && slotDetailQuery.isLoading),
        isFetching: activeQuery.isFetching || upcomingQuery.isFetching || slotDetailQuery.isFetching,
        isError: activeQuery.isError || upcomingQuery.isError || slotDetailQuery.isError,
        refetch,
    };
};
