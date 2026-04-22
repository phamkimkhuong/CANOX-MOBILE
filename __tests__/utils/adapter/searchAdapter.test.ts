/**
 * Search Adapter Unit Tests
 */

import type { HotKeywordItem, SearchSuggestionItem } from '@/types/search';
import {
    mapHotKeywordToUI,
    mapHotKeywordsToUI,
    mapSearchSuggestionToUI,
    mapSearchSuggestionsToUI,
} from '@/utils/adapter/search/searchAdapter';

// ============================================
// mapHotKeywordToUI
// ============================================

describe('mapHotKeywordToUI', () => {
    const keyword: HotKeywordItem = {
        keyword: 'áo thun',
        searchCount: 1200,
        source: 'TRENDING',
    };

    it('maps basic fields', () => {
        const result = mapHotKeywordToUI(keyword, 0);

        expect(result.keyword).toBe('áo thun');
        expect(result.searchCount).toBe(1200);
        expect(result.rank).toBe(1);
    });

    it('generates unique ID from keyword and index', () => {
        const result = mapHotKeywordToUI(keyword, 3);

        expect(result.id).toBe('hot-áo thun-3');
        expect(result.rank).toBe(4);
    });

    it('marks top 3 as hot', () => {
        expect(mapHotKeywordToUI(keyword, 0).isHot).toBe(true);
        expect(mapHotKeywordToUI(keyword, 1).isHot).toBe(true);
        expect(mapHotKeywordToUI(keyword, 2).isHot).toBe(true);
        expect(mapHotKeywordToUI(keyword, 3).isHot).toBe(false);
        expect(mapHotKeywordToUI(keyword, 10).isHot).toBe(false);
    });
});

describe('mapHotKeywordsToUI', () => {
    it('maps array with correct indices', () => {
        const keywords: HotKeywordItem[] = [
            { keyword: 'a', searchCount: 100, source: 'TRENDING' },
            { keyword: 'b', searchCount: 50, source: 'TRENDING' },
        ];

        const result = mapHotKeywordsToUI(keywords);

        expect(result).toHaveLength(2);
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
    });

    it('handles empty array', () => {
        expect(mapHotKeywordsToUI([])).toEqual([]);
    });
});

// ============================================
// mapSearchSuggestionToUI
// ============================================

describe('mapSearchSuggestionToUI', () => {
    const suggestion: SearchSuggestionItem = {
        keyword: 'áo khoác nam',
        source: 'KEYWORD',
    };

    it('maps basic fields', () => {
        const result = mapSearchSuggestionToUI(suggestion, 'áo', 0);

        expect(result.keyword).toBe('áo khoác nam');
        expect(result.highlightedText).toBe('áo');
        expect(result.source).toBe('KEYWORD');
    });

    it('extracts matched and remaining parts', () => {
        const result = mapSearchSuggestionToUI(suggestion, 'áo', 0);

        expect(result.matchedPart).toBe('áo');
        expect(result.remainingPart).toContain('khoác nam');
    });

    it('generates unique ID from index and keyword', () => {
        const result = mapSearchSuggestionToUI(suggestion, 'áo', 5);
        expect(result.id).toBe('suggest-5-áo khoác nam');
    });

    it('handles case-insensitive matching', () => {
        const item: SearchSuggestionItem = { keyword: 'Apple iPhone', source: 'KEYWORD' };
        const result = mapSearchSuggestionToUI(item, 'apple', 0);

        expect(result.matchedPart).toBe('Apple');
    });

    it('handles no match gracefully', () => {
        const result = mapSearchSuggestionToUI(suggestion, 'xyz', 0);

        expect(result.matchedPart).toBe('');
        expect(result.remainingPart).toBe('áo khoác nam');
    });
});

describe('mapSearchSuggestionsToUI', () => {
    it('maps array with correct indices', () => {
        const items: SearchSuggestionItem[] = [
            { keyword: 'áo', source: 'KEYWORD' },
            { keyword: 'áo khoác', source: 'HISTORY' },
        ];

        const result = mapSearchSuggestionsToUI(items, 'áo');

        expect(result).toHaveLength(2);
        expect(result[0].id).toContain('suggest-0');
        expect(result[1].id).toContain('suggest-1');
    });
});
