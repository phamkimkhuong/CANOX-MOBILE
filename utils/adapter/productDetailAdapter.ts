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
} from '@/types/productDetail';
import { getNextFlashSaleSlot } from '../date';


const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? 'https://pub-5341c10461574a539df355b9fbe87197.r2.dev/';


/**
 * Build mapping từ optionValue.id -> { optionName, valueName }
 * Cần thiết vì API variant.optionValues chỉ có id/name, không có optionName
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
 * Normalize variant optionValues với thông tin optionName
 */
export const normalizeVariantOptionValues = (
    variant: ProductVariant,
    optionValueMapping: Map<string, { optionName: string; valueName: string }>
): NormalizedOptionValue[] => {
    return variant.optionValues.map(ov => {
        const mapping = optionValueMapping.get(ov.id);
        return {
            optionId: ov.id, // Trong API này, optionValue.id là unique
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
 * Tạo deterministic, collision-free key cho Variant Matrix
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

    // Sort keys alphabetically để đảm bảo deterministic output
    const sortedKeys = Object.keys(normalized).sort();
    const sorted = sortedKeys.reduce((acc, key) => {
        acc[key] = normalized[key];
        return acc;
    }, {} as Record<string, string>);

    // JSON.stringify is deterministic with sorted keys
    return JSON.stringify(sorted);
};

/**
 * Tạo key từ selected options object (user selection state)
 */
export const createKeyFromSelection = (
    selectedOptions: Record<string, string>
): VariantMatrixKey => {
    // Normalize và filter empty values
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
 * Build Variant Matrix từ mảng variants
 */
export const buildVariantMatrix = (
    variants: ProductVariant[],
    options: ProductOption[]
): VariantMatrix => {
    const matrix: VariantMatrix = new Map();
    const optionValueMapping = buildOptionValueMapping(options);

    for (const variant of variants) {
        // Normalize optionValues với optionName
        const normalizedValues = normalizeVariantOptionValues(variant, optionValueMapping);
        const key = createVariantMatrixKey(normalizedValues);

        const value: VariantMatrixValue = {
            id: variant.id,
            price: variant.price,
            originalPrice: variant.corePrice !== variant.price ? variant.corePrice : undefined,
            stock: variant.inventory.stock,
            isAvailable: variant.inventory.stock > 0,
            sku: variant.sku,
            // Variant có thể có ảnh riêng
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
 * Handle cả relative path và full URL
 */
export const getFullImageUrl = (
    url: string,
    baseUrl: string = IMAGE_BASE_URL
): string => {
    if (!url) return '';

    // Nếu đã là full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Ghép với base URL, đảm bảo không duplicate slash
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${cleanPath}`;
};

/**
 * Gộp media từ product chung và từng variant
 * Sort theo: isPrimary DESC, sortOrder ASC
 */
export const buildGallery = (
    productMedia: ProductDetailResponse['media'],
    variants: ProductVariant[]
): GalleryItem[] => {
    const gallery: GalleryItem[] = [];
    const seenIds = new Set<string>();

    // 1. Thêm media chung của product (primary first)
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

    // 2. Thêm media riêng của từng variant (nếu có imageUrl)
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
 * Tính toán Price Display
 */
export const calculatePriceDisplay = (
    data: ProductDetailResponse,
    selectedVariant?: VariantMatrixValue | null
): PriceDisplay => {
    // Nếu đã chọn variant cụ thể
    if (selectedVariant) {
        const voucherDiscount = data.priceAfterBestVoucher && data.basePrice > 0
            ? data.basePrice - data.priceAfterBestVoucher
            : 0;

        const priceAfterVoucher = voucherDiscount > 0
            ? selectedVariant.price - voucherDiscount
            : selectedVariant.price;

        const discountPercentage = selectedVariant.originalPrice
            ? Math.round(
                ((selectedVariant.originalPrice - priceAfterVoucher) /
                    selectedVariant.originalPrice) *
                100
            )
            : voucherDiscount > 0
                ? Math.round((voucherDiscount / selectedVariant.price) * 100)
                : undefined;

        return {
            currentPrice: priceAfterVoucher, // ← Giá SAU voucher
            originalPrice: selectedVariant.price, // ← Giá GỐC variant (trước voucher)
            discountPercentage,
            isRange: false,
            voucherDiscount: data.bestPlatformVoucher?.discountValue,
            priceAfterVoucher,
        };
    }

    // ========================================
    // CHƯA CHỌN VARIANT
    // ========================================
    const hasBestVoucher = data.priceAfterBestVoucher && data.priceAfterBestVoucher < data.priceMin;
    const displayPrice: number = hasBestVoucher ? data.priceAfterBestVoucher! : data.priceMin;
    // Tính discount percentage
    const discountPercentage = data.basePrice > displayPrice
        ? Math.round(((data.basePrice - displayPrice) / data.basePrice) * 100)
        : undefined;

    const hasRange = data.priceMin !== data.priceMax;

    if (hasRange) {
        // Có khoảng giá (nhiều variants khác giá)
        return {
            currentPrice: displayPrice, // ← Giá SAU voucher
            originalPrice: hasBestVoucher ? data.priceMin : undefined, // ← Giá trước voucher
            priceRange: {
                min: displayPrice,
                max: data.priceMax,
            },
            discountPercentage,
            isRange: true,
            voucherDiscount: data.bestPlatformVoucher?.discountValue,
            priceAfterVoucher: data.priceAfterBestVoucher,
        };
    }

    // Giá cố định (không có variant hoặc tất cả variant cùng giá)
    return {
        currentPrice: displayPrice, // ← Giá SAU voucher
        originalPrice: hasBestVoucher ? data.basePrice : undefined, // ← Giá trước voucher
        discountPercentage,
        isRange: false,
        voucherDiscount: data.bestPlatformVoucher?.discountValue,
        priceAfterVoucher: data.priceAfterBestVoucher,
    };
};

/**
 * Transform options từ API sang UI format
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
                image: null, // API hiện tại không có ảnh cho option value
            })),
    }));
};

/**
 * Transform Shop từ API sang UI format
 */
export const transformShop = (shop: ProductDetailResponse['shop']): ShopUI => {
    return {
        id: shop.shopId,
        shopName: shop.shopName,
        username: shop.username,
        avatar: shop.logoUrl,
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
 * Transform Voucher từ API sang UI format
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

    // API dùng 'parent' thay vì 'parentCategory'
    if (category.parent) {
        return `${category.parent.name} > ${category.name}`;
    }

    return category.name;
};

/**
 * Gộp tất cả vouchers thành UI format
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
 * Tính tổng stock còn lại
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
 * Tạo Flash Sale info từ API response hoặc fallback từ Home slot
 * 
 * Logic "Fake it until you make it":
 * 1. Nếu API trả về flashSale với isActive = true → Dùng luôn
 * 2. Nếu API có promotedUntil → Tạo flash sale từ promotedUntil
 * 3. FALLBACK: Lấy slot từ Home (getNextFlashSaleSlot)
 * 
 * Khi Backend có API thật, chỉ cần sửa logic này, UI không cần động vào.
 */
export const buildFlashSaleInfo = (
    data: ProductDetailResponse,
    totalStock: number
): FlashSaleInfo | undefined => {
    // Case 1: API trả về flash sale đầy đủ
    if (data.flashSale?.isActive && data.flashSale.endTime) {
        return data.flashSale;
    }

    // Case 2: API có flashSale.isActive nhưng thiếu endTime
    if (data.flashSale?.isActive) {
        const slot = getNextFlashSaleSlot();
        return {
            ...data.flashSale,
            endTime: slot.endTime,
        };
    }

    // Case 3: API có promotedUntil (sản phẩm đang được promote)
    if (data.promotedUntil) {
        const promotedDate = new Date(data.promotedUntil);
        // Chỉ tạo flash sale nếu promotedUntil còn hiệu lực
        if (promotedDate.getTime() > Date.now()) {
            return {
                isActive: true,
                endTime: data.promotedUntil,
                // Ước lượng từ data có sẵn
                quantityLimit: totalStock > 0 ? totalStock + (data.totalSold ?? 0) : undefined,
                quantitySold: data.totalSold,
            };
        }
    }

    // Case 4: FALLBACK - Giả lập Flash Sale từ Home slot
    // Điều kiện: Sản phẩm còn hàng và có voucher (đang sale)
    const hasActiveVoucher = data.bestPlatformVoucher || data.bestShopVoucher;
    const hasStock = totalStock > 0;

    if (hasActiveVoucher && hasStock) {
        const slot = getNextFlashSaleSlot();
        return {
            isActive: true,
            endTime: slot.endTime,
            // Ước lượng quantity từ inventory
            quantityLimit: totalStock + (data.totalSold ?? 0),
            quantitySold: data.totalSold ?? 0,
        };
    }

    // Không có flash sale
    return undefined;
};

/**
 * MAIN TRANSFORM FUNCTION
 * Biến đổi ProductDetailResponse từ API thành ProductDetailUI cho component
 */
export const transformProductDetail = (
    data: ProductDetailResponse
): ProductDetailUI => {
    // Get and transform options
    const apiOptions = data.options ?? [];
    const options = transformOptions(apiOptions);

    // Build variant matrix (cần options để mapping)
    const variantMatrix = buildVariantMatrix(data.variants, apiOptions);

    // Build gallery
    const gallery = buildGallery(data.media, data.variants);

    // Transform shop
    const shop = transformShop(data.shop);

    // Calculate initial price display
    const priceDisplay = calculatePriceDisplay(data);

    // Collect and transform vouchers
    const vouchers = collectVouchers(data);

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

        // Features - Sử dụng fallback logic
        flashSale,
        vouchers,
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
 * Tìm index của ảnh trong gallery theo variantId
 */
export const findGalleryIndexByVariant = (
    gallery: GalleryItem[],
    variantId: string
): number => {
    const index = gallery.findIndex(item => item.variantId === variantId);
    return index >= 0 ? index : 0;
};
