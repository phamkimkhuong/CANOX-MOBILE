/**
 * useAddressData - TanStack Query hooks for Address location data
 * 
 * Features:
 * - useQuery for non-paginated data (BE updated)
 * - Debounced search để tránh spam API
 * - Smart caching với staleTime
 * - enabled flag để control fetch timing
 */

import { useDebounce } from '@/hooks/useDebounce';
import {
    autocompleteAddress,
    geocodeAddress,
    getCountry,
    getDistance,
    getProvinceDetail,
    getProvinces,
    getWardsByProvince
} from '@/services/api/addressApi';
import { useQuery } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const ADDRESS_QUERY_KEYS = {
    countries: (search: string) => ['countries', search] as const,
    provinces: (search: string) => ['provinces', search] as const,
    provinceDetail: (code: string) => ['province', code] as const,
    wards: (provinceCode: string, search: string) =>
        ['wards', provinceCode, search] as const,
    autocomplete: (query: string, language: string, countryCode?: string) =>
        ['address-autocomplete', query, language, countryCode] as const,
    geocode: (address: string, language: string) => ['address-geocode', address, language] as const,
    distance: (fromLat: number, fromLng: number, toLat: number, toLng: number) =>
        ['address-distance', fromLat, fromLng, toLat, toLng] as const,
} as const;

const DEBOUNCE_DELAY = 800; // ms - Tăng lên 800ms để đợi người dùng gõ xong cụm từ
const STALE_TIME = 1000 * 60 * 30; // 30 phút - Dữ liệu hành chính ít thay đổi
const INTERACTIVE_STALE_TIME = 1000 * 60 * 5; // 5 phút cho các API tương tác

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
 * Hook fetch danh sách Quốc gia
 */
export const useCountries = (options: UseProvincesOptions = {}) => {
    const { search = '', enabled = true } = options;
    const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);

    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.countries(debouncedSearch),
        queryFn: getCountry,
        enabled,
        staleTime: STALE_TIME,
        gcTime: 1000 * 60 * 60 * 24, // 24 giờ
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook fetch danh sách Tỉnh/Thành phố
 */
export const useProvinces = (options: UseProvincesOptions = {}) => {
    const { search = '', enabled = true } = options;
    const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);

    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.provinces(debouncedSearch),
        queryFn: () => getProvinces({ search: debouncedSearch || undefined }),
        enabled,
        staleTime: STALE_TIME,
        gcTime: 1000 * 60 * 60, // 1 giờ
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook fetch chi tiết Tỉnh/Thành phố
 */
export const useProvinceDetail = (code: string | null, enabled = true) => {
    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.provinceDetail(code ?? ''),
        queryFn: () => {
            if (!code) throw new Error('Province code is required');
            return getProvinceDetail(code);
        },
        enabled: enabled && !!code,
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

interface UseWardsOptions {
    provinceCode: string | null;
    search?: string;
    /** Enable/disable query */
    enabled?: boolean;
}

/**
 * Hook fetch danh sách Phường/Xã
 * Chỉ fetch khi có provinceCode (cascading dependency)
 */
export const useWards = (options: UseWardsOptions) => {
    const { provinceCode, search = '', enabled = true } = options;
    const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
    const isEnabled = enabled && !!provinceCode;

    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.wards(provinceCode ?? '', debouncedSearch),
        queryFn: () => {
            if (!provinceCode) throw new Error('Province code is required');
            return getWardsByProvince(provinceCode, { search: debouncedSearch || undefined });
        },
        enabled: isEnabled,
        staleTime: STALE_TIME,
        gcTime: 1000 * 60 * 30, // 30 phút
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook suggest addresses as user types (Mapbox)
 */
export const useAddressAutocomplete = (
    query: string,
    language: string = 'vi',
    options: { enabled?: boolean; limit?: number; countryCode?: string } = {}
) => {
    const { enabled = true, limit = 5, countryCode } = options;
    const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.autocomplete(debouncedQuery, language, countryCode ?? ''),
        queryFn: () => autocompleteAddress(debouncedQuery, language, limit, countryCode),
        enabled: enabled && debouncedQuery.length >= 3, // Chỉ gợi ý khi gõ từ 3 ký tự
        staleTime: INTERACTIVE_STALE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook get latitude/longitude from an address (Mapbox)
 */
export const useAddressGeocode = (
    address: string,
    language: string = 'vi',
    enabled: boolean = false
) => {
    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.geocode(address, language),
        queryFn: () => geocodeAddress(address, language),
        enabled: enabled && !!address,
        staleTime: INTERACTIVE_STALE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook calculate driving distance between two points (Mapbox)
 */
export const useDistanceCalculation = (params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    enabled?: boolean;
}) => {
    const { fromLat, fromLng, toLat, toLng, enabled = false } = params;

    return useQuery({
        queryKey: ADDRESS_QUERY_KEYS.distance(fromLat, fromLng, toLat, toLng),
        queryFn: () => getDistance(fromLat, fromLng, toLat, toLng),
        enabled: enabled && !!(fromLat && fromLng && toLat && toLng),
        staleTime: INTERACTIVE_STALE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

// ============================================
// HELPER HOOKS (Maintain compatibility)
// ============================================

/**
 * Provides flattened provinces array (Legacy support)
 */
export const useFlattenedProvinces = (options: UseProvincesOptions = {}) => {
    const query = useProvinces(options);
    const provinces = query.data?.data ?? [];

    return {
        ...query,
        provinces,
        totalCount: provinces.length,
    };
};

/**
 * Provides flattened countries array
 */
export const useFlattenedCountries = (options: UseProvincesOptions = {}) => {
    const query = useCountries(options);
    const countries = query.data?.data ?? [];

    return {
        ...query,
        countries,
        totalCount: countries.length,
    };
};

/**
 * Provides flattened wards array (Legacy support)
 */
export const useFlattenedWards = (options: UseWardsOptions) => {
    const query = useWards(options);
    const wards = query.data?.data ?? [];

    return {
        ...query,
        wards,
        totalCount: wards.length,
    };
};
