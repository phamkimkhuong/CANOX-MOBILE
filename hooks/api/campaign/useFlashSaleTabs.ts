import {
    filterApprovedFlashSaleSlots,
    sortFlashSaleSlotsByStartTime,
    useActiveFlashSaleSlots,
    useUpcomingFlashSaleSlots,
} from '@/hooks/api/campaign/useFlashSaleDataSource';
import { SlotStatus } from '@/types/campaign';
import { useMemo } from 'react';

export interface FlashSaleTab {
    id: string;
    campaignId?: string;
    label: string;
    status: SlotStatus;
    startTime: string;
    endTime: string;
    isActive: boolean;
    secondsUntilStart: number;
    secondsUntilEnd: number;
}

/**
 * Hook to get all slots for Flash Sale screen (Active & Upcoming)
 */
export const useFlashSaleTabs = () => {
    const activeQuery = useActiveFlashSaleSlots();
    const upcomingQuery = useUpcomingFlashSaleSlots(24);

    const data = useMemo<FlashSaleTab[]>(() => {
        const activeSlots = filterApprovedFlashSaleSlots(activeQuery.data || []);
        const upcomingSlots = filterApprovedFlashSaleSlots(upcomingQuery.data || []);
        const allSlots = sortFlashSaleSlotsByStartTime([...activeSlots, ...upcomingSlots]);

        return allSlots.map((slot) => {
            const startTime = new Date(slot.startTime);
            const hour = startTime.getHours().toString().padStart(2, '0');
            const minute = startTime.getMinutes().toString().padStart(2, '0');

            let label = `${hour}:${minute}`;
            const now = new Date();

            if (startTime.toDateString() !== now.toDateString()) {
                label = `${startTime.getDate()}/${startTime.getMonth() + 1} ${label}`;
            }

            return {
                id: slot.id,
                campaignId: slot.campaignId || undefined,
                label,
                status: (slot.status as SlotStatus) || SlotStatus.UPCOMING,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.status === SlotStatus.ACTIVE,
                secondsUntilStart: slot.secondsUntilStart || 0,
                secondsUntilEnd: slot.secondsUntilEnd || 0,
            };
        });
    }, [activeQuery.data, upcomingQuery.data]);

    const refetch = async () => {
        await Promise.all([
            activeQuery.refetch(),
            upcomingQuery.refetch(),
        ]);
    };

    return {
        data,
        isLoading: activeQuery.isLoading || upcomingQuery.isLoading,
        isFetching: activeQuery.isFetching || upcomingQuery.isFetching,
        isError: activeQuery.isError || upcomingQuery.isError,
        refetch,
    };
};
