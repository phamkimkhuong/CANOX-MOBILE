/**
 * ==============================================
 * REVIEW INCENTIVES - Gamification Config
 * ==============================================
 * Cấu hình phần thưởng khi đánh giá
 * Backend tự tính reward, đây là config hiển thị UI
 */

export interface ReviewIncentive {
    /** Loại phần thưởng */
    type: 'coins' | 'points';
    /** Phần thưởng cơ bản cho review text */
    baseReward: number;
    /** Bonus khi có ảnh */
    bonusWithPhoto: number;
    /** Bonus khi có video */
    bonusWithVideo: number;
    /** Số ảnh tối đa */
    maxPhotos: number;
    /** Số video tối đa */
    maxVideos: number;
}

/**
 * Default incentive config
 */
export const REVIEW_INCENTIVE: ReviewIncentive = {
    type: 'coins',
    baseReward: 50,
    bonusWithPhoto: 100,
    bonusWithVideo: 50,
    maxPhotos: 5,
    maxVideos: 1,
};

/**
 * Media limits for review
 */
export const REVIEW_MEDIA_LIMITS = {
    MAX_IMAGES: 5,
    MAX_VIDEOS: 1,
    MAX_VIDEO_DURATION_SECONDS: 60,
    MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024,
    MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
};
