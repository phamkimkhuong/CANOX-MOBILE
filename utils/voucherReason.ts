import type { TFunction } from 'i18next';

const NO_DISCOUNT_REASON_PATTERNS = [
    /does not provide any discount for this order/i,
    /discount\s*=\s*0/i,
];

/**
 * Maps backend voucher validation reasons to buyer-friendly
 */
export const getFriendlyVoucherReason = (
    rawReason: string | null | undefined,
    t: TFunction<'checkout'>
): string | null => {
    if (!rawReason) return null;

    const normalizedReason = rawReason.trim();
    if (!normalizedReason) return null;

    if (NO_DISCOUNT_REASON_PATTERNS.some((pattern) => pattern.test(normalizedReason))) {
        return t('voucher.reasons.noDiscount');
    }

    return normalizedReason;
};
