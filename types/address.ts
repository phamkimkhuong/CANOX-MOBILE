/**
 * Address Types - Domain models for Address feature
 * 
 * Matching API response structure from:
 * - GET /api/v1/address/provinces
 * - GET /api/v1/address/provinces/:code/wards
 * - GET /api/v1/address/wards/:code
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// ============================================
// PROVINCE & WARD TYPES (Location Picker)
// ============================================

export interface Province {
    id: string;
    code: string;
    fullName: string;
    totalWards: number;
}

export interface Ward {
    id: string;
    code: string;
    fullName: string;
    provinceCode: string;
    province: Province | null;
}

// ============================================
// PAGINATED RESPONSE TYPES (API Response)
// ============================================

export interface PaginationMeta {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
}

export interface PagedContent<T> extends PaginationMeta {
    content: T[];
}

export interface ApiResponse<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}

// Typed responses cho từng endpoint
export type ProvinceListResponse = ApiResponse<Province[]>;
export type ProvinceDetailResponse = ApiResponse<Province>;
export type WardListResponse = ApiResponse<Ward[]>;
export type WardDetailResponse = ApiResponse<Ward>;

// ============================================
// COUNTRY TYPE
// ============================================

export interface Country {
    code: string;
    name: string;
    fullName: string;
    totalProvinces: number;
}

export type CountryResponse = ApiResponse<Country[]>;

// ============================================
// BUYER ADDRESS DTO (API Response)
// ============================================

/**
 * Address type from API - matches backend AddressType enum
 */
export type AddressTypeAPI = 'HOME' | 'OFFICE' | 'OTHER';

/**
 * Buyer Address DTO - Raw API response from GET /api/v1/buyer/addresses
 */
export interface BuyerAddressDTO {
    addressId: string;
    recipientName: string;
    phone: string;
    address: {
        country: string;
        province: string;
        ward: string;
        detail: string | null;
        district?: string;
        zipCode?: string | null;
        isInternational?: boolean;
    };
    type: AddressTypeAPI;
    createdDate?: string;
    lastModifiedDate?: string;
    isDefault: boolean;
}

/**
 * API Response wrapper for buyer addresses
 */
export interface BuyerAddressListResponse {
    code: number;
    success: boolean;
    message: string;
    data: BuyerAddressDTO[];
}

/**
 * Request body for creating a new buyer address
 */
export interface CreateBuyerAddressRequest {
    recipientName: string;
    phone: string;
    address: {
        country: string;
        province: string;
        district: string;
        ward: string;
        detail: string;
        zipCode?: string;
        geoinfo?: any;
    };
    type: AddressTypeAPI | string;
    isDefault: boolean;
}

/**
 * API Response wrapper for single address operations (create/update)
 */
export interface BuyerAddressSingleResponse {
    code: number;
    success: boolean;
    message: string;
    data: BuyerAddressDTO;
}

/**
 * Maximum number of addresses allowed per buyer
 */
export const MAX_ADDRESSES = 5;

// ============================================
// ADDRESS ENTITY TYPES (UI Models)
// ============================================

/**
 * Address label types 
 */
export type AddressLabel = 'home' | 'work' | 'other';

/**
 * Full shipping address for UI display
 * Transformed from BuyerAddressDTO
 */
export interface ShippingAddress {
    id: string;
    recipientName: string;
    phone: string;
    streetAddress: string;
    wardCode: string;
    wardName: string;
    provinceCode: string;
    provinceName: string;
    districtName: string;
    label: AddressLabel;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Form data khi tạo/sửa địa chỉ
 */
export interface AddressFormData {
    recipientName: string;
    phone: string;
    streetAddress: string;
    provinceCode: string;
    provinceName: string;
    districtName: string;
    wardCode: string;
    wardName: string;
    label: AddressLabel;
    isDefault: boolean;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

/**
 * Mode cho AddressList component
 * - selection: Từ Checkout -> chọn địa chỉ giao hàng -> auto back
 * - management: Từ Settings -> CRUD địa chỉ
 */
export type AddressListMode = 'selection' | 'management';

/**
 * Location Picker selected value
 */
export interface LocationSelection {
    province: Province | null;
    ward: Ward | null;
}

export const ProvinceSchema = z.object({
    id: z.string(),
    code: z.string(),
    fullName: z.string(),
    totalWards: z.number(),
});

export const WardSchema = z.object({
    id: z.string(),
    code: z.string(),
    fullName: z.string(),
    provinceCode: z.string(),
    province: ProvinceSchema.nullable(),
});

export const ProvinceListResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.array(ProvinceSchema),
});

export const ProvinceDetailResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: ProvinceSchema,
});

export const WardListResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.array(WardSchema),
});

export const WardDetailResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: WardSchema,
});

// ============================================
// HELPER TYPES
// ============================================

/**
 * Params cho API pagination & search
 */
export interface LocationSearchParams {
    page?: number;
    size?: number;
    search?: string;
}

/**
 * TanStack Query infinite query page param
 */
export interface InfiniteQueryPageParam {
    pageParam: number;
}
