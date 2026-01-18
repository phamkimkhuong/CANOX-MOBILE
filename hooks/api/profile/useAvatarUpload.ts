import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    PreCheckImagesResponse,
    PreCheckImagesResponseSchema,
    PresignUploadRequest,
    PresignUploadResponse,
    PresignUploadResponseSchema,
    StorageStatusResponse,
    StorageStatusResponseSchema,
    UpdateUserAvatarResponse,
    UpdateUserAvatarResponseSchema
} from '@/types/storage';
import { devLog } from '@/utils/logger';
import { ImageExtension } from '@/utils/storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { profileQueryKeys } from './useProfile';

/**
 * ==============================================
 * AVATAR UPLOAD HOOK
 * ==============================================
 * Uses presigned URL pattern for efficient direct-to-storage uploads.
 */

/**
 * Maximum file size for USER_AVATAR (2MB as per API)
 */
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB = 2,097,152 bytes

/**
 * Configuration for image picker
 * - quality set to 0.7 to help reduce file size below 2MB limit
 * - allowsEditing enables cropping to square aspect ratio
 */
const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1], // Square aspect ratio for avatar
    quality: 0.7,   // 70% quality to reduce file size below 2MB limit
};

import {
    calculateMD5FromArrayBuffer,
    getFileExtension,
    readFileAsArrayBuffer
} from '@/utils/storage';

/**
 * Hook for handling avatar upload
 */
export const useAvatarUpload = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);
    const userId = useAuthStore((state) => state.userId);

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    /**
     * Step 1: Get presigned URL from server
     */
    const getPresignedUrl = async (
        extension: ImageExtension,
        fileSize: number,
        md5: string
    ): Promise<PresignUploadResponse> => {
        const payload: PresignUploadRequest = {
            context: 'USER_AVATAR',
            extension,
            fileSizeBytes: fileSize,
            md5,
            isPrivate: false,
        };
        // Generate unique idempotency key to prevent duplicate uploads
        const idempotencyKey = uuidv4();

        const response = await request<PresignUploadResponse>(
            {
                url: API_ROUTES.STORAGE.PRESIGN_UPLOAD,
                method: 'POST',
                data: payload,
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
            },
            PresignUploadResponseSchema
        );

        return response;
    };

    /**
     * Step 2: Upload blob to presigned URL
     */
    const uploadToPresignedUrlWithData = async (
        presignedUrl: string,
        method: string,
        headers: Record<string, string>,
        data: ArrayBuffer
    ): Promise<void> => {
        const urlParams = new URLSearchParams(presignedUrl.split('?')[1] || '');
        const signedHeadersParam = urlParams.get('X-Amz-SignedHeaders') || '';
        const signedHeadersList = signedHeadersParam.toLowerCase().split(';');

        // Skip 'host' (handled by fetch) and 'content-length' (calculated by fetch)
        const uploadHeaders: Record<string, string> = {};

        for (const [key, value] of Object.entries(headers)) {
            const lowerKey = key.toLowerCase();

            // Skip headers that are handled automatically or not in signed list
            if (lowerKey === 'host') {
                continue;
            }
            if (lowerKey === 'content-length') {
                continue;
            }

            // Only include if it's in the signed headers list
            if (signedHeadersList.includes(lowerKey)) {
                uploadHeaders[key] = value;
            }
        }
        const uploadResponse = await fetch(presignedUrl, {
            method: method,
            headers: uploadHeaders,
            body: data,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            devLog('[useAvatarUpload] Upload error response:', errorText);
            throw new Error(`Lỗi trong quá trình tải ảnh lên`);
        }
    };

    /**
     * Step 3: Pre-check images to trigger backend processing
     * Must be called before polling status
     */
    const preCheckImages = async (assetId: string): Promise<void> => {
        // console.log('preCheckImages', assetId);
        const response = await request<PreCheckImagesResponse>(
            {
                url: API_ROUTES.STORAGE.PRE_CHECK_IMAGES,
                method: 'POST',
                data: {
                    assetIds: [assetId],
                },
            },
            PreCheckImagesResponseSchema
        );

        if (!response.success) {
            throw new Error('Pre-check validation failed');
        }
    };

    /**
     * Step 4: Poll storage status until READY
     * After pre-check, poll until backend finishes processing (max 10 seconds)
     */
    const pollStorageStatus = async (
        assetId: string,
        maxAttempts: number = 10,
        intervalMs: number = 1000
    ): Promise<string> => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const response = await request<StorageStatusResponse>(
                {
                    url: `${API_ROUTES.STORAGE.STATUS}?assetIds=${assetId}`,
                    method: 'GET',
                },
                StorageStatusResponseSchema
            );
            const assetStatus = response.data[assetId];
            if (!assetStatus) {
                throw new Error('Asset not found in status response');
            }
            if (assetStatus.status === 'FAILED') {
                throw new Error('Asset processing failed');
            }
            if (assetStatus.status === 'READY' && assetStatus.publicPath) {
                return assetStatus.publicPath;
            }
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        throw new Error('Timeout: Avatar processing took too long');
    };
    const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;

    /**
     * Step 5: Update user avatar in backend
     */
    const updateUserAvatar = async (publicPath: string): Promise<void> => {
        if (!userId) {
            throw new Error('User ID not found');
        }

        const fullImageUrl = `${CDN_BASE_URL}${publicPath}`;

        const response = await request<UpdateUserAvatarResponse>(
            {
                url: API_ROUTES.USERS.UPDATE_CLIENT(userId),
                method: 'PUT',
                data: {
                    image: fullImageUrl,
                },
            },
            UpdateUserAvatarResponseSchema
        );

        if (!response.success) {
            throw new Error('Failed to update avatar');
        }
        devLog('[useAvatarUpload] Avatar updated successfully:', fullImageUrl);
    };

    /**
     * Main mutation for avatar upload
     */
    const uploadMutation = useMutation({
        mutationFn: async (imageUri: string) => {
            if (!buyerId) {
                throw new Error('User not authenticated');
            }

            setUploadProgress(10);

            // Get file extension
            const extension = getFileExtension(imageUri);
            const fileData = await readFileAsArrayBuffer(imageUri);
            const fileSize = fileData.size;
            setUploadProgress(20);

            // Validate file size BEFORE calling presign API
            if (fileSize > MAX_AVATAR_SIZE_BYTES) {
                const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
                const maxSizeMB = (MAX_AVATAR_SIZE_BYTES / (1024 * 1024)).toFixed(0);
                throw new Error(
                    `Ảnh quá lớn (${fileSizeMB}MB). Kích thước tối đa cho ảnh đại diện là ${maxSizeMB}MB. Vui lòng chọn ảnh nhỏ hơn.`
                );
            }

            // Calculate MD5 from the SAME ArrayBuffer we'll upload
            const fileMd5Hash = calculateMD5FromArrayBuffer(fileData.arrayBuffer);

            setUploadProgress(30);

            // Step 1: Get presigned URL
            const presignResponse = await getPresignedUrl(extension, fileSize, fileMd5Hash);

            setUploadProgress(50);

            // Step 2: Upload to presigned URL using the SAME ArrayBuffer we calculated MD5 from
            await uploadToPresignedUrlWithData(
                presignResponse.data.url,
                presignResponse.data.method,
                presignResponse.data.headers,
                fileData.arrayBuffer
            );
            setUploadProgress(70);
            // Step 3: Pre-check images to trigger backend processing
            await preCheckImages(presignResponse.data.assetId);
            setUploadProgress(80);
            // Step 4: Poll storage status until READY (max 10 seconds)
            const publicPath = await pollStorageStatus(presignResponse.data.assetId);
            setUploadProgress(90);
            // Step 5: Update user avatar in backend
            devLog('[useAvatarUpload] Asset ready:', publicPath);
            await updateUserAvatar(publicPath);
            setUploadProgress(100);
            return {
                assetId: presignResponse.data.assetId,
                path: presignResponse.data.path,
                publicPath,
                success: true,
            };
        },
        onSuccess: () => {
            // Invalidate profile cache to refresh avatar
            queryClient.invalidateQueries({ queryKey: profileQueryKeys.user() });
            setUploadProgress(0);
        },
        onError: (error) => {
            devLog('[useAvatarUpload] Error:', error);
            setUploadProgress(0);
        },
    });

    /**
     * Pick image from gallery
     */
    const pickFromGallery = useCallback(async () => {
        try {
            setIsPickerOpen(true);

            const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                return asset.uri;
            }

            return null;
        } finally {
            setIsPickerOpen(false);
        }
    }, []);

    /**
     * Take photo from camera
     */
    const takePhoto = useCallback(async () => {
        try {
            setIsPickerOpen(true);

            // Request camera permission
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                throw new Error('Camera permission denied');
            }

            const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                devLog('[useAvatarUpload] Photo taken:', {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                });

                return asset.uri;
            }

            return null;
        } finally {
            setIsPickerOpen(false);
        }
    }, []);

    /**
     * Complete flow: pick image and upload
     */
    const pickAndUpload = useCallback(async (source: 'gallery' | 'camera') => {
        const uri = source === 'gallery'
            ? await pickFromGallery()
            : await takePhoto();

        if (uri) {
            return uploadMutation.mutateAsync(uri);
        }

        return null;
    }, [pickFromGallery, takePhoto, uploadMutation]);

    return {
        // State
        isUploading: uploadMutation.isPending,
        isPickerOpen,
        uploadProgress,
        error: uploadMutation.error,

        // Actions
        pickFromGallery,
        takePhoto,
        uploadImage: uploadMutation.mutate,
        uploadImageAsync: uploadMutation.mutateAsync,
        pickAndUpload,

        // Reset
        reset: uploadMutation.reset,
    };
};
