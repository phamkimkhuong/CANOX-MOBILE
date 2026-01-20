/**
 * ==============================================
 * SEARCH HOOKS - BARREL EXPORT
 * ==============================================
 */

// Search Entry (hot keywords, suggestions, tracking)
export { searchKeys, useHotKeywords } from './useHotKeywords';
export { useSearchSuggestions } from './useSearchSuggestions';
export { buildTrackRequest, useTrackSearch } from './useTrackSearch';

// Search Results (product search with infinite scroll)
export {
    searchProductsKeys,
    usePrefetchSearchProducts,
    useSearchProducts
} from './useSearchProducts';
export type { UseSearchProductsOptions } from './useSearchProducts';

// Recommended products (for empty search state)
export { useRecommendedProducts } from './useRecommendedProducts';
