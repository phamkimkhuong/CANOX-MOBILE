import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { uploadFileToStorage } from '@/services/storage/storageService';
import { useAuthStore } from '@/store/useAuthStore';
import {
    UpdateUserAvatarResponse,
    UpdateUserAvatarResponseSchema
} from '@/types/storage';
import { devLog } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
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
 * Hook for handling avatar upload
 */
export const useAvatarUpload = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);
    const userId = useAuthStore((state) => state.userId);

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);


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

            setUploadProgress(5);

            const { assetId, publicPath } = await uploadFileToStorage(
                imageUri,
                'USER_AVATAR',
                (progress) => setUploadProgress(progress.percentage)
            );

            // Step 5: Update user avatar in backend
            devLog('[useAvatarUpload] Asset ready:', publicPath);
            await updateUserAvatar(publicPath);
            setUploadProgress(100);

            return {
                assetId,
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
            Toast.show({
                type: 'error',
                text1: 'Upload ảnh thất bại',
                text2: error instanceof Error ? error.message : 'Vui lòng thử lại sau',
            });
        },
        meta: { handledLocally: true },
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
