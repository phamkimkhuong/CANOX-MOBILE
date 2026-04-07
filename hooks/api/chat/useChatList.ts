/**
 * useChatList - TanStack Query hook for fetching conversations
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatFilter, Conversation } from '@/types/chat';
import {
    ConversationActionResponse,
    ConversationActionResponseSchema,
    ConversationListResponse,
    ConversationListResponseSchema
} from '@/types/chat/conversationDTO';
import { toConversationListUI } from '@/utils/adapter/chat/conversationAdapter';
import { safeParseDate } from '@/utils/date';
import { logger } from '@/utils/logger';
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 20;

/**
 * Query key for conversations list.
 * Used for cache invalidation.
 */
export const CONVERSATIONS_QUERY_KEY = 'conversations';

// ============================================
// API FETCH FUNCTION
// ============================================

/**
 * Fetch conversations from API with pagination.
 *
 * @param page - Page number (0-indexed)
 * @param filter - UI filter type
 * @param currentUserId - Current user's ID for transform
 * @returns Transformed conversation list with pagination info
 */
export const fetchConversations = async (
    page: number,
    filter: ChatFilter,
    currentUserId: string
): Promise<{
    conversations: Conversation[];
    page: number;
    hasNext: boolean;
    totalElements: number;
}> => {
    logger.chat.info('Fetching conversations', { page, filter });

    // Build query params
    const params: Record<string, unknown> = {
        page,
        size: PAGE_SIZE,
    };
    // Call API
    const response = await apiClient.get<ConversationListResponse>(
        API_ROUTES.CHAT.CONVERSATIONS,
        { params }
    );

    // Validate with Zod
    const validatedResponse = ConversationListResponseSchema.parse(response.data);
    if (!validatedResponse.success) {
        throw new Error(validatedResponse.message || 'Failed to fetch conversations');
    }

    // Transform DTO to UI types
    const conversations = toConversationListUI(
        validatedResponse.data.content,
        currentUserId
    );

    logger.chat.info('Fetched conversations', {
        count: conversations.length,
        hasNext: validatedResponse.data.hasNext,
    });

    return {
        conversations,
        page: validatedResponse.data.page,
        hasNext: validatedResponse.data.hasNext,
        totalElements: validatedResponse.data.totalElements,
    };
};

// ============================================
// MAIN HOOK
// ============================================

/**
 * Hook to fetch chat list with infinite scroll and filtering.
 * 
 * Strategy: Fetch ALL conversations, filter client-side
 * - Single API call, single cache
 * - Instant tab switching (no API delay)
 * - Filter applied in useMemo
 *
 * @param filter - Filter type (ALL, UNREAD, SHOP, SUPPORT) - applied client-side
 * @param searchQuery - Debounced search query string (client-side filter)
 * @returns Query result with flattened and filtered conversations array
 */
export const useChatList = (
    filter: ChatFilter = ChatFilter.ALL,
    searchQuery?: string
) => {
    const userId = useAuthStore((state) => state.userId);
    const buyerId = useAuthStore((state) => state.buyerId);
    const query = useInfiniteQuery({
        queryKey: [CONVERSATIONS_QUERY_KEY],
        queryFn: ({ pageParam = 0 }) => {
            if (!userId) {
                throw new Error('User not authenticated');
            }
            return fetchConversations(pageParam, ChatFilter.ALL, userId);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.hasNext ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        enabled: !!buyerId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Flatten all pages into single list
    const allConversations = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.conversations);
    }, [query.data?.pages]);

    // Apply client-side filters
    const conversations = useMemo(() => {
        let filtered = allConversations;

        // Apply search filter (client-side)
        if (searchQuery && searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((conv) =>
                conv.partner.name.toLowerCase().includes(query) ||
                conv.lastMessage.content.toLowerCase().includes(query)
            );
        }
        if (filter === ChatFilter.UNREAD) {
            filtered = filtered.filter((conv) => conv.unreadCount > 0);
        }
        if (filter === ChatFilter.SHOP) {
            filtered = filtered.filter((conv) => conv.conversationType === 'BUYER_TO_SHOP');
        }
        if (filter === ChatFilter.SUPPORT) {
            filtered = filtered.filter((conv) => conv.conversationType === 'BUYER_TO_PLATFORM');
        }

        // Sort: pinned first, then by lastMessage.createdAt
        return [...filtered].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (safeParseDate(b.lastMessage.createdAt)?.getTime() ?? 0) -
                (safeParseDate(a.lastMessage.createdAt)?.getTime() ?? 0);
        });
    }, [allConversations, searchQuery, filter]);

    // Calculate total unread across all conversations
    const totalUnread = useMemo(() => {
        return allConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    }, [allConversations]);

    return {
        ...query,
        conversations,
        totalUnread,
    };
};

/**
 * useRefreshChatList - Smart refresh for chat list infinite query
 * Only fetches page 0 instead of all loaded pages.
 * 
 * @returns refresh function
 */
export const useRefreshChatList = () => {
    return useSmartRefresh([CONVERSATIONS_QUERY_KEY]);
};


// ============================================
// ACTION MUTATIONS
// ============================================

/**
 * Hook for conversation actions (pin, mute, delete, markAsRead).
 * Uses optimistic updates for better UX.
 */
export const useConversationActions = () => {
    const queryClient = useQueryClient();

    /**
     * Pin/Unpin a conversation.
     * POST /api/v1/chat/conversations/{id}/pin?isPinned=true/false
     */
    const pinConversation = useMutation({
        mutationFn: async ({ conversationId, isPinned }: { conversationId: string; isPinned: boolean }) => {
            logger.chat.info('Pin conversation:', { conversationId, isPinned });

            const response = await apiClient.post<ConversationActionResponse>(
                API_ROUTES.CHAT.PIN(conversationId),
                null,
                { params: { isPinned } }
            );

            // Validate response
            const validated = ConversationActionResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to pin conversation');
            }

            return validated.data;
        },
        onSuccess: () => {
            // Refetch conversations to get updated order
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
        onError: (error) => {
            logger.chat.error('Pin conversation failed:', error);
        },
    });

    /**
     * Mute/Unmute a conversation.
     * POST /api/v1/chat/conversations/{id}/mute?isMuted=true/false
     */
    const muteConversation = useMutation({
        mutationFn: async ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) => {
            logger.chat.info('Mute conversation:', { conversationId, isMuted });

            const response = await apiClient.post<ConversationActionResponse>(
                API_ROUTES.CHAT.MUTE(conversationId),
                null,
                { params: { isMuted } }
            );

            // Validate response
            const validated = ConversationActionResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to mute conversation');
            }

            return { conversationId, isMuted, updatedDto: validated.data };
        },
        onSuccess: ({ conversationId, isMuted }) => {
            queryClient.setQueriesData<InfiniteData<{ conversations: Conversation[]; page: number; hasNext: boolean; totalElements: number }>>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            conversations: page.conversations.map((conv) =>
                                conv.id === conversationId
                                    ? { ...conv, isMuted }
                                    : conv
                            )
                        }))
                    };
                }
            );

            // Also invalidate to sync with server in background
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
        onError: (error) => {
            logger.chat.error('Mute conversation failed:', error);
        },
    });

    /**
     * Delete a conversation.
     */
    const deleteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            logger.chat.info('Delete conversation:', conversationId);

            await apiClient.delete(`/api/v1/chat/conversations/${conversationId}`);

            return { success: true, conversationId };
        },
        onSuccess: ({ conversationId }) => {
            queryClient.setQueriesData<InfiniteData<{ conversations: Conversation[]; page: number; hasNext: boolean; totalElements: number }>>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            conversations: page.conversations.filter((conv) => conv.id !== conversationId)
                        }))
                    };
                }
            );
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
        onError: (error) => {
            logger.chat.error('Delete conversation failed:', error);
        },
    });

    return {
        pinConversation,
        muteConversation,
        deleteConversation,
    };
};
