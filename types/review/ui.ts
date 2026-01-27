/**
 * ==============================================
 * REVIEW UI MODELS - Domain Layer
 * ==============================================
 */

import { ReviewMediaDTO, ReviewMediaType, ReviewStatus, ReviewType } from './dto';

// Re-export base types for backward compatibility
export type { ReviewMediaType, ReviewStatus, ReviewType };

/**
 * Pending review item UI model
 */
export interface PendingReviewItemUI {
    itemId: string;
    productId: string;
    variantId: string;
    productName: string;
    imageUrl: string;
    variantAttributes: string | null;
    price: number;
    formattedPrice: string;
    orderId: string;
    orderNumber: string;
    deliveredAt: string;
    shopId: string;
    shopName: string;
    shopLogo: string | null;
}

/**
 * Pending review grouped by order
 */
export interface PendingReviewGroupUI {
    orderId: string;
    orderNumber: string;
    deliveredAt: string;
    shopName: string;
    items: PendingReviewItemUI[];
}

/**
 * My review item for UI display
 */
export interface MyReviewUI {
    id: string;
    reviewType: ReviewType;
    productId: string;
    productName: string;
    productImage: string;
    variantAttributes: string | null;
    rating: number;
    comment: string;
    status: ReviewStatus;
    createdDate: string;
    media: ReviewMediaDTO[];
    helpfulCount: number;
    hasSellerResponse: boolean;
    sellerResponse?: {
        comment: string;
        date: string;
    } | null;
}

/**
 * Media item being uploaded
 */
export interface ReviewMediaItemUI {
    id: string;
    uri: string;
    type: ReviewMediaType;
    uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    assetId?: string;
    error?: string;
    fileSize?: number;
    duration?: number;
}

/**
 * Review form values (react-hook-form)
 */
export interface ReviewFormValues {
    rating: number;
    comment: string;
    selectedTags: string[];
    isAnonymous: boolean;
}

/**
 * Rating filter options
 */
export type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5 | 'with-media' | 'with-response';

/**
 * Rating filter option for UI
 */
export interface RatingFilterOption {
    value: RatingFilter;
    label: string;
    icon?: string;
}

// === Type aliases for backward compatibility ===
export type PendingReviewItem = PendingReviewItemUI;
export type PendingReviewGroup = PendingReviewGroupUI;
export type ReviewMediaItem = ReviewMediaItemUI;
