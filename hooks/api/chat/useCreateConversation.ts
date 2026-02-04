/**
 * useCreateConversation - Hook to create or get existing conversation
 * Used when:
 * - User clicks "Chat with Shop" from Product Detail
 * - User starts a new conversation from any screen
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    ConversationType,
    CreateConversationRequest,
    CreateConversationResponse,
    CreateConversationResponseSchema,
} from '@/types/chat/conversationDTO';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CONVERSATIONS_QUERY_KEY } from './useChatList';
import { chatMessagesQueryKeys, fetchMessages, MessagePage } from './useChatMessages';

// ============================================
// IN-MEMORY CACHE
// ============================================

// Cache conversationId by shopUserId to avoid redundant API calls
const conversationCache = new Map<string, string>();
// Track ongoing promises to prevent duplicate requests globally
const processingRequests = new Map<string, Promise<CreateConversationResponse>>();

/**
 * Get cached conversationId for a shop user
 * Returns undefined if not cached
 */
export const getCachedConversationId = (shopUserId: string): string | undefined => {
    return conversationCache.get(shopUserId);
};

// ============================================
// API FUNCTION
// ============================================

/**
 * Create or get existing conversation
 */
const createConversation = async (
    request: CreateConversationRequest
): Promise<CreateConversationResponse> => {
    const shopUserId = request.participantIds[0];

    // Check cache first
    if (shopUserId) {
        const cachedId = conversationCache.get(shopUserId);
        if (cachedId) {
            return {
                data: { id: cachedId, name: request.name || '', type: request.conversationType, participants: [] },
                success: true,
                message: 'Lấy từ cache',
                code: 200,
            } as unknown as CreateConversationResponse;
        }
    }

    // Check if there's an ongoing request for the same shopUserId
    if (shopUserId && processingRequests.has(shopUserId)) {
        logger.chat.info('Waiting for existing createConversation promise', { shopUserId });
        return processingRequests.get(shopUserId)!;
    }

    // Perform new request and save promise to Map
    const apiPromise = (async () => {
        try {
            logger.chat.info('Creating/getting conversation', {
                type: request.conversationType,
                participantCount: request.participantIds.length,
            });

            const response = await apiClient.post<CreateConversationResponse>(
                API_ROUTES.CHAT.CONVERSATIONS,
                request
            );
            const validated = CreateConversationResponseSchema.parse(response.data);

            // Cache response
            if (shopUserId) {
                conversationCache.set(shopUserId, validated.data.id);
            }

            logger.chat.info('Conversation created/retrieved', {
                conversationId: validated.data.id,
                isNew: validated.message.includes('Tạo'),
            });

            return validated;
        } finally {
            // Delete promise Map when done (success or error)
            if (shopUserId) {
                processingRequests.delete(shopUserId);
            }
        }
    })();

    if (shopUserId) {
        processingRequests.set(shopUserId, apiPromise);
    }

    return apiPromise;
};

/**
 * Hook to create or get existing conversation with a shop
 */
export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createConversation,
        onSuccess: () => {
            // Invalidate conversations list to include new conversation
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
        onError: (error) => {
            logger.chat.error('Failed to create conversation', { error });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Hook prefetch cho tính năng Chat với Shop.
 */
export const usePrefetchShopChat = () => {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.userId);
    const myShopId = useAuthStore((state) => state.shopId);
    const { mutate: createConv } = useCreateConversation();

    const prefetch = useCallback((shopUserId: string, shopName: string, shopLogoUrl?: string | null, shopId?: string) => {
        if (!shopUserId || !userId) return;
        if (shopId && shopId === myShopId) return;

        const cachedId = getCachedConversationId(shopUserId);

        if (cachedId) {
            // If already have ID in cache, prefetch messages of that conversation
            queryClient.prefetchInfiniteQuery({
                queryKey: chatMessagesQueryKeys.conversation(cachedId),
                queryFn: ({ pageParam = 0 }) => fetchMessages(cachedId, pageParam as number, userId),
                initialPageParam: 0,
                getNextPageParam: (lastPage: MessagePage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
                staleTime: 30 * 1000,
            });
        } else {
            // Nếu chưa có ID, âm thầm gọi mutation để lấy ID sớm (Ghost Loading)
            const request = buildChatWithShopRequest(shopUserId, shopName, shopLogoUrl);
            createConv(request);
        }
    }, [userId, queryClient, createConv, myShopId]);

    return prefetch;
};

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Helper to build request for chatting with a shop
 *
 * @param shopUserId - The userId of the shop owner (NOT shopId)
 * @param shopName - Display name of the shop
 * @param shopLogoUrl - Optional logo URL
 */
export const buildChatWithShopRequest = (
    shopUserId: string,
    shopName: string,
    shopLogoUrl?: string | null
): CreateConversationRequest => ({
    conversationType: ConversationType.BUYER_TO_SHOP,
    participantIds: [shopUserId],
    name: shopName,
    avatarUrl: shopLogoUrl,
});

export default useCreateConversation;
