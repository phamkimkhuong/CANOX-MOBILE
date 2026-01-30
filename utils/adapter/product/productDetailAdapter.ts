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
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300';


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
    const optionValues = variant.optionValues ?? [];
    return optionValues.map(ov => {
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

        const promo = variant.promotion;
        const currentPrice = promo?.salePrice ?? variant.price ?? 0;
        const originalPrice = promo?.originalPrice ?? variant.priceBeforeDiscount ?? undefined;

        const value: VariantMatrixValue = {
            id: variant.id,
            price: currentPrice,
            originalPrice: (originalPrice && originalPrice > currentPrice) ? originalPrice : undefined,
            stock: variant.inventory?.available ?? variant.inventory?.stock ?? 0,
            isAvailable: (variant.inventory?.available ?? variant.inventory?.stock ?? 0) > 0,
            sku: variant.sku ?? undefined,
            // Variant can have own image
            media: (variant.imagePath || variant.imageUrl) ? [{
                id: `variant-${variant.id}`,
                url: toSizedImageUrl(variant.imagePath || variant.imageUrl, '', 'medium') ?? DEFAULT_IMAGE,
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
    const mediaArray = productMedia ?? [];
    const sortedProductMedia = [...mediaArray].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

    for (const media of sortedProductMedia) {
        if (!seenIds.has(media.id)) {
            // Priority: imagePath (new template) > basePath + extension (legacy) > url (legacy full URL)
            const imageUrl = toSizedImageUrl(media.imagePath || media.basePath || media.url, media.extension, 'orig')
                || DEFAULT_IMAGE;

            gallery.push({
                id: media.id,
                url: imageUrl,
                type: (media.type as 'IMAGE' | 'VIDEO') ?? 'IMAGE',
                isPrimary: media.isPrimary ?? false,
                variantId: null,
            });
            seenIds.add(media.id);
        }
    }

    for (const variant of variants) {
        if (variant.imagePath || variant.imageUrl) {
            const variantMediaId = `variant-img-${variant.id}`;
            if (!seenIds.has(variantMediaId)) {
                gallery.push({
                    id: variantMediaId,
                    url: toSizedImageUrl(variant.imagePath || variant.imageUrl, '', 'orig') ?? DEFAULT_IMAGE,
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
    // Safe defaults for nullable fields
    const priceMin = data.priceMin ?? 0;
    const priceMax = data.priceMax ?? 0;
    const priceBeforeDiscount = data.priceBeforeDiscount ?? 0;

    // If specific variant selected
    if (selectedVariant) {
        let finalPrice = selectedVariant.price;
        let discountAmount = 0;
        // 1. Get best available voucher (Platform or Shop)
        const bestVoucher = data.bestPlatformVoucher || data.bestShopVoucher;

        // 2. Re-calculate discount amount for this Variant
        if (bestVoucher) {
            const discountValue = bestVoucher.discountValue ?? 0;
            if (bestVoucher.discountType === 'PERCENTAGE') {
                // Calc % discount: Variant Price * % / 100
                const rawDiscount = (selectedVariant.price * discountValue) / 100;

                // Apply cap (Max Discount) if exists
                // Example: 5% off 8,570,000 = 428,500, but max is 250,000 -> Take 250,000
                discountAmount = bestVoucher.maxDiscount
                    ? Math.min(rawDiscount, bestVoucher.maxDiscount)
                    : rawDiscount;
            } else {
                // Fixed cash discount (FIXED)
                discountAmount = discountValue;
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
            currentPrice: finalPrice,
            originalPrice: (selectedVariant.originalPrice && selectedVariant.originalPrice > finalPrice)
                ? selectedVariant.originalPrice
                : (selectedVariant.price > finalPrice ? selectedVariant.price : undefined),
            discountPercentage: totalDiscountPercent > 0 ? totalDiscountPercent : undefined,
            isRange: false,
            voucherDiscount: discountAmount,
            priceAfterVoucher: finalPrice,
        };
    }

    // ========================================
    // VARIANT NOT SELECTED
    // ========================================
    const priceAfterBestVoucher = data.priceAfterBestVoucher ?? 0;
    const hasBestVoucher = priceAfterBestVoucher > 0 && priceAfterBestVoucher < priceMin;
    const displayPrice: number = hasBestVoucher ? priceAfterBestVoucher : priceMin;
    const effectiveOriginalPrice = priceBeforeDiscount > displayPrice ? priceBeforeDiscount : 0;
    // Tính discount percentage
    const discountPercentage = effectiveOriginalPrice > displayPrice
        ? Math.round(((effectiveOriginalPrice - displayPrice) / effectiveOriginalPrice) * 100)
        : undefined;

    const hasRange = priceMin !== priceMax;

    if (hasRange) {
        // Has price range (multiple variants with different prices)
        return {
            currentPrice: displayPrice,
            originalPrice: effectiveOriginalPrice || (hasBestVoucher ? priceMin : undefined),
            priceRange: {
                min: displayPrice,
                max: priceMax,
            },
            discountPercentage,
            isRange: true,
            voucherDiscount: (data.bestPlatformVoucher?.discountAmount ?? undefined),
            priceAfterVoucher: priceAfterBestVoucher || undefined,
        };
    }

    // Fixed price (no variant or all variants same price)
    return {
        currentPrice: displayPrice,
        originalPrice: effectiveOriginalPrice || (hasBestVoucher ? priceMin : undefined),
        discountPercentage,
        isRange: false,
        voucherDiscount: (data.bestPlatformVoucher?.discountAmount ?? undefined),
        priceAfterVoucher: priceAfterBestVoucher || undefined,
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
    if (!shop) {
        return {
            id: '',
            userId: '',
            shopName: '',
            username: '',
            avatar: null,
            logoUrl: null,
            description: null,
            isVerified: false,
        };
    }
    const shopLogo = shop.logoPath ? toPublicUrl(shop.logoPath) : (shop.logoUrl || null);

    return {
        id: shop.shopId ?? '',
        userId: shop.userId ?? '',
        shopName: shop.shopName ?? '',
        username: shop.username ?? '',
        avatar: shopLogo ?? undefined,
        logoUrl: shopLogo ?? undefined,
        description: shop.description ?? undefined,
        isVerified: shop.verifyBy !== null && shop.verifyBy !== undefined,
        rating: shop.rating ?? undefined,
        responseRate: shop.responseRate ?? undefined,
        responseTime: shop.responseTime ?? undefined,
        followerCount: shop.followerCount ?? undefined,
        productCount: shop.productCount ?? undefined,
        location: shop.shop_location || shop.location || undefined,
        lastOnline: shop.lastOnline ?? undefined,
    };
};

/**
 * Transform Voucher from API to UI format
 */
export const transformVoucher = (voucher: Voucher): VoucherUI => {
    return {
        id: voucher.voucherId ?? '',
        code: voucher.code ?? '',
        name: voucher.name ?? undefined,
        description: voucher.description ?? undefined,
        discountType: (voucher.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT') ?? 'PERCENTAGE',
        discountValue: voucher.discountValue ?? 0,
        maxDiscount: voucher.maxDiscount ?? undefined,
        minOrderValue: voucher.minOrderValue ?? undefined,
        sponsorType: voucher.sponsorType as 'PLATFORM' | 'SHOP' | undefined,
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
    const variantArray = variants ?? [];
    return variantArray.reduce((total, v) => {
        return total + (v.inventory?.available ?? v.inventory?.stock ?? 0);
    }, 0);
};

// ============================================
// FLASH SALE / CAMPAIGN LOGIC
// ============================================

/**
 * Build Flash Sale info from activeCampaigns
 * 
 * Uses real data from BE - no more simulation/fallback
 */
export const buildFlashSaleInfo = (
    data: ProductDetailResponse,
    totalStock: number
): FlashSaleInfo | undefined => {
    // Check activeCampaigns for any active tactical campaign
    const tacticalCampaigns = ['FLASH_SALE', 'DAILY_DEAL', 'MEGA_SALE', 'SHOP_SALE', 'SHOP_PROMOTION'];
    const activeCampaign = data.activeCampaigns?.find(c =>
        tacticalCampaigns.includes(c.campaignType ?? '')
    );

    if (activeCampaign) {
        // Get max discount percentage from variant promotions
        const maxDiscount = data.variants?.reduce((max, v) => {
            const pct = v.promotion?.discountPercent ?? 0;
            return pct > max ? pct : max;
        }, 0) ?? 0;

        return {
            isActive: true,
            endTime: activeCampaign.endTime ?? undefined,
            secondsRemaining: activeCampaign.secondsRemaining ?? undefined,
            campaignType: activeCampaign.campaignType ?? undefined,
            discountPercentage: maxDiscount > 0 ? maxDiscount : undefined,
            quantityLimit: totalStock + (data.totalSold ?? 0),
            quantitySold: data.totalSold ?? 0,
        };
    }

    // Fallback: API returns flashSale object directly (legacy support)
    if (data.flashSale?.isActive && data.flashSale.endTime) {
        return data.flashSale;
    }

    // No active campaign/flash sale
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

    // Safe arrays for buildVariantMatrix and buildGallery
    const variantsArray = (data.variants ?? []).filter(v => v !== null);
    const mediaArray = (data.media ?? []).filter(m => m !== null);

    // Build variant matrix (needs options for mapping)
    const variantMatrix = buildVariantMatrix(variantsArray, apiOptions);

    // Build gallery
    const gallery = buildGallery(mediaArray, variantsArray);

    // Transform shop
    const shop = transformShop(data.shop);

    // Calculate initial price display
    const priceDisplay = calculatePriceDisplay(data);

    // Collect and transform vouchers
    const vouchers = collectVouchers(data);

    // Extract best voucher for variant price calculation
    const apiVoucher = data.bestPlatformVoucher || data.bestShopVoucher;
    const bestVoucher = apiVoucher ? {
        discountType: (apiVoucher.discountType ?? 'PERCENTAGE') as 'PERCENTAGE' | 'FIXED_AMOUNT',
        discountValue: apiVoucher.discountValue ?? 0,
        maxDiscount: apiVoucher.maxDiscount ?? undefined,
    } : undefined;

    // Calculate total stock
    const totalStock = calculateTotalStock(variantsArray);

    // Build specifications
    const specifications: ProductSpec[] = data.specifications ?? [];

    // Build Flash Sale với fallback logic
    const flashSale = buildFlashSaleInfo(data, totalStock);

    // Transform reviewStatistics to match expected type
    const reviewStats = data.reviewStatistics ?? { totalReviews: 0, averageRating: 0 };
    const reviewStatistics = {
        reviewableId: reviewStats.reviewableId ?? undefined,
        totalReviews: reviewStats.totalReviews ?? 0,
        averageRating: reviewStats.averageRating ?? 0,
        ratingDistribution: reviewStats.ratingDistribution ?? undefined,
        ratingPercentage: reviewStats.ratingPercentage ?? undefined,
        verifiedPurchaseCount: reviewStats.verifiedPurchaseCount ?? undefined,
        verifiedPurchasePercentage: reviewStats.verifiedPurchasePercentage ?? undefined,
        commentCount: reviewStats.commentCount ?? undefined,
        mediaReviewCount: reviewStats.mediaReviewCount ?? undefined,
        imageReviewCount: reviewStats.imageReviewCount ?? undefined,
        videoReviewCount: reviewStats.videoReviewCount ?? undefined,
    };

    return {
        // Basic Info
        id: data.id,
        name: data.name ?? '',
        slug: data.slug ?? '',
        description: data.description ?? null,

        // Price
        priceDisplay,

        // Media
        gallery,

        // Variants
        options,
        variantMatrix,
        hasVariants: variantsArray.length > 0 && options.length > 0,

        // Shop
        shop,

        // Stats
        rating: reviewStatistics.averageRating,
        totalReviews: reviewStatistics.totalReviews,
        totalSold: data.totalSold ?? 0,
        reviewStatistics,

        // Features - Sử dụng fallback logic
        flashSale,
        vouchers,
        bestVoucher,
        shipping: data.shipping ?? undefined,
        specifications,
        categoryPath: buildCategoryPath(data.category),
        isActive: data.active ?? true,
        isAvailable: (data.active ?? true) && totalStock > 0,
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
