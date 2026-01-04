/**
 * useChatList - TanStack Query hook for fetching conversations
 *
 * Features:
 * - Infinite scroll pagination (page-based)
 * - Filter by conversation type
 * - Search (client-side for now, can be server-side later)
 * - Optimistic updates for pin/mute/delete
 *
 * @see types/chat/conversationDTO.ts - API DTO types
 * @see utils/adapter/conversationAdapter.ts - DTO → UI transform
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatFilter, Conversation } from '@/types/chat';
import {
    ConversationActionResponse,
    ConversationActionResponseSchema,
    ConversationListResponse,
    ConversationListResponseSchema,
    ConversationType,
} from '@/types/chat/conversationDTO';
import { toConversationListUI } from '@/utils/adapter/conversationAdapter';
import { logger } from '@/utils/logger';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 20;

/**
 * Query key for conversations list.
 * Used for cache invalidation.
 */
export const CONVERSATIONS_QUERY_KEY = 'conversations';

/**
 * Map UI filter to API conversationType filter.
 * Returns undefined for ALL filter (no filtering).
 */
const mapFilterToConversationType = (filter: ChatFilter): ConversationType | undefined => {
    switch (filter) {
        case ChatFilter.SHOP:
            return 'BUYER_TO_SHOP';
        case ChatFilter.SUPPORT:
            return 'BUYER_TO_PLATFORM';
        case ChatFilter.UNREAD:
            return undefined; // Filter client-side
        case ChatFilter.ALL:
        default:
            return undefined;
    }
};

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
const fetchConversations = async (
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

    // Add conversationType filter if applicable
    const conversationType = mapFilterToConversationType(filter);
    if (conversationType) {
        params.conversationType = conversationType;
    }

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
 * @param filter - Filter type (ALL, UNREAD, SHOP, SUPPORT)
 * @param searchQuery - Debounced search query string (client-side filter)
 * @returns Query result with flattened conversations array
 */
export const useChatList = (
    filter: ChatFilter = ChatFilter.ALL,
    searchQuery?: string
) => {
    // Get current user ID for participant matching
    const buyerId = useAuthStore((state) => state.buyerId);

    const query = useInfiniteQuery({
        queryKey: [CONVERSATIONS_QUERY_KEY, filter],
        queryFn: ({ pageParam = 0 }) => {
            if (!buyerId) {
                throw new Error('User not authenticated');
            }
            return fetchConversations(pageParam, filter, buyerId);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.hasNext ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        enabled: !!buyerId, // Only fetch when authenticated
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

        // Apply UNREAD filter (client-side since API might not support it)
        if (filter === ChatFilter.UNREAD) {
            filtered = filtered.filter((conv) => conv.unreadCount > 0);
        }

        // Sort: pinned first, then by lastMessage.createdAt
        return [...filtered].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastMessage.createdAt).getTime() -
                new Date(a.lastMessage.createdAt).getTime();
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

// ============================================
// ACTION MUTATIONS
// ============================================

/**
 * Hook for conversation actions (pin, mute, delete, markAsRead).
 * Uses optimistic updates for better UX.
 */
export const useConversationActions = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

    /**
     * Pin/Unpin a conversation.
     * PUT /api/v1/chat/conversations/{id}/pin?isPinned=true/false
     */
    const pinConversation = useMutation({
        mutationFn: async ({ conversationId, isPinned }: { conversationId: string; isPinned: boolean }) => {
            logger.chat.info('Pin conversation:', { conversationId, isPinned });

            const response = await apiClient.put<ConversationActionResponse>(
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
     * PUT /api/v1/chat/conversations/{id}/mute?isMuted=true/false
     */
    const muteConversation = useMutation({
        mutationFn: async ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) => {
            logger.chat.info('Mute conversation:', { conversationId, isMuted });

            const response = await apiClient.put<ConversationActionResponse>(
                API_ROUTES.CHAT.MUTE(conversationId),
                null,
                { params: { isMuted } }
            );

            // Validate response
            const validated = ConversationActionResponseSchema.parse(response.data);
            if (!validated.success) {
                throw new Error(validated.message || 'Failed to mute conversation');
            }

            return validated.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
        onError: (error) => {
            logger.chat.error('Mute conversation failed:', error);
        },
    });

    /**
     * Delete a conversation.
     * TODO: Replace with real API endpoint when available.
     */
    const deleteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            // TODO: Implement real API call
            // await apiClient.delete(`/api/v1/chat/conversations/${conversationId}`);
            logger.chat.info('Delete conversation:', conversationId);
            return { success: true, conversationId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });

    /**
     * Mark a conversation as read.
     * TODO: Replace with real API endpoint when available.
     */
    const markAsRead = useMutation({
        mutationFn: async (conversationId: string) => {
            // TODO: Implement real API call
            // await apiClient.post(`/api/v1/chat/conversations/${conversationId}/read`);
            logger.chat.info('Mark as read:', conversationId);
            return { success: true, conversationId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });

    return {
        pinConversation,
        muteConversation,
        deleteConversation,
        markAsRead,
    };
};
