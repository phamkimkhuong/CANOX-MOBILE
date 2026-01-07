import type {
    FlashSaleInfo,
    GalleryItem,
    NormalizedOptionValue,
    PriceDisplay,
    ProductDetailResponse,
    ProductDetailUI,
    ProductOption,
    ProductOptionUI,
    ProductSpec,
    ProductVariant,
    ShopUI,
    VariantMatrix,
    VariantMatrixKey,
    VariantMatrixValue,
    Voucher,
    VoucherUI,
} from '@/types/product/productDetail';
import { getNextFlashSaleSlot } from '@/utils/date';


const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? 'https://pub-5341c10461574a539df355b9fbe87197.r2.dev/';


/**
 * Build mapping from optionValue.id -> { optionName, valueName }. Necessary because API variant.optionValues only has id/name, no optionName
 */
export const buildOptionValueMapping = (
    options: ProductOption[]
): Map<string, { optionName: string; valueName: string }> => {
    const mapping = new Map<string, { optionName: string; valueName: string }>();

    for (const option of options) {
        for (const value of option.values) {
            mapping.set(value.id, {
                optionName: option.name,
                valueName: value.name,
            });
        }
    }

    return mapping;
};

/**
 * Normalize variant optionValues with optionName info
 */
export const normalizeVariantOptionValues = (
    variant: ProductVariant,
    optionValueMapping: Map<string, { optionName: string; valueName: string }>
): NormalizedOptionValue[] => {
    return variant.optionValues.map(ov => {
        const mapping = optionValueMapping.get(ov.id);
        return {
            optionId: ov.id, // In this API, optionValue.id is unique
            optionName: mapping?.optionName ?? 'Unknown',
            valueId: ov.id,
            valueName: mapping?.valueName ?? ov.name,
        };
    });
};

/**
 * Normalize option name/value để đảm bảo consistency
 */
const normalizeString = (str: string): string => {
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

/**
 * Create deterministic, collision-free key for Variant Matrix
 */
export const createVariantMatrixKey = (
    optionValues: { optionName: string; valueName: string }[]
): VariantMatrixKey => {
    // Create object with normalized, sorted keys
    const normalized = optionValues.reduce((acc, ov) => {
        const key = normalizeString(ov.optionName);
        const value = normalizeString(ov.valueName);
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    // Sort keys alphabetically to ensure deterministic output
    const sortedKeys = Object.keys(normalized).sort();
    const sorted = sortedKeys.reduce((acc, key) => {
        acc[key] = normalized[key];
        return acc;
    }, {} as Record<string, string>);

    // JSON.stringify is deterministic with sorted keys
    return JSON.stringify(sorted);
};

/**
 * Create key from selected options object (user selection state)
 */
export const createKeyFromSelection = (
    selectedOptions: Record<string, string>
): VariantMatrixKey => {
    // Normalize and filter empty values
    const normalized = Object.entries(selectedOptions)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => {
            const normalizedKey = normalizeString(key);
            const normalizedValue = normalizeString(value);
            acc[normalizedKey] = normalizedValue;
            return acc;
        }, {} as Record<string, string>);

    // Sort keys
    const sortedKeys = Object.keys(normalized).sort();
    const sorted = sortedKeys.reduce((acc, key) => {
        acc[key] = normalized[key];
        return acc;
    }, {} as Record<string, string>);

    return JSON.stringify(sorted);
};

/**
 * Build Variant Matrix from variants array
 */
export const buildVariantMatrix = (
    variants: ProductVariant[],
    options: ProductOption[]
): VariantMatrix => {
    const matrix: VariantMatrix = new Map();
    const optionValueMapping = buildOptionValueMapping(options);

    for (const variant of variants) {
        // Normalize optionValues with optionName
        const normalizedValues = normalizeVariantOptionValues(variant, optionValueMapping);
        const key = createVariantMatrixKey(normalizedValues);

        const value: VariantMatrixValue = {
            id: variant.id,
            price: variant.price,
            originalPrice: variant.corePrice !== variant.price ? variant.corePrice : undefined,
            stock: variant.inventory.stock,
            isAvailable: variant.inventory.stock > 0,
            sku: variant.sku,
            // Variant can have own image
            media: variant.imageUrl ? [{
                id: `variant-${variant.id}`,
                url: getFullImageUrl(variant.imageUrl),
                type: 'IMAGE' as const,
                isPrimary: false,
                variantId: variant.id,
            }] : undefined,
        };

        matrix.set(key, value);
    }

    return matrix;
};

/**
 * Get full image URL
 * Handle both relative path and full URL
 */
export const getFullImageUrl = (
    url: string,
    baseUrl: string = IMAGE_BASE_URL
): string => {
    if (!url) return '';

    // If already full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Append to base URL, ensuring no duplicate slash
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${cleanPath}`;
};

/**
 * Merge media from general product and each variant
 * Sort by: isPrimary DESC, sortOrder ASC
 */
export const buildGallery = (
    productMedia: ProductDetailResponse['media'],
    variants: ProductVariant[]
): GalleryItem[] => {
    const gallery: GalleryItem[] = [];
    const seenIds = new Set<string>();

    // 1. Add general product media (primary first)
    const sortedProductMedia = [...productMedia].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

    for (const media of sortedProductMedia) {
        if (!seenIds.has(media.id)) {
            gallery.push({
                id: media.id,
                url: getFullImageUrl(media.url),
                type: media.type,
                isPrimary: media.isPrimary,
                variantId: null,
            });
            seenIds.add(media.id);
        }
    }

    // 2. Add specific variant media (if has imageUrl)
    for (const variant of variants) {
        if (variant.imageUrl) {
            const variantMediaId = `variant-img-${variant.id}`;
            if (!seenIds.has(variantMediaId)) {
                gallery.push({
                    id: variantMediaId,
                    url: getFullImageUrl(variant.imageUrl),
                    type: 'IMAGE',
                    isPrimary: false,
                    variantId: variant.id,
                });
                seenIds.add(variantMediaId);
            }
        }
    }

    return gallery;
};

/**
 * Calculate Price Display
 */
export const calculatePriceDisplay = (
    data: ProductDetailResponse,
    selectedVariant?: VariantMatrixValue | null
): PriceDisplay => {
    // If specific variant selected
    if (selectedVariant) {
        let finalPrice = selectedVariant.price;
        let discountAmount = 0;
        // 1. Get best available voucher (Platform or Shop)
        const bestVoucher = data.bestPlatformVoucher || data.bestShopVoucher;

        // 2. Re-calculate discount amount for this Variant
        if (bestVoucher) {
            if (bestVoucher.discountType === 'PERCENTAGE') {
                // Calc % discount: Variant Price * % / 100
                const rawDiscount = (selectedVariant.price * bestVoucher.discountValue) / 100;

                // Apply cap (Max Discount) if exists
                // Example: 5% off 8,570,000 = 428,500, but max is 250,000 -> Take 250,000
                discountAmount = bestVoucher.maxDiscount
                    ? Math.min(rawDiscount, bestVoucher.maxDiscount)
                    : rawDiscount;
            } else {
                // Fixed cash discount (FIXED)
                discountAmount = bestVoucher.discountValue;
            }
        }

        // 3. Final Price = Variant Price - Discount
        finalPrice = selectedVariant.price - discountAmount;

        // 4. Calculate total % discount (to show badge -XX%)
        // Compare final price (8.32m) with variant original price (8.57m)
        const totalDiscountPercent = Math.round(
            ((selectedVariant.price - finalPrice) / selectedVariant.price) * 100
        );
        return {
            currentPrice: finalPrice, // 8,320,000 (Correct)
            originalPrice: selectedVariant.price, // 8,570,000 (Strikethrough Price)
            discountPercentage: totalDiscountPercent > 0 ? totalDiscountPercent : undefined,
            isRange: false,
            voucherDiscount: discountAmount,
            priceAfterVoucher: finalPrice,
        };
    }

    // ========================================
    // VARIANT NOT SELECTED
    // ========================================
    const hasBestVoucher = data.priceAfterBestVoucher && data.priceAfterBestVoucher < data.priceMin;
    const displayPrice: number = hasBestVoucher ? data.priceAfterBestVoucher! : data.priceMin;
    // Tính discount percentage
    const discountPercentage = data.basePrice > displayPrice
        ? Math.round(((data.basePrice - displayPrice) / data.basePrice) * 100)
        : undefined;

    const hasRange = data.priceMin !== data.priceMax;

    if (hasRange) {
        // Has price range (multiple variants with different prices)
        return {
            currentPrice: displayPrice,
            originalPrice: hasBestVoucher ? data.priceMin : undefined,
            priceRange: {
                min: displayPrice,
                max: data.priceMax,
            },
            discountPercentage,
            isRange: true,
            voucherDiscount: data.bestPlatformVoucher?.discountAmount,
            priceAfterVoucher: data.priceAfterBestVoucher,
        };
    }

    // Fixed price (no variant or all variants same price)
    return {
        currentPrice: displayPrice,
        originalPrice: hasBestVoucher ? data.basePrice : undefined,
        discountPercentage,
        isRange: false,
        voucherDiscount: data.bestPlatformVoucher?.discountAmount,
        priceAfterVoucher: data.priceAfterBestVoucher,
    };
};

/**
 * Transform options from API to UI format
 * Sort values by displayOrder
 */
export const transformOptions = (
    options: ProductOption[]
): ProductOptionUI[] => {
    return options.map(option => ({
        id: option.id,
        name: option.name,
        values: [...option.values]
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map(value => ({
                id: value.id,
                name: value.name,
                displayOrder: value.displayOrder,
                image: null, // API currently has no image for option value
            })),
    }));
};

/**
 * Transform Shop from API to UI format
 */
export const transformShop = (shop: ProductDetailResponse['shop']): ShopUI => {
    return {
        id: shop.shopId,
        userId: shop.userId || '',
        shopName: shop.shopName,
        username: shop.username,
        avatar: shop.logoUrl,
        logoUrl: shop.logoUrl,
        description: shop.description,
        isVerified: shop.verifyBy !== null && shop.verifyBy !== undefined,
        rating: shop.rating,
        responseRate: shop.responseRate,
        responseTime: shop.responseTime,
        followerCount: shop.followerCount,
        productCount: shop.productCount,
        location: shop.location,
        lastOnline: shop.lastOnline,
    };
};

/**
 * Transform Voucher from API to UI format
 */
export const transformVoucher = (voucher: Voucher): VoucherUI => {
    return {
        id: voucher.voucherId,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscount: voucher.maxDiscount,
        minOrderValue: voucher.minOrderValue,
        sponsorType: voucher.sponsorType,
        endDate: voucher.endDate,
    };
};

/**
 * Build category path string
 */
export const buildCategoryPath = (
    category: ProductDetailResponse['category']
): string | undefined => {
    if (!category) return undefined;

    // API uses 'parent' instead of 'parentCategory'
    if (category.parent) {
        return `${category.parent.name} > ${category.name}`;
    }

    return category.name;
};

/**
 * Collect all vouchers into UI format
 */
export const collectVouchers = (data: ProductDetailResponse): VoucherUI[] => {
    const vouchers: VoucherUI[] = [];

    if (data.bestPlatformVoucher) {
        vouchers.push(transformVoucher(data.bestPlatformVoucher));
    }

    if (data.bestShopVoucher) {
        vouchers.push(transformVoucher(data.bestShopVoucher));
    }

    if (data.shopVouchers) {
        vouchers.push(...data.shopVouchers.map(transformVoucher));
    }

    return vouchers;
};

/**
 * Calculate total remaining stock
 */
export const calculateTotalStock = (variants: ProductVariant[]): number => {
    return variants.reduce((total, v) => {
        return total + v.inventory.stock;
    }, 0);
};

// ============================================
// FLASH SALE FALLBACK LOGIC
// ============================================

/**
 * Create Flash Sale info from API response or fallback from Home slot
 * 
 * Logic "Fake it until you make it":
 * 1. If API returns flashSale with isActive = true → Use it
 * 2. If API has promotedUntil → Create flash sale from promotedUntil
 * 3. FALLBACK: Get slot from Home (getNextFlashSaleSlot)
 */
export const buildFlashSaleInfo = (
    data: ProductDetailResponse,
    totalStock: number
): FlashSaleInfo | undefined => {
    // Case 1: API returns full flash sale
    if (data.flashSale?.isActive && data.flashSale.endTime) {
        return data.flashSale;
    }

    // Case 2: API has flashSale.isActive but missing endTime
    if (data.flashSale?.isActive) {
        const slot = getNextFlashSaleSlot();
        return {
            ...data.flashSale,
            endTime: slot.endTime,
        };
    }

    // Case 3: API has promotedUntil (product is being promoted)
    if (data.promotedUntil) {
        const promotedDate = new Date(data.promotedUntil);
        // Only create flash sale if promotedUntil is valid
        if (promotedDate.getTime() > Date.now()) {
            return {
                isActive: true,
                endTime: data.promotedUntil,
                // Estimate from available data
                quantityLimit: totalStock > 0 ? totalStock + (data.totalSold ?? 0) : undefined,
                quantitySold: data.totalSold,
            };
        }
    }

    // Case 4: FALLBACK - Simulate Flash Sale from Home slot
    // Condition: Product in stock and has voucher (on sale)
    const hasActiveVoucher = data.bestPlatformVoucher || data.bestShopVoucher;
    const hasStock = totalStock > 0;

    if (hasActiveVoucher && hasStock) {
        const slot = getNextFlashSaleSlot();
        return {
            isActive: true,
            endTime: slot.endTime,
            // Estimate quantity from inventory
            quantityLimit: totalStock + (data.totalSold ?? 0),
            quantitySold: data.totalSold ?? 0,
        };
    }

    // No flash sale
    return undefined;
};

/**
 * MAIN TRANSFORM FUNCTION
 * Transform ProductDetailResponse from API to ProductDetailUI for component
 */
export const transformProductDetail = (
    data: ProductDetailResponse
): ProductDetailUI => {
    // Get and transform options
    const apiOptions = data.options ?? [];
    const options = transformOptions(apiOptions);

    // Build variant matrix (needs options for mapping)
    const variantMatrix = buildVariantMatrix(data.variants, apiOptions);

    // Build gallery
    const gallery = buildGallery(data.media, data.variants);

    // Transform shop
    const shop = transformShop(data.shop);

    // Calculate initial price display
    const priceDisplay = calculatePriceDisplay(data);

    // Collect and transform vouchers
    const vouchers = collectVouchers(data);

    // Extract best voucher for variant price calculation
    const apiVoucher = data.bestPlatformVoucher || data.bestShopVoucher;
    const bestVoucher = apiVoucher ? {
        discountType: apiVoucher.discountType,
        discountValue: apiVoucher.discountValue,
        maxDiscount: apiVoucher.maxDiscount ?? undefined,
    } : undefined;

    // Calculate total stock
    const totalStock = calculateTotalStock(data.variants);

    // Build specifications
    const specifications: ProductSpec[] = data.specifications ?? [];

    // Build Flash Sale với fallback logic
    const flashSale = buildFlashSaleInfo(data, totalStock);

    return {
        // Basic Info
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,

        // Price
        priceDisplay,

        // Media
        gallery,

        // Variants
        options,
        variantMatrix,
        hasVariants: data.variants.length > 0 && options.length > 0,

        // Shop
        shop,

        // Stats
        rating: data.reviewStatistics.averageRating,
        totalReviews: data.reviewStatistics.totalReviews,
        totalSold: data.totalSold ?? 0,
        reviewStatistics: data.reviewStatistics,

        // Features - Sử dụng fallback logic
        flashSale,
        vouchers,
        bestVoucher,
        shipping: data.shipping,
        specifications,
        categoryPath: buildCategoryPath(data.category),
        isActive: data.active,
        isAvailable: data.active && totalStock > 0,
    };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Re-export formatting utilities from centralized format module
 * @see utils/format.ts
 */
export { formatCurrency, formatPriceShort, formatSoldCount } from '@/utils/format';

/**
 * Find image index in gallery by variantId
 */
export const findGalleryIndexByVariant = (
    gallery: GalleryItem[],
    variantId: string
): number => {
    const index = gallery.findIndex(item => item.variantId === variantId);
    return index >= 0 ? index : 0;
};
