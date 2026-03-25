import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ActiveSlotsResponse, ActiveSlotsResponseSchema, CampaignSlotResponse } from '@/types/campaign';
import { formatLocalDateKey, safeParseDate } from '@/utils/date';
import { QueryClient, useQuery } from '@tanstack/react-query';

const DEFAULT_UPCOMING_HOURS = 24;

export const flashSaleQueryKeys = {
    activeSlots: () => ['campaigns', 'slots', 'active'] as const,
    upcomingSlots: (hours: number = DEFAULT_UPCOMING_HOURS) => ['campaigns', 'slots', 'upcoming', hours] as const,
    slotDetail: (slotId: string | null) => ['campaigns', 'slots', slotId, 'detail'] as const,
    campaignDetail: (campaignId?: string) => ['campaigns', 'detail', campaignId] as const,
};

const fetchSlots = async (config: {
    url: string;
    params?: Record<string, string | number>;
}): Promise<CampaignSlotResponse[]> => {
    const response = await request<ActiveSlotsResponse>(
        {
            url: config.url,
            method: 'GET',
            params: config.params,
        },
        ActiveSlotsResponseSchema
    );

    return response.data?.content || [];
};

export const useActiveFlashSaleSlots = () => {
    return useQuery({
        queryKey: flashSaleQueryKeys.activeSlots(),
        queryFn: () => fetchSlots({ url: API_ROUTES.CAMPAIGNS.ACTIVE_SLOTS }),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
};

export const useUpcomingFlashSaleSlots = (hours: number = DEFAULT_UPCOMING_HOURS) => {
    return useQuery({
        queryKey: flashSaleQueryKeys.upcomingSlots(hours),
        queryFn: () => fetchSlots({
            url: API_ROUTES.CAMPAIGNS.UPCOMING_SLOTS,
            params: { hours },
        }),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
};

export const filterApprovedFlashSaleSlots = (slots: CampaignSlotResponse[]): CampaignSlotResponse[] => {
    return slots.filter((slot) => (slot.approvedProducts || 0) > 0);
};

export const sortFlashSaleSlotsByStartTime = (slots: CampaignSlotResponse[]): CampaignSlotResponse[] => {
    return [...slots].sort((a, b) => {
        return (safeParseDate(a.startTime)?.getTime() ?? 0) - (safeParseDate(b.startTime)?.getTime() ?? 0);
    });
};

export const selectBestFlashSaleSlot = (slots: CampaignSlotResponse[]): CampaignSlotResponse | null => {
    if (slots.length === 0) return null;

    const todayStr = formatLocalDateKey(new Date());

    const sorted = [...slots].sort((a, b) => {
        const dateA = a.slotDate || formatLocalDateKey(a.startTime);
        const dateB = b.slotDate || formatLocalDateKey(b.startTime);

        const isAToday = dateA === todayStr;
        const isBToday = dateB === todayStr;

        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;

        return (a.secondsUntilEnd || 0) - (b.secondsUntilEnd || 0);
    });

    return sorted[0];
};

export const selectNearestUpcomingFlashSaleSlot = (slots: CampaignSlotResponse[]): CampaignSlotResponse | null => {
    if (slots.length === 0) return null;

    return [...slots].sort((a, b) => {
        return (a.secondsUntilStart || 0) - (b.secondsUntilStart || 0);
    })[0];
};

export const selectPrimaryFlashSaleSlot = (
    activeSlots: CampaignSlotResponse[],
    upcomingSlots: CampaignSlotResponse[]
): { slot: CampaignSlotResponse; isUpcoming: boolean } | null => {
    const activeSlot = selectBestFlashSaleSlot(activeSlots);
    if (activeSlot) {
        return {
            slot: activeSlot,
            isUpcoming: false,
        };
    }

    const upcomingSlot = selectNearestUpcomingFlashSaleSlot(upcomingSlots);
    if (upcomingSlot) {
        return {
            slot: upcomingSlot,
            isUpcoming: true,
        };
    }

    return null;
};

export const refreshFlashSaleQueries = async (
    queryClient: QueryClient,
    options?: {
        slotId?: string | null;
        campaignId?: string;
        hours?: number;
    }
) => {
    const hours = options?.hours ?? DEFAULT_UPCOMING_HOURS;
    const tasks: Promise<unknown>[] = [
        queryClient.refetchQueries({
            queryKey: flashSaleQueryKeys.activeSlots(),
            exact: true,
            type: 'all',
        }),
        queryClient.refetchQueries({
            queryKey: flashSaleQueryKeys.upcomingSlots(hours),
            exact: true,
            type: 'all',
        }),
    ];

    if (options?.slotId) {
        tasks.push(queryClient.refetchQueries({
            queryKey: flashSaleQueryKeys.slotDetail(options.slotId),
            exact: true,
            type: 'all',
        }));
    }

    if (options?.campaignId) {
        tasks.push(queryClient.refetchQueries({
            queryKey: flashSaleQueryKeys.campaignDetail(options.campaignId),
            exact: true,
            type: 'all',
        }));
    }

    await Promise.all(tasks);
};
