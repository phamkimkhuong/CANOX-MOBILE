import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { ShopLoyaltyPreviewResponseSchema } from '@/types/loyalty/loyaltySchema';
import { ShopLoyaltyPolicyUI } from '@/types/loyalty/ui';
import { transformShopLoyaltyPreview } from '@/utils/adapter/loyaltyAdapter';
import { useQuery } from '@tanstack/react-query';

export const publicLoyaltyQueryKeys = {
    all: ['public-loyalty'] as const,
    shopPolicy: (shopId: string) => [...publicLoyaltyQueryKeys.all, 'shop-policy', shopId] as const,
};

export const usePublicShopLoyaltyPolicy = (
    shopId: string | undefined,
    options?: { 
        enabled?: boolean;
        shopName?: string;
        shopLogo?: string | null;
    }
) => {
    return useQuery({
        queryKey: publicLoyaltyQueryKeys.shopPolicy(shopId || ''),
        queryFn: async (): Promise<ShopLoyaltyPolicyUI> => {
            const response = await request(
                {
                    url: API_ROUTES.PUBLIC_LOYALTY.SHOP_POLICY(shopId!),
                    method: 'GET',
                },
                ShopLoyaltyPreviewResponseSchema
            );

            return transformShopLoyaltyPreview(
                response.data,
                shopId!,
                options?.shopName || 'Cửa hàng',
                options?.shopLogo || ''
            );
        },
        enabled: (options?.enabled ?? true) && !!shopId,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
