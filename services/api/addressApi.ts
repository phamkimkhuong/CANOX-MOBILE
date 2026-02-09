/**
 * Address API Service - Centralized API calls for Address module
 * 
 * All requests go through apiClient which handles:
 * - Authentication (Bearer token)
 * - Error handling
 * - Request/Response logging
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import type {
    AutocompleteResponse,
    BuyerAddressListResponse,
    BuyerAddressSingleResponse,
    CountryResponse,
    CreateBuyerAddressRequest,
    DistanceCalculationResponse,
    GeocodeResponse,
    LocationSearchParams,
    ProvinceDetailResponse,
    ProvinceListResponse,
    WardDetailResponse,
    WardListResponse,
} from '@/types/address';

// ============================================
// HELPERS
// ============================================

/**
 * Normalizes location codes by stripping leading zeros
 * (BE updated to use "1" instead of "01")
 */
const normalizeCode = (code: string): string => {
    if (!code) return code;
    // Strip leading zeros for numeric strings
    return code.replace(/^0+/, '') || '0';
};

/**
 * Normalizes language codes for Mapbox.
 * Mapbox expects ISO 639-1 or BCP-47 (e.g., 'vi', 'en', 'en-US').
 * This helper fixes common mistakes like passing country codes instead of language codes.
 */
const normalizeLang = (lang: string): string => {
    if (!lang) return 'vi';

    // Mapbox requires lowercase
    const lowerLang = lang.toLowerCase();

    // Map of common region/country codes to their primary language codes
    const commonMapping: Record<string, string> = {
        'us': 'en',
        'uk': 'en',
        'gb': 'en',
        'jp': 'ja',
        'kr': 'ko',
        'cn': 'zh',
        'vn': 'vi',
    };

    // If it's a known country code used as a language, return the mapping
    if (commonMapping[lowerLang]) {
        return commonMapping[lowerLang];
    }

    // Keep original for BCP-47 support (e.g., 'en-US', 'zh-Hans')
    return lowerLang;
};

/**
 * Normalizes country codes for Mapbox (e.g., 'UK' -> 'GB')
 */
const normalizeCountry = (countryCode: string | undefined): string | undefined => {
    if (!countryCode) return undefined;
    const code = countryCode.toUpperCase();
    if (code === 'UK') return 'GB';
    return code;
};

// ============================================
// LOCATION DATA (Country, Province, Ward)
// ============================================

/**
 * Fetch country info of user
 */
export const getCountry = async (): Promise<CountryResponse> => {
    const response = await apiClient.get<CountryResponse>(
        API_ROUTES.ADDRESS.COUNTRY
    );
    return response.data;
};

/**
 * Fetch list of provinces
 * 
 * @param params - Search & pagination params
 * @returns Promise<ProvinceListResponse>
 */
export const getProvinces = async (
    params: LocationSearchParams = {}
): Promise<ProvinceListResponse> => {
    const { search } = params;

    const response = await apiClient.get<ProvinceListResponse>(
        API_ROUTES.ADDRESS.PROVINCES,
        {
            params: {
                ...(search && { search }),
            },
        }
    );

    return response.data;
};

/**
 * Fetch province detail
 * 
 * @param code - Province code (e.g: "1", "79")
 * @returns Promise<ProvinceDetailResponse>
 */
export const getProvinceDetail = async (
    code: string
): Promise<ProvinceDetailResponse> => {
    const normalizedCode = normalizeCode(code);
    const response = await apiClient.get<ProvinceDetailResponse>(
        API_ROUTES.ADDRESS.PROVINCE_DETAIL(normalizedCode)
    );

    return response.data;
};

/**
 * Fetch list of wards by province
 * 
 * @param provinceCode - Province code (e.g: "1", "52")
 * @param params - Search & pagination params
 * @returns Promise<WardListResponse>
 */
export const getWardsByProvince = async (
    provinceCode: string,
    params: LocationSearchParams = {}
): Promise<WardListResponse> => {
    const { search } = params;
    const normalizedCode = normalizeCode(provinceCode);

    const response = await apiClient.get<WardListResponse>(
        API_ROUTES.ADDRESS.WARDS_BY_PROVINCE(normalizedCode),
        {
            params: {
                ...(search && { search }),
            },
        }
    );

    return response.data;
};

/**
 * Fetch ward detail (includes province info)
 * 
 * @param wardCode - Ward code (e.g: "9886")
 * @returns Promise<WardDetailResponse>
 */
export const getWardDetail = async (
    wardCode: string
): Promise<WardDetailResponse> => {
    const normalizedCode = normalizeCode(wardCode);
    const response = await apiClient.get<WardDetailResponse>(
        API_ROUTES.ADDRESS.WARD_DETAIL(normalizedCode)
    );

    return response.data;
};

import {
    AutocompleteResponseSchema,
    DistanceResponseSchema,
    GeocodeResponseSchema,
} from '@/types/address';
import { safeValidate } from '@/utils/schema';

/**
 * Suggest addresses as user types (Mapbox)
 */
export const autocompleteAddress = async (
    query: string,
    language: string = 'vi',
    limit: number = 5,
    countryCode?: string
): Promise<AutocompleteResponse> => {
    const sanitizedLang = normalizeLang(language);
    const sanitizedCountry = normalizeCountry(countryCode);

    const response = await apiClient.get<AutocompleteResponse>(
        API_ROUTES.ADDRESS.AUTOCOMPLETE,
        {
            params: {
                query,
                language: sanitizedLang,
                limit,
                ...(sanitizedCountry && { country: sanitizedCountry })
            }
        }
    );

    // Validate & Fallback
    const validated = safeValidate(
        AutocompleteResponseSchema,
        response.data,
        { ...response.data, data: [] }, // Fallback data array to empty if mismatch
        'autocompleteAddress'
    );

    return validated;
};

/**
 * Get latitude/longitude from an address (Mapbox)
 */
export const geocodeAddress = async (
    address: string,
    language: string = 'vi'
): Promise<GeocodeResponse> => {
    const sanitizedLang = normalizeLang(language);
    const response = await apiClient.get<GeocodeResponse>(
        API_ROUTES.ADDRESS.GEOCODE,
        {
            params: { address, language: sanitizedLang }
        }
    );

    // Validate & Fallback
    const validated = safeValidate(
        GeocodeResponseSchema,
        response.data,
        { ...response.data, data: null },
        'geocodeAddress'
    );

    return validated;
};

/**
 * Calculate driving distance between two points (Mapbox)
 */
export const getDistance = async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): Promise<DistanceCalculationResponse> => {
    const response = await apiClient.get<DistanceCalculationResponse>(
        API_ROUTES.ADDRESS.DISTANCE,
        {
            params: { fromLat, fromLng, toLat, toLng }
        }
    );

    // Validate & Fallback
    const validated = safeValidate(
        DistanceResponseSchema,
        response.data,
        { ...response.data, data: null },
        'getDistance'
    );

    return validated;
};

// ============================================
// USER ADDRESS CRUD
// ============================================

/**
 * Fetch list of addresses of buyer
 */
export const getBuyerAddresses = async (): Promise<BuyerAddressListResponse> => {
    const response = await apiClient.get<BuyerAddressListResponse>(
        API_ROUTES.BUYER_ADDRESS.LIST
    );

    return response.data;
};

/**
 * Fetch detail of a specific address
 */
export const getBuyerAddressDetail = async (addressId: string): Promise<BuyerAddressSingleResponse> => {
    const response = await apiClient.get<BuyerAddressSingleResponse>(
        API_ROUTES.BUYER_ADDRESS.DETAIL(addressId)
    );
    return response.data;
};

/**
 * Create new address for buyer
 */
export const createBuyerAddress = async (
    data: CreateBuyerAddressRequest
): Promise<BuyerAddressSingleResponse> => {
    const response = await apiClient.post<BuyerAddressSingleResponse>(
        API_ROUTES.BUYER_ADDRESS.CREATE,
        data
    );

    return response.data;
};

/**
 * Update existing address for buyer
 */
export const updateBuyerAddress = async (
    addressId: string,
    data: CreateBuyerAddressRequest
): Promise<BuyerAddressSingleResponse> => {
    const response = await apiClient.put<BuyerAddressSingleResponse>(
        API_ROUTES.BUYER_ADDRESS.UPDATE(addressId),
        data
    );

    return response.data;
};

/**
 * Delete address of buyer
 */
export const deleteBuyerAddress = async (
    addressId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
        API_ROUTES.BUYER_ADDRESS.DELETE(addressId)
    );

    return response.data;
};

/**
 * Set an address as default
 */
export const setDefaultBuyerAddress = async (
    addressId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
        API_ROUTES.BUYER_ADDRESS.SET_DEFAULT(addressId)
    );
    return response.data;
};
