import type { ShippingAddress } from '@/types/address';
import type { ProductShippingScope } from '@/types/product/productDetail';

const DOMESTIC_REGION = 'VIETNAM';
const INTERNATIONAL_REGION = 'INTERNATIONAL';

export interface ProductShippingCompatibility {
    scope: ProductShippingScope;
    requiresAddressSelection: boolean;
    isDeterministicallyBlocked: boolean;
    isCompatible: boolean;
    mismatch:
        | 'domestic_address_for_international_only'
        | 'international_address_for_domestic_only'
        | null;
}

export const deriveProductShippingScope = (
    availableRegions: string[] | null | undefined
): ProductShippingScope => {
    const normalized = new Set(
        (availableRegions ?? [])
            .map((region) => region?.trim().toUpperCase())
            .filter((region): region is string => Boolean(region))
    );

    const supportsDomestic = normalized.has(DOMESTIC_REGION);
    const supportsInternational = normalized.has(INTERNATIONAL_REGION);

    if (supportsDomestic && supportsInternational) return 'both';
    if (supportsInternational) return 'international_only';
    if (supportsDomestic) return 'domestic_only';
    return 'unknown';
};

export const evaluateProductShippingCompatibility = (
    scope: ProductShippingScope,
    address: ShippingAddress | null
): ProductShippingCompatibility => {
    if (!address) {
        return {
            scope,
            requiresAddressSelection: true,
            isDeterministicallyBlocked: false,
            isCompatible: false,
            mismatch: null,
        };
    }

    if (scope === 'international_only' && !address.isInternational) {
        return {
            scope,
            requiresAddressSelection: false,
            isDeterministicallyBlocked: true,
            isCompatible: false,
            mismatch: 'domestic_address_for_international_only',
        };
    }

    if (scope === 'domestic_only' && address.isInternational) {
        return {
            scope,
            requiresAddressSelection: false,
            isDeterministicallyBlocked: true,
            isCompatible: false,
            mismatch: 'international_address_for_domestic_only',
        };
    }

    return {
        scope,
        requiresAddressSelection: false,
        isDeterministicallyBlocked: false,
        isCompatible: scope !== 'unknown',
        mismatch: null,
    };
};
