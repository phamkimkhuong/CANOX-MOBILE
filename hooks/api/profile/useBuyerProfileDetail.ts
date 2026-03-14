import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    BuyerProfileDetailResponse,
    BuyerProfileDetailResponseSchema,
} from '@/types/user';
import {
    BuyerProfileDetailUI,
    transformBuyerProfileDetail,
} from '@/utils/adapter/userAdapter';
import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from './useProfile';

/**
 * Hook to fetch buyer profile detail for edit-profile screens.
 * Source of truth: GET /api/v1/buyers/me
 */
export const useBuyerProfileDetail = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: profileQueryKeys.buyerDetail(),
        queryFn: async (): Promise<BuyerProfileDetailUI> => {
            const response = await request<BuyerProfileDetailResponse>(
                {
                    url: API_ROUTES.BUYERS_INFORMATION.DETAIL,
                    method: 'GET',
                },
                BuyerProfileDetailResponseSchema
            );

            return transformBuyerProfileDetail(response.data);
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
};
