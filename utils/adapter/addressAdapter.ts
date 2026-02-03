/**
 * Address Adapter - Transform API DTOs to UI Models
 *
 * Follows the adapter pattern used in cartAdapter, productAdapter, etc.
 * Converts backend BuyerAddressDTO → frontend ShippingAddress
 */

import type {
    AddressLabel,
    AddressTypeAPI,
    BuyerAddressDTO,
    ShippingAddress,
} from '@/types/address';

/**
 * Map API AddressType enum to UI AddressLabel
 */
const mapAddressType = (apiType: AddressTypeAPI): AddressLabel => {
    const typeMap: Record<AddressTypeAPI, AddressLabel> = {
        HOME: 'home',
        OFFICE: 'work',
        OTHER: 'other',
    };
    return typeMap[apiType] ?? 'other';
};

/**
 * Transform single BuyerAddressDTO → ShippingAddress
 *
 * Handles the mapping between API fields and UI fields:
 * - addressId → id
 * - detailAddress → streetAddress
 * - type (uppercase) → label (lowercase)
 * - ward (full name) → wardName (wardCode not available from this API)
 * - province (full name) → provinceName (provinceCode not available)
 */
export const toBuyerAddressUI = (dto: BuyerAddressDTO): ShippingAddress => ({
    id: dto.addressId,
    recipientName: dto.recipientName,
    phone: dto.phone,
    streetAddress: dto.address?.detail ?? '',
    wardCode: '',
    wardName: dto.address?.ward ?? '',
    districtName: dto.address?.district ?? '',
    provinceCode: '',
    provinceName: dto.address?.province ?? '',
    countryName: dto.address?.country ?? '',
    label: mapAddressType(dto.type),
    isDefault: dto.isDefault,
    createdAt: dto.createdDate,
    updatedAt: dto.lastModifiedDate,
});

/**
 * Transform array of BuyerAddressDTO → ShippingAddress[]
 */
export const toBuyerAddressListUI = (dtos: BuyerAddressDTO[]): ShippingAddress[] =>
    dtos.map(toBuyerAddressUI);

/**
 * Get full address string for display
 */
export const formatShippingAddress = (address: ShippingAddress): string => {
    if (!address) return '';
    const parts = [
        address.streetAddress,
        address.wardName,
        address.districtName,
        address.provinceName,
    ]
        .map(p => p?.trim())
        .filter(p => !!p && p !== 'null' && p !== 'undefined');
    return parts.join(', ');
};

/**
 * Get label display text (Vietnamese)
 */
export const getAddressLabelText = (label: AddressLabel): string => {
    const labelMap: Record<AddressLabel, string> = {
        home: 'Nhà riêng',
        work: 'Văn phòng',
        other: 'Khác',
    };
    return labelMap[label] ?? 'Khác';
};
