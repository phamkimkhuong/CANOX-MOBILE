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
        meta: { handledLocally: true },
    });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build track request
 */
export const buildTrackRequest = (keyword: string, categoryId?: string): TrackSearchRequest => ({
    keyword,
    categoryId,
    source: 'SUBMIT',
});
