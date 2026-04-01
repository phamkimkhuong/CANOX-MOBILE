import {
    AVATAR_MEDIA_POLICY,
    CHAT_MEDIA_POLICY,
    RETURN_MEDIA_POLICY,
    REVIEW_MEDIA_POLICY,
} from '@/constants/mediaPolicies';
import {
    normalizeAssetDurationSeconds,
    validateImageSelection,
    validateVideoSelection,
} from '@/utils/validation/mediaValidation';

describe('mediaValidation', () => {
    describe('normalizeAssetDurationSeconds', () => {
        it('converts picker milliseconds into seconds', () => {
            expect(normalizeAssetDurationSeconds(21000)).toBe(21);
        });

        it('returns undefined for invalid durations', () => {
            expect(normalizeAssetDurationSeconds(undefined)).toBeUndefined();
            expect(normalizeAssetDurationSeconds(null)).toBeUndefined();
            expect(normalizeAssetDurationSeconds(0)).toBeUndefined();
        });
    });

    describe('validateImageSelection', () => {
        it('accepts image when no policy is defined', () => {
            expect(validateImageSelection(25 * 1024 * 1024)).toEqual({ valid: true });
        });

        it('rejects avatar image above feature policy', () => {
            expect(
                validateImageSelection(
                    (AVATAR_MEDIA_POLICY.image?.maxSizeBytes ?? 0) + 1,
                    AVATAR_MEDIA_POLICY.image
                )
            ).toEqual({
                valid: false,
                code: 'FILE_TOO_LARGE',
            });
        });

        it('rejects chat image above feature policy', () => {
            expect(
                validateImageSelection(
                    (CHAT_MEDIA_POLICY.image?.maxSizeBytes ?? 0) + 1,
                    CHAT_MEDIA_POLICY.image
                )
            ).toEqual({
                valid: false,
                code: 'FILE_TOO_LARGE',
            });
        });
    });

    describe('validateVideoSelection', () => {
        it('rejects review video above duration limit', () => {
            expect(
                validateVideoSelection({
                    sizeBytes: 10 * 1024 * 1024,
                    durationSeconds: (REVIEW_MEDIA_POLICY.video?.maxDurationSeconds ?? 0) + 1,
                    policy: REVIEW_MEDIA_POLICY.video,
                })
            ).toEqual({
                valid: false,
                code: 'VIDEO_TOO_LONG',
            });
        });

        it('rejects return video above size limit', () => {
            expect(
                validateVideoSelection({
                    sizeBytes: (RETURN_MEDIA_POLICY.video?.maxSizeBytes ?? 0) + 1,
                    durationSeconds: 30,
                    policy: RETURN_MEDIA_POLICY.video,
                })
            ).toEqual({
                valid: false,
                code: 'FILE_TOO_LARGE',
            });
        });

        it('accepts video when it fits feature policy', () => {
            expect(
                validateVideoSelection({
                    sizeBytes: 20 * 1024 * 1024,
                    durationSeconds: 30,
                    policy: REVIEW_MEDIA_POLICY.video,
                })
            ).toEqual({ valid: true });
        });
    });
});
