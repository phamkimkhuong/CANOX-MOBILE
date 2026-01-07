import { ReviewDTO, ReviewMediaDTO, ReviewMediaUI, ReviewUI } from '@/types/product/review';

/**
 * Adapter for Product Reviews
 * Converts API DTOs to UI models
 */

/**
 * Maps Review Media DTO to UI model
 */
export const toReviewMediaUI = (dto: ReviewMediaDTO): ReviewMediaUI => ({
    id: dto.id,
    url: dto.url,
    type: dto.type,
});

/**
 * Maps Review DTO to UI model
 */
export const toReviewUI = (dto: ReviewDTO): ReviewUI => {
    return {
        id: dto.id,
        rating: dto.rating,
        comment: dto.comment,
        // Fallback username priorities
        username: dto.username || dto.buyerName || 'Người dùng',
        userAvatar: dto.userAvatar,
        buyerName: dto.buyerName,
        verifiedPurchase: dto.verifiedPurchase ?? false,
        createdAt: dto.createdAt || new Date().toISOString(),
        media: (dto.media || []).map(toReviewMediaUI),
        sellerResponse: dto.hasResponse && dto.sellerResponse ? {
            comment: dto.sellerResponse,
            date: dto.sellerResponseDate || '',
        } : null,
    };
};

/**
 * Maps array of Review DTOs to UI models
 */
export const toReviewsUI = (dtos: ReviewDTO[]): ReviewUI[] => {
    return dtos.map(toReviewUI);
};
