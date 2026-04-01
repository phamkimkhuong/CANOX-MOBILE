import { CHAT_MEDIA_POLICY } from '@/constants/mediaPolicies';
import { generateVideoThumbnailSource } from '@/utils/media/videoThumbnail';
import { logger } from '@/utils/logger';
import {
    normalizeAssetDurationSeconds,
    validateImageSelection,
    validateVideoSelection,
} from '@/utils/validation/mediaValidation';
import type { SharedRefType } from 'expo';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

/**
 * ==============================================
 * useChatImagePicker Hook
 * ==============================================
 * Handle image selection from library or camera
 * to send in chat. Includes permission request logic.
 * 
 * @returns Object containing pickImage, takePhoto functions and isProcessing state
 */

export interface PickedImage {
    uri: string;
    width: number;
    height: number;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}

export interface PickedVideo {
    uri: string;
    width: number;
    height: number;
    duration?: number;
    thumbnailSource?: SharedRefType<'image'>;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}

const CHAT_IMAGE_MAX_SIZE_MB = (CHAT_MEDIA_POLICY.image?.maxSizeBytes ?? 0) / (1024 * 1024);
const CHAT_VIDEO_MAX_SIZE_MB = (CHAT_MEDIA_POLICY.video?.maxSizeBytes ?? 0) / (1024 * 1024);
const CHAT_VIDEO_MAX_DURATION_SECONDS = CHAT_MEDIA_POLICY.video?.maxDurationSeconds ?? 60;

export const useChatImagePicker = () => {
    const { t } = useTranslation('chat');
    const [isProcessing, setIsProcessing] = useState(false);

    const showChatImageTooLargeToast = useCallback(() => {
        Toast.show({
            type: 'error',
            text1: t('detail.media.imageTooLargeTitle'),
            text2: t('detail.media.imageTooLargeMessage', {
                max: CHAT_IMAGE_MAX_SIZE_MB,
            }),
        });
    }, [t]);

    const showChatVideoValidationToast = useCallback((code: 'FILE_TOO_LARGE' | 'VIDEO_TOO_LONG') => {
        const text1 = code === 'VIDEO_TOO_LONG'
            ? t('detail.media.videoTooLongTitle')
            : t('detail.media.videoTooLargeTitle');
        const text2 = code === 'VIDEO_TOO_LONG'
            ? t('detail.media.videoTooLongMessage', {
                max: CHAT_VIDEO_MAX_DURATION_SECONDS,
            })
            : t('detail.media.videoTooLargeMessage', {
                max: CHAT_VIDEO_MAX_SIZE_MB,
            });

        Toast.show({
            type: 'error',
            text1,
            text2,
        });
    }, [t]);

    /**
     * Request permission to access the media library
     */
    const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: t('detail.media.permissionTitle'),
                text2: t('detail.media.mediaLibraryPermissionMessage'),
            });
            return false;
        }
        return true;
    }, [t]);

    /**
     * Xin quyền truy cập camera
     */
    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: t('detail.media.permissionTitle'),
                text2: t('detail.media.cameraPermissionMessage'),
            });
            return false;
        }
        return true;
    }, [t]);

    /**
     * Pick an image from the library (Gallery)
     * @returns PickedImage or null if user cancels/error
     */
    const pickImage = useCallback(async (): Promise<PickedImage | null> => {
        try {
            setIsProcessing(true);

            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) return null;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (result.canceled || !result.assets?.[0]) {
                logger.chat.info('User cancelled image picker');
                return null;
            }

            const asset = result.assets[0];
            if (!validateImageSelection(asset.fileSize, CHAT_MEDIA_POLICY.image).valid) {
                showChatImageTooLargeToast();
                return null;
            }

            logger.chat.info('Image picked from library', {
                uri: asset.uri.substring(0, 50),
                width: asset.width,
                height: asset.height,
            });

            return {
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
                fileName: asset.fileName || `image_${Date.now()}.jpg`,
                mimeType: asset.mimeType || 'image/jpeg',
                fileSize: asset.fileSize,
            };
        } catch (error) {
            logger.chat.error('Error picking image', error);
            Toast.show({
                type: 'error',
                text1: t('detail.media.pickImageFailedTitle'),
                text2: t('detail.media.pickImageFailedMessage'),
            });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [requestMediaLibraryPermission, showChatImageTooLargeToast, t]);

    /**
     * Pick multiple images from the library (Gallery)
     * Allows user to select up to `selectionLimit` images at once
     * @param selectionLimit Maximum number of images to select (default: 10)
     * @returns Array of PickedImage or empty array if user cancels/error
     */
    const pickMultipleImages = useCallback(async (selectionLimit: number = 10): Promise<PickedImage[]> => {
        try {
            setIsProcessing(true);
            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) return [];
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: selectionLimit,
            });
            if (result.canceled || !result.assets?.length) {
                logger.chat.info('User cancelled multi-image picker');
                return [];
            }

            const invalidAsset = result.assets.find((asset) => (
                !validateImageSelection(asset.fileSize, CHAT_MEDIA_POLICY.image).valid
            ));

            if (invalidAsset) {
                showChatImageTooLargeToast();
                return [];
            }

            const pickedImages: PickedImage[] = result.assets.map((asset, index) => ({
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
                fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
                mimeType: asset.mimeType || 'image/jpeg',
                fileSize: asset.fileSize,
            }));
            return pickedImages;
        } catch (error) {
            logger.chat.error('Error picking multiple images', error);
            Toast.show({
                type: 'error',
                text1: t('detail.media.pickImageFailedTitle'),
                text2: t('detail.media.pickImageFailedMessage'),
            });
            return [];
        } finally {
            setIsProcessing(false);
        }
    }, [requestMediaLibraryPermission, showChatImageTooLargeToast, t]);

    /**
     * Take a photo using the camera
     * @returns PickedImage or null if user cancels/error
     */
    const takePhoto = useCallback(async (): Promise<PickedImage | null> => {
        try {
            setIsProcessing(true);

            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return null;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.[0]) {
                logger.chat.info('User cancelled camera');
                return null;
            }

            const asset = result.assets[0];
            if (!validateImageSelection(asset.fileSize, CHAT_MEDIA_POLICY.image).valid) {
                showChatImageTooLargeToast();
                return null;
            }

            logger.chat.info('Photo taken from camera', {
                uri: asset.uri.substring(0, 50),
                width: asset.width,
                height: asset.height,
            });

            return {
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
                fileName: asset.fileName || `photo_${Date.now()}.jpg`,
                mimeType: asset.mimeType || 'image/jpeg',
                fileSize: asset.fileSize,
            };
        } catch (error) {
            logger.chat.error('Error taking photo', error);
            Toast.show({
                type: 'error',
                text1: t('detail.media.takePhotoFailedTitle'),
                text2: t('detail.media.takePhotoFailedMessage'),
            });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [requestCameraPermission, showChatImageTooLargeToast, t]);

    /**
     * Pick a single video from the media library
     * @returns PickedVideo or null if user cancels/error
     */
    const pickVideo = useCallback(async (): Promise<PickedVideo | null> => {
        try {
            setIsProcessing(true);

            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) return null;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsMultipleSelection: false,
                videoMaxDuration: CHAT_VIDEO_MAX_DURATION_SECONDS,
            });

            if (result.canceled || !result.assets?.[0]) {
                logger.chat.info('User cancelled video picker');
                return null;
            }

            const asset = result.assets[0];
            const normalizedDuration = normalizeAssetDurationSeconds(asset.duration);
            const validationResult = validateVideoSelection({
                sizeBytes: asset.fileSize,
                durationSeconds: normalizedDuration,
                policy: CHAT_MEDIA_POLICY.video,
            });

            if (!validationResult.valid) {
                showChatVideoValidationToast(validationResult.code);
                return null;
            }

            logger.chat.info('Video picked from library', {
                uri: asset.uri.substring(0, 50),
                width: asset.width,
                height: asset.height,
                duration: normalizedDuration,
            });

            let thumbnailSource: SharedRefType<'image'> | undefined;
            try {
                thumbnailSource = await generateVideoThumbnailSource(
                    asset.uri,
                    normalizedDuration
                ) ?? undefined;
            } catch (thumbnailError) {
                logger.chat.warn('Failed to generate chat video thumbnail', {
                    uri: asset.uri.substring(0, 50),
                    error: thumbnailError,
                });
            }

            return {
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
                duration: normalizedDuration,
                thumbnailSource,
                fileName: asset.fileName || `video_${Date.now()}.mp4`,
                mimeType: asset.mimeType || 'video/mp4',
                fileSize: asset.fileSize,
            };
        } catch (error) {
            logger.chat.error('Error picking video', error);
            Toast.show({
                type: 'error',
                text1: t('detail.media.pickVideoFailedTitle'),
                text2: t('detail.media.pickVideoFailedMessage'),
            });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [requestMediaLibraryPermission, showChatVideoValidationToast, t]);

    return {
        pickImage,
        pickMultipleImages,
        pickVideo,
        takePhoto,
        isProcessing,
    };
};
