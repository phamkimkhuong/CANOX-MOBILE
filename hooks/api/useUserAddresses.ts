/**
 * useUserAddresses - TanStack Query hooks for User's saved addresses
 */

import { createBuyerAddress, deleteBuyerAddress, getBuyerAddresses, getCountry, setDefaultBuyerAddress, updateBuyerAddress } from '@/services/api/addressApi';
import { isSessionExpiredError } from '@/services/api/errors';
import { useAuthStore } from '@/store/useAuthStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type {
    AddressFormData,
    Country,
    CreateBuyerAddressRequest,
    ShippingAddress,
} from '@/types/address';
import { MAX_ADDRESSES } from '@/types/address';
import { toBuyerAddressListUI, toBuyerAddressUI } from '@/utils/adapter/addressAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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

/**
 * Hook fetch danh sách địa chỉ của user
 */
export const useUserAddresses = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const setAddresses = useUserAddressStore((s) => s.setAddresses);

    const query = useQuery({
        queryKey: USER_ADDRESS_KEYS.all,
        queryFn: async (): Promise<ShippingAddress[]> => {
            const response = await getBuyerAddresses();

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to fetch addresses');
            }

            return toBuyerAddressListUI(response.data);
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    // Auto-sync to zustand store
    useEffect(() => {
        if (query.data) {
            setAddresses(query.data);
        }
    }, [query.data, setAddresses]);

    return query;
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
    address: {
        detail: data.streetAddress,
        ward: data.wardName,
        district: '', // District logic not yet fully implemented in form
        province: data.provinceName,
        country: countryName,
    },
    type: data.label.toUpperCase(),
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
            return response.data; // Now returns Country[]
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
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
                const cachedCountries = queryClient.getQueryData<Country[]>(COUNTRY_KEY);
                const vnCountry = cachedCountries?.find(c => c.code === 'VN' || c.name === 'Vietnam');

                if (vnCountry?.name) {
                    countryName = vnCountry.name;
                } else {
                    const countryResponse = await getCountry();
                    if (countryResponse.success && countryResponse.data.length > 0) {
                        const firstCountry = countryResponse.data.find(c => c.code === 'VN') || countryResponse.data[0];
                        countryName = firstCountry.name;
                        queryClient.setQueryData(COUNTRY_KEY, countryResponse.data);
                    }
                }
            } catch {
                // Use default if country fetch fails
            }

            const requestData = toCreateRequest(data, countryName);
            const response = await createBuyerAddress(requestData);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to create address');
            }

            return toBuyerAddressUI(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định';
            if (isSessionExpiredError(error)) return;
            Toast.show({ type: 'error', text1: 'Thêm địa chỉ thất bại', text2: message });
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
                const cachedCountries = queryClient.getQueryData<Country[]>(COUNTRY_KEY);
                const vnCountry = cachedCountries?.find(c => c.code === 'VN' || c.name === 'Vietnam');

                if (vnCountry?.name) {
                    countryName = vnCountry.name;
                } else {
                    const countryResponse = await getCountry();
                    if (countryResponse.success && countryResponse.data.length > 0) {
                        const firstCountry = countryResponse.data.find(c => c.code === 'VN') || countryResponse.data[0];
                        countryName = firstCountry.name;
                        queryClient.setQueryData(COUNTRY_KEY, countryResponse.data);
                    }
                }
            } catch {
                // Use default if country fetch fails
            }

            const requestData = toCreateRequest(params.data, countryName);

            const response = await updateBuyerAddress(params.id, requestData);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to update address');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định';
            if (isSessionExpiredError(error)) return;
            Toast.show({ type: 'error', text1: 'Cập nhật địa chỉ thất bại', text2: message });
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

            const response = await deleteBuyerAddress(addressId);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to delete address');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định';
            if (isSessionExpiredError(error)) return;
            Toast.show({ type: 'error', text1: 'Xóa địa chỉ thất bại', text2: message });
        },
    });
};

/**
 * Hook set địa chỉ mặc định
 */
export const useSetDefaultAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (addressId: string): Promise<void> => {
            const response = await setDefaultBuyerAddress(addressId);

            if (!response.success) {
                throw new Error(response.message ?? 'Failed to set default address');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_ADDRESS_KEYS.all });
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã thiết lập địa chỉ mặc định',
            });
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định';
            if (isSessionExpiredError(error)) return;
            Toast.show({ type: 'error', text1: 'Thiết lập thất bại', text2: message });
        },
    });
};
