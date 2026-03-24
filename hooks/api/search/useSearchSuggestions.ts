/**
 * ==============================================
 * SEARCH SUGGESTIONS HOOK - TanStack Query
 * ==============================================
 * 
 * Fetches autocomplete suggestions based on user input
 * GET /api/v1/search/suggestions
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { useDebounce } from '@/hooks/useDebounce';
import { request } from '@/services/api/client';
import type {
    SearchSuggestionUI,
    SearchSuggestionsResponse,
} from '@/types/search';
import { SearchSuggestionsResponseSchema } from '@/types/search';
import { mapSearchSuggestionsToUI } from '@/utils/adapter/search/searchAdapter';
import { useQuery } from '@tanstack/react-query';
import { searchKeys } from './useHotKeywords';

// ============================================
// HOOK
// ============================================

interface UseSearchSuggestionsOptions {
    query: string;
    limit?: number;
    debounceMs?: number;
    enabled?: boolean;
}

/**
 * useSearchSuggestions - Fetch autocomplete suggestions
 * 
 * Features:
 * - Auto-debounce (300ms default)
 * - Disabled when query is empty
 * - Vietnamese text support
 * 
 * @param options.query - User input text
 * @param options.limit - Maximum suggestions (default: 10)
 * @param options.debounceMs - Debounce delay (default: 300ms)
 */
export const useSearchSuggestions = (options: UseSearchSuggestionsOptions) => {
    const { query, limit = 10, debounceMs = 300, enabled = true } = options;

    // Debounce the query to avoid excessive API calls
    const debouncedQuery = useDebounce(query.trim(), debounceMs);

    const isValidQuery = debouncedQuery.length >= 1;

    return useQuery({
        queryKey: searchKeys.suggestions(debouncedQuery),
        enabled: enabled && isValidQuery,
        queryFn: async (): Promise<SearchSuggestionUI[]> => {
            const response = await request<SearchSuggestionsResponse>(
                {
                    url: API_ROUTES.SEARCH.SUGGESTIONS,
                    method: 'GET',
                    params: {
                        q: debouncedQuery,
                        limit,
                    },
                },
                SearchSuggestionsResponseSchema
            );

            return mapSearchSuggestionsToUI(response.data.suggestions, debouncedQuery);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5,    // Keep in cache 5 minutes
        // Don't retry on suggestions - user is typing fast
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
