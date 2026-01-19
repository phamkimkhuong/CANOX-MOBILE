/**
 * ==============================================
 * TRACK SEARCH HOOK - TanStack Query Mutation
 * ==============================================
 * 
 * Records a search keyword when user submits or clicks suggestion
 * POST /api/v1/search/track
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import type {
    TrackSearchRequest,
    TrackSearchResponse,
} from '@/types/search';
import { TrackSearchResponseSchema } from '@/types/search';
import { logger } from '@/utils/logger';
import { useMutation } from '@tanstack/react-query';

// ============================================
// HOOK
// ============================================

/**
 * useTrackSearch - Track search keyword for analytics
 * 
 * Usage:
 * - Call on search submit (Enter key)
 * - Call when user clicks a suggestion
 * - Call when user clicks a hot keyword
 * - Do NOT call while user is typing
 */
export const useTrackSearch = () => {
    return useMutation({
        mutationFn: async (data: TrackSearchRequest): Promise<TrackSearchResponse> => {
            const response = await request<TrackSearchResponse>(
                {
                    url: API_ROUTES.SEARCH.TRACK,
                    method: 'POST',
                    data,
                },
                TrackSearchResponseSchema
            );
            return response;
        },
        onError: (error) => {
            // Silent fail - don't disrupt user experience for analytics
            logger.api.warn('Failed to track search:', error);
        },
    });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build track request from different sources
 */
export const buildTrackRequest = {
    /** User pressed Enter to submit search */
    fromSubmit: (keyword: string, categoryId?: string): TrackSearchRequest => ({
        keyword,
        categoryId,
        source: 'SUBMIT',
    }),

    /** User clicked a suggestion */
    fromSuggestion: (keyword: string): TrackSearchRequest => ({
        keyword,
        source: 'SUGGESTION',
    }),

    /** User clicked a recent search */
    fromHistory: (keyword: string): TrackSearchRequest => ({
        keyword,
        source: 'HISTORY',
    }),

    /** User clicked a hot keyword */
    fromHot: (keyword: string): TrackSearchRequest => ({
        keyword,
        source: 'HOT',
    }),
};
