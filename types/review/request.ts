/**
 * ==============================================
 * REVIEW REQUESTs - API Layer
 * ==============================================
 */

import { ReviewType } from './dto';

/**
 * Create review payload - Sent to API
 */
export interface CreateReviewRequest {
    reviewType: ReviewType;
    reviewableId: string;
    rating: number;
    comment: string;
    orderId: string;
    /** Media asset IDs from presign upload */
    mediaAssetIds: string[];
}

/**
 * Update review payload
 */
export interface UpdateReviewRequest {
    rating: number;
    comment: string;
}

/**
 * Fetch reviews params
 */
export interface FetchReviewParams {
    page: number;
    size?: number;
    rating?: number;
    hasMedia?: boolean;
    hasResponse?: boolean;
}
