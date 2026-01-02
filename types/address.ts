/**
 * Address Types - Domain models for Address feature
 * 
 * Matching API response structure from:
 * - GET /api/v1/address/provinces
 * - GET /api/v1/address/provinces/:code/wards
 * - GET /api/v1/address/wards/:code
 */

import { z } from 'zod';

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
export type ProvinceListResponse = ApiResponse<PagedContent<Province>>;
export type WardListResponse = ApiResponse<PagedContent<Ward>>;
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

export type CountryResponse = ApiResponse<Country>;

// ============================================
// BUYER ADDRESS DTO (API Response)
// ============================================

/**
 * Address type from API - matches backend AddressType enum
 */
export type AddressTypeAPI = 'HOME' | 'WORK' | 'OTHER';

/**
 * Buyer Address DTO - Raw API response from GET /buyers/{buyerId}/address
 */
export interface BuyerAddressDTO {
    addressId: string;
    recipientName: string;
    phone: string;
    detailAddress: string;
    ward: string;
    district: string;
    province: string;
    country: string;
    type: AddressTypeAPI;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    deleted: boolean;
    version: number;
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
    detailAddress: string;
    ward: string;
    district: string;
    province: string;
    country: string;
    districtNameOld?: string;
    provinceNameOld?: string;
    wardNameOld?: string;
    type: AddressTypeAPI;
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

export const PagedContentSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        content: z.array(itemSchema),
        page: z.number(),
        size: z.number(),
        totalElements: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrevious: z.boolean(),
        previousPage: z.number(),
        nextPage: z.number(),
        empty: z.boolean(),
        first: z.boolean(),
        last: z.boolean(),
    });

export const ProvinceListResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: PagedContentSchema(ProvinceSchema),
});

export const WardListResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: PagedContentSchema(WardSchema),
});

export const WardDetailResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
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
