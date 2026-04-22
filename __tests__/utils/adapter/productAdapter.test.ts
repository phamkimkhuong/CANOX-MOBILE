/**
 * Product Adapter Unit Tests
 */

import type { BaseProductDTO } from '@/types/product/product';
import { shortenLocationName, transformProduct } from '@/utils/adapter/product/productAdapter';

// ============================================
// shortenLocationName
// ============================================

describe('shortenLocationName', () => {
    it('shortens "Thành Phố" to "TP."', () => {
        expect(shortenLocationName('Thành Phố Hồ Chí Minh')).toBe('TP. Hồ Chí Minh');
    });

    it('handles different casing', () => {
        expect(shortenLocationName('Thành phố Hà Nội')).toBe('TP. Hà Nội');
    });

    it('handles extra whitespace', () => {
        expect(shortenLocationName('Thành  Phố  Đà Nẵng')).toBe('TP. Đà Nẵng');
    });

    it('returns non-matching locations as-is (trimmed)', () => {
        expect(shortenLocationName('Bình Dương')).toBe('Bình Dương');
    });

    it('returns empty string for null/undefined', () => {
        expect(shortenLocationName(null)).toBe('');
        expect(shortenLocationName(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
        expect(shortenLocationName('')).toBe('');
    });
});

// ============================================
// transformProduct
// ============================================

describe('transformProduct', () => {
    const createProductDTO = (overrides: Partial<BaseProductDTO> = {}): BaseProductDTO => ({
        id: 'prod-1',
        name: 'Áo thun nam',
        priceBeforeDiscount: 200000,
        priceAfterBestVoucher: 150000,
        media: [
            { imagePath: 'products/img1.webp', url: null, isPrimary: true },
            { imagePath: 'products/img2.webp', url: null, isPrimary: false },
        ],
        reviewStatistics: {
            averageRating: 4.5,
            totalReviews: 120,
            verifiedPurchaseCount: 80,
        },
        shop: { shop_location: 'Thành Phố Hồ Chí Minh' },
        availableRegions: ['VIETNAM'],
        variants: [{ id: 'var-b' }, { id: 'var-a' }],
        ...overrides,
    });

    it('maps basic fields', () => {
        const result = transformProduct(createProductDTO());

        expect(result.id).toBe('prod-1');
        expect(result.title).toBe('Áo thun nam');
    });

    // PRICING LOGIC
    it('shows selling price when discounted', () => {
        const result = transformProduct(createProductDTO({
            priceBeforeDiscount: 200000,
            priceAfterBestVoucher: 150000,
        }));

        expect(result.price).toBe(150000);
        expect(result.originalPrice).toBe(200000);
        expect(result.discountPercentage).toBe(25); // (200k-150k)/200k * 100
    });

    it('shows original price only when no discount', () => {
        const result = transformProduct(createProductDTO({
            priceBeforeDiscount: 200000,
            priceAfterBestVoucher: 200000,
        }));

        expect(result.price).toBe(200000);
        expect(result.originalPrice).toBeUndefined();
        expect(result.discountPercentage).toBeUndefined();
    });

    it('shows original price when sellingPrice is 0', () => {
        const result = transformProduct(createProductDTO({
            priceBeforeDiscount: 200000,
            priceAfterBestVoucher: 0,
        }));

        expect(result.price).toBe(200000);
        expect(result.originalPrice).toBeUndefined();
    });

    // IMAGE LOGIC
    it('uses primary media image', () => {
        const result = transformProduct(createProductDTO());
        expect(result.thumbnail).toBeTruthy();
    });

    it('falls back to first media when no primary', () => {
        const result = transformProduct(createProductDTO({
            media: [
                { imagePath: 'products/fallback.webp', url: null, isPrimary: false },
            ],
        }));

        expect(result.thumbnail).toBeTruthy();
    });

    // LOCATION
    it('shortens location name', () => {
        const result = transformProduct(createProductDTO());
        expect(result.location).toBe('TP. Hồ Chí Minh');
    });

    // INTERNATIONAL FLAG
    it('sets isInternational when INTERNATIONAL region exists', () => {
        const result = transformProduct(createProductDTO({
            availableRegions: ['VIETNAM', 'INTERNATIONAL'],
        }));

        expect(result.isInternational).toBe(true);
    });

    it('does not set isInternational for domestic only', () => {
        const result = transformProduct(createProductDTO({
            availableRegions: ['VIETNAM'],
        }));

        expect(result.isInternational).toBeUndefined();
    });

    // VARIANTS — deterministic sort
    it('sorts variant IDs lexicographically', () => {
        const result = transformProduct(createProductDTO({
            variants: [{ id: 'var-c' }, { id: 'var-a' }, { id: 'var-b' }],
        }));

        expect(result.defaultVariantId).toBe('var-a');
        expect(result.allVariantIds).toEqual(['var-a', 'var-b', 'var-c']);
    });

    it('handles empty variants', () => {
        const result = transformProduct(createProductDTO({ variants: [] }));

        expect(result.defaultVariantId).toBeUndefined();
        expect(result.allVariantIds).toBeUndefined();
    });

    // REVIEW STATS
    it('maps review statistics', () => {
        const result = transformProduct(createProductDTO());

        expect(result.rating).toBe(4.5);
        expect(result.reviews).toBe(120);
        expect(result.sold).toBe(80);
    });

    it('defaults review stats to 0 when missing', () => {
        const result = transformProduct(createProductDTO({
            reviewStatistics: undefined,
        }));

        expect(result.rating).toBe(0);
        expect(result.reviews).toBe(0);
        expect(result.sold).toBe(0);
    });

    // NULL SAFETY
    it('handles minimal DTO (all nulls)', () => {
        const result = transformProduct({
            id: 'prod-null',
        } as BaseProductDTO);

        expect(result.id).toBe('prod-null');
        expect(result.title).toBe('');
        expect(result.price).toBe(0);
        expect(result.location).toBe('');
        expect(result.rating).toBe(0);
    });
});
