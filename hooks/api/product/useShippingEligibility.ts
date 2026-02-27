import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import { ShippingEligibilityAPIResponseSchema } from '@/types/product/productDetail';
import { useQuery } from '@tanstack/react-query';

export const checkShippingEligibility = async (productId: string, addressId: string) => {
    const response = await request(
        {
            url: API_ROUTES.PUBLIC_PRODUCTS.SHIPPING_ELIGIBILITY(productId),
            method: 'GET',
            params: { addressId }
        },
        ShippingEligibilityAPIResponseSchema
    );
    return response.data;
};

export const useProductShippingInfo = (productId: string) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addressId = useUserAddressStore((state) => state.selectedAddressId);

    const checkEligibleQuery = useQuery({
        queryKey: ['shipping-eligibility', productId, addressId],
        queryFn: () => checkShippingEligibility(productId, addressId!),
        enabled: isAuthenticated && Boolean(addressId) && Boolean(productId),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: false, // Don't retry if fails
        refetchOnWindowFocus: false, // Don't refetch on window focus
    });

    return {
        ...checkEligibleQuery,
        hasMissingAddress: isAuthenticated && !addressId,
        isGuest: !isAuthenticated,
    };
};
