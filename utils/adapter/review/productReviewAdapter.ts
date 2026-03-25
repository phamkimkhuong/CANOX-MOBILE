/**
 * ==============================================
 * PRODUCT REVIEW ADAPTER
 * ==============================================
 * Transforms API DTOs to UI-ready models for All Reviews screen
 * Handles: name masking, date formatting, media processing
 */

import {
    ProductReviewDTO,
    ProductReviewFilterParams,
    ProductReviewFilterType,
    ProductReviewMediaDTO,
    ProductReviewMediaUI,
    ProductReviewPageData,
    ProductReviewsResponse,
    ProductReviewStatisticsDTO,
    ProductReviewStatisticsUI,
    ProductReviewUI,
    ReviewEmptyStateConfig,
    SellerResponseUI,
    VariantFilterOptionDTO,
    VariantFilterOptionUI,
} from '@/types/review/productReview';
import { formatRelativeDate } from '@/utils/date';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Mask username for privacy
 * nguyenvana → n*****a
 * abc → a*c
 * ab → a*
 */
export const maskUsername = (name: string | null | undefined): string => {
    if (!name) return 'Người dùng';

    const trimmed = name.trim();
    if (trimmed.length <= 2) {
        return trimmed.length === 2 ? `${trimmed[0]}*` : trimmed;
    }

    const firstChar = trimmed[0];
    const lastChar = trimmed[trimmed.length - 1];
    const maskedMiddle = '*'.repeat(Math.min(5, trimmed.length - 2));

    return `${firstChar}${maskedMiddle}${lastChar}`;
};

/**
 * Format review count for display
 * 1500 → "1.5k"
 * 500 → "500"
 */
export const formatReviewCount = (count: number): string => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return count.toString();
};

/**
 * Get display name from DTO (prioritize buyerName, fallback to username)
 */
const getDisplayName = (dto: ProductReviewDTO): string => {
    // Prioritize buyerName as it's the more direct field for the reviewer
    return maskUsername(dto.buyerName || dto.username || null);
};

// ============================================
// MEDIA ADAPTER
// ============================================

/**
 * Transform media DTO to UI model
 */
export const toProductReviewMediaUI = (dto: ProductReviewMediaDTO): ProductReviewMediaUI => ({
    id: dto.id,
    url: dto.url,
    type: dto.type,
    thumbnailUrl: dto.thumbnailUrl ?? undefined,
    duration: dto.duration ?? undefined,
});

// ============================================
// SELLER RESPONSE ADAPTER
// ============================================

/**
 * Transform seller response to UI model
 */
export const toSellerResponseUI = (
    dto: ProductReviewDTO,
    shopName: string = 'Shop'
): SellerResponseUI | null => {
    if (!dto.hasResponse || !dto.sellerResponse) {
        return null;
    }

    const respondedAt = dto.sellerResponseDate || '';

    return {
        shopName,
        comment: dto.sellerResponse,
        respondedAt,
        formattedDate: formatRelativeDate(respondedAt) || 'Đã phản hồi',
    };
};

// ============================================
// SINGLE REVIEW ADAPTER
// ============================================

/**
 * Transform single review DTO to UI model
 */
export const toProductReviewUI = (
    dto: ProductReviewDTO,
    shopName: string = 'Shop'
): ProductReviewUI => {
    const media = (dto.media || []).map(toProductReviewMediaUI);
    const imageCount = media.filter(m => m.type === 'IMAGE').length;
    const videoCount = media.filter(m => m.type === 'VIDEO').length;

    const createdAt = dto.createdDate || '';

    return {
        id: dto.id,

        // User info
        userId: dto.userId || dto.buyerId || '',
        userName: getDisplayName(dto),
        userAvatar: dto.userAvatar || null,
        isVerifiedPurchase: dto.verifiedPurchase ?? false,

        // Rating
        rating: dto.rating,

        // Variant info
        variantId: dto.variantId || null,
        variantAttributes: dto.variantAttributes || '',
        hasVariantInfo: Boolean(dto.variantAttributes),

        // Content
        comment: dto.comment,

        // Media
        media,
        hasMedia: media.length > 0,
        imageCount,
        videoCount,

        // Seller response
        hasSellerResponse: dto.hasResponse ?? false,
        sellerResponse: toSellerResponseUI(dto, shopName),

        // Engagement
        helpfulCount: dto.helpfulCount || 0,
        isHelpful: dto.userHasVotedHelpful ?? false,

        // Timestamps
        createdDate: createdAt,
        formattedDate: formatRelativeDate(createdAt) || '',
    };
};

/**
 * Transform array of review DTOs to UI models
 */
export const toProductReviewsUI = (
    dtos: ProductReviewDTO[],
    shopName?: string
): ProductReviewUI[] => {
    return dtos.map(dto => toProductReviewUI(dto, shopName));
};

// ============================================
// STATISTICS ADAPTER
// ============================================

/**
 * Transform variant filter option DTO to UI
 */
export const toVariantFilterOptionUI = (dto: VariantFilterOptionDTO): VariantFilterOptionUI => ({
    variantId: dto.variantId,
    label: dto.label,
    reviewCount: dto.reviewCount,
    formattedCount: `(${formatReviewCount(dto.reviewCount)})`,
});

/**
 * Transform statistics DTO to UI model
 */
export const toProductReviewStatisticsUI = (
    dto: ProductReviewStatisticsDTO
): ProductReviewStatisticsUI => ({
    averageRating: dto.averageRating,
    formattedRating: dto.averageRating.toFixed(1),
    totalReviews: dto.totalReviews,
    formattedTotal: formatReviewCount(dto.totalReviews),
    ratingDistribution: dto.ratingDistribution || {},
    ratingPercentage: dto.ratingPercentage || {},
    mediaReviewCount: dto.mediaReviewCount || 0,
    responseReviewCount: dto.responseReviewCount || 0,
    variantOptions: (dto.variantOptions || []).map(toVariantFilterOptionUI),
});

// ============================================
// FULL RESPONSE ADAPTER
// ============================================

/**
 * Transform full API response to page data for infinite query
 */
export const toProductReviewPageData = (
    response: ProductReviewsResponse,
    shopName?: string
): ProductReviewPageData => {
    const data = response.data;

    if (!data) {
        return {
            reviews: [],
            statistics: null,
            pagination: {
                page: 0,
                hasNext: false,
                totalElements: 0,
                totalPages: 0,
            },
        };
    }

    return {
        reviews: toProductReviewsUI(data.content || [], shopName),
        statistics: data.statistics ? toProductReviewStatisticsUI(data.statistics) : null,
        pagination: {
            page: data.page,
            hasNext: data.hasNext,
            totalElements: data.totalElements ?? 0,
            totalPages: data.totalPages,
        },
    };
};

// ============================================
// EMPTY STATE HELPER
// ============================================

/**
 * Get empty state config based on current filter
 */
export const getReviewEmptyState = (
    filter: ProductReviewFilterType,
    variantLabel?: string
): ReviewEmptyStateConfig => {
    if (filter === 1) {
        return {
            icon: 'checkmark-circle',
            title: 'Tuyệt vời!',
            subtitle: 'Sản phẩm này chưa có đánh giá 1 sao nào.',
            isPositive: true,
        };
    }

    if (filter === 2) {
        return {
            icon: 'checkmark-circle',
            title: 'Tuyệt vời!',
            subtitle: 'Sản phẩm này chưa có đánh giá 2 sao nào.',
            isPositive: true,
        };
    }

    if (filter === 'with-media') {
        return {
            icon: 'camera',
            title: 'Chưa có hình ảnh',
            subtitle: 'Chưa có khách hàng nào đăng ảnh/video review.',
            isPositive: false,
        };
    }

    if (filter === 'with-response') {
        return {
            icon: 'chat-dots',
            title: 'Chưa có phản hồi',
            subtitle: 'Chưa có đánh giá nào được shop phản hồi.',
            isPositive: false,
        };
    }

    // For variant filter
    if (variantLabel) {
        return {
            icon: 'tag',
            title: 'Chưa có đánh giá',
            subtitle: `Phân loại "${variantLabel}" chưa có đánh giá nào.`,
            isPositive: false,
        };
    }

    // Default (all)
    return {
        icon: 'chat-bubble',
        title: 'Chưa có đánh giá',
        subtitle: 'Hãy là người đầu tiên đánh giá sản phẩm này!',
        isPositive: false,
    };
};

// ============================================
// FILTER HELPERS
// ============================================

/**
 * Parse filter type to API params
 */
export const parseProductReviewFilter = (
    filter: ProductReviewFilterType,
    sortOption: string = 'newest'
): Partial<ProductReviewFilterParams> => {
    const params: Partial<ProductReviewFilterParams> = {};

    // Map sortBy
    if (sortOption === 'newest') params.sortBy = 'NEWEST';
    else if (sortOption === 'helpful') params.sortBy = 'HELPFUL';
    else if (sortOption === 'oldest') params.sortBy = 'OLDEST';

    // Map spring sort array for more robust sorting if needed
    if (sortOption === 'rating_high') params.sort = ['rating,desc', 'createdDate,desc'];
    else if (sortOption === 'rating_low') params.sort = ['rating,asc', 'createdDate,desc'];

    // Map filters
    if (filter === 'all') return params;

    if (filter === 'with-media') {
        params.mediaFilter = 'ALL';
    } else if (filter === 'with-response') {
        params.hasResponse = true;
    } else if (typeof filter === 'number') {
        params.rating = filter;
    }

    return params;
};
