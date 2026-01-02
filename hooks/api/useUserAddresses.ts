/**
 * useUserAddresses - TanStack Query hooks for User's saved addresses
 */

import { createBuyerAddress, deleteBuyerAddress, getBuyerAddresses, getCountry, updateBuyerAddress } from '@/services/api/addressApi';
import { useAuthStore } from '@/store/useAuthStore';
import type {
    AddressFormData,
    CreateBuyerAddressRequest,
    ShippingAddress,
} from '@/types/address';
import { MAX_ADDRESSES } from '@/types/address';
import { toBuyerAddressListUI, toBuyerAddressUI } from '@/utils/adapter/addressAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// ============================================
// QUERY KEYS
// ============================================

export const USER_ADDRESS_KEYS = {
    all: ['user-addresses'] as const,
    detail: (id: string) => ['user-addresses', id] as const,
} as const;

export const COUNTRY_KEY = ['country'] as const;

// Default fallback nếu API country fail
const DEFAULT_COUNTRY_NAME = 'Việt Nam';

// ============================================
// HOOKS
// ============================================

/**
 * Hook fetch danh sách địa chỉ của user
 */
export const useUserAddresses = () => {
    const buyerId = useAuthStore((state) => state.buyerId);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: USER_ADDRESS_KEYS.all,
        queryFn: async (): Promise<ShippingAddress[]> => {
            if (!buyerId) {
                throw new Error('User not authenticated or buyerId not found');
            }

            const response = await getBuyerAddresses(buyerId);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to fetch addresses');
            }

            return toBuyerAddressListUI(response.data);
        },
        enabled: isAuthenticated && !!buyerId,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook lấy địa chỉ mặc định
 */
export const useDefaultAddress = () => {
    const { data: addresses, ...rest } = useUserAddresses();

    const defaultAddress = addresses?.find((addr) => addr.isDefault) ?? null;

    return {
        ...rest,
        data: defaultAddress,
    };
};

/**
 * Hook kiểm tra có thể thêm địa chỉ mới không
 * Trả về { canAdd, currentCount, maxCount }
 */
export const useCanAddAddress = () => {
    const { data: addresses, isLoading } = useUserAddresses();

    const currentCount = addresses?.length ?? 0;
    const canAdd = currentCount < MAX_ADDRESSES;

    return {
        canAdd,
        currentCount,
        maxCount: MAX_ADDRESSES,
        isLoading,
    };
};

/**
 * Helper function để check và show toast nếu đạt limit
 * Sử dụng trước khi navigate đến form thêm địa chỉ
 */
export const checkAddressLimitAndShowToast = (
    currentCount: number,
    maxCount: number = MAX_ADDRESSES
): boolean => {
    if (currentCount >= maxCount) {
        Toast.show({
            type: 'error',
            text1: 'Đã đạt giới hạn địa chỉ',
            text2: `Bạn chỉ có thể lưu tối đa ${maxCount} địa chỉ. Vui lòng xóa bớt để thêm mới.`,
        });
        return false;
    }
    return true;
};

/**
 * Transform AddressFormData (UI) → CreateBuyerAddressRequest (API)
 */
const toCreateRequest = (data: AddressFormData, countryName: string): CreateBuyerAddressRequest => ({
    recipientName: data.recipientName,
    phone: data.phone,
    detailAddress: data.streetAddress,
    ward: data.wardName,
    district: '',
    province: data.provinceName,
    country: countryName,
    districtNameOld: '',
    provinceNameOld: data.provinceName,
    wardNameOld: data.wardName,
    type: data.label.toUpperCase() as 'HOME' | 'WORK' | 'OTHER',
    isDefault: data.isDefault,
});

/**
 * Hook fetch country - cached with long staleTime
 */
export const useCountry = () => {
    return useQuery({
        queryKey: COUNTRY_KEY,
        queryFn: async () => {
            const response = await getCountry();
            if (!response.success) {
                throw new Error(response.message ?? 'Failed to fetch country');
            }
            return response.data;
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours - country rarely changes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
};

/**
 * Hook thêm địa chỉ mới
 * Fetches country name automatically before creating
 */
export const useAddAddress = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

    return useMutation({
        mutationFn: async (data: AddressFormData): Promise<ShippingAddress> => {
            if (!buyerId) {
                throw new Error('User not authenticated');
            }

            // Get country name from cache or fetch
            let countryName = DEFAULT_COUNTRY_NAME;
            try {
                const cachedCountry = queryClient.getQueryData<{ name: string }>(COUNTRY_KEY);
                if (cachedCountry?.name) {
                    countryName = cachedCountry.name;
                } else {
                    const countryResponse = await getCountry();
                    if (countryResponse.success) {
                        countryName = countryResponse.data.name;
                        queryClient.setQueryData(COUNTRY_KEY, countryResponse.data);
                    }
                }
            } catch {
                // Use default if country fetch fails
            }

            const requestData = toCreateRequest(data, countryName);
            const response = await createBuyerAddress(buyerId, requestData);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to create address');
            }

            return toBuyerAddressUI(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
            Toast.show({
                type: 'success',
                text1: 'Thêm địa chỉ thành công',
            });
        },
        onError: (error: Error) => {
            Toast.show({
                type: 'error',
                text1: 'Thêm địa chỉ thất bại',
                text2: error.message,
            });
        },
    });
};

/**
 * Hook cập nhật địa chỉ
 */
export const useUpdateAddress = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

    return useMutation({
        mutationFn: async (params: {
            id: string;
            data: AddressFormData;
        }): Promise<void> => {
            if (!buyerId) {
                throw new Error('User not authenticated');
            }

            // Get country name from cache or fetch
            let countryName = DEFAULT_COUNTRY_NAME;
            try {
                const cachedCountry = queryClient.getQueryData<{ name: string }>(COUNTRY_KEY);
                if (cachedCountry?.name) {
                    countryName = cachedCountry.name;
                } else {
                    const countryResponse = await getCountry();
                    if (countryResponse.success) {
                        countryName = countryResponse.data.name;
                        queryClient.setQueryData(COUNTRY_KEY, countryResponse.data);
                    }
                }
            } catch {
                // Use default if country fetch fails
            }

            const requestData = toCreateRequest(params.data, countryName);

            const response = await updateBuyerAddress(buyerId, params.id, requestData);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to update address');
            }

        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
            Toast.show({
                type: 'success',
                text1: 'Cập nhật địa chỉ thành công',
            });
        },
        onError: (error: Error) => {
            Toast.show({
                type: 'error',
                text1: 'Cập nhật địa chỉ thất bại',
                text2: error.message,
            });
        },
    });
};

/**
 * Hook xóa địa chỉ
 */
export const useDeleteAddress = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

    return useMutation({
        mutationFn: async (addressId: string): Promise<void> => {
            if (!buyerId) {
                throw new Error('User not authenticated');
            }

            const response = await deleteBuyerAddress(buyerId, addressId);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to delete address');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
            Toast.show({
                type: 'success',
                text1: 'Xóa địa chỉ thành công',
            });
        },
        onError: (error: Error) => {
            Toast.show({
                type: 'error',
                text1: 'Xóa địa chỉ thất bại',
                text2: error.message,
            });
        },
    });
};

/**
 * Hook set địa chỉ mặc định
 * TODO: Implement when SET_DEFAULT API is ready
 */
export const useSetDefaultAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (_id: string): Promise<string> => {
            throw new Error('Set default address API not implemented yet');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
        },
    });
};
