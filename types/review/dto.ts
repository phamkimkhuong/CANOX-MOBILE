/**
 * ==============================================
 * REVIEW DTOs - API Layer
 * ==============================================
 * Raw data structures from the backend API
 */

/**
 * Review type enum
 */
export type ReviewType = 'PRODUCT' | 'SHOP' | 'ORDER';

/**
 * Review status
 */
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Media type (IMAGE, VIDEO)
 */
export type ReviewMediaType = 'IMAGE' | 'VIDEO';

/**
 * Media item in review response
 */
export interface ReviewMediaDTO {
    id: string;
    url: string;
    type: ReviewMediaType;
    sortOrder?: number;
}

/**
 * My review item from API response
 */
export interface MyReviewDTO {
    id: string;
    reviewType: ReviewType;
    reviewableId: string;
    rating: number;
    comment: string;
    userId: string;
    username: string;
    userAvatar: string | null;
    buyerId: string;
    buyerName: string;
    verifiedPurchase: boolean;
    orderId: string;
    status: ReviewStatus;
    rejectionReason?: string;
    helpfulCount: number;
    hasResponse: boolean;
    sellerResponse?: string | null;
    sellerResponseDate?: string | null;
    sellerResponseBy?: string | null;
    media: ReviewMediaDTO[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Paginated response for reviews from backend
 */
export interface ReviewPageDTO {
    content: MyReviewDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
}

/**
 * API Response wrapper
 */
export interface ReviewApiResponseDTO<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}
