import { uploadFileToStorage } from '@/services/storage/storageService';
import { useReturnRequestDraftStore } from '@/store/useReturnRequestDraftStore';
import type {
    ReturnMediaItem,
    ReturnMediaType,
    ReturnRequestDraft,
} from '@/types/order/return';
import type { UploadContext } from '@/types/storage';
import { RETURN_MEDIA_LIMITS } from '@/types/order/return';
import { toPublicUrl } from '@/utils/url';
import { logger } from '@/utils/logger';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

const EMPTY_RETURN_REQUEST_DRAFT: ReturnRequestDraft = {
    reasonCode: null,
    bankAccountId: null,
    description: '',
    mediaItems: [],
};

const getUploadContext = (type: ReturnMediaType): UploadContext => {
    // Temporary reuse until storage/backend adds dedicated RETURN_IMAGE / RETURN_VIDEO contexts.
    return type === 'VIDEO' ? 'REVIEW_VIDEO' : 'REVIEW_IMAGE';
};

const getUploadErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Upload failed';
};

const normalizeAssetDurationSeconds = (
    durationMs: number | null | undefined
): number | undefined => {
    if (typeof durationMs !== 'number' || durationMs <= 0) {
        return undefined;
    }

    return Math.ceil(durationMs / 1000);
};

export const useReturnMediaUpload = (orderId?: string) => {
    const { t } = useTranslation(['order', 'common']);

    const draft = useReturnRequestDraftStore((state) => (
        state.drafts[orderId ?? ''] ?? EMPTY_RETURN_REQUEST_DRAFT
    ));
    const appendMediaItems = useReturnRequestDraftStore((state) => state.appendMediaItems);
    const updateMediaItem = useReturnRequestDraftStore((state) => state.updateMediaItem);
    const removeMediaItem = useReturnRequestDraftStore((state) => state.removeMediaItem);

    const mediaItems = draft.mediaItems;

    const imageCount = useMemo(() => (
        mediaItems.filter((item) => item.type === 'IMAGE').length
    ), [mediaItems]);

    const videoCount = useMemo(() => (
        mediaItems.filter((item) => item.type === 'VIDEO').length
    ), [mediaItems]);

    const hasUploadingMedia = useMemo(() => (
        mediaItems.some((item) => item.uploadStatus === 'pending' || item.uploadStatus === 'uploading')
    ), [mediaItems]);

    const requestLibraryPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') return true;

        Toast.show({
            type: 'error',
            text1: t('returnRequest.mediaPermissionTitle'),
            text2: t('returnRequest.mediaPermissionMessage'),
        });
        return false;
    }, [t]);

    const uploadMediaById = useCallback(async (mediaId: string) => {
        if (!orderId) return;

        const latestDraft = useReturnRequestDraftStore.getState().drafts[orderId] ?? EMPTY_RETURN_REQUEST_DRAFT;
        const mediaItem = latestDraft.mediaItems.find((item) => item.id === mediaId);
        if (!mediaItem) return;

        updateMediaItem(orderId, mediaId, {
            uploadStatus: 'uploading',
            progress: Math.max(mediaItem.progress, 1),
            error: undefined,
        });

        try {
            const { assetId, publicPath } = await uploadFileToStorage(
                mediaItem.uri,
                getUploadContext(mediaItem.type),
                ({ percentage }) => {
                    updateMediaItem(orderId, mediaId, {
                        uploadStatus: 'uploading',
                        progress: Math.max(1, Math.min(99, Math.round(percentage))),
                        error: undefined,
                    });
                }
            );

            updateMediaItem(orderId, mediaId, {
                uploadStatus: 'success',
                progress: 100,
                assetId,
                url: toPublicUrl(publicPath, mediaItem.uri),
                error: undefined,
            });
        } catch (error) {
            logger.api.error('[useReturnMediaUpload] Upload failed', error);

            updateMediaItem(orderId, mediaId, {
                uploadStatus: 'error',
                progress: 0,
                error: getUploadErrorMessage(error),
            });

            Toast.show({
                type: 'error',
                text1: t('returnRequest.mediaUploadErrorTitle'),
                text2: t('returnRequest.mediaUploadErrorMessage'),
            });
        }
    }, [orderId, t, updateMediaItem]);

    const pickImages = useCallback(async () => {
        if (!orderId) return;

        const remainingSlots = RETURN_MEDIA_LIMITS.MAX_IMAGES - imageCount;
        if (remainingSlots <= 0) {
            Toast.show({
                type: 'info',
                text1: t('returnRequest.imageLimitReachedTitle'),
                text2: t('returnRequest.imageLimitReachedMessage', {
                    max: RETURN_MEDIA_LIMITS.MAX_IMAGES,
                }),
            });
            return;
        }

        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: remainingSlots,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const newMediaItems: ReturnMediaItem[] = result.assets.map((asset) => ({
                id: uuidv4(),
                uri: asset.uri,
                type: 'IMAGE',
                uploadStatus: 'pending',
                progress: 0,
                fileSize: asset.fileSize,
            }));

            appendMediaItems(orderId, newMediaItems);
            newMediaItems.forEach((item) => {
                void uploadMediaById(item.id);
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: t('returnRequest.imagePickErrorTitle'),
                text2: t('returnRequest.imagePickErrorMessage'),
            });
        }
    }, [appendMediaItems, imageCount, orderId, requestLibraryPermission, t, uploadMediaById]);

    const pickVideo = useCallback(async () => {
        if (!orderId) return;

        if (videoCount >= RETURN_MEDIA_LIMITS.MAX_VIDEOS) {
            Toast.show({
                type: 'info',
                text1: t('returnRequest.videoLimitReachedTitle'),
                text2: t('returnRequest.videoLimitReachedMessage', {
                    max: RETURN_MEDIA_LIMITS.MAX_VIDEOS,
                }),
            });
            return;
        }

        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsMultipleSelection: false,
                quality: 0.8,
                videoMaxDuration: RETURN_MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];
            const durationSeconds = normalizeAssetDurationSeconds(asset.duration);

            if (
                durationSeconds
                && durationSeconds > RETURN_MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS
            ) {
                Toast.show({
                    type: 'error',
                    text1: t('returnRequest.videoTooLongTitle'),
                    text2: t('returnRequest.videoTooLongMessage', {
                        max: RETURN_MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS,
                    }),
                });
                return;
            }

            if (
                asset.fileSize
                && asset.fileSize > RETURN_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES
            ) {
                Toast.show({
                    type: 'error',
                    text1: t('returnRequest.videoTooLargeTitle'),
                    text2: t('returnRequest.videoTooLargeMessage', {
                        max: RETURN_MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES / (1024 * 1024),
                    }),
                });
                return;
            }

            const newMediaItem: ReturnMediaItem = {
                id: uuidv4(),
                uri: asset.uri,
                type: 'VIDEO',
                uploadStatus: 'pending',
                progress: 0,
                fileSize: asset.fileSize,
                duration: durationSeconds,
            };

            appendMediaItems(orderId, [newMediaItem]);
            void uploadMediaById(newMediaItem.id);
        } catch {
            Toast.show({
                type: 'error',
                text1: t('returnRequest.videoPickErrorTitle'),
                text2: t('returnRequest.videoPickErrorMessage'),
            });
        }
    }, [appendMediaItems, orderId, requestLibraryPermission, t, uploadMediaById, videoCount]);

    const removeMedia = useCallback((mediaId: string) => {
        if (!orderId) return;
        removeMediaItem(orderId, mediaId);
    }, [orderId, removeMediaItem]);

    const retryMediaUpload = useCallback((mediaId: string) => {
        void uploadMediaById(mediaId);
    }, [uploadMediaById]);

    return {
        mediaItems,
        hasUploadingMedia,
        pickImages,
        pickVideo,
        removeMedia,
        retryMediaUpload,
    };
};
