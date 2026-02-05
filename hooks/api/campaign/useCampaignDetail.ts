import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { CampaignDetailResponse, CampaignDetailResponseSchema, CampaignResponse } from '@/types/campaign';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get campaign detail (for banners, decorations)
 * @param id Campaign ID
 */
export const useCampaignDetail = (id?: string) => {
    return useQuery({
        queryKey: ['campaigns', 'detail', id],
        queryFn: async (): Promise<CampaignResponse | null> => {
            if (!id) return null;

            const response = await request<CampaignDetailResponse>(
                {
                    url: API_ROUTES.CAMPAIGNS.DETAIL(id),
                    method: 'GET',
                },
                CampaignDetailResponseSchema
            );

            return response.data || null;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 30, // 30 minutes (campaign banners don't change often)
    });
};
