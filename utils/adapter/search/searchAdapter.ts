/**
 * ==============================================
 * SEARCH ADAPTERS - DTO → UI Transformation
 * ==============================================
 */

import type {
    HotKeywordItem,
    HotKeywordUI,
    SearchSuggestionItem,
    SearchSuggestionUI,
} from '@/types/search';

/**
 * Maps a single HotKeywordItem DTO to HotKeywordUI
 * 
 * @param dto - Hot keyword data from API
 * @param index - Position in original list (for rank)
 * @returns Transformed UI object
 */
export const mapHotKeywordToUI = (dto: HotKeywordItem, index: number): HotKeywordUI => {
    return {
        id: `hot-${dto.keyword}-${index}`,
        keyword: dto.keyword,
        searchCount: dto.searchCount,
        rank: index + 1,
        isHot: index < 3, // Top 3 are "hot"
    };
};

/**
 * Maps multiple hot keywords
 */
export const mapHotKeywordsToUI = (dtos: HotKeywordItem[]): HotKeywordUI[] => {
    return dtos.map((item, index) => mapHotKeywordToUI(item, index));
};

/**
 * Maps a single SearchSuggestionItem DTO to SearchSuggestionUI
 * 
 * @param dto - Suggestion data from API
 * @param query - User's current search input for highlighting
 * @returns Transformed UI object
 */
export const mapSearchSuggestionToUI = (
    dto: SearchSuggestionItem,
    query: string,
    index: number
): SearchSuggestionUI => {
    const keyword = dto.keyword;
    const lowerKeyword = keyword.toLowerCase();
    const lowerQuery = query.toLowerCase();

    const matchIndex = lowerKeyword.indexOf(lowerQuery);

    let matchedPart = '';
    let remainingPart = keyword;

    if (matchIndex >= 0) {
        // Extract the matched portion (preserving original case)
        matchedPart = keyword.slice(matchIndex, matchIndex + query.length);
        // This is a bit simplified, for complex highlighting we might need more parts
        // but keeping it compatible with existing UI types
        remainingPart = keyword.slice(0, matchIndex) +
            keyword.slice(matchIndex + query.length);
    }

    return {
        id: `suggest-${index}-${dto.keyword}`,
        keyword: dto.keyword,
        matchedPart,
        remainingPart,
        highlightedText: query,
        source: (dto.source as SearchSuggestionUI['source']) || 'KEYWORD',
    };
};

/**
 * Maps multiple search suggestions
 */
export const mapSearchSuggestionsToUI = (
    dtos: SearchSuggestionItem[],
    query: string
): SearchSuggestionUI[] => {
    return dtos.map((item, index) => mapSearchSuggestionToUI(item, query, index));
};
