import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ShopLoyaltyPolicyResponseSchema } from '@/types/loyalty/loyaltySchema';
import { ShopLoyaltyPolicyUI } from '@/types/loyalty/ui';
import { transformShopLoyaltyPolicy } from '@/utils/adapter/loyaltyAdapter';
import { useQuery } from '@tanstack/react-query';

export const publicLoyaltyQueryKeys = {
    all: ['public-loyalty'] as const,
    shopPolicy: (shopId: string) => [...publicLoyaltyQueryKeys.all, 'shop-policy', shopId] as const,
};

export const usePublicShopLoyaltyPolicy = (
    shopId: string | undefined,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: publicLoyaltyQueryKeys.shopPolicy(shopId || ''),
        queryFn: async (): Promise<ShopLoyaltyPolicyUI> => {
            const response = await request(
                {
                    url: API_ROUTES.PUBLIC_LOYALTY.SHOP_POLICY(shopId!),
                    method: 'GET',
                },
                ShopLoyaltyPolicyResponseSchema
            );

            return transformShopLoyaltyPolicy(response.data);
        },
        enabled: (options?.enabled ?? true) && !!shopId,
        staleTime: 1000 * 60 * 10,
    });
};
