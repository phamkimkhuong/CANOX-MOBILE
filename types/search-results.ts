/**
 * ==============================================
 * SEARCH RESULTS TYPES - Product Search
 * ==============================================
 * API: GET /api/v1/public/products/search
 */

import { z } from 'zod';

// ============================================
// SORT TYPES
// ============================================
export type SearchSortField =
    | 'RELEVANCE'
    | 'NEWEST'
    | 'BEST_SELLING'
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
    slug: z.string().nullable().optional().default(''),
    description: z.string().nullable().optional().default(''),
    priceMin: z.number().nullable().optional().default(0),
    priceMax: z.number().nullable().optional().default(0),
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    showDiscount: z.number().nullable().optional().default(0),
    active: z.boolean().nullable().optional().default(true),
    isFeatured: z.boolean().nullable().optional().default(false),
    priceAfterBestVoucher: z.number().nullable().optional().default(0),
    priceAfterBestShopVoucher: z.number().nullable().optional().default(0),
    priceAfterBestPlatformVoucher: z.number().nullable().optional().default(0),
    // Category
    category: z.object({
        id: z.string(),
        name: z.string().nullable().optional().default(''),
        slug: z.string().nullable().optional().default(''),
    }).nullable().optional(),
    // Shop
    shop: z.object({
        shopId: z.string().nullable().optional(),
        shopName: z.string().nullable().optional().default(''),
        logoUrl: z.string().nullable().optional().default(''),
        status: z.string().nullable().optional(),
    }).nullable().optional(),
    // Media
    media: z.array(z.object({
        id: z.string().nullable().optional(),
        url: z.string().nullable().optional().default(''),
        type: z.string().nullable().optional().default('IMAGE'),
        isPrimary: z.boolean().nullable().optional().default(false),
    })).nullable().optional().default([]),
    // Variants (for price calculation)
    variants: z.array(z.object({
        id: z.string().nullable().optional(),
        price: z.number().nullable().optional().default(0),
        priceBeforeDiscount: z.number().nullable().optional().default(0),
        hasStock: z.boolean().nullable().optional().default(true),
        inventory: z.object({
            available: z.number().nullable().optional().default(0),
        }).nullable().optional(),
    })).nullable().optional().default([]),
    // Review stats
    reviewStatistics: z.object({
        totalReviews: z.number().nullable().optional().default(0),
        averageRating: z.number().nullable().optional().default(0),
        verifiedPurchaseCount: z.number().nullable().optional().default(0),
    }).nullable().optional(),
    // Active campaigns (for flash sale badge)
    activeCampaigns: z.array(z.object({
        campaignId: z.string(),
        campaignType: z.string(),
        campaignName: z.string().nullable().optional(),
    })).nullable().optional().default([]),
    // Best voucher info
    bestShopVoucher: z.object({
        voucherId: z.string(),
        discountValue: z.number().nullable().optional(),
        discountType: z.string().nullable().optional(),
    }).nullable().optional(),
});

export type SearchProductItem = z.infer<typeof SearchProductItemSchema>;

// ============================================
// SEARCH RESPONSE
// ============================================

/**
 * Paginated search response data
 */
export const SearchResponseDataSchema = z.object({
    content: z.array(SearchProductItemSchema).default([]),
    page: z.number().catch(0),
    size: z.number().catch(20),
    totalElements: z.number().optional().catch(0),
    totalPages: z.number().catch(0),
    hasNext: z.boolean().catch(false),
    hasPrevious: z.boolean().optional().catch(false),
    nextPage: z.number().nullable().optional(),
    previousPage: z.number().nullable().optional(),
    empty: z.boolean().optional(),
    first: z.boolean().optional(),
    last: z.boolean().optional(),
});

/**
 * Full search response schema
 */
export const SearchProductsResponseSchema = z.object({
    code: z.number().nullable().optional().default(0),
    success: z.boolean().nullable().optional().default(true),
    message: z.string().nullable().optional().default(''),
    data: SearchResponseDataSchema.nullable().optional(),
});

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
}
