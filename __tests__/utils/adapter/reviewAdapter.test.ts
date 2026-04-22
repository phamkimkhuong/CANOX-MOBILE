/**
 * Review Adapter Unit Tests
 *
 * Tests: toPendingReviewItemUI, extractPendingReviews, toMyReviewUI,
 *        parseRatingFilter, toCreateReviewRequest, calculateEstimatedReviewReward,
 *        getMaxReviewReward, getReviewRewardTypeLabel, getReviewTagsForRating, getReviewRatingLabel
 */

import type { Order, OrderItem } from '@/types/order/order';
import type { MyReviewsListItemDTO } from '@/types/review';
import {
    calculateEstimatedReviewReward,
    extractPendingReviews,
    getMaxReviewReward,
    getReviewRatingLabel,
    getReviewRewardTypeLabel,
    getReviewTagsForRating,
    parseRatingFilter,
    toCreateReviewRequest,
    toMyReviewUI,
    toPendingReviewItemUI,
} from '@/utils/adapter/review/reviewAdapter';

// ============================================
// Fixtures
// ============================================

const createOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
    itemId: 'item-1',
    productId: 'prod-1',
    variantId: 'var-1',
    productName: 'Áo thun',
    variantAttributes: 'Đỏ / M',
    imagePath: 'products/img.webp',
    quantity: 1,
    unitPrice: 100000,
    totalPrice: 100000,
    reviewed: false,
    ...overrides,
} as OrderItem);

const createOrder = (overrides: Partial<Order> = {}): Order => ({
    orderId: 'order-1',
    orderNumber: 'ORD-001',
    createdAt: '2026-04-15T10:00:00Z',
    createdDate: '2026-04-15',
    shopId: 'shop-1',
    shopInfo: {
        shopName: 'Test Shop',
        logoUrl: 'shops/logo.webp',
    },
    items: [createOrderItem()],
    ...overrides,
} as Order);

// ============================================
// toPendingReviewItemUI
// ============================================

describe('toPendingReviewItemUI', () => {
    it('maps item and order fields', () => {
        const result = toPendingReviewItemUI(createOrderItem(), createOrder());

        expect(result.itemId).toBe('item-1');
        expect(result.productId).toBe('prod-1');
        expect(result.productName).toBe('Áo thun');
        expect(result.orderId).toBe('order-1');
        expect(result.orderNumber).toBe('ORD-001');
        expect(result.shopName).toBe('Test Shop');
    });

    it('uses itemId fallback when null', () => {
        const item = createOrderItem({ itemId: undefined as unknown as string });
        const order = createOrder();
        const result = toPendingReviewItemUI(item, order);

        // Fallback: orderId-productId
        expect(result.itemId).toBe('order-1-prod-1');
    });

    it('formats price', () => {
        const result = toPendingReviewItemUI(
            createOrderItem({ unitPrice: 99000 }),
            createOrder()
        );

        expect(result.formattedPrice).toBeTruthy();
        expect(result.price).toBe(99000);
    });
});

// ============================================
// extractPendingReviews
// ============================================

describe('extractPendingReviews', () => {
    it('groups unreviewed items by order', () => {
        const orders = [
            createOrder({
                orderId: 'o1',
                items: [
                    createOrderItem({ reviewed: false }),
                    createOrderItem({ itemId: 'item-2', reviewed: true }),
                ],
            }),
        ];

        const result = extractPendingReviews(orders);

        expect(result).toHaveLength(1);
        expect(result[0].items).toHaveLength(1);
    });

    it('skips orders with all items reviewed', () => {
        const orders = [
            createOrder({
                items: [createOrderItem({ reviewed: true })],
            }),
        ];

        expect(extractPendingReviews(orders)).toHaveLength(0);
    });

    it('sorts groups by deliveredAt DESC (newest first)', () => {
        const orders = [
            createOrder({
                orderId: 'old',
                createdAt: '2026-01-01T10:00:00Z',
                items: [createOrderItem({ reviewed: false })],
            }),
            createOrder({
                orderId: 'new',
                createdAt: '2026-04-01T10:00:00Z',
                items: [createOrderItem({ reviewed: false })],
            }),
        ];

        const result = extractPendingReviews(orders);

        expect(result[0].orderId).toBe('new');
        expect(result[1].orderId).toBe('old');
    });

    it('returns empty for empty input', () => {
        expect(extractPendingReviews([])).toEqual([]);
    });
});

// ============================================
// toMyReviewUI
// ============================================

describe('toMyReviewUI', () => {
    const createMyReviewDTO = (overrides: Partial<MyReviewsListItemDTO> = {}): MyReviewsListItemDTO => ({
        id: 'review-1',
        reviewType: 'PRODUCT',
        reviewableId: 'prod-abc123',
        rating: 4,
        comment: 'Tốt lắm',
        status: 'APPROVED',
        createdDate: '2026-04-10T10:00:00Z',
        media: [{ id: 'media-1', url: 'img.jpg', type: 'IMAGE' }],
        helpfulCount: 5,
        hasResponse: true,
        sellerResponse: 'Cảm ơn!',
        sellerResponseDate: '2026-04-11T10:00:00Z',
        ...overrides,
    });

    it('maps basic fields', () => {
        const result = toMyReviewUI(createMyReviewDTO());

        expect(result.id).toBe('review-1');
        expect(result.rating).toBe(4);
        expect(result.comment).toBe('Tốt lắm');
        expect(result.status).toBe('APPROVED');
        expect(result.helpfulCount).toBe(5);
    });

    it('formats productName from ID', () => {
        const result = toMyReviewUI(createMyReviewDTO({ reviewableId: 'prod-abc123' }));
        expect(result.productName).toBe('Product #abc123');
    });

    it('maps seller response when present', () => {
        const result = toMyReviewUI(createMyReviewDTO());

        expect(result.hasSellerResponse).toBe(true);
        expect(result.sellerResponse).toEqual({
            comment: 'Cảm ơn!',
            date: '2026-04-11T10:00:00Z',
        });
    });

    it('returns null seller response when absent', () => {
        const result = toMyReviewUI(createMyReviewDTO({
            hasResponse: false,
            sellerResponse: null,
        }));

        expect(result.sellerResponse).toBeNull();
        expect(result.hasSellerResponse).toBe(false);
    });

    it('defaults media and helpfulCount', () => {
        const result = toMyReviewUI(createMyReviewDTO({
            media: undefined as unknown as MyReviewsListItemDTO['media'],
            helpfulCount: undefined as unknown as number,
        }));

        expect(result.media).toEqual([]);
        expect(result.helpfulCount).toBe(0);
    });
});

// ============================================
// parseRatingFilter
// ============================================

describe('parseRatingFilter', () => {
    it('returns empty for "all"', () => {
        expect(parseRatingFilter('all')).toEqual({});
    });

    it('returns hasMedia for "with-media"', () => {
        expect(parseRatingFilter('with-media')).toEqual({ hasMedia: true });
    });

    it('returns hasResponse for "with-response"', () => {
        expect(parseRatingFilter('with-response')).toEqual({ hasResponse: true });
    });

    it('returns rating number for numeric filter', () => {
        expect(parseRatingFilter(5)).toEqual({ rating: 5 });
        expect(parseRatingFilter(1)).toEqual({ rating: 1 });
    });
});

// ============================================
// toCreateReviewRequest
// ============================================

describe('toCreateReviewRequest', () => {
    it('builds request with correct fields', () => {
        const result = toCreateReviewRequest({
            productId: 'prod-1',
            orderId: 'order-1',
            rating: 5,
            comment: 'Tuyệt vời!',
            mediaAssetIds: ['asset-1'],
        });

        expect(result.reviewType).toBe('PRODUCT');
        expect(result.reviewableId).toBe('prod-1');
        expect(result.rating).toBe(5);
        expect(result.comment).toBe('Tuyệt vời!');
        expect(result.orderId).toBe('order-1');
        expect(result.mediaAssetIds).toEqual(['asset-1']);
    });

    it('defaults to PRODUCT reviewType', () => {
        const result = toCreateReviewRequest({
            productId: 'p1',
            orderId: 'o1',
            rating: 3,
            comment: '',
        });

        expect(result.reviewType).toBe('PRODUCT');
        expect(result.mediaAssetIds).toEqual([]);
    });

    it('uses custom reviewType when provided', () => {
        const result = toCreateReviewRequest({
            productId: 'p1',
            orderId: 'o1',
            rating: 3,
            comment: '',
            reviewType: 'SHOP',
        });

        expect(result.reviewType).toBe('SHOP');
    });
});

// ============================================
// REWARD CALCULATIONS
// ============================================

describe('calculateEstimatedReviewReward', () => {
    it('returns base reward for text only', () => {
        expect(calculateEstimatedReviewReward(false, false)).toBe(50);
    });

    it('adds photo bonus', () => {
        expect(calculateEstimatedReviewReward(true, false)).toBe(150);
    });

    it('adds video bonus', () => {
        expect(calculateEstimatedReviewReward(false, true)).toBe(100);
    });

    it('adds both bonuses', () => {
        expect(calculateEstimatedReviewReward(true, true)).toBe(200);
    });

    it('uses custom config', () => {
        const config = {
            type: 'points' as const,
            baseReward: 10,
            bonusWithPhoto: 20,
            bonusWithVideo: 30,
            maxPhotos: 5,
            maxVideos: 1,
        };
        expect(calculateEstimatedReviewReward(true, true, config)).toBe(60);
    });
});

describe('getMaxReviewReward', () => {
    it('returns sum of all reward components', () => {
        expect(getMaxReviewReward()).toBe(200); // 50 + 100 + 50
    });
});

describe('getReviewRewardTypeLabel', () => {
    it('returns "Xu" for coins type', () => {
        expect(getReviewRewardTypeLabel()).toBe('Xu');
    });

    it('returns "Điểm" for points type', () => {
        const config = {
            type: 'points' as const,
            baseReward: 10,
            bonusWithPhoto: 20,
            bonusWithVideo: 30,
            maxPhotos: 5,
            maxVideos: 1,
        };
        expect(getReviewRewardTypeLabel(config)).toBe('Điểm');
    });
});

// ============================================
// TAG FUNCTIONS
// ============================================

describe('getReviewTagsForRating', () => {
    it('returns positive tags for rating 5', () => {
        const tags = getReviewTagsForRating(5);
        expect(tags.length).toBeGreaterThan(0);
        tags.forEach(t => expect(t.category).toBe('positive'));
    });

    it('returns negative tags for rating 1', () => {
        const tags = getReviewTagsForRating(1);
        expect(tags.length).toBeGreaterThan(0);
        tags.forEach(t => expect(t.category).toBe('negative'));
    });

    it('returns neutral tags for rating 3', () => {
        const tags = getReviewTagsForRating(3);
        expect(tags.length).toBeGreaterThan(0);
        tags.forEach(t => expect(t.category).toBe('neutral'));
    });

    it('returns empty for invalid ratings', () => {
        expect(getReviewTagsForRating(0)).toEqual([]);
        expect(getReviewTagsForRating(6)).toEqual([]);
        expect(getReviewTagsForRating(-1)).toEqual([]);
    });
});

describe('getReviewRatingLabel', () => {
    it('returns labels for valid ratings', () => {
        expect(getReviewRatingLabel(5)).toBe('ratingLabels.rating_5');
        expect(getReviewRatingLabel(1)).toBe('ratingLabels.rating_1');
    });

    it('returns empty for unknown rating', () => {
        expect(getReviewRatingLabel(99)).toBe('');
    });
});
