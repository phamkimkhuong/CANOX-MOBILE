/**
 * ==============================================
 * REVIEW ADAPTER
 * ==============================================
 * Transform API DTOs to UI Models and handle logic.
 */

import { Order, OrderItem } from '@/types/order/order';
import {
    CreateReviewRequest,
    FetchReviewParams,
    MyReviewsListItemDTO,
    MyReviewUI,
    PendingReviewGroupUI,
    PendingReviewItemUI,
    RatingFilter,
} from '@/types/review';
import { REVIEW_INCENTIVE } from '@/utils/adapter/review/reviewIncentives';
import { QUICK_TAGS, RATING_LABELS } from '@/utils/adapter/review/reviewTags';
import { formatCurrency } from '@/utils/format';
import { buildImageUrl } from '@/utils/url';

/**
 * Transform OrderItem + Order → PendingReviewItemUI
 */
export const toPendingReviewItemUI = (
    item: OrderItem,
    order: Order
): PendingReviewItemUI => ({
    itemId: item.itemId || `${order.orderId}-${item.productId}`, // Fallback if itemId is null
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    imageUrl: buildImageUrl(item.imagePath, '', 'medium'),
    variantAttributes: item.variantAttributes,
    price: item.unitPrice,
    formattedPrice: formatCurrency(item.unitPrice),
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    deliveredAt: order.createdAt || new Date().toISOString(),
    shopId: order.shopId || '',
    shopName: order.shopInfo?.shopName || 'Shop',
    shopLogo: order.shopInfo?.logoUrl ? buildImageUrl(order.shopInfo.logoUrl, '', '') : null,
});

/**
 * Extract unreviewed items from orders and group them
 */
export const extractPendingReviews = (orders: Order[]): PendingReviewGroupUI[] => {
    const groups: PendingReviewGroupUI[] = [];

    for (const order of orders) {
        const unreviewedItems = order.items.filter((item) => !item.reviewed);

        if (unreviewedItems.length > 0) {
            groups.push({
                orderId: order.orderId || '',
                orderNumber: order.orderNumber || '000000',
                deliveredAt: order.createdAt || new Date().toISOString(),
                shopName: order.shopInfo?.shopName || 'Shop',
                items: unreviewedItems.map((item) => toPendingReviewItemUI(item, order)),
            });
        }
    }

    return groups.sort(
        (a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime()
    );
};

/**
 * Transform MyReviewDTO → MyReviewUI
 */
export const toMyReviewUI = (dto: MyReviewsListItemDTO): MyReviewUI => ({
    id: dto.id,
    reviewType: dto.reviewType,
    productId: dto.reviewableId,
    productName: `Product #${dto.reviewableId.slice(-6)}`,
    productImage: '',
    variantAttributes: null,
    rating: dto.rating,
    comment: dto.comment,
    status: dto.status,
    createdDate: dto.createdDate || new Date().toISOString(),
    media: dto.media || [],
    helpfulCount: dto.helpfulCount || 0,
    hasSellerResponse: dto.hasResponse || false,
    sellerResponse: dto.sellerResponse
        ? {
            comment: dto.sellerResponse,
            date: dto.sellerResponseDate || '',
        }
        : null,
});

/**
 * Parse RatingFilter UI type to API Fetch Params
 */
export const parseRatingFilter = (filter: RatingFilter): Partial<FetchReviewParams> => {
    if (filter === 'all') return {};
    if (filter === 'with-media') return { hasMedia: true };
    if (filter === 'with-response') return { hasResponse: true };
    if (typeof filter === 'number') return { rating: filter };
    return {};
};

/**
 * Build CreateReviewRequest payload for API
 */
export const toCreateReviewRequest = (params: {
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
    mediaAssetIds?: string[];
    reviewType?: 'PRODUCT' | 'SHOP' | 'ORDER';
}): CreateReviewRequest => ({
    reviewType: params.reviewType || 'PRODUCT',
    reviewableId: params.productId,
    rating: params.rating,
    comment: params.comment,
    orderId: params.orderId,
    mediaAssetIds: params.mediaAssetIds || [],
});

/**
 * Logic for calculating rewards
 */
export const calculateEstimatedReviewReward = (
    hasPhotos: boolean,
    hasVideo: boolean,
    incentiveConfig = REVIEW_INCENTIVE
): number => {
    let reward = incentiveConfig.baseReward;
    if (hasPhotos) reward += incentiveConfig.bonusWithPhoto;
    if (hasVideo) reward += incentiveConfig.bonusWithVideo;
    return reward;
};

/**
 * Get max possible reward
 */
export const getMaxReviewReward = (incentiveConfig = REVIEW_INCENTIVE): number => {
    return (
        incentiveConfig.baseReward +
        incentiveConfig.bonusWithPhoto +
        incentiveConfig.bonusWithVideo
    );
};

/**
 * Get reward type label
 */
export const getReviewRewardTypeLabel = (incentiveConfig = REVIEW_INCENTIVE): string => {
    return incentiveConfig.type === 'coins' ? 'Xu' : 'Điểm';
};

/**
 * Get tags for specific rating
 */
export const getReviewTagsForRating = (rating: number) => {
    if (rating < 1 || rating > 5) return [];
    return QUICK_TAGS.filter(
        (tag) => rating >= tag.ratingRange[0] && rating <= tag.ratingRange[1]
    );
};

/**
 * Get rating label
 */
export const getReviewRatingLabel = (rating: number): string => {
    return RATING_LABELS[rating] || '';
};
