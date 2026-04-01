import type { SharedRefType } from 'expo';
import { createVideoPlayer } from 'expo-video';

const DEFAULT_CAPTURE_TIME_SECONDS = 0.8;
const MIN_CAPTURE_TIME_SECONDS = 0.2;
const MAX_CAPTURE_TIME_SECONDS = 2;
const THUMBNAIL_MAX_WIDTH = 480;

const resolveCaptureTimeSeconds = (durationSeconds?: number): number => {
    if (typeof durationSeconds !== 'number' || durationSeconds <= 0) {
        return DEFAULT_CAPTURE_TIME_SECONDS;
    }

    if (durationSeconds <= 1) {
        return Math.max(durationSeconds / 2, 0);
    }

    const targetTime = Math.min(
        Math.max(durationSeconds * 0.25, MIN_CAPTURE_TIME_SECONDS),
        MAX_CAPTURE_TIME_SECONDS
    );

    return Math.min(targetTime, Math.max(durationSeconds - 0.1, 0));
};

// Generate a lightweight preview frame so freshly picked videos render like real media immediately.
export const generateVideoThumbnailSource = async (
    videoUri: string,
    durationSeconds?: number
): Promise<SharedRefType<'image'> | null> => {
    const player = createVideoPlayer({ uri: videoUri });

    try {
        const [thumbnail] = await player.generateThumbnailsAsync(
            resolveCaptureTimeSeconds(durationSeconds),
            { maxWidth: THUMBNAIL_MAX_WIDTH }
        );

        return thumbnail ?? null;
    } finally {
        player.release();
    }
};
