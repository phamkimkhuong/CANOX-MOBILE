/**
 * ==============================================
 * USE REVIEW MEDIA UPLOAD - Upload ảnh/video review
 * ==============================================
 * Hook xử lý upload media cho review
 * Sử dụng presigned URL pattern
 */

import { uploadFileToStorage } from '@/services/storage/storageService';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================

type ImageExtension = 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';
type VideoExtension = 'mp4' | 'mov' | 'avi';

// ============================================
// HELPER FUNCTIONS
// ============================================

import type { ReviewMediaItem, ReviewMediaType } from '@/types/review';
import { UploadContext } from '@/types/storage';
import { REVIEW_MEDIA_LIMITS } from '@/utils/adapter/review/reviewIncentives';
import { logger } from '@/utils/logger';
import * as ImagePicker from 'expo-image-picker';

/**
 * Get upload context based on media type
 */
const getUploadContext = (type: ReviewMediaType): UploadContext => {
    return type === 'VIDEO' ? 'REVIEW_VIDEO' : 'REVIEW_IMAGE';
};



// ============================================
// HOOK
// ============================================

export const useReviewMediaUpload = () => {
    const [mediaItems, setMediaItems] = useState<ReviewMediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Request media library permission
     */
    const requestLibraryPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Cần quyền truy cập',
                text2: 'Vui lòng cho phép truy cập thư viện ảnh trong Cài đặt',
            });
            return false;
        }
        return true;
    }, []);

    /**
     * Request camera permission
     */
    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Cần quyền truy cập',
                text2: 'Vui lòng cho phép truy cập máy ảnh trong Cài đặt',
            });
            return false;
        }
        return true;
    }, []);

    /**
     * Upload a single media item following the 4-step flow
     */
    const uploadSingleMedia = useCallback(async (
        item: ReviewMediaItem,
        onProgress: (progress: number) => void
    ): Promise<string> => {
        const context = getUploadContext(item.type);
        const { assetId } = await uploadFileToStorage(
            item.uri,
            context,
            (p) => onProgress(p.percentage)
        );
        return assetId;
    }, []);

    /**
     * Upload a media item
     */
    const uploadMedia = useCallback(async (item: ReviewMediaItem) => {
        setIsUploading(true);

        try {
            const assetId = await uploadSingleMedia(item, (progress) => {
                setMediaItems((prev) =>
                    prev.map((m) =>
                        m.id === item.id
                            ? {
                                ...m,
                                uploadStatus: progress === 100 ? 'success' : 'uploading',
                                progress
                            }
                            : m
                    )
                );
            });

            // Update final success explicitly if needed
            setMediaItems((prev) =>
                prev.map((m) =>
                    m.id === item.id
                        ? { ...m, uploadStatus: 'success' as const, progress: 100, assetId }
                        : m
                )
            );

            logger.api.info('[uploadMedia] Success:', assetId);
        } catch (error) {
            logger.api.error('[uploadMedia] Error:', error);

            // Update error
            setMediaItems((prev) =>
                prev.map((m) =>
                    m.id === item.id
                        ? { ...m, uploadStatus: 'error' as const, error: (error as Error).message }
                        : m
                )
            );

            Toast.show({
                type: 'error',
                text1: 'Upload thất bại',
                text2: 'Vui lòng thử lại',
            });
        } finally {
            setIsUploading(false);
        }
    }, [uploadSingleMedia]);

    /**
     * Pick images from library
     */
    const pickImages = useCallback(async () => {
        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return;

        const currentImageCount = mediaItems.filter(m => m.type === 'IMAGE').length;
        const remainingSlots = REVIEW_MEDIA_LIMITS.MAX_IMAGES - currentImageCount;

        if (remainingSlots <= 0) {
            Toast.show({
                type: 'info',
                text1: 'Đã đạt giới hạn',
                text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_IMAGES} ảnh`,
            });
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: remainingSlots,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const newItems: ReviewMediaItem[] = result.assets.map((asset) => ({
                id: uuidv4(),
                uri: asset.uri,
                type: 'IMAGE' as ReviewMediaType,
                uploadStatus: 'pending' as const,
                progress: 0,
                fileSize: asset.fileSize,
            }));

            setMediaItems((prev) => [...prev, ...newItems]);

            // Start uploading
            for (const item of newItems) {
                uploadMedia(item);
            }
        } catch (error) {
            logger.api.error('[pickImages] Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể chọn ảnh',
            });
        }
    }, [mediaItems, requestLibraryPermission, uploadMedia]);

    /**
     * Take a photo using camera
     */
    const takePhoto = useCallback(async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        const currentImageCount = mediaItems.filter(m => m.type === 'IMAGE').length;
        if (currentImageCount >= REVIEW_MEDIA_LIMITS.MAX_IMAGES) {
            Toast.show({
                type: 'info',
                text1: 'Đã đạt giới hạn',
                text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_IMAGES} ảnh`,
            });
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];
            const newItem: ReviewMediaItem = {
                id: uuidv4(),
                uri: asset.uri,
                type: 'IMAGE',
                uploadStatus: 'pending',
                progress: 0,
                fileSize: asset.fileSize,
            };

            setMediaItems((prev) => [...prev, newItem]);
            uploadMedia(newItem);
        } catch (error) {
            logger.api.error('[takePhoto] Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể mở máy ảnh',
            });
        }
    }, [mediaItems, requestCameraPermission, uploadMedia]);

    /**
     * Pick video from library
     */
    const pickVideo = useCallback(async () => {
        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return;

        const currentVideoCount = mediaItems.filter(m => m.type === 'VIDEO').length;
        if (currentVideoCount >= REVIEW_MEDIA_LIMITS.MAX_VIDEOS) {
            Toast.show({
                type: 'info',
                text1: 'Đã đạt giới hạn',
                text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_VIDEOS} video`,
            });
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsMultipleSelection: false,
                quality: 0.8,
                videoMaxDuration: REVIEW_MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];

            // Validate video size
            if (asset.fileSize && asset.fileSize > REVIEW_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES) {
                Toast.show({
                    type: 'error',
                    text1: 'Video quá lớn',
                    text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`,
                });
                return;
            }

            const newItem: ReviewMediaItem = {
                id: uuidv4(),
                uri: asset.uri,
                type: 'VIDEO',
                uploadStatus: 'pending',
                progress: 0,
                fileSize: asset.fileSize,
                duration: asset.duration ?? undefined,
            };

            setMediaItems((prev) => [...prev, newItem]);
            uploadMedia(newItem);
        } catch (error) {
            logger.api.error('[pickVideo] Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể chọn video',
            });
        }
    }, [mediaItems, requestLibraryPermission, uploadMedia]);

    /**
     * Record a video using camera
     */
    const takeVideo = useCallback(async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        const currentVideoCount = mediaItems.filter(m => m.type === 'VIDEO').length;
        if (currentVideoCount >= REVIEW_MEDIA_LIMITS.MAX_VIDEOS) {
            Toast.show({
                type: 'info',
                text1: 'Đã đạt giới hạn',
                text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_VIDEOS} video`,
            });
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['videos'],
                quality: 0.8,
                videoMaxDuration: REVIEW_MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];

            // Validate video size
            if (asset.fileSize && asset.fileSize > REVIEW_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES) {
                Toast.show({
                    type: 'error',
                    text1: 'Video quá lớn',
                    text2: `Tối đa ${REVIEW_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`,
                });
                return;
            }

            const newItem: ReviewMediaItem = {
                id: uuidv4(),
                uri: asset.uri,
                type: 'VIDEO',
                uploadStatus: 'pending',
                progress: 0,
                fileSize: asset.fileSize,
                duration: asset.duration ?? undefined,
            };

            setMediaItems((prev) => [...prev, newItem]);
            uploadMedia(newItem);
        } catch (error) {
            logger.api.error('[takeVideo] Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể mở máy ảnh',
            });
        }
    }, [mediaItems, requestCameraPermission, uploadMedia]);

    /**
     * Remove a media item
     */
    const removeMedia = useCallback((id: string) => {
        setMediaItems((prev) => prev.filter((m) => m.id !== id));
    }, []);

    /**
     * Retry failed upload
     */
    const retryUpload = useCallback((id: string) => {
        const item = mediaItems.find((m) => m.id === id);
        if (item) {
            uploadMedia({ ...item, uploadStatus: 'pending', progress: 0 });
        }
    }, [mediaItems, uploadMedia]);

    /**
     * Get asset IDs of successfully uploaded items
     */
    const getAssetIds = useCallback((): string[] => {
        return mediaItems
            .filter((m) => m.uploadStatus === 'success' && m.assetId)
            .map((m) => m.assetId!);
    }, [mediaItems]);

    /**
     * Check if all uploads are complete
     */
    const allUploadsComplete = useCallback((): boolean => {
        if (mediaItems.length === 0) return true;
        return mediaItems.every(
            (m) => m.uploadStatus === 'success' || m.uploadStatus === 'error'
        );
    }, [mediaItems]);

    /**
     * Check if any uploads are pending/uploading
     */
    const hasPendingUploads = useCallback((): boolean => {
        return mediaItems.some(
            (m) => m.uploadStatus === 'pending' || m.uploadStatus === 'uploading'
        );
    }, [mediaItems]);

    /**
     * Reset all media
     */
    const reset = useCallback(() => {
        setMediaItems([]);
        setIsUploading(false);
    }, []);

    return {
        // State
        mediaItems,
        isUploading,

        // Actions
        pickImages,
        pickVideo,
        takePhoto,
        takeVideo,
        removeMedia,
        retryUpload,
        reset,

        // Helpers
        getAssetIds,
        allUploadsComplete,
        hasPendingUploads,

        // Counts
        imageCount: mediaItems.filter((m) => m.type === 'IMAGE').length,
        videoCount: mediaItems.filter((m) => m.type === 'VIDEO').length,
        maxImages: REVIEW_MEDIA_LIMITS.MAX_IMAGES,
        maxVideos: REVIEW_MEDIA_LIMITS.MAX_VIDEOS,
    };
};
