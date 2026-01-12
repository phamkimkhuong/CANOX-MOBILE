import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    ImageExtension,
    PresignUploadRequest,
    PresignUploadResponse,
    PresignUploadResponseSchema
} from '@/types/storage';
import { devLog } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { md5 as calculateMd5 } from 'js-md5';
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

/**
 * Extract file extension from URI or filename
 */
const getFileExtension = (uri: string): ImageExtension => {
    const extension = uri.split('.').pop()?.toLowerCase();

    // Map common extensions
    if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
    if (extension === 'png') return 'png';
    if (extension === 'webp') return 'webp';
    if (extension === 'gif') return 'gif';

    // Default to jpg for unknown types
    return 'jpg';
};

/**
 * Calculate actual MD5 hash of file content
 * Uses js-md5 library to compute real MD5 from file binary data
 * This is required because S3/R2 verifies Content-MD5 header against uploaded file
 */
const calculateFileMD5 = async (fileUri: string): Promise<string> => {
    try {
        // Fetch file as blob
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Convert blob to ArrayBuffer using FileReader (compatible with React Native)
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('FileReader did not return ArrayBuffer'));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });

        // Calculate MD5 hash (returns 32-character hex string)
        const hash = calculateMd5(arrayBuffer);

        devLog('[useAvatarUpload] Calculated real MD5:', hash);
        return hash;
    } catch (error) {
        devLog('[useAvatarUpload] MD5 calculation error:', error);
        throw new Error('Failed to calculate file MD5');
    }
};

/**
 * Get MIME type from extension
 */
const getMimeType = (extension: ImageExtension): string => {
    const mimeTypes: Record<ImageExtension, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
    };
    return mimeTypes[extension] || 'image/jpeg';
};

/**
 * Hook for handling avatar upload
 */
export const useAvatarUpload = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

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

        devLog('[useAvatarUpload] Requesting presigned URL:', payload);

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
     * Step 2: Upload file to presigned URL
     * IMPORTANT: Must use exact headers from server response
     * Presigned URLs are signed with specific headers - any modification causes 403
     */
    const uploadToPresignedUrl = async (
        presignedUrl: string,
        method: string,
        headers: Record<string, string>,
        fileUri: string
    ): Promise<void> => {
        devLog('[useAvatarUpload] Uploading to presigned URL:', presignedUrl);
        devLog('[useAvatarUpload] Using headers from server:', headers);

        // Read file as blob for upload
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Create headers object, excluding 'Host' which is set automatically by fetch
        const uploadHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(headers)) {
            // Skip 'Host' header - it's handled automatically and can cause issues
            if (key.toLowerCase() !== 'host') {
                uploadHeaders[key] = value;
            }
        }

        devLog('[useAvatarUpload] Final upload headers:', uploadHeaders);

        // Upload directly to presigned URL with EXACT headers from server
        const uploadResponse = await fetch(presignedUrl, {
            method: method,
            headers: uploadHeaders,
            body: blob,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            devLog('[useAvatarUpload] Upload error response:', errorText);
            throw new Error(`Upload failed with status: ${uploadResponse.status} - ${errorText}`);
        }

        devLog('[useAvatarUpload] Upload successful');
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

            // Get file info
            const extension = getFileExtension(imageUri);

            // Fetch file to get actual size
            const fileResponse = await fetch(imageUri);
            const blob = await fileResponse.blob();
            const fileSize = blob.size;

            setUploadProgress(20);

            // Validate file size BEFORE calling presign API
            if (fileSize > MAX_AVATAR_SIZE_BYTES) {
                const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
                const maxSizeMB = (MAX_AVATAR_SIZE_BYTES / (1024 * 1024)).toFixed(0);
                throw new Error(
                    `Ảnh quá lớn (${fileSizeMB}MB). Kích thước tối đa cho ảnh đại diện là ${maxSizeMB}MB. Vui lòng chọn ảnh nhỏ hơn.`
                );
            }

            // Calculate real MD5 hash of file content
            const fileMd5Hash = await calculateFileMD5(imageUri);

            setUploadProgress(30);

            // Step 1: Get presigned URL
            const presignResponse = await getPresignedUrl(extension, fileSize, fileMd5Hash);

            setUploadProgress(50);

            // Step 2: Upload to presigned URL
            await uploadToPresignedUrl(
                presignResponse.data.url,
                presignResponse.data.method,
                presignResponse.data.headers,
                imageUri
            );

            setUploadProgress(80);

            // Step 3: Update user profile with new avatar path
            // Note: This step depends on your API - might need separate endpoint
            // For now, we return the asset info for the caller to handle

            setUploadProgress(100);

            return {
                assetId: presignResponse.data.assetId,
                path: presignResponse.data.path,
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
                devLog('[useAvatarUpload] Image picked:', {
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
