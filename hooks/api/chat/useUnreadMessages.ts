/**
 * ==============================================
 * UNREAD MESSAGES HOOK
 * ==============================================
 * Hook for fetching unread message count for badge display
 * 
 * API: GET /api/v1/chat/conversations/unread/messages/count
 * Response: { code: number, success: boolean, message: string, data: number }
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

interface UnreadMessageCountResponse {
    code: number;
    success: boolean;
    message: string;
    data: number;
}

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
            const response = await apiClient.get<UnreadMessageCountResponse>(
                API_ROUTES.CHAT.UNREAD_COUNT
            );

            if (response.data.success) {
                return response.data.data;
            }
            return 0;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute - data is fresh for 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
        refetchInterval: isAuthenticated ? 1000 * 60 * 2 : false, // Poll every 2 minutes
        refetchOnWindowFocus: false, // Disable to avoid duplicate calls
        refetchOnMount: false, // Don't refetch on every mount if data is fresh
        retry: 1, // Only retry once on failure
    });
};
