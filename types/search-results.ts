/**
 * ==============================================
 * SEARCH RESULTS TYPES - Product Search
 * ==============================================
 * API: GET /api/v1/public/products/search
 */

import { z } from 'zod';
import { createPaginatedResponseSchema } from './responseSchema';

// ============================================
// SORT TYPES
// ============================================
export type SearchSortField =
    | 'RELEVANCE'
    | 'NEWEST'
    | 'INTERNATIONAL'
    | 'PRICE_ASC'
    | 'PRICE_DESC';

/**
 * Price sort state for cycling through states
 * NONE -> ASC -> DESC -> NONE
 */
export type PriceSortState = 'NONE' | 'ASC' | 'DESC';

/**
 * Sort option for UI display
 */
export interface SortOption {
    id: SearchSortField;
    label: string;
    /** For price tab - tracks the current state */
    priceState?: PriceSortState;
}

// ============================================
// FILTER TYPES  
// ============================================

/**
 * Quick filter chip types
 */
export type QuickFilterType =
    | 'FREESHIP'
    | 'RATING_4PLUS'
    | 'VOUCHER';

/**
 * Quick filter for UI
 */
export interface QuickFilter {
    id: QuickFilterType;
    label: string;
    isActive: boolean;
}

/**
 * Advanced filter options (for FilterModal)
 */
export interface AdvancedFilters {
    /** Minimum price */
    minPrice?: number;
    /** Maximum price */
    maxPrice?: number;
    /** Minimum rating (1-5) */
    minRating?: number;
    /** Category ID filter */
    categoryId?: string;
    /** Shop ID filter */
    shopId?: string;
    /** Only show products with valid price range */
    validPriceRange?: boolean;
    /** Location/City filter */
    location?: string;
}

// ============================================
// SEARCH REQUEST PARAMS
// ============================================

/**
 * Search request parameters for API
 */
export interface SearchProductsParams {
    keyword: string;
    /** Shop ID filter (optional) */
    shopId?: string;
    /** Category ID filter (optional) */
    categoryId?: string;
    /** Category IDs filter (multiple) */
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    /** Only valid price range products */
    validPriceRange?: boolean;
    /** Filter by average rating */
    averageRating?: number;
}

/**
 * Pageable request params
 */
export interface PageableParams {
    page: number;
    size: number;
    sort?: string[];
}

/**
 * Full search request (combines request + pageable)
 */
export interface SearchRequestParams {
    request: SearchProductsParams;
    pageable: PageableParams;
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Search screen state management
 */
export interface SearchResultState {
    keyword: string;
    sortBy: SearchSortField;
    quickFilters: QuickFilterType[];
    advancedFilters: AdvancedFilters;
    isFilterModalVisible: boolean;
}

/**
 * Initial state for search results
 */
export const initialSearchResultState: SearchResultState = {
    keyword: '',
    sortBy: 'RELEVANCE',
    quickFilters: [],
    advancedFilters: {},
    isFilterModalVisible: false,
};

// ============================================
// SEARCH PRODUCT ITEM (Extended for search)
// ============================================

/**
 * Search product item schema (extends base product)
 * Includes additional fields from search API
 */
export const SearchProductItemSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional().default(''),
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    priceAfterBestVoucher: z.number().nullable().optional().default(0),
    showDiscount: z.number().nullable().optional().default(0),
    // Category - pruned
    category: z.object({
        name: z.string().nullable().optional().default(''),
    }).nullable().optional(),
    // Shop - pruned + shop_location for product card display
    shop: z.object({
        shopId: z.string().nullable().optional(),
        shopName: z.string().nullable().optional().default(''),
        shop_location: z.string().nullable().optional().default(''),
    }).nullable().optional(),
    // Media - pruned imagePath (used for toSizedImageUrl)
    media: z.array(z.object({
        imagePath: z.string().nullable().optional(),
        url: z.string().nullable().optional().default(''),
        isPrimary: z.boolean().nullable().optional().default(false),
    })).nullable().optional().default([]),
    // Review stats - pruned to essentials
    reviewStatistics: z.object({
        totalReviews: z.number().nullable().optional().default(0),
        averageRating: z.number().nullable().optional().default(0),
        verifiedPurchaseCount: z.number().nullable().optional().default(0),
    }).nullable().optional(),
    // Active campaigns - pruned
    activeCampaigns: z.array(z.object({
        campaignType: z.string(),
    })).nullable().optional().default([]),
    // Best voucher info - pruned to check presence only
    bestShopVoucher: z.object({}).nullable().optional(),
    // Regions info to check international status
    availableRegions: z.array(z.string()).nullish().transform(val => val ?? []),
});

export type SearchProductItem = z.infer<typeof SearchProductItemSchema>;

/**
 * Search results response schema using helper
 */
export const SearchProductsResponseSchema = createPaginatedResponseSchema(SearchProductItemSchema);

export type SearchProductsResponse = z.infer<typeof SearchProductsResponseSchema>;

// ============================================
// UI TRANSFORMED TYPE
// ============================================

/**
 * Transformed search product for UI display
 * Lighter weight than API response
 */
export interface SearchProductUI {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviews: number;
    sold: number;
    shopName: string;
    shopId?: string;
    location?: string;
    hasVoucher?: boolean;
    isFlashSale?: boolean;
    categoryName?: string;
    campaignLabel?: string;
    isInternational?: boolean;
}
