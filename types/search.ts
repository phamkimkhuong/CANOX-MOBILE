/**
 * ==============================================
 * SEARCH TYPES - Single Source of Truth
 * ==============================================
 * 
 * API Endpoints:
 * - GET /search/hot → HotKeywordsResponse
 * - GET /search/suggestions → SearchSuggestionsResponse
 * - POST /search/track → TrackSearchResponse
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// ============================================
// HOT KEYWORDS TYPES
// ============================================

/**
 * Single hot keyword item
 */
export const HotKeywordItemSchema = z.object({
    keyword: z.string(),
    searchCount: z.number(),
    source: z.string().default('KEYWORD'),
});

export type HotKeywordItem = z.infer<typeof HotKeywordItemSchema>;

/**
 * Hot Keywords Data Schema
 */
export const HotKeywordsDataSchema = z.object({
    suggestions: z.array(HotKeywordItemSchema).default([]),
    requestId: z.string().optional(),
    count: z.number().default(0),
});

/**
 * Hot Keywords API Response
 * GET /api/v1/search/hot?limit=10
 */
export const HotKeywordsResponseSchema = ResponseDefaultSchema.extend({
    data: HotKeywordsDataSchema,
});

export type HotKeywordsResponse = z.infer<typeof HotKeywordsResponseSchema>;

// ============================================
// SEARCH SUGGESTIONS TYPES
// ============================================

/**
 * Single suggestion item
 */
export const SearchSuggestionItemSchema = z.object({
    keyword: z.string(),
    source: z.string().default('KEYWORD'),
});

export type SearchSuggestionItem = z.infer<typeof SearchSuggestionItemSchema>;

/**
 * Search Suggestions Data Schema
 */
export const SearchSuggestionsDataSchema = z.object({
    suggestions: z.array(SearchSuggestionItemSchema).default([]),
    requestId: z.string().optional(),
    count: z.number().default(0),
});

/**
 * Search Suggestions API Response
 * GET /api/v1/search/suggestions?q=keyword&limit=10
 */
export const SearchSuggestionsResponseSchema = ResponseDefaultSchema.extend({
    data: SearchSuggestionsDataSchema,
});

export type SearchSuggestionsResponse = z.infer<typeof SearchSuggestionsResponseSchema>;

// ============================================
// TRACK SEARCH TYPES
// ============================================

/**
 * Track Search Request Body
 */
export interface TrackSearchRequest {
    keyword: string;
    categoryId?: string;
    source: 'SUBMIT';
}

/**
 * Track Search API Response
 * POST /api/v1/search/track
 */
export const TrackSearchResponseSchema = ResponseDefaultSchema;

export type TrackSearchResponse = z.infer<typeof TrackSearchResponseSchema>;

// ============================================
// UI TYPES
// ============================================

/**
 * Hot Keyword UI - Processed for display
 */
export interface HotKeywordUI {
    id: string;
    keyword: string;
    searchCount: number;
    rank: number;
    isHot: boolean; // Top 3 items
}

/**
 * Search Suggestion UI - For auto-complete list
 */
export interface SearchSuggestionUI {
    id: string;
    keyword: string;
    /** Part matching user input (for highlighting) */
    matchedPart: string;
    /** Part after matched text */
    remainingPart: string;
    /** Text to highlight in the suggestion */
    highlightedText?: string;
    source: 'KEYWORD' | 'SHOP' | 'CATEGORY';
}

/**
 * Track search source types
 */
export type TrackSearchSource = 'SUBMIT';

/**
 * Recent Search Item - Stored in MMKV
 */
export interface RecentSearchItem {
    keyword: string;
    timestamp: number;
}

/**
 * Search Screen State
 */
export type SearchScreenState = 'idle' | 'typing' | 'loading' | 'results';
