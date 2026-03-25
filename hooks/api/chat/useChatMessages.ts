/**
 * useChatMessages - TanStack Query hook for fetching chat messages
 *
 * Features:
 * - Infinite scroll pagination
 * - Transform DTO to UI types
 * - Optimistic send message
 *
 * @see types/chat/message.ts - Message types
 * @see utils/chat/messageHelpers.ts - Transform functions
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    DeleteMessageResponse,
    DeleteMessageResponseSchema,
    MarkAsReadPayload,
    MarkAsReadResponse,
    MarkAsReadResponseSchema,
    Message,
    MessageDTO,
    MessageListResponse,
    MessageListResponseSchema,
    SendMessagePayload,
    SendMessageResponse,
    SendMessageResponseSchema,
} from '@/types/chat/message';
import { transformMessage, transformMessageList } from '@/utils/adapter/chat/messageAdapter';
import { logger } from '@/utils/logger';
import {
    InfiniteData,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { CONVERSATIONS_QUERY_KEY } from './useChatList';
import { CHAT_QUERY_KEYS } from './useUnreadMessages';

// ============================================
// INTERNAL TYPES
// ============================================

export interface MessagePage {
    messages: Message[];
    page: number;
    hasNext: boolean;
    totalElements: number;
}

type MessagesInfiniteData = InfiniteData<MessagePage, number>;

interface SendMessageContext {
    previousData: MessagesInfiniteData | undefined;
}

const PAGE_SIZE = 20;

// ============================================
// QUERY KEYS
// ============================================

export const chatMessagesQueryKeys = {
    all: ['chat-messages'] as const,
    conversation: (conversationId: string) =>
        [...chatMessagesQueryKeys.all, conversationId] as const,
};

// ============================================
// API FETCH FUNCTION
// ============================================

/**
 * Fetch messages for a conversation
 * API returns newest first (descending by sentAt)
 */
export const fetchMessages = async (
    conversationId: string,
    page: number,
    currentUserId: string
): Promise<{
    messages: Message[];
    page: number;
    hasNext: boolean;
    totalElements: number;
}> => {
    logger.chat.info('Fetching messages', { conversationId, page });

    const response = await apiClient.get<MessageListResponse>(
        API_ROUTES.CHAT.CONVERSATION_MESSAGES(conversationId),
        {
            params: {
                page,
                size: PAGE_SIZE,
            },
        }
    );

    // Validate with Zod
    const validatedResponse = MessageListResponseSchema.parse(response.data);
    if (!validatedResponse.success) {
        throw new Error(validatedResponse.message || 'Failed to fetch messages');
    }

    // Transform DTO to UI types
    const messages = transformMessageList(
        validatedResponse.data.content,
        currentUserId
    );

    logger.chat.info('Fetched messages', {
        count: messages.length,
        hasNext: validatedResponse.data.hasNext,
    });

    return {
        messages,
        page: validatedResponse.data.page,
        hasNext: validatedResponse.data.hasNext,
        totalElements: validatedResponse.data.totalElements,
    };
};

// ============================================
// MAIN HOOK - useChatMessages
// ============================================

/**
 * Hook to fetch chat messages with infinite scroll
 *
 * @param conversationId - ID of the conversation
 * @returns Query result with flattened messages array
 */
export const useChatMessages = (conversationId: string) => {
    const userId = useAuthStore((state) => state.userId);

    const query = useInfiniteQuery({
        queryKey: chatMessagesQueryKeys.conversation(conversationId),
        queryFn: ({ pageParam = 0 }) => {
            if (!userId) {
                throw new Error('User not authenticated');
            }
            return fetchMessages(conversationId, pageParam, userId);
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNext) return undefined;
            return lastPage.page + 1;
        },
        initialPageParam: 0,
        enabled: !!conversationId && !!userId,
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false, // Real-time via socket
        refetchOnReconnect: false,
    });

    // Flatten all pages into single messages array
    const messages = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.messages);
    }, [query.data?.pages]);

    return {
        messages,
        isLoading: query.isLoading,
        isRefetching: query.isRefetching,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
        fetchNextPage: query.fetchNextPage,
        refetch: query.refetch,
        error: query.error,
    };
};

// ============================================
// SEND MESSAGE HOOK
// ============================================

/**
 * Hook to send a new message with optimistic update
 */
export const useSendMessage = (conversationId: string) => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);

    return useMutation<
        SendMessageResponse,
        Error,
        Omit<SendMessagePayload, 'conversationId'>,
        SendMessageContext
    >({
        mutationFn: async (payload) => {
            logger.chat.info('Sending message', { conversationId, type: payload.type });

            const response = await apiClient.post<SendMessageResponse>(
                API_ROUTES.CHAT.SEND_MESSAGE,
                {
                    conversationId,
                    ...payload,
                }
            );

            const validated = SendMessageResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to send message');
            }

            return validated;
        },
        onMutate: async (payload) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({
                queryKey: chatMessagesQueryKeys.conversation(conversationId),
            });

            // Get current data
            const previousData = queryClient.getQueryData(
                chatMessagesQueryKeys.conversation(conversationId)
            );

            // Optimistically add the new message
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId,
                type: payload.type,
                content: payload.content,
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
                attachments: [],
                reactions: [],
            };

            // Update cache optimistically
            queryClient.setQueryData<MessagesInfiniteData>(
                chatMessagesQueryKeys.conversation(conversationId),
                (old) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page, index) => {
                            if (index === 0) {
                                // Add to first page (newest)
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

            return { previousData } as SendMessageContext;
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
            logger.chat.error('Failed to send message', error);
        },
        onSuccess: (data) => {
            // Replace optimistic message with real one
            if (userId) {
                const realMessage = transformMessage(data.data, userId);
                queryClient.setQueryData<MessagesInfiniteData>(
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
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });
};

// ============================================
// SEND PRODUCT CARD HOOK
// ============================================

interface SendProductCardPayload {
    productId: string;
    message: string;
    // Optional info for optimistic display
    productInfo?: {
        title: string;
        price: number;
        thumbnail: string;
        shopId: string;
        shopName: string;
    };
}

/**
 * Hook to send a product card message
 * - Calls POST /api/v1/chat/messages/product-card
 * - Optimistically adds the message to cache
 * - Replaces with real message on success
 */
export const useSendProductCard = (conversationId: string) => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);

    return useMutation<
        SendMessageResponse,
        Error,
        SendProductCardPayload,
        SendMessageContext
    >({
        mutationFn: async (payload) => {
            logger.chat.info('Sending product card', { conversationId, productId: payload.productId });

            const response = await apiClient.post<SendMessageResponse>(
                API_ROUTES.CHAT.SEND_PRODUCT_CARD,
                {
                    conversationId,
                    productId: payload.productId,
                    message: payload.message,
                }
            );

            const validated = SendMessageResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to send product card');
            }

            return validated;
        },
        onMutate: async (payload) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({
                queryKey: chatMessagesQueryKeys.conversation(conversationId),
            });

            // Get current data
            const previousData = queryClient.getQueryData(
                chatMessagesQueryKeys.conversation(conversationId)
            );

            // Create optimistic metadata if product info is provided
            let optimisticMetadata: string | undefined = undefined;
            if (payload.productInfo) {
                optimisticMetadata = JSON.stringify({
                    productId: payload.productId,
                    productName: payload.productInfo.title,
                    price: payload.productInfo.price,
                    image: payload.productInfo.thumbnail,
                    shopId: payload.productInfo.shopId,
                    shopName: payload.productInfo.shopName,
                });
            }

            // Optimistically add the new message (as PRODUCT_CARD type)
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId,
                type: 'PRODUCT_CARD' as Message['type'],
                content: payload.message,
                metadata: optimisticMetadata,
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
                attachments: [],
                reactions: [],
            };

            // Update cache optimistically
            queryClient.setQueryData<MessagesInfiniteData>(
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

            return { previousData } as SendMessageContext;
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
            logger.chat.error('Failed to send product card', error);
        },
        onSuccess: (data) => {
            // Replace optimistic message with real one
            if (userId) {
                const realMessage = transformMessage(data.data, userId);
                queryClient.setQueryData<MessagesInfiniteData>(
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
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });
};

// ============================================
// SEND ORDER CARD HOOK
// ============================================

export interface SendOrderCardPayload {
    orderId: string;
    message: string;
    // Optional info for optimistic display
    orderInfo?: {
        orderCode: string;
        status: string;
        totalAmount: number;
        currency: string;
        items: Array<{
            productId: string;
            productName: string;
            quantity: number;
            image?: string;
        }>;
        shopId: string;
    };
}

/**
 * Hook to send an order card message
 */
export const useSendOrderCard = (conversationId: string) => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);

    return useMutation<
        SendMessageResponse,
        Error,
        SendOrderCardPayload,
        SendMessageContext
    >({
        mutationFn: async (payload) => {
            logger.chat.info('Sending order card', { conversationId, orderId: payload.orderId });

            const response = await apiClient.post<SendMessageResponse>(
                API_ROUTES.CHAT.SEND_ORDER_CARD,
                {
                    conversationId,
                    orderId: payload.orderId,
                    message: payload.message,
                }
            );

            const validated = SendMessageResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to send order card');
            }

            return validated;
        },
        onMutate: async (payload) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({
                queryKey: chatMessagesQueryKeys.conversation(conversationId),
            });

            // Get current data
            const previousData = queryClient.getQueryData(
                chatMessagesQueryKeys.conversation(conversationId)
            );

            // Create optimistic metadata if order info is provided
            let optimisticMetadata: string | undefined = undefined;
            if (payload.orderInfo) {
                optimisticMetadata = JSON.stringify({
                    orderId: payload.orderId,
                    orderCode: payload.orderInfo.orderCode,
                    status: payload.orderInfo.status,
                    totalAmount: payload.orderInfo.totalAmount,
                    currency: payload.orderInfo.currency,
                    items: payload.orderInfo.items,
                    shopId: payload.orderInfo.shopId,
                    buyerId: userId || '',
                    createdDate: null,
                });
            }

            // Optimistically add the new message (as ORDER_CARD type)
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId,
                type: 'ORDER_CARD' as Message['type'],
                content: payload.message,
                metadata: optimisticMetadata,
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
                attachments: [],
                reactions: [],
            };

            // Update cache optimistically
            queryClient.setQueryData<MessagesInfiniteData>(
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

            return { previousData } as SendMessageContext;
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
            logger.chat.error('Failed to send order card', error);
        },
        onSuccess: (data) => {
            // Replace optimistic message with real one
            if (userId) {
                const realMessage = transformMessage(data.data, userId);
                queryClient.setQueryData<MessagesInfiniteData>(
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
            } else {
                queryClient.invalidateQueries({
                    queryKey: chatMessagesQueryKeys.conversation(conversationId),
                });
            }
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });
};


// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to add a new message to cache (from socket)
 */
export const useAddMessageToCache = (conversationId: string) => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);

    return (messageDTO: MessageDTO) => {
        if (!userId) return;

        const message = transformMessage(messageDTO, userId);

        queryClient.setQueryData<MessagesInfiniteData>(
            chatMessagesQueryKeys.conversation(conversationId),
            (old) => {
                if (!old?.pages) return old;

                // Check if message already exists
                const exists = old.pages.some((page) =>
                    page.messages.some((m) => m.id === message.id)
                );

                if (exists) return old;

                // Add to first page
                return {
                    ...old,
                    pages: old.pages.map((page, index) => {
                        if (index === 0) {
                            return {
                                ...page,
                                messages: [message, ...page.messages],
                            };
                        }
                        return page;
                    }),
                };
            }
        );
    };
};

// ============================================
// MARK AS READ HOOK
// ============================================

/**
 * Hook to mark messages as read in a conversation
 * Called when entering chat detail screen
 */
export const useMarkMessagesAsRead = (conversationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: MarkAsReadPayload) => {
            logger.chat.info('Marking messages as read', { conversationId, ...payload });

            const response = await apiClient.post<MarkAsReadResponse>(
                API_ROUTES.CHAT.MARK_AS_READ(conversationId),
                payload
            );

            const validated = MarkAsReadResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to mark messages as read');
            }

            return validated;
        },
        onSuccess: () => {
            // Get the conversation's unreadCount from cache
            const conversationsCache = queryClient.getQueriesData<{
                pages: Array<{ conversations: Array<{ id: string; unreadCount: number }> }>;
            }>({ queryKey: [CONVERSATIONS_QUERY_KEY] });

            let conversationUnreadCount = 0;

            // Find the conversation's unreadCount in cache
            for (const [, data] of conversationsCache) {
                if (data?.pages) {
                    for (const page of data.pages) {
                        const conversation = page.conversations?.find((c) => c.id === conversationId);
                        if (conversation) {
                            conversationUnreadCount = conversation.unreadCount || 0;
                            break;
                        }
                    }
                }
            }

            // Update total unread count by subtracting this conversation's unread count
            if (conversationUnreadCount > 0) {
                queryClient.setQueryData<number>(
                    CHAT_QUERY_KEYS.unreadCount(),
                    (old) => Math.max(0, (old || 0) - conversationUnreadCount)
                );
            }

            // Also update the conversation's unreadCount in cache to 0
            queryClient.setQueriesData<{
                pages: Array<{ conversations: Array<{ id: string; unreadCount: number }> }>;
            }>({ queryKey: [CONVERSATIONS_QUERY_KEY] }, (old) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        conversations: page.conversations?.map((c) =>
                            c.id === conversationId ? { ...c, unreadCount: 0 } : c
                        ),
                    })),
                };
            });

            logger.chat.info('Messages marked as read', {
                conversationId,
                unreadCountReduced: conversationUnreadCount,
            });
        },
        onError: (error) => {
            logger.chat.error('Failed to mark messages as read', { conversationId, error });
        },
    });
};

// ============================================
// DELETE/RECALL MESSAGE HOOK
// ============================================

export type DeleteType = 'DELETE_FOR_EVERYONE';

interface DeleteMessagePayload {
    messageId: string;
    deleteType: DeleteType;
}

/**
 * Hook to recall a message
 * DELETE_FOR_EVERYONE: Thu hồi tin nhắn (hiển thị "Tin nhắn đã bị thu hồi")
 */
export const useDeleteMessage = (conversationId: string) => {
    const queryClient = useQueryClient();

    return useMutation<DeleteMessageResponse, Error, DeleteMessagePayload, { previousData: MessagesInfiniteData | undefined }>({
        mutationFn: async ({ messageId, deleteType }) => {
            logger.chat.info('Deleting message', { messageId, deleteType });

            const response = await apiClient.delete<DeleteMessageResponse>(
                API_ROUTES.CHAT.DELETE_MESSAGE(messageId),
                { data: { deleteType } }
            );

            const validated = DeleteMessageResponseSchema.parse(response.data);

            if (!validated.success) {
                throw new Error(validated.message || 'Failed to delete message');
            }

            return validated;
        },
        onMutate: async ({ messageId, deleteType }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({
                queryKey: chatMessagesQueryKeys.conversation(conversationId),
            });

            // Get current data
            const previousData = queryClient.getQueryData<MessagesInfiniteData>(
                chatMessagesQueryKeys.conversation(conversationId)
            );

            // Optimistically update the message
            if (previousData && deleteType === 'DELETE_FOR_EVERYONE') {
                queryClient.setQueryData<MessagesInfiniteData>(
                    chatMessagesQueryKeys.conversation(conversationId),
                    {
                        ...previousData,
                        pages: previousData.pages.map((page) => ({
                            ...page,
                            messages: page.messages.map((msg) =>
                                msg.id === messageId
                                    ? { ...msg, isDeleted: true, content: 'Tin nhắn đã bị thu hồi' }
                                    : msg
                            ),
                        })),
                    }
                );
            }

            return { previousData };
        },
        onError: (error, _variables, context) => {
            logger.chat.error('Failed to delete message', { error });

            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    chatMessagesQueryKeys.conversation(conversationId),
                    context.previousData
                );
            }
        },
        onSuccess: (data, { messageId, deleteType }) => {
            logger.chat.info('Message deleted successfully', { messageId, deleteType });

            // Invalidate conversation list to update last message preview
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });
};
