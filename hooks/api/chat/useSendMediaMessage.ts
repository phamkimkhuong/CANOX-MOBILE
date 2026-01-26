import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    AttachmentRequest,
    Message,
    SendMessageResponse,
    SendMessageResponseSchema,
} from '@/types/chat/message';
import {
    PreCheckImagesResponse,
    PreCheckImagesResponseSchema,
    PresignUploadRequest,
    PresignUploadResponse,
    PresignUploadResponseSchema,
    StorageStatusResponse,
    StorageStatusResponseSchema,
} from '@/types/storage';
import { transformMessage } from '@/utils/adapter/chat/messageAdapter';
import { logger } from '@/utils/logger';
import {
    calculateMD5FromArrayBuffer,
    getFileExtension,
    readFileAsArrayBuffer,
} from '@/utils/storage';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { chatMessagesQueryKeys } from './useChatMessages';

/**
 * Interface for media file being uploaded
 */
export interface ChatMediaFile {
    uri: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
}

interface SendMediaMessagePayload {
    files: ChatMediaFile[];
    content?: string;
}

/**
 * Hook to send media messages (Images) with optimistic UI and multi-step upload
 */
export const useSendMediaMessage = (conversationId: string) => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);
    const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;

    /**
     * Step-by-step upload for a single file
     */
    const uploadSingleFile = async (file: ChatMediaFile): Promise<AttachmentRequest> => {
        const fileData = await readFileAsArrayBuffer(file.uri);
        const extension = getFileExtension(file.uri);
        const md5 = calculateMD5FromArrayBuffer(fileData.arrayBuffer);

        // 1. Presign Upload
        const presignPayload: PresignUploadRequest = {
            context: 'CHAT_IMAGE',
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

        // 2. PUT to Storage
        const uploadHeaders: Record<string, string> = {};
        const urlParams = new URLSearchParams(presignResponse.data.url.split('?')[1] || '');
        const signedHeaders = (urlParams.get('X-Amz-SignedHeaders') || '').toLowerCase().split(';');

        for (const [key, value] of Object.entries(presignResponse.data.headers)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey !== 'host' && lowerKey !== 'content-length' && signedHeaders.includes(lowerKey)) {
                uploadHeaders[key] = value;
            }
        }

        const uploadResponse = await fetch(presignResponse.data.url, {
            method: presignResponse.data.method,
            headers: uploadHeaders,
            body: fileData.arrayBuffer,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed for ${file.fileName}`);
        }

        // 3. Pre-check
        await request<PreCheckImagesResponse>(
            {
                url: API_ROUTES.STORAGE.PRE_CHECK_IMAGES,
                method: 'POST',
                data: { assetIds: [presignResponse.data.assetId] },
            },
            PreCheckImagesResponseSchema
        );

        // 4. Poll status
        let publicPath = '';
        let attempts = 0;
        const maxAttempts = 15;

        while (attempts < maxAttempts) {
            const statusResponse = await request<StorageStatusResponse>(
                {
                    url: `${API_ROUTES.STORAGE.STATUS}?assetIds=${presignResponse.data.assetId}`,
                    method: 'GET',
                },
                StorageStatusResponseSchema
            );

            const status = statusResponse.data[presignResponse.data.assetId];
            if (status?.status === 'READY' && status.publicPath) {
                publicPath = status.publicPath;
                break;
            }
            if (status?.status === 'FAILED') {
                throw new Error(`Processing failed for ${file.fileName}`);
            }

            attempts++;
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!publicPath) {
            throw new Error(`Timeout processing ${file.fileName}`);
        }

        return {
            fileUrl: `${CDN_BASE_URL}${publicPath}`,
            fileName: file.fileName,
            mimeType: file.mimeType || 'image/jpeg',
            fileSize: fileData.size,
            width: file.width,
            height: file.height,
        };
    };

    return useMutation<SendMessageResponse, Error, SendMediaMessagePayload, { previousData: unknown }>({
        mutationFn: async ({ files, content }) => {
            logger.chat.info('Uploading media files', { count: files.length });

            // Upload all files in parallel
            const attachments = await Promise.all(
                files.map(file => uploadSingleFile(file))
            );

            logger.chat.info('Files uploaded, sending message', { conversationId });

            // Send final message
            const response = await apiClient.post<SendMessageResponse>(
                API_ROUTES.CHAT.SEND_MESSAGE,
                {
                    conversationId,
                    type: 'IMAGE',
                    content: content || '',
                    attachments,
                }
            );

            const validated = SendMessageResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to send media message');
            }

            return validated;
        },
        onMutate: async ({ files, content }) => {
            await queryClient.cancelQueries({
                queryKey: chatMessagesQueryKeys.conversation(conversationId),
            });

            const previousData = queryClient.getQueryData(
                chatMessagesQueryKeys.conversation(conversationId)
            );

            // Optimistic Message with local URIs
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId,
                type: 'IMAGE',
                content: content || '',
                sender: {
                    userId: userId || '',
                    username: '',
                    displayName: 'Bạn',
                    isShop: false,
                },
                status: 'PENDING',
                sentAt: new Date().toISOString(),
                isEdited: false,
                isDeleted: false,
                attachments: files.map((file, idx) => ({
                    id: `temp-att-${Date.now()}-${idx}`,
                    type: 'IMAGE',
                    url: file.uri, // Use local URI for immediate display
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    dimensions: file.width && file.height ? { width: file.width, height: file.height } : undefined,
                })),
                reactions: [],
            };

            queryClient.setQueryData<InfiniteData<{ messages: Message[] }>>(
                chatMessagesQueryKeys.conversation(conversationId),
                (old) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page, index) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    messages: [optimisticMessage, ...page.messages],
                                };
                            }
                            return page;
                        }),
                    };
                }
            );

            return { previousData };
        },
        onError: (error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
            logger.chat.error('Failed to send media message', error);
        },
        onSuccess: (data) => {
            if (userId) {
                const realMessage = transformMessage(data.data, userId);
                queryClient.setQueryData<InfiniteData<{ messages: Message[] }>>(
                    chatMessagesQueryKeys.conversation(conversationId),
                    (old) => {
                        if (!old?.pages) return old;
                        return {
                            ...old,
                            pages: old.pages.map((page, index) => {
                                if (index === 0) {
                                    return {
                                        ...page,
                                        messages: page.messages.map((msg) =>
                                            msg.id.startsWith('temp-') ? realMessage : msg
                                        ),
                                    };
                                }
                                return page;
                            }),
                        };
                    }
                );
            }
        },
    });
};
