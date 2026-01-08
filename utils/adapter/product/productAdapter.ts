import { BaseProductDTO, ProductFeedItem } from '@/types/product/product';
import { toPublicUrl } from '@/utils/url';

/**
 * Transform Raw API Data -> Lightweight UI Model
 * Supports multiple DTO types via BaseProductDTO interface
 */
export const transformProduct = (raw: BaseProductDTO): ProductFeedItem => {
    // 1. Primary image logic (Prioritize isPrimary, else take first image)
    const primaryMedia = raw.media.find(m => m.isPrimary) || raw.media[0];

    // 2. Display price logic
    // Handle optional fields from different DTOs
    const priceAfterVoucher = raw.priceAfterBestVoucher ?? 0;
    const priceMin = raw.priceMin ?? raw.basePrice;

    // Prioritize price after voucher (actual amount user pays)
    const displayPrice = priceAfterVoucher > 0 ? priceAfterVoucher : priceMin;

    // 3. Calculate % discount
    let discount = 0;
    if (raw.basePrice > displayPrice) {
        discount = Math.round(((raw.basePrice - displayPrice) / raw.basePrice) * 100);
    }

    return {
        id: raw.id,
        title: raw.name,
        thumbnail: toPublicUrl(primaryMedia?.url),
        price: displayPrice,
        originalPrice: raw.basePrice > displayPrice ? raw.basePrice : undefined,
        discountPercentage: discount > 0 ? discount : undefined,
        rating: raw.reviewStatistics?.averageRating ?? 0,
        reviews: raw.reviewStatistics?.totalReviews ?? 0,
        sold: raw.reviewStatistics?.verifiedPurchaseCount ?? 0,
        shopName: raw.shop.shopName,
    };
};