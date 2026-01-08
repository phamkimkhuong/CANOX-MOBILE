/**
 * ==============================================
 * SHOP TYPES - Single Source of Truth
 * ==============================================
 * API Endpoints:
 * - GET /shops/{id} → ShopDetailDTO
 * - GET /shops/{id}/products → PaginatedResponse<ShopProductDTO>
 */

import { z } from 'zod';
import { ProductFeedItem } from './product/product';
import { createPaginatedResponseSchema, ResponseDefaultSchema } from './responseSchema';
/**
 * Shop Statistics Schema
 */
export const ShopStatisticsSchema = z.object({
    totalProducts: z.number(),
    activeProducts: z.number(),
    averageRating: z.number(),
    totalReviews: z.number(),
    totalOrdersCompleted: z.number(),
    totalRevenue: z.number(),
    ratingDistribution: z.record(z.string(), z.number()).nullable().optional(),
    shopAge: z.number(),
});

/**
 * Shop Detail DTO Schema - Matches API Response exactly
 * Endpoint: GET /api/v1/public/shops/{shopId}
 */
export const ShopDetailDTOSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(), // Usually null
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
    onVacation: z.boolean(),
    createdAt: z.string(),
    statistics: ShopStatisticsSchema,
});

export type ShopDetailDTO = z.infer<typeof ShopDetailDTOSchema>;

/**
 * API Response wrapper for Shop Detail
 */
export const ShopDetailResponseSchema = ResponseDefaultSchema.extend({
    data: ShopDetailDTOSchema,
});

export type ShopDetailResponse = z.infer<typeof ShopDetailResponseSchema>;

// ============================================
// SECTION 2: SHOP PRODUCT TYPES
// ============================================

/**
 * Product Media Schema (for shop products)
 */
export const ShopProductMediaSchema = z.object({
    id: z.string(),
    basePath: z.string().nullable().optional(),
    extension: z.string().nullable().optional(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    isPrimary: z.boolean(),
    sortOrder: z.number(),
});

export type ShopProductMedia = z.infer<typeof ShopProductMediaSchema>;

/**
 * Product Variant Schema (for price calculation)
 */
export const ShopProductVariantSchema = z.object({
    id: z.string(),
    sku: z.string().nullable().optional(),
    price: z.number(),
    corePrice: z.number(),
    imageUrl: z.string().nullable().optional(),
    inventory: z.object({
        id: z.string(),
        stock: z.number(),
    }).nullable().optional(),
    optionValues: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })).optional(),
});

export type ShopProductVariant = z.infer<typeof ShopProductVariantSchema>;

/**
 * Product Category Schema (minimal)
 */
export const ShopProductCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

/**
 * Product Review Statistics Schema
 */
export const ShopProductReviewStatisticsSchema = z.object({
    reviewableId: z.string(),
    totalReviews: z.number(),
    averageRating: z.number(),
    verifiedPurchaseCount: z.number().nullable().optional(),
}).nullable().optional();

/**
 * Shop Product DTO Schema - Matches API Response for shop products
 * Endpoint: GET /api/v1/public/products/shop/{shopId}
 */
export const ShopProductDTOSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    basePrice: z.number(),
    priceMin: z.number().nullable().optional(),
    priceMax: z.number().nullable().optional(),
    priceAfterBestVoucher: z.number().nullable().optional(),
    active: z.boolean(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    category: ShopProductCategorySchema.nullable().optional(),
    shop: z.object({
        shopId: z.string(),
        shopName: z.string(),
        logoUrl: z.string().nullable().optional(),
    }),
    variants: z.array(ShopProductVariantSchema),
    media: z.array(ShopProductMediaSchema),
    reviewStatistics: ShopProductReviewStatisticsSchema,
    createdDate: z.string().nullable().optional(),
});

export type ShopProductDTO = z.infer<typeof ShopProductDTOSchema>;

/**
 * Paginated Shop Products Response Schema
 */
export const ShopProductsResponseSchema = createPaginatedResponseSchema(ShopProductDTOSchema);

export type ShopProductsResponse = z.infer<typeof ShopProductsResponseSchema>;

/**
 * Shop Header UI - Lightweight data for ShopHeaderInfo component
 * Transformed from ShopDetailDTO via adapter
 */
export interface ShopHeaderUI {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string;
    bannerUrl: string | null;
    isVerified: boolean;
    location: string | null;
    /** Shop join date - formatted for display */
    joinDate: string;
    /** Stats - all nullable since API may not return */
    stats: {
        productCount: number | null;
        followerCount: number | null;
        rating: number | null;
        responseRate: number | null;
    };
}

/**
 * Shop Product Item UI - For product grid
 * Unified with ProductFeedItem
 */
export type ShopProductItemUI = ProductFeedItem;

// ============================================
// SECTION 4: FILTER & SORT TYPES
// ============================================

/**
 * Sort options for shop products
 */
export type ShopProductSortOption =
    | 'newest'      // Default - by createdDate DESC
    | 'price_asc'   // Price low to high
    | 'price_desc'  // Price high to low
    | 'popular';    // By soldCount (when available)

/**
 * Filter params for shop products API
 */
export interface ShopProductFilterParams {
    page?: number;
    size?: number;
    sort?: ShopProductSortOption;
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
}

// ============================================
// SECTION 5: TAB TYPES
// ============================================

/**
 * Shop detail tabs
 */
export type ShopTabType = 'products' | 'profile' | 'categories';

export interface ShopTab {
    key: ShopTabType;
    label: string;
}

export const SHOP_TABS: ShopTab[] = [
    { key: 'products', label: 'Sản phẩm' },
    { key: 'profile', label: 'Hồ sơ' },
    { key: 'categories', label: 'Danh mục' },
];
