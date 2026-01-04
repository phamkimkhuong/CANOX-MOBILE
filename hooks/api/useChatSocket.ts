/**
 * useChatSocket - WebSocket hook for real-time chat updates
 *
 * Handles real-time updates to the conversation list cache
 * without conflicting with pagination structure.
 */

import { CONVERSATIONS_QUERY_KEY } from '@/hooks/api/chat/useChatList';
import { Conversation, LastMessage } from '@/types/chat';
import { createLogger } from '@/utils/logger';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

const log = createLogger('ChatSocket');

/**
 * Page structure returned by useChatList
 */
interface ConversationQueryPage {
    conversations: Conversation[];
    page: number;
    hasNext: boolean;
    totalElements: number;
}

/**
 * Socket event types for chat
 */
export interface ChatSocketEvents {
    NEW_MESSAGE: {
        conversationId: string;
        message: LastMessage;
    };
    CONVERSATION_UPDATED: Conversation;
    CONVERSATION_DELETED: { conversationId: string };
    TYPING_START: { conversationId: string; userId: string };
    TYPING_END: { conversationId: string; userId: string };
    ONLINE_STATUS: { userId: string; isOnline: boolean };
}

/**
 * Mock socket connection for development
 * Replace with actual Socket.IO implementation in production
 */
class MockChatSocket {
    private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
    private connected = false;

    connect(): void {
        this.connected = true;
        log.info('Connected');
    }

    disconnect(): void {
        this.connected = false;
        this.listeners.clear();
        log.info('Disconnected');
    }

    on<K extends keyof ChatSocketEvents>(
        event: K,
        callback: (data: ChatSocketEvents[K]) => void
    ): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback as (data: unknown) => void);
    }

    off<K extends keyof ChatSocketEvents>(
        event: K,
        callback: (data: ChatSocketEvents[K]) => void
    ): void {
        this.listeners.get(event)?.delete(callback as (data: unknown) => void);
    }

    emit<K extends keyof ChatSocketEvents>(event: K, data: ChatSocketEvents[K]): void {
        this.listeners.get(event)?.forEach((cb) => cb(data));
    }

    isConnected(): boolean {
        return this.connected;
    }
}

// Singleton instance
const chatSocket = new MockChatSocket();

/**
 * Hook for managing chat socket connection and React Query cache updates
 * Handles realtime updates without conflicting with pagination
 */
export const useChatSocket = () => {
    const queryClient = useQueryClient();
    const isSubscribed = useRef(false);

    /**
     * Update conversation in cache when new message arrives
     * - Moves conversation to top of list
     * - Updates lastMessage and unreadCount
     * - Preserves pagination structure
     */
    const handleNewMessage = useCallback(
        (data: ChatSocketEvents['NEW_MESSAGE']) => {
            queryClient.setQueriesData<{
                pages: ConversationQueryPage[];
                pageParams: number[];
            }>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const { conversationId, message } = data;
                    let conversationToMove: Conversation | null = null;
                    let foundInPage = -1;
                    let foundIndex = -1;

                    // Find the conversation across all pages
                    for (let pageIdx = 0; pageIdx < oldData.pages.length; pageIdx++) {
                        const page = oldData.pages[pageIdx];
                        const idx = page.conversations.findIndex((c) => c.id === conversationId);
                        if (idx !== -1) {
                            conversationToMove = { ...page.conversations[idx] };
                            foundInPage = pageIdx;
                            foundIndex = idx;
                            break;
                        }
                    }

                    // If conversation not found, it might be a new conversation
                    // In production, you'd fetch it from the socket event
                    if (!conversationToMove) {
                        log.warn('Conversation not found:', conversationId);
                        return oldData;
                    }

                    // Update the conversation
                    const updatedConversation: Conversation = {
                        ...conversationToMove,
                        lastMessage: message,
                        unreadCount: conversationToMove.unreadCount + 1,
                    };

                    // Create new pages array
                    const newPages = oldData.pages.map((page, pageIdx) => {
                        if (pageIdx === foundInPage) {
                            // Remove from original position
                            return {
                                ...page,
                                conversations: page.conversations.filter((_, idx) => idx !== foundIndex),
                            };
                        }
                        return page;
                    });

                    // Handle pinned conversations - they stay at top
                    const firstPage = newPages[0];
                    const pinnedCount = firstPage.conversations.filter((c) => c.isPinned).length;
                    newPages[0] = {
                        ...firstPage,
                        conversations: [
                            ...firstPage.conversations.slice(0, pinnedCount),
                            updatedConversation,
                            ...firstPage.conversations.slice(pinnedCount),
                        ],
                    };

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },
        [queryClient]
    );

    /**
     * Handle full conversation update (e.g., pin/mute status change)
     */
    const handleConversationUpdated = useCallback(
        (conversation: Conversation) => {
            queryClient.setQueriesData<{
                pages: ConversationQueryPage[];
                pageParams: number[];
            }>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        conversations: page.conversations.map((c) =>
                            c.id === conversation.id ? conversation : c
                        ),
                    }));

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },
        [queryClient]
    );

    /**
     * Handle conversation deletion
     */
    const handleConversationDeleted = useCallback(
        (data: ChatSocketEvents['CONVERSATION_DELETED']) => {
            queryClient.setQueriesData<{
                pages: ConversationQueryPage[];
                pageParams: number[];
            }>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        conversations: page.conversations.filter((c) => c.id !== data.conversationId),
                    }));

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },
        [queryClient]
    );

    /**
     * Subscribe to socket events
     */
    useEffect(() => {
        if (isSubscribed.current) return;

        chatSocket.connect();
        isSubscribed.current = true;

        chatSocket.on('NEW_MESSAGE', handleNewMessage);
        chatSocket.on('CONVERSATION_UPDATED', handleConversationUpdated);
        chatSocket.on('CONVERSATION_DELETED', handleConversationDeleted);

        return () => {
            chatSocket.off('NEW_MESSAGE', handleNewMessage);
            chatSocket.off('CONVERSATION_UPDATED', handleConversationUpdated);
            chatSocket.off('CONVERSATION_DELETED', handleConversationDeleted);
            chatSocket.disconnect();
            isSubscribed.current = false;
        };
    }, [handleNewMessage, handleConversationUpdated, handleConversationDeleted]);

    /**
     * Manually mark conversation as read
     * Decrements unread count in cache immediately (optimistic update)
     */
    const markAsReadOptimistic = useCallback(
        (conversationId: string) => {
            queryClient.setQueriesData<{
                pages: ConversationQueryPage[];
                pageParams: number[];
            }>(
                { queryKey: [CONVERSATIONS_QUERY_KEY] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        conversations: page.conversations.map((c) =>
                            c.id === conversationId
                                ? { ...c, unreadCount: 0, lastMessage: { ...c.lastMessage, isRead: true } }
                                : c
                        ),
                    }));

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },
        [queryClient]
    );

    return {
        isConnected: chatSocket.isConnected(),
        markAsReadOptimistic,
        // Expose for testing/simulation
        _socket: chatSocket,
    };
};

/**
 * Simulate incoming message (for development/testing)
 */
export const simulateIncomingMessage = (
    conversationId: string,
    content: string
): void => {
    const message: LastMessage = {
        id: `msg_${Date.now()}`,
        content,
        type: 'TEXT',
        senderId: 'shop_001',
        createdAt: new Date().toISOString(),
        isRead: false,
    };

    chatSocket.emit('NEW_MESSAGE', { conversationId, message });
};
