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
