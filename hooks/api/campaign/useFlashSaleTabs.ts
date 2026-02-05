import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ActiveSlotsResponse, ActiveSlotsResponseSchema, SlotStatus } from '@/types/campaign';
import { useQuery } from '@tanstack/react-query';

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
    return useQuery({
        queryKey: ['campaigns', 'slots', 'all'],
        queryFn: async (): Promise<FlashSaleTab[]> => {
            // Get active slots
            const activeResponse = await request<ActiveSlotsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.ACTIVE_SLOTS,
                    method: 'GET',
                },
                ActiveSlotsResponseSchema
            );

            // Get upcoming slots (next 24 hours)
            const upcomingResponse = await request<ActiveSlotsResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.UPCOMING_SLOTS,
                    method: 'GET',
                    params: { hours: 24 }
                },
                ActiveSlotsResponseSchema
            );

            // Filter out slots that have no approved products to avoid empty tabs
            const activeSlots = (activeResponse.data || []).filter(slot => (slot.approvedProducts || 0) > 0);
            const upcomingSlots = (upcomingResponse.data || []).filter(slot => (slot.approvedProducts || 0) > 0);

            // Combine and sort
            const allSlots = [...activeSlots, ...upcomingSlots].sort((a, b) => {
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            });

            // Map to UI Tabs
            return allSlots.map((slot) => {
                const startTime = new Date(slot.startTime);
                const hour = startTime.getHours().toString().padStart(2, '0');
                const minute = startTime.getMinutes().toString().padStart(2, '0');

                let label = `${hour}:${minute}`;
                const now = new Date();

                // If it's another day, add date
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
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
