/**
 * ==============================================
 * REVIEW HOOKS - Query Keys & Base
 * ==============================================
 * Centralized query keys for review module
 */

import type { RatingFilter } from '@/types/review';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const reviewKeys = {
    /** Root key for all review queries */
    all: ['reviews'] as const,

    /** Pending reviews (items to review) */
    pending: () => [...reviewKeys.all, 'pending'] as const,

    /** My reviews (history) */
    myReviews: () => [...reviewKeys.all, 'my-reviews'] as const,
    myReviewsList: (filter?: RatingFilter) =>
        [...reviewKeys.myReviews(), filter ?? 'all'] as const,

    /** Single review detail */
    detail: (reviewId: string) => [...reviewKeys.all, 'detail', reviewId] as const,

    /** Reviews for a specific product/shop */
    forEntity: (type: string, entityId: string) =>
        [...reviewKeys.all, 'entity', type, entityId] as const,
};

// ============================================
// CONSTANTS
// ============================================

export const REVIEWS_PAGE_SIZE = 20;
