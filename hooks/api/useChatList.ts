import {
    ChatFilter,
    Conversation,
    ConversationPage,
    ConversationPageSchema,
} from '@/types/chat';
import { createLogger } from '@/utils/logger';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const log = createLogger('Chat');

/**
 * Current user ID (mock)
 */
const CURRENT_USER_ID = 'user_001';

/**
 * Mock conversation data
 */
const MOCK_CONVERSATIONS: Conversation[] = [
    // Pinned & Unread - Shop with unread messages
    {
        id: 'conv_001',
        partner: {
            id: 'shop_001',
            name: 'Global Tech Store',
            avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
            isOnline: true,
            isVerified: true,
            responseRate: 98,
            type: 'SHOP',
        },
        lastMessage: {
            id: 'msg_001',
            content: 'Global_Warranty_Policy.pdf',
            type: 'FILE',
            senderId: 'shop_001',
            createdAt: new Date().toISOString(),
            isRead: false,
        },
        unreadCount: 2,
        isPinned: true,
    },
    // Shop - Read message with order update
    {
        id: 'conv_002',
        partner: {
            id: 'shop_002',
            name: 'Seoul Style Official',
            avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
            isOnline: false,
            isVerified: false,
            responseRate: 85,
            type: 'SHOP',
        },
        lastMessage: {
            id: 'msg_002',
            content: 'Đơn hàng #KR99382 đã được vận chuyển ✈️',
            type: 'ORDER',
            senderId: 'shop_002',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
    // System - Order update
    {
        id: 'conv_003',
        partner: {
            id: 'system_order',
            name: 'Cập nhật đơn hàng',
            isOnline: false,
            type: 'SYSTEM',
        },
        lastMessage: {
            id: 'msg_003',
            content: 'Gói hàng của bạn đã đến kho trung chuyển',
            type: 'TEXT',
            senderId: 'system_order',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
    // Shop - Image message
    {
        id: 'conv_004',
        partner: {
            id: 'shop_003',
            name: 'Tokyo Audio Lab',
            avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
            isOnline: true,
            isVerified: false,
            responseRate: 92,
            type: 'SHOP',
        },
        lastMessage: {
            id: 'msg_004',
            content: 'Đã gửi một ảnh',
            type: 'IMAGE',
            senderId: 'shop_003',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
    // AI Assistant
    {
        id: 'conv_005',
        partner: {
            id: 'ai_assistant',
            name: 'Trợ lý ảo AI',
            isOnline: true,
            type: 'AI',
        },
        lastMessage: {
            id: 'msg_005',
            content: 'Tôi có thể giúp bạn tìm mã giảm giá không?',
            type: 'TEXT',
            senderId: 'ai_assistant',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
    // Shop - Product message
    {
        id: 'conv_006',
        partner: {
            id: 'shop_004',
            name: 'Home Decor VN',
            avatar: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
            isOnline: false,
            type: 'SHOP',
        },
        lastMessage: {
            id: 'msg_006',
            content: 'Cảm ơn bạn đã quan tâm đến sản phẩm!',
            type: 'TEXT',
            senderId: CURRENT_USER_ID,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
    // Promo - Unread
    {
        id: 'conv_007',
        partner: {
            id: 'promo_channel',
            name: 'Khuyến mãi',
            isOnline: false,
            type: 'PROMO',
        },
        lastMessage: {
            id: 'msg_007',
            content: '🔥 Flash Sale giảm 70% chỉ hôm nay!',
            type: 'TEXT',
            senderId: 'promo_channel',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: false,
        },
        unreadCount: 1,
    },
    // Shop with product
    {
        id: 'conv_008',
        partner: {
            id: 'shop_005',
            name: 'Fashion House',
            avatar: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100',
            isOnline: true,
            isVerified: true,
            responseRate: 95,
            type: 'SHOP',
        },
        lastMessage: {
            id: 'msg_008',
            content: 'Áo thun Oversized - Size L',
            type: 'PRODUCT',
            senderId: CURRENT_USER_ID,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: true,
        },
        unreadCount: 0,
    },
];

const PAGE_SIZE = 6;

/**
 * Simulate API fetch with pagination and search
 */
const fetchConversations = async (
    cursor: string | null,
    filter: ChatFilter,
    searchQuery?: string
): Promise<ConversationPage> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filter conversations
    let filtered = MOCK_CONVERSATIONS;

    // Apply search filter first
    if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((conv) =>
            conv.partner.name.toLowerCase().includes(query) ||
            conv.lastMessage.content.toLowerCase().includes(query)
        );
    }

    // Sort: pinned first, then by lastMessage.createdAt
    filtered = [...filtered].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    if (filter !== ChatFilter.ALL) {
        filtered = filtered.filter((conv) => {
            if (filter === ChatFilter.UNREAD) return conv.unreadCount > 0;
            if (filter === ChatFilter.SHOP) return conv.partner.type === 'SHOP';
            if (filter === ChatFilter.SUPPORT) return conv.partner.type === 'AI' || conv.partner.type === 'SYSTEM';
            return true;
        });
    }

    // Paginate
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + PAGE_SIZE;
    const data = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    const response: ConversationPage = {
        data,
        nextCursor: hasMore ? endIndex.toString() : null,
        hasMore,
    };

    // Validate with Zod
    return ConversationPageSchema.parse(response);
};

/**
 * Hook to fetch chat list with infinite scroll and search
 * @param filter - Filter type (ALL, UNREAD, SHOP, SUPPORT)
 * @param searchQuery - Debounced search query string
 */
export const useChatList = (
    filter: ChatFilter = ChatFilter.ALL,
    searchQuery?: string
) => {
    const query = useInfiniteQuery({
        queryKey: ['conversations', filter, searchQuery ?? ''],
        queryFn: ({ pageParam }) => fetchConversations(pageParam, filter, searchQuery),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    // Flatten all pages into single list
    const conversations = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.data);
    }, [query.data?.pages]);

    // Count total unread
    const totalUnread = useMemo(() => {
        return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    }, [conversations]);

    return {
        ...query,
        conversations,
        totalUnread,
    };
};

/**
 * Hook for conversation actions (pin, mute, delete)
 */
export const useConversationActions = () => {
    const queryClient = useQueryClient();

    const pinConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 300));
            log.info('Pinned:', conversationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const muteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            log.info('Muted:', conversationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const deleteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            log.info('Deleted:', conversationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const markAsRead = useMutation({
        mutationFn: async (conversationId: string) => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            log.info('Marked as read:', conversationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    return {
        pinConversation,
        muteConversation,
        deleteConversation,
        markAsRead,
    };
};
