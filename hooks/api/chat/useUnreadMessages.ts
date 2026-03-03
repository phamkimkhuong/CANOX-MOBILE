/**
 * ==============================================
 * UNREAD MESSAGES HOOK
 * ==============================================
 * Hook for fetching unread message count for badge display
 *
 * API: GET /api/v1/chat/conversations/unread/messages/count
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { handleQueryRetry } from '@/services/api/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import { ResponseDefaultSchema } from '@/types/responseSchema';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// ============================================
// SCHEMA
// ============================================

/**
 * Response schema for unread message count
 * Extends ResponseDefaultSchema with number data
 */
const UnreadMessageCountResponseSchema = ResponseDefaultSchema.extend({
    data: z.number(),
});

type UnreadMessageCountResponse = z.infer<typeof UnreadMessageCountResponseSchema>;

// ============================================
// QUERY KEYS
// ============================================

export const CHAT_QUERY_KEYS = {
    all: ['chat'] as const,
    unreadCount: () => [...CHAT_QUERY_KEYS.all, 'unread-count'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch total unread message count across all conversations
 *
 * Used for:
 * - TabBar badge on Chat tab
 * - Header badge in other screens
 *
 * Features:
 * - Lightweight polling every 2 minutes
 * - Only enabled when user is authenticated
 * - Caches for 1 minute to reduce API calls
 */
export const useUnreadMessageCount = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: CHAT_QUERY_KEYS.unreadCount(),
        queryFn: async (): Promise<number> => {
            if (!useAuthStore.getState().isAuthenticated) return 0;
            if (!isAuthenticated) return 0;

            const response = await apiClient.get<UnreadMessageCountResponse>(
                API_ROUTES.CHAT.UNREAD_COUNT
            );

            // Validate with Zod schema
            const validated = UnreadMessageCountResponseSchema.parse(response.data);

            if (validated.success) {
                return validated.data;
            }
            return 0;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute - data is fresh for 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
        refetchInterval: isAuthenticated ? 1000 * 60 * 2 : false, // Poll every 2 minutes
        refetchOnWindowFocus: false, // Disable to avoid duplicate calls
        refetchOnMount: false, // Don't refetch on every mount if data is fresh
        retry: (count, error) => handleQueryRetry(count, error, 1), // Only retry once on failure, but skip 403
    });
};
