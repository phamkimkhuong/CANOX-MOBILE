import type {
    ImageSelectionPolicy,
    VideoSelectionPolicy,
} from '@/constants/mediaPolicies';

export type MediaValidationErrorCode = 'FILE_TOO_LARGE' | 'VIDEO_TOO_LONG';

export type MediaValidationResult =
    | { valid: true }
    | { valid: false; code: MediaValidationErrorCode };

const VALID_MEDIA_RESULT: MediaValidationResult = { valid: true };

export const normalizeAssetDurationSeconds = (
    durationMs: number | null | undefined
): number | undefined => {
    if (typeof durationMs !== 'number' || durationMs <= 0) {
        return undefined;
    }

    return Math.ceil(durationMs / 1000);
};

export const validateImageSelection = (
    sizeBytes: number | null | undefined,
    policy?: ImageSelectionPolicy
): MediaValidationResult => {
    if (
        typeof policy?.maxSizeBytes === 'number'
        && typeof sizeBytes === 'number'
        && sizeBytes > policy.maxSizeBytes
    ) {
        return {
            valid: false,
            code: 'FILE_TOO_LARGE',
        };
    }

    return VALID_MEDIA_RESULT;
};

export const validateVideoSelection = ({
    sizeBytes,
    durationSeconds,
    policy,
}: {
    sizeBytes: number | null | undefined;
    durationSeconds: number | undefined;
    policy?: VideoSelectionPolicy;
}): MediaValidationResult => {
    if (
        typeof policy?.maxDurationSeconds === 'number'
        && typeof durationSeconds === 'number'
        && durationSeconds > policy.maxDurationSeconds
    ) {
        return {
            valid: false,
            code: 'VIDEO_TOO_LONG',
        };
    }

    if (
        typeof policy?.maxSizeBytes === 'number'
        && typeof sizeBytes === 'number'
        && sizeBytes > policy.maxSizeBytes
    ) {
        return {
            valid: false,
            code: 'FILE_TOO_LARGE',
        };
    }

    return VALID_MEDIA_RESULT;
};
