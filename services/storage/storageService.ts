/**
 * Storage Service - Centralized logic for the 4-step upload flow
 * 
 * Pattern:
 * 1. Presign Upload (Get S3 URL + AssetId)
 * 2. PUT to Storage (Direct binary upload)
 * 3. Pre-check (Trigger backend processing)
 * 4. Status Polling (Wait until READY)
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import {
    getNativeFileMetadata,
    NativeFileUploadMethod,
    NativeFileUploadTarget,
    uploadFileUriWithNativeTask,
} from '@/services/storage/nativeFileUpload';
import {
    PresignUploadRequest,
    PresignUploadResponse,
    PresignUploadResponseSchema,
    StoragePreCheckResponse,
    StoragePreCheckResponseSchema,
    StorageStatusResponse,
    StorageStatusResponseSchema,
    UploadContext,
} from '@/types/storage';
import { logger } from '@/utils/logger';
import { getFileExtension } from '@/utils/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for upload progress reporting
 */
export interface UploadProgress {
    step: 'READING' | 'PRESIGNING' | 'UPLOADING' | 'PROCESSING' | 'READY';
    percentage: number;
}

type SignedUploadTarget = {
    url: string;
    method: NativeFileUploadMethod;
    headers: Record<string, string>;
};

const isVideoContext = (context: UploadContext): boolean => context.includes('VIDEO');

const normalizeUploadMethod = (method: string): NativeFileUploadMethod => {
    const normalizedMethod = method.toUpperCase();

    if (normalizedMethod === 'POST' || normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
        return normalizedMethod;
    }

    throw new Error(`Unsupported upload method: ${method}`);
};

const getSignedUploadHeaders = (
    uploadUrl: string,
    presignedHeaders: Record<string, string>
): Record<string, string> => {
    const uploadHeaders: Record<string, string> = {};
    const urlParams = new URLSearchParams(uploadUrl.split('?')[1] || '');
    const signedHeaders = (urlParams.get('X-Amz-SignedHeaders') || '')
        .toLowerCase()
        .split(';')
        .filter(Boolean);

    for (const [key, value] of Object.entries(presignedHeaders)) {
        const lowerKey = key.toLowerCase();

        if (
            lowerKey !== 'host'
            && lowerKey !== 'content-length'
            && signedHeaders.includes(lowerKey)
        ) {
            uploadHeaders[key] = value;
        }
    }

    return uploadHeaders;
};

/**
 * Handle the complete 4-step upload flow for any context
 * 
 * @param fileUri - Local URI of the file to upload
 * @param context - Upload context (e.g., 'USER_AVATAR', 'CHAT_IMAGE', 'REVIEW_IMAGE')
 * @param onProgress - Optional callback for granular progress updates
 * @returns Object containing assetId and publicPath
 */
export const uploadFileToStorage = async (
    fileUri: string,
    context: UploadContext,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ assetId: string; publicPath: string }> => {
    try {
        const isVideo = isVideoContext(context);

        // --- STEP 0: PREPARE FILE METADATA & CHECKSUM ---
        onProgress?.({ step: 'READING', percentage: 5 });
        const extension = getFileExtension(fileUri);
        const fileMetadata = await getNativeFileMetadata(fileUri);
        onProgress?.({ step: 'READING', percentage: 20 });

        // --- STEP 1: PRESIGN UPLOAD ---
        onProgress?.({ step: 'PRESIGNING', percentage: 30 });
        const presignPayload: PresignUploadRequest = {
            context,
            extension,
            fileSizeBytes: fileMetadata.size,
            md5: fileMetadata.md5,
            isPrivate: false,
        };

        const presignResponse = await request<PresignUploadResponse>(
            {
                url: API_ROUTES.STORAGE.PRESIGN_UPLOAD,
                method: 'POST',
                data: presignPayload,
                headers: { 'Idempotency-Key': uuidv4() },
            },
            PresignUploadResponseSchema
        );

        const { url, method, headers, assetId } = presignResponse.data;
        onProgress?.({ step: 'PRESIGNING', percentage: 40 });

        // --- STEP 2: UPLOAD TO STORAGE ---
        onProgress?.({ step: 'UPLOADING', percentage: 45 });
        const uploadTarget: SignedUploadTarget = {
            url,
            method: normalizeUploadMethod(method),
            headers: getSignedUploadHeaders(url, headers),
        };

        const nativeUploadTarget: NativeFileUploadTarget = {
            ...uploadTarget,
            fileUri,
        };

        await uploadFileUriWithNativeTask(
            nativeUploadTarget,
            (progressFraction) => {
                onProgress?.({
                    step: 'UPLOADING',
                    percentage: Math.max(
                        45,
                        Math.min(70, Math.round(45 + (progressFraction * 25)))
                    ),
                });
            }
        );
        onProgress?.({ step: 'UPLOADING', percentage: 70 });

        // --- STEP 3: PRE-CHECK (Trigger Processing) ---
        onProgress?.({ step: 'PROCESSING', percentage: 75 });

        // Determine correct pre-check endpoint based on context
        const preCheckUrl = isVideo
            ? API_ROUTES.STORAGE.PRE_CHECK_VIDEOS
            : API_ROUTES.STORAGE.PRE_CHECK_IMAGES;

        await request<StoragePreCheckResponse>(
            {
                url: preCheckUrl,
                method: 'POST',
                data: { assetIds: [assetId] },
            },
            StoragePreCheckResponseSchema
        );
        onProgress?.({ step: 'PROCESSING', percentage: 85 });

        // --- STEP 4: POLL STATUS ---
        let publicPath = '';
        let attempts = 0;
        // Videos take longer to process (transcoding/validation)
        const maxAttempts = isVideo ? 60 : 15;

        while (attempts < maxAttempts) {
            const statusResponse = await request<StorageStatusResponse>(
                {
                    url: `${API_ROUTES.STORAGE.STATUS}?assetIds=${assetId}`,
                    method: 'GET',
                },
                StorageStatusResponseSchema
            );

            const status = statusResponse.data[assetId];
            if (status?.status === 'READY' && status.publicPath) {
                publicPath = status.publicPath;
                break;
            }
            if (status?.status === 'FAILED') {
                throw new Error('Backend processing failed for the uploaded file');
            }

            attempts++;
            // Increment percentage slightly during polling
            onProgress?.({
                step: 'PROCESSING',
                percentage: Math.min(99, 85 + (attempts * 0.9))
            });
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!publicPath) {
            throw new Error('Processing timeout: Asset did not become READY in time');
        }

        onProgress?.({ step: 'READY', percentage: 100 });

        return { assetId, publicPath };

    } catch (error) {
        logger.api.error('[StorageService] Critical error during upload flow:', error);
        throw error;
    }
};
