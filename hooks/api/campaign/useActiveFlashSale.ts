import {
    filterApprovedFlashSaleSlots,
    refreshFlashSaleQueries,
    selectPrimaryFlashSaleSlot,
    useActiveFlashSaleSlots,
    useUpcomingFlashSaleSlots,
} from '@/hooks/api/campaign/useFlashSaleDataSource';
import { FlashSaleData } from '@/types/home';
import { transformSlotProductsToFlashSaleItems } from '@/utils/adapter/campaign/flashSaleAdapter';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSlotDetail } from './useSlotDetail';

/**
 * Hook get active flash sale for Home screen
 * Logic:
 * 1. Fetch active slots → if found, show best active slot with countdown to endTime
 * 2. If NO active slot → fallback to upcoming (24h) with approvedProducts > 0
 *    → show nearest upcoming slot with countdown to startTime
 */
export const useActiveFlashSale = () => {
    const { t } = useTranslation('home');
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

        const items =
            slotDetailQuery.data.transformedProducts ||
            transformSlotProductsToFlashSaleItems(slotDetailQuery.data);
        if (items.length === 0) return null;

        return {
            slot: {
                id: selectedSlot.id,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                label: selectedSlot.slotName || (primarySlot?.isUpcoming ? t('flashSale.statusUpcoming') : t('flashSale.statusLive')),
                secondsUntilStart: selectedSlot.secondsUntilStart || 0,
                secondsUntilEnd: selectedSlot.secondsUntilEnd || 0,
                isUpcoming: primarySlot?.isUpcoming ?? false,
            },
            items,
        };
    }, [primarySlot?.isUpcoming, selectedSlot, slotDetailQuery.data, t]);

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
