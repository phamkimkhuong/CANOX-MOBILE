/**
 * ==============================================
 * REVIEW QUICK TAGS - Suggestion Chips
 * ==============================================
 */

export type QuickTagCategory = 'positive' | 'negative' | 'neutral';

export interface QuickTag {
    id: string;
    label: string;
    category: QuickTagCategory;
    /** Rating range this tag appears for [min, max] */
    ratingRange: [number, number];
}

/**
 * Quick tags data
 */
export const QUICK_TAGS: QuickTag[] = [
    { id: 'fast_delivery', label: 'Giao hàng nhanh', category: 'positive', ratingRange: [4, 5] },
    { id: 'good_packaging', label: 'Đóng gói cẩn thận', category: 'positive', ratingRange: [4, 5] },
    { id: 'great_quality', label: 'Chất lượng tuyệt vời', category: 'positive', ratingRange: [4, 5] },
    { id: 'true_to_description', label: 'Đúng mô tả', category: 'positive', ratingRange: [4, 5] },
    { id: 'good_value', label: 'Giá cả hợp lý', category: 'positive', ratingRange: [4, 5] },
    { id: 'friendly_seller', label: 'Shop thân thiện', category: 'positive', ratingRange: [4, 5] },
    { id: 'will_rebuy', label: 'Sẽ mua lại', category: 'positive', ratingRange: [4, 5] },
    { id: 'wrong_color', label: 'Sai màu', category: 'negative', ratingRange: [1, 2] },
    { id: 'defective', label: 'Hàng lỗi', category: 'negative', ratingRange: [1, 2] },
    { id: 'slow_delivery', label: 'Giao chậm', category: 'negative', ratingRange: [1, 2] },
    { id: 'bad_packaging', label: 'Đóng gói sơ sài', category: 'negative', ratingRange: [1, 2] },
    { id: 'not_as_described', label: 'Không đúng mô tả', category: 'negative', ratingRange: [1, 2] },
    { id: 'wrong_size', label: 'Sai size', category: 'negative', ratingRange: [1, 2] },
    { id: 'poor_quality', label: 'Chất lượng kém', category: 'negative', ratingRange: [1, 2] },
    { id: 'no_response', label: 'Shop không phản hồi', category: 'negative', ratingRange: [1, 2] },
    { id: 'average', label: 'Tạm được', category: 'neutral', ratingRange: [3, 3] },
    { id: 'ok_quality', label: 'Chất lượng ổn', category: 'neutral', ratingRange: [3, 3] },
    { id: 'acceptable', label: 'Chấp nhận được', category: 'neutral', ratingRange: [3, 3] },
];

/**
 * Rating label mapping
 */
export const RATING_LABELS: Record<number, string> = {
    0: 'Chưa chọn',
    1: 'Tệ',
    2: 'Không hài lòng',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Tuyệt vời',
};
