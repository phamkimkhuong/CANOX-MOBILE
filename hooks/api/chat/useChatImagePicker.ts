import { logger } from '@/utils/logger';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
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

export const useChatImagePicker = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Request permission to access the media library
     */
    const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
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
     * Xin quyền truy cập camera
     */
    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Cần quyền truy cập',
                text2: 'Vui lòng cho phép truy cập Camera trong Cài đặt',
            });
            return false;
        }
        return true;
    }, []);

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
                text1: 'Lỗi',
                text2: 'Không thể chọn ảnh. Vui lòng thử lại.',
            });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [requestMediaLibraryPermission]);

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
                text1: 'Lỗi',
                text2: 'Không thể chọn ảnh. Vui lòng thử lại.',
            });
            return [];
        } finally {
            setIsProcessing(false);
        }
    }, [requestMediaLibraryPermission]);

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
                text1: 'Lỗi',
                text2: 'Không thể chụp ảnh. Vui lòng thử lại.',
            });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [requestCameraPermission]);

    return {
        pickImage,
        pickMultipleImages,
        takePhoto,
        isProcessing,
    };
};
