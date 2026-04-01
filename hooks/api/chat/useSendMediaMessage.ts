import { CHAT_MEDIA_POLICY } from '@/constants/mediaPolicies';
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
import {
    validateImageSelection,
    validateVideoSelection,
} from '@/utils/validation/mediaValidation';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SharedRefType } from 'expo';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { chatMessagesQueryKeys } from './useChatMessages';

/**
 * Interface for media file being uploaded
 */
export interface ChatMediaFile {
    uri: string;
    type: 'IMAGE' | 'VIDEO';
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnailSource?: SharedRefType<'image'> | string;
}

const resolveMediaType = (
    files: ChatMediaFile[],
    errors: {
        mixedMediaType: string;
        singleVideoOnly: string;
    },
): 'IMAGE' | 'VIDEO' => {
    const [firstFile] = files;
    if (!firstFile) {
        return 'IMAGE';
    }

    const hasMixedTypes = files.some((file) => file.type !== firstFile.type);
    if (hasMixedTypes) {
        throw new Error(errors.mixedMediaType);
    }

    if (firstFile.type === 'VIDEO' && files.length > 1) {
        throw new Error(errors.singleVideoOnly);
    }

    return firstFile.type;
};

const ensureChatMediaWithinPolicy = (
    files: ChatMediaFile[],
    mediaType: 'IMAGE' | 'VIDEO',
    errors: {
        imageTooLarge: string;
        videoTooLarge: string;
        videoTooLong: string;
    },
) => {
    if (mediaType === 'VIDEO') {
        const invalidVideo = files.find((file) => (
            !validateVideoSelection({
                sizeBytes: file.fileSize,
                durationSeconds: file.duration,
                policy: CHAT_MEDIA_POLICY.video,
            }).valid
        ));

        if (!invalidVideo) return;

        const validationResult = validateVideoSelection({
            sizeBytes: invalidVideo.fileSize,
            durationSeconds: invalidVideo.duration,
            policy: CHAT_MEDIA_POLICY.video,
        });

        if (!validationResult.valid) {
            throw new Error(
                validationResult.code === 'VIDEO_TOO_LONG'
                    ? errors.videoTooLong
                    : errors.videoTooLarge
            );
        }

        return;
    }

    const invalidFile = files.find((file) => (
        !validateImageSelection(file.fileSize, CHAT_MEDIA_POLICY.image).valid
    ));

    if (invalidFile) {
        throw new Error(errors.imageTooLarge);
    }
};

interface SendMediaMessagePayload {
    files: ChatMediaFile[];
    content?: string;
}

interface SendMediaMessageContext {
    previousData: unknown;
    optimisticMessageId: string;
    optimisticAttachments: Message['attachments'];
}

/**
 * Hook to send media messages (Images) with optimistic UI and multi-step upload
 */
export const useSendMediaMessage = (conversationId: string) => {
    const { t } = useTranslation('chat');
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);
    const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;
    const chatImageTooLargeMessage = t('detail.media.imageTooLargeMessage', {
        max: (CHAT_MEDIA_POLICY.image?.maxSizeBytes ?? 0) / (1024 * 1024),
    });
    const chatVideoTooLargeMessage = t('detail.media.videoTooLargeMessage', {
        max: (CHAT_MEDIA_POLICY.video?.maxSizeBytes ?? 0) / (1024 * 1024),
    });
    const chatVideoTooLongMessage = t('detail.media.videoTooLongMessage', {
        max: CHAT_MEDIA_POLICY.video?.maxDurationSeconds ?? 60,
    });

    /**
     * Step-by-step upload for a single file
     */
    const uploadSingleFile = async (file: ChatMediaFile): Promise<AttachmentRequest> => {
        const { publicPath } = await uploadFileToStorage(
            file.uri,
            file.type === 'VIDEO' ? 'CHAT_VIDEO' : 'CHAT_IMAGE'
        );

        return {
            fileUrl: `${CDN_BASE_URL}${publicPath}`,
            fileName: file.fileName,
            mimeType: file.mimeType || (file.type === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
            fileSize: file.fileSize || 0,
            width: file.width,
            height: file.height,
            duration: file.duration,
        };
    };

    return useMutation<SendMessageResponse, Error, SendMediaMessagePayload, SendMediaMessageContext>({
        mutationFn: async ({ files, content }) => {
            logger.chat.info('Uploading media files', { count: files.length });
            const mediaType = resolveMediaType(files, {
                mixedMediaType: t('detail.media.mixedMediaTypeMessage'),
                singleVideoOnly: t('detail.media.singleVideoOnlyMessage'),
            });
            ensureChatMediaWithinPolicy(files, mediaType, {
                imageTooLarge: chatImageTooLargeMessage,
                videoTooLarge: chatVideoTooLargeMessage,
                videoTooLong: chatVideoTooLongMessage,
            });

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
                    type: mediaType,
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
            const mediaType = resolveMediaType(files, {
                mixedMediaType: t('detail.media.mixedMediaTypeMessage'),
                singleVideoOnly: t('detail.media.singleVideoOnlyMessage'),
            });
            const optimisticMessageId = `temp-${Date.now()}`;

            // Optimistic Message with local URIs
            const optimisticMessage: Message = {
                id: optimisticMessageId,
                conversationId,
                type: mediaType,
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
                    type: file.type,
                    url: file.uri, // Use local URI for immediate display
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    mimeType: file.mimeType,
                    dimensions: file.width && file.height ? { width: file.width, height: file.height } : undefined,
                    duration: file.duration,
                    thumbnailSource: file.thumbnailSource,
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

            return {
                previousData,
                optimisticMessageId,
                optimisticAttachments: optimisticMessage.attachments,
            };
        },
        onError: (error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
            Toast.show({
                type: 'error',
                text1: _variables.files[0]?.type === 'VIDEO'
                    ? t('detail.media.sendVideoFailedTitle')
                    : t('detail.media.sendImageFailedTitle'),
                text2: error.message || t('detail.media.sendMediaFailedFallback'),
            });
            logger.chat.error('Failed to send media message', error);
        },
        onSuccess: (data, _variables, context) => {
            if (userId) {
                const transformedMessage = transformMessage(data.data, userId);
                const realMessage: Message = {
                    ...transformedMessage,
                    attachments: transformedMessage.attachments.map((attachment, index) => {
                        const optimisticAttachment = context?.optimisticAttachments[index];
                        if (
                            attachment.type !== 'VIDEO'
                            || attachment.thumbnail
                            || attachment.thumbnailSource
                            || !optimisticAttachment?.thumbnailSource
                        ) {
                            return attachment;
                        }

                        return {
                            ...attachment,
                            thumbnailSource: optimisticAttachment.thumbnailSource,
                            duration: attachment.duration ?? optimisticAttachment.duration,
                            dimensions: attachment.dimensions ?? optimisticAttachment.dimensions,
                        };
                    }),
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
                                    messages: page.messages.map((msg) =>
                                        msg.id === context?.optimisticMessageId ? realMessage : msg
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
