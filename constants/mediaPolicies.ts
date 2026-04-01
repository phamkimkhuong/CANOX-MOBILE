import { UPLOAD_SIZE_LIMITS } from '@/types/storage';

export interface ImageSelectionPolicy {
    maxSizeBytes?: number;
}

export interface VideoSelectionPolicy {
    maxSizeBytes?: number;
    maxDurationSeconds?: number;
}

export interface MediaSelectionPolicy {
    image?: ImageSelectionPolicy;
    video?: VideoSelectionPolicy;
}

export const REVIEW_MEDIA_POLICY: MediaSelectionPolicy = {
    image: {
        maxSizeBytes: 10 * 1024 * 1024,
    },
    video: {
        maxSizeBytes: 50 * 1024 * 1024,
        maxDurationSeconds: 60,
    },
};

export const RETURN_MEDIA_POLICY: MediaSelectionPolicy = {
    video: {
        maxSizeBytes: 50 * 1024 * 1024,
        maxDurationSeconds: 60,
    },
};

export const AVATAR_MEDIA_POLICY: MediaSelectionPolicy = {
    image: {
        maxSizeBytes: UPLOAD_SIZE_LIMITS.USER_AVATAR,
    },
};

export const CHAT_MEDIA_POLICY: MediaSelectionPolicy = {
    image: {
        maxSizeBytes: UPLOAD_SIZE_LIMITS.CHAT_IMAGE,
    },
    video: {
        maxSizeBytes: UPLOAD_SIZE_LIMITS.CHAT_VIDEO,
        maxDurationSeconds: 60,
    },
};
