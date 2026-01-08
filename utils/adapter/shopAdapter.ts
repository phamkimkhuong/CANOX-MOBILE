/**
 * ==============================================
 * SHOP ADAPTER - Transform DTO to UI Types
 * ==============================================
 * 
 * Responsibilities:
 * 1. Transform raw API data to lightweight UI models
 * 2. Handle nullable fields with fallbacks
 * 3. Calculate derived values (price range, stock, etc.)
 * 4. Format data for display
 */

import {
    ShopDetailDTO,
    ShopHeaderUI,
    ShopProductDTO,
    ShopProductItemUI,
} from '@/types/shop';
import { formatCurrency } from '@/utils/format';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';

/** Default placeholder for shop logo */
const DEFAULT_SHOP_LOGO = 'https://via.placeholder.com/100x100?text=Shop';

/** Default placeholder for product image */
const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/300x300?text=Product';

/**
 * Transform ShopDetailDTO → ShopHeaderUI
 * 
 * Handles:
 * - Logo URL resolution (already full URL from API)
 * - Banner URL fallback (usually null)
 * - Location extraction from address
 * - Join date formatting
 * 
 * @param dto - Raw API response data
 * @returns Lightweight UI model for shop header
 */
export const toShopHeaderUI = (dto: ShopDetailDTO): ShopHeaderUI => {
    // 1. Extract location from address (Province/City only)
    let location: string | null = null;
    if (dto.address?.address) {
        const addr = dto.address.address;
        // Prefer provinceName, fallback to districtName
        location = addr.provinceName || addr.districtName || null;
    }

    // 2. Format join date
    let joinDate = '';
    if (dto.createdDate) {
        const date = new Date(dto.createdDate);
        // Format: "Tham gia 11/2025"
        joinDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    // 3. Logo URL - API returns full URL, but fallback if null
    const logoUrl = dto.logoUrl || DEFAULT_SHOP_LOGO;

    return {
        id: dto.shopId,
        name: dto.shopName,
        description: dto.description || null,
        logoUrl,
        bannerUrl: dto.bannerUrl || null,
        isVerified: dto.verificationInfo?.verified ?? false,
        location,
        joinDate,
        stats: {
            productCount: null,
            followerCount: null,
            rating: null,
            responseRate: null,
        },
    };
};

// ============================================
// SHOP PRODUCT ADAPTER
// ============================================

/**
 * Calculate price display info from product variants
 * 
 * Logic:
 * - Case 1 (No variants): Use basePrice
 * - Case 2 (Single price): All variants same price → show single price
 * - Case 3 (Price range): min != max → show "Từ {minPrice}"
 * 
 * @param basePrice - Product base price
 * @param variants - Array of product variants
 * @returns Object with display info
 */
const calculatePriceInfo = (
    basePrice: number,
    variants: ShopProductDTO['variants']
): {
    displayPrice: number;
    originalPrice: number | null;
    priceDisplay: string;
    hasPriceRange: boolean;
} => {
    // No variants - use basePrice
    if (!variants || variants.length === 0) {
        return {
            displayPrice: basePrice,
            originalPrice: null,
            priceDisplay: formatCurrency(basePrice),
            hasPriceRange: false,
        };
    }

    // Extract all variant prices
    const prices = variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Single price across all variants
    if (minPrice === maxPrice) {
        const originalPrice = basePrice > minPrice ? basePrice : null;
        return {
            displayPrice: minPrice,
            originalPrice,
            priceDisplay: formatCurrency(minPrice),
            hasPriceRange: false,
        };
    }

    // Price range - show "Từ {minPrice}"
    return {
        displayPrice: minPrice,
        originalPrice: null, // Don't show strikethrough for range
        priceDisplay: `Từ ${formatCurrency(minPrice)}`,
        hasPriceRange: true,
    };
};

/**
 * Calculate total stock from all variants
 * 
 * @param variants - Array of product variants
 * @returns Total stock count (0 if all out of stock)
 */
const calculateTotalStock = (variants: ShopProductDTO['variants']): number => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => {
        return total + (variant.inventory?.stock ?? 0);
    }, 0);
};

/**
 * Get primary product thumbnail URL
 * 
 * Priority:
 * 1. Media with isPrimary = true
 * 2. First IMAGE type media
 * 3. First media of any type
 * 4. Fallback placeholder
 * 
 * @param media - Array of product media
 * @returns Full URL of thumbnail
 */
const getProductThumbnail = (media: ShopProductDTO['media']): string => {
    if (!media || media.length === 0) {
        return DEFAULT_PRODUCT_IMAGE;
    }

    // Sort by sortOrder and find best candidate
    const sortedMedia = [...media].sort((a, b) => a.sortOrder - b.sortOrder);

    // Priority 1: isPrimary = true
    const primaryMedia = sortedMedia.find(m => m.isPrimary && m.type === 'IMAGE');
    if (primaryMedia) {
        // Use basePath + extension if available for CDN optimization
        if (primaryMedia.basePath && primaryMedia.extension) {
            return toSizedImageUrl(primaryMedia.basePath, primaryMedia.extension, '_orig')
                || toPublicUrl(primaryMedia.url, DEFAULT_PRODUCT_IMAGE);
        }
        return toPublicUrl(primaryMedia.url, DEFAULT_PRODUCT_IMAGE);
    }

    // Priority 2: First IMAGE
    const firstImage = sortedMedia.find(m => m.type === 'IMAGE');
    if (firstImage) {
        if (firstImage.basePath && firstImage.extension) {
            return toSizedImageUrl(firstImage.basePath, firstImage.extension, '_orig')
                || toPublicUrl(firstImage.url, DEFAULT_PRODUCT_IMAGE);
        }
        return toPublicUrl(firstImage.url, DEFAULT_PRODUCT_IMAGE);
    }

    // Fallback: First media (might be video thumbnail)
    return toPublicUrl(sortedMedia[0].url, DEFAULT_PRODUCT_IMAGE);
};

/**
 * Transform ShopProductDTO → ShopProductItemUI
 * 
 * Handles:
 * - Price calculation (range vs single)
 * - Thumbnail extraction
 * - Stock calculation
 * - Null handling for rating/reviews
 * 
 * @param dto - Raw API product data
 * @returns Lightweight UI model for product grid
 */
export const toShopProductItemUI = (dto: ShopProductDTO): ShopProductItemUI => {
    const priceInfo = calculatePriceInfo(dto.basePrice, dto.variants);
    const thumbnail = getProductThumbnail(dto.media);
    const totalStock = calculateTotalStock(dto.variants);

    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        thumbnail,
        displayPrice: priceInfo.displayPrice,
        originalPrice: priceInfo.originalPrice,
        priceDisplay: priceInfo.priceDisplay,
        hasPriceRange: priceInfo.hasPriceRange,
        totalStock,
        isOutOfStock: totalStock === 0,
        // These may be null from API - UI should handle gracefully
        rating: dto.averageRating ?? null,
        reviewCount: dto.totalReviews ?? null,
        soldCount: null, //  Not available from current API
    };
};

/**
 * Transform array of ShopProductDTO → ShopProductItemUI[]
 * 
 * @param products - Array of raw API products
 * @returns Array of UI models
 */
export const toShopProductsUI = (products: ShopProductDTO[]): ShopProductItemUI[] => {
    return products.map(toShopProductItemUI);
};
