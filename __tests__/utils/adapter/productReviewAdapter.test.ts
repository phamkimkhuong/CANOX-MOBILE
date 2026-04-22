/**
 * Product Review Adapter Unit Tests
 *
 * Tests: maskUsername, formatReviewCount, toProductReviewUI, toProductReviewStatisticsUI,
 *        parseProductReviewFilter, getReviewEmptyState
 */

import {
    formatReviewCount,
    getReviewEmptyState,
    maskUsername,
    parseProductReviewFilter,
    toProductReviewMediaUI,
    toProductReviewStatisticsUI,
    toProductReviewUI,
    toSellerResponseUI,
    toVariantFilterOptionUI,
} from '@/utils/adapter/review/productReviewAdapter';
import type { ProductReviewDTO, ProductReviewMediaDTO, ProductReviewStatisticsDTO, VariantFilterOptionDTO } from '@/types/review/productReview';

// ============================================
// maskUsername
// ============================================

describe('maskUsername', () => {
    it('masks long usernames: nguyenvana → n*****a', () => {
        expect(maskUsername('nguyenvana')).toBe('n*****a');
    });

    it('masks 3-char name: abc → a*c', () => {
        expect(maskUsername('abc')).toBe('a*c');
    });

    it('masks 2-char name: ab → a*', () => {
        expect(maskUsername('ab')).toBe('a*');
    });

    it('returns single char as-is', () => {
        expect(maskUsername('a')).toBe('a');
    });

    it('returns default for null/undefined/empty', () => {
        expect(maskUsername(null)).toBe('Người dùng');
        expect(maskUsername(undefined)).toBe('Người dùng');
        expect(maskUsername('')).toBe('Người dùng');
    });

    it('trims whitespace before masking', () => {
        expect(maskUsername('  abc  ')).toBe('a*c');
    });

    it('caps mask at 5 stars for very long names', () => {
        const result = maskUsername('abcdefghijklmnop');
        expect(result).toBe('a*****p');
    });
});

// ============================================
// formatReviewCount
// ============================================

describe('formatReviewCount', () => {
    it('formats 500 as "500"', () => {
        expect(formatReviewCount(500)).toBe('500');
    });

    it('formats 1000 as "1k"', () => {
        expect(formatReviewCount(1000)).toBe('1k');
    });

    it('formats 1500 as "1.5k"', () => {
        expect(formatReviewCount(1500)).toBe('1.5k');
    });

    it('formats 10000 as "10k"', () => {
        expect(formatReviewCount(10000)).toBe('10k');
    });

    it('handles 0', () => {
        expect(formatReviewCount(0)).toBe('0');
    });
});

// ============================================
// toProductReviewMediaUI
// ============================================

describe('toProductReviewMediaUI', () => {
    it('maps media fields', () => {
        const dto: ProductReviewMediaDTO = {
            id: 'media-1',
            url: 'https://cdn.example.com/img.jpg',
            type: 'IMAGE',
            sortOrder: 0,
            thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
            duration: null,
        };

        const result = toProductReviewMediaUI(dto);

        expect(result.id).toBe('media-1');
        expect(result.url).toBe('https://cdn.example.com/img.jpg');
        expect(result.type).toBe('IMAGE');
        expect(result.thumbnailUrl).toBe('https://cdn.example.com/thumb.jpg');
        expect(result.duration).toBeUndefined();
    });

    it('maps video with duration', () => {
        const dto: ProductReviewMediaDTO = {
            id: 'vid-1',
            url: 'https://cdn.example.com/vid.mp4',
            type: 'VIDEO',
            sortOrder: 0,
            thumbnailUrl: null,
            duration: 30,
        };

        const result = toProductReviewMediaUI(dto);
        expect(result.type).toBe('VIDEO');
        expect(result.duration).toBe(30);
    });
});

// ============================================
// toSellerResponseUI
// ============================================

describe('toSellerResponseUI', () => {
    it('returns null when no response', () => {
        const dto = { hasResponse: false, sellerResponse: null } as ProductReviewDTO;
        expect(toSellerResponseUI(dto)).toBeNull();
    });

    it('maps seller response with shop name', () => {
        const dto = {
            hasResponse: true,
            sellerResponse: 'Cảm ơn bạn đã mua hàng!',
            sellerResponseDate: '2026-04-15T10:00:00Z',
        } as ProductReviewDTO;

        const result = toSellerResponseUI(dto, 'MyShop');

        expect(result).not.toBeNull();
        expect(result!.shopName).toBe('MyShop');
        expect(result!.comment).toBe('Cảm ơn bạn đã mua hàng!');
    });
});

// ============================================
// toProductReviewUI
// ============================================

describe('toProductReviewUI', () => {
    const createDTO = (overrides: Partial<ProductReviewDTO> = {}): ProductReviewDTO => ({
        id: 'review-1',
        reviewableId: 'prod-1',
        userId: 'user-1',
        buyerId: 'buyer-1',
        buyerName: 'Nguyễn Văn A',
        username: 'nguyenvana',
        userAvatar: 'https://example.com/avatar.jpg',
        rating: 5,
        comment: 'Sản phẩm rất tốt!',
        media: [],
        verifiedPurchase: true,
        variantId: 'var-1',
        variantAttributes: 'Màu: Đỏ, Size: L',
        hasResponse: false,
        sellerResponse: null,
        sellerResponseDate: null,
        helpfulCount: 3,
        userHasVotedHelpful: false,
        createdDate: '2026-04-10T10:00:00Z',
        ...overrides,
    });

    it('maps basic review fields', () => {
        const result = toProductReviewUI(createDTO());

        expect(result.id).toBe('review-1');
        expect(result.rating).toBe(5);
        expect(result.comment).toBe('Sản phẩm rất tốt!');
        expect(result.isVerifiedPurchase).toBe(true);
        expect(result.helpfulCount).toBe(3);
        expect(result.isHelpful).toBe(false);
    });

    it('masks the buyer name', () => {
        const result = toProductReviewUI(createDTO({ buyerName: 'NguyenVanA' }));
        expect(result.userName).not.toBe('NguyenVanA');
        expect(result.userName).toContain('*');
    });

    it('counts media correctly', () => {
        const result = toProductReviewUI(createDTO({
            media: [
                { id: '1', url: 'a.jpg', type: 'IMAGE', sortOrder: 0, thumbnailUrl: null, duration: null },
                { id: '2', url: 'b.jpg', type: 'IMAGE', sortOrder: 1, thumbnailUrl: null, duration: null },
                { id: '3', url: 'c.mp4', type: 'VIDEO', sortOrder: 2, thumbnailUrl: null, duration: 15 },
            ],
        }));

        expect(result.hasMedia).toBe(true);
        expect(result.imageCount).toBe(2);
        expect(result.videoCount).toBe(1);
        expect(result.media).toHaveLength(3);
    });

    it('sets hasMedia false for empty media', () => {
        const result = toProductReviewUI(createDTO({ media: [] }));
        expect(result.hasMedia).toBe(false);
    });

    it('sets variant info flag', () => {
        const with_ = toProductReviewUI(createDTO({ variantAttributes: 'Size: L' }));
        const without = toProductReviewUI(createDTO({ variantAttributes: '' }));

        expect(with_.hasVariantInfo).toBe(true);
        expect(without.hasVariantInfo).toBe(false);
    });
});

// ============================================
// toVariantFilterOptionUI
// ============================================

describe('toVariantFilterOptionUI', () => {
    it('maps fields and formats count', () => {
        const dto: VariantFilterOptionDTO = {
            variantId: 'var-1',
            label: 'Đỏ / L',
            reviewCount: 1500,
        };

        const result = toVariantFilterOptionUI(dto);

        expect(result.variantId).toBe('var-1');
        expect(result.label).toBe('Đỏ / L');
        expect(result.formattedCount).toBe('(1.5k)');
    });
});

// ============================================
// toProductReviewStatisticsUI
// ============================================

describe('toProductReviewStatisticsUI', () => {
    it('maps statistics correctly', () => {
        const dto: ProductReviewStatisticsDTO = {
            averageRating: 4.3,
            totalReviews: 2500,
            ratingDistribution: { 5: 1500, 4: 500, 3: 300, 2: 150, 1: 50 },
            ratingPercentage: { 5: 60, 4: 20, 3: 12, 2: 6, 1: 2 },
            mediaReviewCount: 200,
            responseReviewCount: 50,
            variantOptions: [],
        };

        const result = toProductReviewStatisticsUI(dto);

        expect(result.averageRating).toBe(4.3);
        expect(result.formattedRating).toBe('4.3');
        expect(result.formattedTotal).toBe('2.5k');
        expect(result.mediaReviewCount).toBe(200);
        expect(result.responseReviewCount).toBe(50);
    });
});

// ============================================
// parseProductReviewFilter
// ============================================

describe('parseProductReviewFilter', () => {
    it('returns empty for "all"', () => {
        const result = parseProductReviewFilter('all');
        expect(result.rating).toBeUndefined();
        expect(result.mediaFilter).toBeUndefined();
    });

    it('sets mediaFilter for "with-media"', () => {
        const result = parseProductReviewFilter('with-media');
        expect(result.mediaFilter).toBe('ALL');
    });

    it('sets hasResponse for "with-response"', () => {
        const result = parseProductReviewFilter('with-response');
        expect(result.hasResponse).toBe(true);
    });

    it('sets rating for numeric filters', () => {
        expect(parseProductReviewFilter(5).rating).toBe(5);
        expect(parseProductReviewFilter(1).rating).toBe(1);
    });

    it('maps sort options to sortBy', () => {
        expect(parseProductReviewFilter('all', 'newest').sortBy).toBe('NEWEST');
        expect(parseProductReviewFilter('all', 'helpful').sortBy).toBe('HELPFUL');
        expect(parseProductReviewFilter('all', 'oldest').sortBy).toBe('OLDEST');
    });

    it('maps rating sort to spring sort array', () => {
        const high = parseProductReviewFilter('all', 'rating_high');
        expect(high.sort).toEqual(['rating,desc', 'createdDate,desc']);

        const low = parseProductReviewFilter('all', 'rating_low');
        expect(low.sort).toEqual(['rating,asc', 'createdDate,desc']);
    });
});

// ============================================
// getReviewEmptyState
// ============================================

describe('getReviewEmptyState', () => {
    it('returns positive state for 1-star filter', () => {
        const result = getReviewEmptyState(1);
        expect(result.isPositive).toBe(true);
        expect(result.icon).toBe('checkmark-circle');
    });

    it('returns positive state for 2-star filter', () => {
        const result = getReviewEmptyState(2);
        expect(result.isPositive).toBe(true);
    });

    it('returns camera state for with-media filter', () => {
        const result = getReviewEmptyState('with-media');
        expect(result.icon).toBe('camera');
        expect(result.isPositive).toBe(false);
    });

    it('returns response state for with-response filter', () => {
        const result = getReviewEmptyState('with-response');
        expect(result.icon).toBe('chat-dots');
    });

    it('shows variant label in subtitle', () => {
        const result = getReviewEmptyState('all', 'Đỏ / L');
        expect(result.subtitle).toContain('Đỏ / L');
    });

    it('returns default state for "all" without variant', () => {
        const result = getReviewEmptyState('all');
        expect(result.icon).toBe('chat-bubble');
        expect(result.isPositive).toBe(false);
    });
});
