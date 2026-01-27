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
import {
    calculateMD5FromArrayBuffer,
    getFileExtension,
    readFileAsArrayBuffer,
} from '@/utils/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for upload progress reporting
 */
export interface UploadProgress {
    step: 'READING' | 'PRESIGNING' | 'UPLOADING' | 'PROCESSING' | 'READY';
    percentage: number;
}

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
        // --- STEP 0: READ FILE & CALCULATE MD5 ---
        onProgress?.({ step: 'READING', percentage: 5 });
        const fileData = await readFileAsArrayBuffer(fileUri);
        const extension = getFileExtension(fileUri);
        const md5 = calculateMD5FromArrayBuffer(fileData.arrayBuffer);
        onProgress?.({ step: 'READING', percentage: 20 });

        // --- STEP 1: PRESIGN UPLOAD ---
        onProgress?.({ step: 'PRESIGNING', percentage: 30 });
        const presignPayload: PresignUploadRequest = {
            context,
            extension,
            fileSizeBytes: fileData.size,
            md5,
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

        // Filter headers based on signed headers list in URL (Required for S3)
        const uploadHeaders: Record<string, string> = {};
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const signedHeaders = (urlParams.get('X-Amz-SignedHeaders') || '').toLowerCase().split(';');

        for (const [key, value] of Object.entries(headers)) {
            const lowerKey = key.toLowerCase();
            // Skip host & content-length (handled by fetch)
            // Only include headers that are signed in the S3 URL
            if (lowerKey !== 'host' && lowerKey !== 'content-length' && signedHeaders.includes(lowerKey)) {
                uploadHeaders[key] = value;
            }
        }

        const uploadResponse = await fetch(url, {
            method,
            headers: uploadHeaders,
            body: fileData.arrayBuffer,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Cloud storage upload failed: ${uploadResponse.status} - ${errorText}`);
        }
        onProgress?.({ step: 'UPLOADING', percentage: 70 });

        // --- STEP 3: PRE-CHECK (Trigger Processing) ---
        onProgress?.({ step: 'PROCESSING', percentage: 75 });

        // Determine correct pre-check endpoint based on context
        const isVideo = context.includes('VIDEO');
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
