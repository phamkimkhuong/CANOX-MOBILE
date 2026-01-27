import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { uploadFileToStorage } from '@/services/storage/storageService';
import { useAuthStore } from '@/store/useAuthStore';
import {
    AttachmentRequest,
    Message,
    SendMessageResponse,
    SendMessageResponseSchema,
} from '@/types/chat/message';
import { transformMessage } from '@/utils/adapter/chat/messageAdapter';
import { logger } from '@/utils/logger';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
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
        const { publicPath } = await uploadFileToStorage(
            file.uri,
            'CHAT_IMAGE'
        );

        return {
            fileUrl: `${CDN_BASE_URL}${publicPath}`,
            fileName: file.fileName,
            mimeType: file.mimeType || 'image/jpeg',
            fileSize: file.fileSize || 0,
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
