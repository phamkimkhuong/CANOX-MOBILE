import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

/**
 * ==============================================
 * STORAGE UPLOAD TYPES
 * ==============================================
 * API POST /api/v1/storage/presign-upload-private
 */

/**
 * Allowed upload contexts - determines the storage path and permissions
 */
export const UploadContextEnum = z.enum([
    'PRODUCT_IMAGE',
    'PRODUCT_THUMBNAIL',
    'PRODUCT_VIDEO',
    'USER_AVATAR',
    'USER_COVER',
    'SHOP_LOGO',
    'SHOP_BANNER',
    'SHOP_VIDEO',
    'EMPLOYEE_AVATAR',
    'REVIEW_IMAGE',
    'REVIEW_VIDEO',
    'CATEGORY_IMAGE',
    'DOCUMENT',
    'BANNER',
    'VOUCHER_IMAGE',
    'WISHLIST_COVER',
    'CHAT_IMAGE',
    'CHAT_VIDEO',
    'CHAT_FILE',
]);

export type UploadContext = z.infer<typeof UploadContextEnum>;

/**
 * Allowed image extensions for upload
 * Note: 'avif' is NOT allowed based on API response
 */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;
export type ImageExtension = typeof ALLOWED_IMAGE_EXTENSIONS[number];

export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi'] as const;
export type VideoExtension = typeof ALLOWED_VIDEO_EXTENSIONS[number];

export type StorageExtension = ImageExtension | VideoExtension;

/**
 * File size limits per upload context (in bytes)
 * Based on API error responses
 */
export const UPLOAD_SIZE_LIMITS = {
    USER_AVATAR: 2 * 1024 * 1024,      // 2MB
    USER_COVER: 5 * 1024 * 1024,       // 5MB (assumed)
    SHOP_LOGO: 2 * 1024 * 1024,        // 2MB (assumed)
    SHOP_BANNER: 5 * 1024 * 1024,      // 5MB (assumed)
    PRODUCT_IMAGE: 10 * 1024 * 1024,   // 10MB (assumed)
    CHAT_IMAGE: 5 * 1024 * 1024,       // 5MB (assumed)
    DEFAULT: 10 * 1024 * 1024,         // 10MB default
} as const;

/**
 * Request payload for presign-upload API
 */
export const PresignUploadRequestSchema = z.object({
    context: UploadContextEnum,
    extension: z.string().min(1).max(10),
    fileSizeBytes: z.number().int().min(1).max(1073741824), // 1 byte to 1GB
    md5: z.string().length(32), // MD5 hash is always 32 hex characters
    isPrivate: z.boolean().optional().default(false),
});

export type PresignUploadRequest = z.infer<typeof PresignUploadRequestSchema>;

/**
 * Response data from presign-upload API
 */
export const PresignUploadDataSchema = z.object({
    url: z.url(),
    method: z.string(), // Usually 'PUT'
    headers: z.record(z.string(), z.string()), // Dynamic headers like Content-Type, x-amz-*
    expiresAtEpochSeconds: z.number(),
    path: z.string(),
    assetId: z.string(),
});

export type PresignUploadData = z.infer<typeof PresignUploadDataSchema>;

/**
 * Full response wrapper for presign-upload API
 */
export const PresignUploadResponseSchema = ResponseDefaultSchema.extend({
    data: PresignUploadDataSchema,
});

export type PresignUploadResponse = z.infer<typeof PresignUploadResponseSchema>;

/**
 * Helper interface for picked image from expo-image-picker
 */
export interface PickedImage {
    uri: string;
    fileName: string;
    type: string; // MIME type e.g., 'image/jpeg'
    fileSize: number;
    width: number;
    height: number;
}

/**
 * Avatar upload result after successful upload
 */
export interface AvatarUploadResult {
    assetId: string;
    path: string;
    url: string; // CDN URL for displaying
}

/**
 * Asset status from storage status API
 */
export type AssetStatusType = 'PRESIGNED' | 'READY' | 'FAILED';

export interface AssetStatus {
    publicPath: string | null;
    status: AssetStatusType;
}

/**
 * Storage status API response
 * GET /api/v1/storage/status?assetIds[]=<assetId>
 */
export const StorageStatusDataSchema = z.record(z.string(), z.object({
    publicPath: z.string().nullable(),
    status: z.enum(['PRESIGNED', 'READY', 'FAILED']),
}));

export const StorageStatusResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: StorageStatusDataSchema,
});

export type StorageStatusResponse = z.infer<typeof StorageStatusResponseSchema>;

/**
 * Pre-check assets API (Images/Videos)
 * POST /api/v1/storage/pre-check-images
 * POST /api/v1/storage/pre-check-videos
 */
export const StoragePreCheckRequestSchema = z.object({
    assetIds: z.array(z.string()),
});

export const StoragePreCheckResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
});

export type StoragePreCheckRequest = z.infer<typeof StoragePreCheckRequestSchema>;
export type StoragePreCheckResponse = z.infer<typeof StoragePreCheckResponseSchema>;

/**
 * Update user avatar API
 * PUT /api/v1/users/{userId}/client
 */
export const UpdateUserAvatarRequestSchema = z.object({
    image: z.url(),
});

export const UpdateUserAvatarResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
});

export type UpdateUserAvatarRequest = z.infer<typeof UpdateUserAvatarRequestSchema>;
export type UpdateUserAvatarResponse = z.infer<typeof UpdateUserAvatarResponseSchema>;
