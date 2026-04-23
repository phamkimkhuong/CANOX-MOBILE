import { BaseProductDTO, ProductFeedItem } from '@/types/product/product';
import { toPublicUrl } from '@/utils/url';

/**
 * Shorten Vietnam location names for display
 * Examples:
 * - "Thành Phố Hồ Chí Minh" -> "TP. Hồ Chí Minh"
 */
export const shortenLocationName = (location: string | null | undefined): string => {
    if (!location) return '';

    return location.trim().replace(/^Thành\s+[Pp]hố\s+/i, 'TP. ');
};

/**
 * Transform Raw API Data -> Lightweight UI Model
 * Supports multiple DTO types via BaseProductDTO interface
 * 
 * Price logic:
 * - priceBeforeDiscount    = giá gốc (original price, always highest)
 * - priceAfterBestVoucher  = giá bán (selling price, after best voucher)
 * - If giá bán < giá gốc   -> show both + discount badge
 * - If giá bán = 0 or >= giá gốc -> show giá gốc only
 * 
 * Image logic:
 * - Uses product.media[] (product-level images, NOT variant images)
 * - Prioritize isPrimary flag, fallback to first image
 */
export const transformProduct = (raw: BaseProductDTO): ProductFeedItem => {
    // 1. Primary image (product-level, not variant-level)
    const media = raw.media ?? [];
    const primaryMedia = media.find(m => m.isPrimary) || media[0];

    // 2. Price logic
    const originalPrice = raw.priceBeforeDiscount ?? 0;
    const sellingPrice = raw.priceAfterBestVoucher ?? 0;

    // Giá bán phải > 0 VÀ < giá gốc thì mới hiện giá gốc gạch ngang
    const hasDiscount = sellingPrice > 0 && sellingPrice < originalPrice;
    const displayPrice = hasDiscount ? sellingPrice : originalPrice;

    // Tính % giảm giá
    let discountPercentage = 0;
    if (hasDiscount) {
        discountPercentage = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
    }

    // 3. Location
    const location = shortenLocationName(raw.shop?.shop_location);

    // 4. International badge
    const regions = raw.availableRegions ?? [];
    const isInternational = regions.includes('INTERNATIONAL');

    // 5. Variants — sort by id for deterministic defaultVariantId
    const sortedVariantIds = (raw.variants ?? [])
        .map(v => v.id)
        .sort(); // lexicographic sort = deterministic

    return {
        id: raw.id,
        title: raw.name ?? '',
        thumbnail: toPublicUrl(primaryMedia?.imagePath || primaryMedia?.url, ''),
        price: displayPrice,
        originalPrice: hasDiscount ? originalPrice : undefined,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        rating: raw.reviewStatistics?.averageRating ?? 0,
        reviews: raw.reviewStatistics?.totalReviews ?? 0,
        sold: (raw.variants ?? []).reduce((acc, v) => acc + (v.inventory?.soldCount ?? 0), 0) || raw.reviewStatistics?.verifiedPurchaseCount || 0,
        location,
        isInternational: isInternational || undefined,
        defaultVariantId: sortedVariantIds[0],
        allVariantIds: sortedVariantIds.length > 0 ? sortedVariantIds : undefined,
    };
};