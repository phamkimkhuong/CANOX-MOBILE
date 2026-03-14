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
// SMART ADDRESS TYPES (Mapbox Integration)
// ============================================

/**
 * Result from autocomplete API
 */
export interface MapboxAutocompleteResponse {
    placeName: string;
    text: string;
    latitude: number;
    longitude: number;
    relevance: number;
    province: string | null;
    district: string | null;
    ward: string | null;
    country: string;
    postcode: string | null;
    locationId: string;
    placeType: string;
    address: string;
}

/**
 * Result from geocode API
 */
export interface GeoInfoResponse {
    latitude: number;
    longitude: number;
    placeName: string;
    relevance: number;
}

/**
 * Result from distance calculation API
 */
export interface DistanceResponse {
    distanceKm: number;
    durationMinutes: number;
}

export type AutocompleteResponse = ApiResponse<MapboxAutocompleteResponse[]>;
export type GeocodeResponse = ApiResponse<GeoInfoResponse | null>;
export type DistanceCalculationResponse = ApiResponse<DistanceResponse | null>;

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
        geoinfo?: {
            latitude: number;
            longitude: number;
            confirmed?: boolean;
            userVerified?: boolean;
            userAdjusted?: boolean;
        };
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
    wardCode?: string;
    wardName: string;
    provinceCode?: string;
    provinceName: string;
    districtName: string;
    countryName: string;
    label: AddressLabel;
    isDefault: boolean;
    isInternational: boolean;
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
    provinceCode?: string;
    provinceName: string;
    districtName: string;
    wardCode?: string;
    wardName: string;
    countryCode: string;
    countryName: string;
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
    province: ProvinceSchema.nullish().default(null),
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
    // ... skipping existing schemas for brevity in prompt but I should probably add Country schema
    message: z.string(),
    data: WardSchema,
});

export const CountrySchema = z.object({
    code: z.string(),
    name: z.string(),
    fullName: z.string(),
    totalProvinces: z.number(),
});

export const CountryResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.array(CountrySchema),
});

// Smart Address schemas (Robust strategy to prevent crashes)
export const MapboxAutocompleteSchema = z.object({
    placeName: z.string().catch('').default(''),
    text: z.string().catch('').default(''),
    latitude: z.number().catch(0).default(0),
    longitude: z.number().catch(0).default(0),
    relevance: z.number().catch(0).default(0),
    province: z.string().nullish().catch(null).default(null),
    district: z.string().nullish().catch(null).default(null),
    ward: z.string().nullish().catch(null).default(null),
    country: z.string().catch('').default(''),
    postcode: z.string().nullish().catch(null).default(null),
    locationId: z.string().catch('').default(''),
    placeType: z.string().catch('').default(''),
    address: z.string().catch('').default(''),
});

export const AutocompleteResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(MapboxAutocompleteSchema).catch([]).default([]),
});

export const GeoInfoSchema = z.object({
    latitude: z.number().catch(0).default(0),
    longitude: z.number().catch(0).default(0),
    placeName: z.string().catch('').default(''),
    relevance: z.number().catch(0).default(0),
});

export const GeocodeResponseSchema = ResponseDefaultSchema.extend({
    data: GeoInfoSchema.nullable().catch(null).default(null),
});

export const DistanceSchema = z.object({
    distanceKm: z.number().catch(0).default(0),
    durationMinutes: z.number().catch(0).default(0),
});

export const DistanceResponseSchema = ResponseDefaultSchema.extend({
    data: DistanceSchema.nullable().catch(null).default(null),
});

export const BuyerAddressAddressSchema = z.object({
    country: z.string().catch('').default(''),
    province: z.string().catch('').default(''),
    ward: z.string().catch('').default(''),
    detail: z.string().nullish().default(null),
    district: z.string().nullish().default(''),
    zipCode: z.string().nullish().default(null),
    isInternational: z.boolean().nullish().default(false),
});

export const BuyerAddressDTOSchema = z.object({
    addressId: z.string(),
    recipientName: z.string().catch('').default(''),
    phone: z.string().catch('').default(''),
    address: BuyerAddressAddressSchema,
    type: z.enum(['HOME', 'OFFICE', 'OTHER']).catch('OTHER').default('OTHER'),
    createdDate: z.string().nullish(),
    lastModifiedDate: z.string().nullish(),
    isDefault: z.boolean().catch(false).default(false),
});

export const BuyerAddressListResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(BuyerAddressDTOSchema).default([]),
});

export const BuyerAddressSingleResponseSchema = ResponseDefaultSchema.extend({
    data: BuyerAddressDTOSchema,
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
// ============================================
// FORM VALIDATION SCHEMAS
// ============================================

/**
 * Schema cho Address Form - Dùng với react-hook-form
 * Tách biệt khỏi UI để dễ bảo trì và tái sử dụng
 */
export const AddressFormSchema = z.object({
    recipientName: z
        .string()
        .min(2, 'Tên người nhận tối thiểu 2 ký tự')
        .max(50, 'Tên người nhận tối đa 50 ký tự'),
    phone: z
        .string()
        .min(10, 'Số điện thoại không hợp lệ')
        .max(11, 'Số điện thoại không hợp lệ')
        .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
    countryCode: z.string().min(1, 'Vui lòng chọn Quốc gia'),
    countryName: z.string(),
    provinceCode: z.string().optional(),
    provinceName: z.string().min(1, 'Vui lòng nhập Tỉnh/Thành phố'),
    districtName: z.string().min(1, 'Vui lòng nhập Quận/Huyện'),
    wardCode: z.string().optional(),
    wardName: z.string().min(1, 'Vui lòng nhập Phường/Xã'),
    streetAddress: z
        .string()
        .min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự')
        .max(200, 'Địa chỉ chi tiết tối đa 200 ký tự'),
    label: z.enum(['home', 'work', 'other']),
    isDefault: z.boolean(),
});
