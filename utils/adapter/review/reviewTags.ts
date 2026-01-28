/**
 * ==============================================
 * REVIEW QUICK TAGS - Suggestion Chips
 * ==============================================
 */

export type QuickTagCategory = 'positive' | 'negative' | 'neutral';

export interface QuickTag {
    id: string;
    labelKey: string;
    category: QuickTagCategory;
    /** Rating range this tag appears for [min, max] */
    ratingRange: [number, number];
}

/**
 * Quick tags data
 */
export const QUICK_TAGS: QuickTag[] = [
    { id: 'fast_delivery', labelKey: 'tags.fast_delivery', category: 'positive', ratingRange: [4, 5] },
    { id: 'good_packaging', labelKey: 'tags.good_packaging', category: 'positive', ratingRange: [4, 5] },
    { id: 'great_quality', labelKey: 'tags.great_quality', category: 'positive', ratingRange: [4, 5] },
    { id: 'true_to_description', labelKey: 'tags.true_to_description', category: 'positive', ratingRange: [4, 5] },
    { id: 'good_value', labelKey: 'tags.good_value', category: 'positive', ratingRange: [4, 5] },
    { id: 'friendly_seller', labelKey: 'tags.friendly_seller', category: 'positive', ratingRange: [4, 5] },
    { id: 'will_rebuy', labelKey: 'tags.will_rebuy', category: 'positive', ratingRange: [4, 5] },
    { id: 'wrong_color', labelKey: 'tags.wrong_color', category: 'negative', ratingRange: [1, 2] },
    { id: 'defective', labelKey: 'tags.defective', category: 'negative', ratingRange: [1, 2] },
    { id: 'slow_delivery', labelKey: 'tags.slow_delivery', category: 'negative', ratingRange: [1, 2] },
    { id: 'bad_packaging', labelKey: 'tags.bad_packaging', category: 'negative', ratingRange: [1, 2] },
    { id: 'not_as_described', labelKey: 'tags.not_as_described', category: 'negative', ratingRange: [1, 2] },
    { id: 'wrong_size', labelKey: 'tags.wrong_size', category: 'negative', ratingRange: [1, 2] },
    { id: 'poor_quality', labelKey: 'tags.poor_quality', category: 'negative', ratingRange: [1, 2] },
    { id: 'no_response', labelKey: 'tags.no_response', category: 'negative', ratingRange: [1, 2] },
    { id: 'average', labelKey: 'tags.average', category: 'neutral', ratingRange: [3, 3] },
    { id: 'ok_quality', labelKey: 'tags.ok_quality', category: 'neutral', ratingRange: [3, 3] },
    { id: 'acceptable', labelKey: 'tags.acceptable', category: 'neutral', ratingRange: [3, 3] },
];

/**
 * Rating label mapping (Translation Keys)
 */
export const RATING_LABELS: Record<number, string> = {
    0: 'ratingLabels.none',
    1: 'ratingLabels.rating_1',
    2: 'ratingLabels.rating_2',
    3: 'ratingLabels.rating_3',
    4: 'ratingLabels.rating_4',
    5: 'ratingLabels.rating_5',
};
