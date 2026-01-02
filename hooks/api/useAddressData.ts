/**
 * useAddressData - TanStack Query hooks for Address location data
 * 
 * Features:
 * - useInfiniteQuery for pagination + search
 * - Debounced search để tránh spam API
 * - Smart caching với staleTime
 * - enabled flag để control fetch timing
 */

import { useDebounce } from '@/hooks/useDebounce';
import { getProvinces, getWardsByProvince } from '@/services/api/addressApi';
import type { Province, Ward } from '@/types/address';
import { useInfiniteQuery } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const ADDRESS_QUERY_KEYS = {
    provinces: (search: string) => ['provinces', search] as const,
    wards: (provinceCode: string, search: string) =>
        ['wards', provinceCode, search] as const,
} as const;

const DEBOUNCE_DELAY = 300; // ms - Delay search để tránh spam
const STALE_TIME = 1000 * 60 * 30; // 30 phút - Dữ liệu hành chính ít thay đổi

// ============================================
// HOOKS
// ============================================

interface UseProvincesOptions {
    /** Search text (sẽ được debounce) */
    search?: string;
    /** Enable/disable query */
    enabled?: boolean;
}

/**
 * Hook fetch danh sách Tỉnh/Thành phố với infinite scroll + search
 */
export const useProvinces = (options: UseProvincesOptions = {}) => {
    const { search = '', enabled = true } = options;

    // Debounce search để user gõ xong mới gọi API
    const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);

    return useInfiniteQuery({
        queryKey: ADDRESS_QUERY_KEYS.provinces(debouncedSearch),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await getProvinces({
                page: pageParam,
                search: debouncedSearch || undefined,
            });
            return response;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            // Trả về page tiếp theo nếu còn data, undefined nếu hết
            if (lastPage.data.hasNext) {
                return lastPage.data.nextPage;
            }
            return undefined;
        },
        enabled,
        staleTime: STALE_TIME,
        // Cache tỉnh lâu hơn vì ít thay đổi
        gcTime: 1000 * 60 * 60, // 1 giờ
    });
};

interface UseWardsOptions {
    provinceCode: string | null;
    search?: string;
    /** Enable/disable query */
    enabled?: boolean;
}

/**
 * Hook fetch danh sách Phường/Xã với infinite scroll + search
 * Chỉ fetch khi có provinceCode (cascading dependency)
 */
export const useWards = (options: UseWardsOptions) => {
    const { provinceCode, search = '', enabled = true } = options;

    // Debounce search
    const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);

    // Chỉ enable khi có provinceCode
    const isEnabled = enabled && !!provinceCode;

    return useInfiniteQuery({
        queryKey: ADDRESS_QUERY_KEYS.wards(provinceCode ?? '', debouncedSearch),
        queryFn: async ({ pageParam = 0 }) => {
            if (!provinceCode) {
                throw new Error('Province code is required');
            }

            const response = await getWardsByProvince(provinceCode, {
                page: pageParam,
                search: debouncedSearch || undefined,
            });
            return response;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.data.hasNext) {
                return lastPage.data.nextPage;
            }
            return undefined;
        },
        enabled: isEnabled,
        staleTime: STALE_TIME,
        gcTime: 1000 * 60 * 30, // 30 phút
    });
};

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Flatten provinces từ infinite query pages
 */
export const useFlattenedProvinces = (options: UseProvincesOptions = {}) => {
    const query = useProvinces(options);

    const provinces: Province[] =
        query.data?.pages.flatMap((page) => page.data.content) ?? [];

    return {
        ...query,
        provinces,
        totalCount: query.data?.pages[0]?.data.totalElements ?? 0,
    };
};

/**
 * Flatten wards từ infinite query pages
 */
export const useFlattenedWards = (options: UseWardsOptions) => {
    const query = useWards(options);

    const wards: Ward[] =
        query.data?.pages.flatMap((page) => page.data.content) ?? [];

    return {
        ...query,
        wards,
        totalCount: query.data?.pages[0]?.data.totalElements ?? 0,
    };
};
