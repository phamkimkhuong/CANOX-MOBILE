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
import {
    createUploadTask,
    FileSystemUploadType,
    getInfoAsync,
} from 'expo-file-system/legacy';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for upload progress reporting
 */
export interface UploadProgress {
    step: 'READING' | 'PRESIGNING' | 'UPLOADING' | 'PROCESSING' | 'READY';
    percentage: number;
}

type NativeFileMetadata = {
    size: number;
    md5: string;
};

type SignedUploadTarget = {
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    headers: Record<string, string>;
};

const isVideoContext = (context: UploadContext): boolean => context.includes('VIDEO');

const getNativeFileMetadata = async (fileUri: string): Promise<NativeFileMetadata> => {
    const fileInfo = await getInfoAsync(fileUri, { md5: true });

    if (!fileInfo.exists || fileInfo.isDirectory) {
        throw new Error('Failed to access upload file');
    }

    if (typeof fileInfo.size !== 'number' || fileInfo.size <= 0) {
        throw new Error('Failed to determine file size');
    }

    if (!fileInfo.md5) {
        throw new Error('Failed to calculate file checksum');
    }

    return {
        size: fileInfo.size,
        md5: fileInfo.md5,
    };
};

const normalizeUploadMethod = (method: string): 'POST' | 'PUT' | 'PATCH' => {
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

const uploadArrayBufferToSignedUrl = async (
    target: SignedUploadTarget,
    arrayBuffer: ArrayBuffer
): Promise<void> => {
    const uploadResponse = await fetch(target.url, {
        method: target.method,
        headers: target.headers,
        body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Cloud storage upload failed: ${uploadResponse.status} - ${errorText}`);
    }
};

const uploadFileUriToSignedUrl = async (
    target: SignedUploadTarget,
    fileUri: string,
    onProgress?: (progressFraction: number) => void
): Promise<void> => {
    const uploadTask = createUploadTask(
        target.url,
        fileUri,
        {
            headers: target.headers,
            httpMethod: target.method,
            uploadType: FileSystemUploadType.BINARY_CONTENT,
        },
        ({ totalBytesExpectedToSend, totalBytesSent }) => {
            if (totalBytesExpectedToSend <= 0) {
                return;
            }

            onProgress?.(Math.min(1, totalBytesSent / totalBytesExpectedToSend));
        }
    );

    const uploadResponse = await uploadTask.uploadAsync();
    if (!uploadResponse) {
        throw new Error('Cloud storage upload was interrupted');
    }

    if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error(
            `Cloud storage upload failed: ${uploadResponse.status} - ${uploadResponse.body}`
        );
    }
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
        let fileSizeBytes = 0;
        let md5 = '';
        let imageUploadBuffer: ArrayBuffer | undefined;

        if (isVideo) {
            const videoMetadata = await getNativeFileMetadata(fileUri);
            fileSizeBytes = videoMetadata.size;
            md5 = videoMetadata.md5;
        } else {
            const imageFileData = await readFileAsArrayBuffer(fileUri);
            fileSizeBytes = imageFileData.size;
            md5 = calculateMD5FromArrayBuffer(imageFileData.arrayBuffer);
            imageUploadBuffer = imageFileData.arrayBuffer;
        }
        onProgress?.({ step: 'READING', percentage: 20 });

        // --- STEP 1: PRESIGN UPLOAD ---
        onProgress?.({ step: 'PRESIGNING', percentage: 30 });
        const presignPayload: PresignUploadRequest = {
            context,
            extension,
            fileSizeBytes,
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
        const uploadTarget: SignedUploadTarget = {
            url,
            method: normalizeUploadMethod(method),
            headers: getSignedUploadHeaders(url, headers),
        };

        if (isVideo) {
            await uploadFileUriToSignedUrl(
                uploadTarget,
                fileUri,
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
        } else {
            if (!imageUploadBuffer) {
                throw new Error('Image upload buffer is missing');
            }

            await uploadArrayBufferToSignedUrl(uploadTarget, imageUploadBuffer);
        }
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
