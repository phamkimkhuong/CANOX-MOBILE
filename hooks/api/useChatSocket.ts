import { Conversation, ConversationPage, ConversationSchema, LastMessage } from '@/types/chat';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

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
        console.log('[ChatSocket] Connected');
    }

    disconnect(): void {
        this.connected = false;
        this.listeners.clear();
        console.log('[ChatSocket] Disconnected');
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
                pages: ConversationPage[];
                pageParams: (string | null)[];
            }>(
                { queryKey: ['conversations'] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const { conversationId, message } = data;
                    let conversationToMove: Conversation | null = null;
                    let foundInPage = -1;
                    let foundIndex = -1;

                    // Find the conversation across all pages
                    for (let pageIdx = 0; pageIdx < oldData.pages.length; pageIdx++) {
                        const page = oldData.pages[pageIdx];
                        const idx = page.data.findIndex((c) => c.id === conversationId);
                        if (idx !== -1) {
                            conversationToMove = { ...page.data[idx] };
                            foundInPage = pageIdx;
                            foundIndex = idx;
                            break;
                        }
                    }

                    // If conversation not found, it might be a new conversation
                    // In production, you'd fetch it from the socket event
                    if (!conversationToMove) {
                        console.warn('[ChatSocket] Conversation not found:', conversationId);
                        return oldData;
                    }

                    // Update the conversation
                    const updatedConversation: Conversation = {
                        ...conversationToMove,
                        lastMessage: message,
                        unreadCount: conversationToMove.unreadCount + 1,
                    };

                    // Validate with Zod
                    const validated = ConversationSchema.safeParse(updatedConversation);
                    if (!validated.success) {
                        // console.error('[ChatSocket] Invalid conversation data:', validated.error);
                        Alert.alert('Error', 'Invalid conversation data');
                        return oldData;
                    }

                    // Create new pages array
                    const newPages = oldData.pages.map((page, pageIdx) => {
                        if (pageIdx === foundInPage) {
                            // Remove from original position
                            return {
                                ...page,
                                data: page.data.filter((_, idx) => idx !== foundIndex),
                            };
                        }
                        return page;
                    });

                    // Handle pinned conversations - they stay at top
                    if (updatedConversation.isPinned) {
                        // Find insertion point among pinned items
                        const firstPage = newPages[0];
                        const pinnedCount = firstPage.data.filter((c) => c.isPinned).length;
                        newPages[0] = {
                            ...firstPage,
                            data: [
                                ...firstPage.data.slice(0, pinnedCount),
                                validated.data,
                                ...firstPage.data.slice(pinnedCount),
                            ],
                        };
                    } else {
                        // Insert after pinned items at top of first page
                        const firstPage = newPages[0];
                        const pinnedCount = firstPage.data.filter((c) => c.isPinned).length;
                        newPages[0] = {
                            ...firstPage,
                            data: [
                                ...firstPage.data.slice(0, pinnedCount),
                                validated.data,
                                ...firstPage.data.slice(pinnedCount),
                            ],
                        };
                    }

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
                pages: ConversationPage[];
                pageParams: (string | null)[];
            }>(
                { queryKey: ['conversations'] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.map((c) =>
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
                pages: ConversationPage[];
                pageParams: (string | null)[];
            }>(
                { queryKey: ['conversations'] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((c) => c.id !== data.conversationId),
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
                pages: ConversationPage[];
                pageParams: (string | null)[];
            }>(
                { queryKey: ['conversations'] },
                (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.map((c) =>
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
