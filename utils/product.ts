import { ProductFeedItem, ProductResponseItem } from '@/types/product';

// Cần cấu hình biến môi trường cho CDN URL
const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://pub-5341c10461574a539df355b9fbe87197.r2.dev/';

export const getImageUrl = (path: string | null): string => {
    if (!path) return 'https://via.placeholder.com/300'; // Ảnh mặc định
    if (path.startsWith('http')) return path; // Đã là full url
    return `${CDN_BASE_URL}${path}`; // Ghép base url
};

/**
 * Transform Raw API Data -> Lightweight UI Model
 */
export const transformProduct = (raw: ProductResponseItem): ProductFeedItem => {
    // 1. Logic lấy ảnh đại diện (Ưu tiên isPrimary, nếu không lấy ảnh đầu tiên)
    const primaryMedia = raw.media.find(m => m.isPrimary) || raw.media[0];

    // 2. Logic tính giá hiển thị
    // Ưu tiên hiển thị giá sau voucher (thực tế user phải trả)
    const displayPrice = raw.priceAfterBestVoucher > 0 ? raw.priceAfterBestVoucher : raw.priceMin;

    // 3. Tính % giảm giá
    let discount = 0;
    if (raw.basePrice > displayPrice) {
        discount = Math.round(((raw.basePrice - displayPrice) / raw.basePrice) * 100);
    }

    return {
        id: raw.id,
        title: raw.name,
        thumbnail: getImageUrl(primaryMedia?.url),
        price: displayPrice,
        originalPrice: raw.basePrice > displayPrice ? raw.basePrice : undefined,
        discountPercentage: discount > 0 ? discount : undefined,
        rating: raw.reviewStatistics.averageRating,
        reviews: raw.reviewStatistics.totalReviews,
        sold: raw.reviewStatistics.verifiedPurchaseCount, // Dùng số lượt mua làm số đã bán
        shopName: raw.shop.shopName,
    };
};