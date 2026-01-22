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
 */
export const transformProduct = (raw: BaseProductDTO): ProductFeedItem => {
    // 1. Primary image logic (Prioritize isPrimary, else take first image)
    const media = raw.media ?? [];
    const primaryMedia = media.find(m => m.isPrimary) || media[0];

    // 2. Display price logic
    const priceMin = raw.priceMin ?? 0;
    const priceAfterVoucher = raw.priceAfterBestVoucher ?? 0;
    const priceBeforeDiscount = raw.priceBeforeDiscount ?? 0;

    // Prioritize price after voucher (actual amount user pays)
    const displayPrice = priceAfterVoucher > 0 ? priceAfterVoucher : priceMin;

    // Original price: use priceBeforeDiscount if available, else priceMin
    const originalPrice = priceBeforeDiscount > displayPrice ? priceBeforeDiscount : undefined;

    // 3. Calculate % discount
    let discount = 0;
    if (originalPrice && originalPrice > displayPrice) {
        discount = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    const location = shortenLocationName(raw.shop?.shop_location);

    return {
        id: raw.id,
        title: raw.name ?? '',
        thumbnail: toPublicUrl(primaryMedia?.url ?? ''),
        price: displayPrice,
        originalPrice,
        discountPercentage: discount > 0 ? discount : undefined,
        rating: raw.reviewStatistics?.averageRating ?? 0,
        reviews: raw.reviewStatistics?.totalReviews ?? 0,
        sold: raw.reviewStatistics?.verifiedPurchaseCount ?? 0,
        location,
    };
};