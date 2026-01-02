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
    BuyerAddressListResponse,
    BuyerAddressSingleResponse,
    CountryResponse,
    CreateBuyerAddressRequest,
    LocationSearchParams,
    ProvinceListResponse,
    WardDetailResponse,
    WardListResponse,
} from '@/types/address';

/**
 * Default pagination settings
 */
const DEFAULT_PAGE_SIZE = {
    PROVINCES: 40,
    WARDS: 20,
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
    const { page = 0, size = DEFAULT_PAGE_SIZE.PROVINCES, search } = params;

    const response = await apiClient.get<ProvinceListResponse>(
        API_ROUTES.ADDRESS.PROVINCES,
        {
            params: {
                page,
                size,
                ...(search && { search }),
            },
        }
    );

    return response.data;
};

/**
 * Fetch list of wards by province
 * 
 * @param provinceCode - Province code (e.g: "01", "52")
 * @param params - Search & pagination params
 * @returns Promise<WardListResponse>
 */
export const getWardsByProvince = async (
    provinceCode: string,
    params: LocationSearchParams = {}
): Promise<WardListResponse> => {
    const { page = 0, size = DEFAULT_PAGE_SIZE.WARDS, search } = params;

    const response = await apiClient.get<WardListResponse>(
        API_ROUTES.ADDRESS.WARDS_BY_PROVINCE(provinceCode),
        {
            params: {
                page,
                size,
                ...(search && { search }),
            },
        }
    );

    return response.data;
};

/**
 * Fetch ward detail (includes province info)
 * 
 * @param wardCode - Ward code (e.g: "00082")
 * @returns Promise<WardDetailResponse>
 */
export const getWardDetail = async (
    wardCode: string
): Promise<WardDetailResponse> => {
    const response = await apiClient.get<WardDetailResponse>(
        API_ROUTES.ADDRESS.WARD_DETAIL(wardCode)
    );

    return response.data;
};

// ============================================
// USER ADDRESS CRUD
// ============================================

/**
 * Fetch list of addresses of buyer
 */
export const getBuyerAddresses = async (
    buyerId: string
): Promise<BuyerAddressListResponse> => {
    const response = await apiClient.get<BuyerAddressListResponse>(
        API_ROUTES.BUYER_ADDRESS.LIST(buyerId)
    );

    return response.data;
};

/**
 * Create new address for buyer
 */
export const createBuyerAddress = async (
    buyerId: string,
    data: CreateBuyerAddressRequest
): Promise<BuyerAddressSingleResponse> => {
    const response = await apiClient.post<BuyerAddressSingleResponse>(
        API_ROUTES.BUYER_ADDRESS.CREATE(buyerId),
        data
    );

    return response.data;
};

/**
 * Update existing address for buyer
 */
export const updateBuyerAddress = async (
    buyerId: string,
    addressId: string,
    data: CreateBuyerAddressRequest
): Promise<BuyerAddressSingleResponse> => {
    const response = await apiClient.put<BuyerAddressSingleResponse>(
        API_ROUTES.BUYER_ADDRESS.UPDATE(buyerId, addressId),
        data
    );

    return response.data;
};

/**
 * Delete address of buyer
 */
export const deleteBuyerAddress = async (
    buyerId: string,
    addressId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
        API_ROUTES.BUYER_ADDRESS.DELETE(buyerId, addressId)
    );

    return response.data;
};
