/**
 * useCreateConversation - Hook to create or get existing conversation
 * Used when:
 * - User clicks "Chat with Shop" from Product Detail
 * - User starts a new conversation from any screen
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import {
    ConversationType,
    CreateConversationRequest,
    CreateConversationResponse,
    CreateConversationResponseSchema,
} from '@/types/chat/conversationDTO';
import { logger } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONVERSATIONS_QUERY_KEY } from './useChatList';

// ============================================
// IN-MEMORY CACHE
// ============================================

// Cache conversationId by shopUserId to avoid redundant API calls
const conversationCache = new Map<string, string>();

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
    logger.chat.info('Creating/getting conversation', {
        type: request.conversationType,
        participantCount: request.participantIds.length,
    });

    const response = await apiClient.post<CreateConversationResponse>(
        API_ROUTES.CHAT.CONVERSATIONS,
        request
    );
    const validated = CreateConversationResponseSchema.parse(response.data);

    // Cache the conversationId for this shop user
    if (request.participantIds[0]) {
        conversationCache.set(request.participantIds[0], validated.data.id);
    }

    logger.chat.info('Conversation created/retrieved', {
        conversationId: validated.data.id,
        isNew: validated.message.includes('Tạo'),
    });

    return validated;
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
    });
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
