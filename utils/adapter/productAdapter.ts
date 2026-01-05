import { ProductFeedItem, ProductResponseItem } from '@/types/product/product';
import { toPublicUrl } from '@/utils/url';

/**
 * Transform Raw API Data -> Lightweight UI Model
 */
export const transformProduct = (raw: ProductResponseItem): ProductFeedItem => {
    // 1. Primary image logic (Prioritize isPrimary, else take first image)
    const primaryMedia = raw.media.find(m => m.isPrimary) || raw.media[0];

    // 2. Display price logic
    // Prioritize price after voucher (actual amount user pays)
    const displayPrice = raw.priceAfterBestVoucher > 0 ? raw.priceAfterBestVoucher : raw.priceMin;

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
        rating: raw.reviewStatistics.averageRating,
        reviews: raw.reviewStatistics.totalReviews,
        sold: raw.reviewStatistics.verifiedPurchaseCount,
        shopName: raw.shop.shopName,
    };
};