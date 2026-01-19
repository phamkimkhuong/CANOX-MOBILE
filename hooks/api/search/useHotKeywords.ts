/**
 * ==============================================
 * HOT KEYWORDS HOOK - TanStack Query
 * ==============================================
 * 
 * Fetches trending/hot search keywords
 * GET /api/v1/search/hot
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type {
    HotKeywordUI,
    HotKeywordsResponse,
} from '@/types/search';
import { HotKeywordsResponseSchema } from '@/types/search';
import { mapHotKeywordsToUI } from '@/utils/adapter/search/searchAdapter';
import { useQuery } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const searchKeys = {
    all: ['search'] as const,
    hot: (limit?: number) => [...searchKeys.all, 'hot', limit] as const,
    suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
};

// ============================================
// HOOK
// ============================================

interface UseHotKeywordsOptions {
    limit?: number;
    enabled?: boolean;
}

/**
 * useHotKeywords - Fetch trending search keywords
 * 
 * @param options.limit - Maximum number of keywords (default: 10)
 * @param options.enabled - Whether to enable the query
 */
export const useHotKeywords = (options: UseHotKeywordsOptions = {}) => {
    const { limit = 10, enabled = true } = options;

    return useQuery({
        queryKey: searchKeys.hot(limit),
        enabled,
        queryFn: async (): Promise<HotKeywordUI[]> => {
            const response = await request<HotKeywordsResponse>(
                {
                    url: API_ROUTES.SEARCH.HOT,
                    method: 'GET',
                    params: { limit },
                },
                HotKeywordsResponseSchema
            );

            return mapHotKeywordsToUI(response.data.suggestions);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes - hot keywords change slowly
        gcTime: 1000 * 60 * 30,   // Keep in cache 30 minutes
    });
};
