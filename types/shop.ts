/**
 * ==============================================
 * SHOP TYPES - Single Source of Truth
 * ==============================================
 * API Endpoints:
 * - GET /shops/{id} → ShopDetailDTO
 * - GET /shops/{id}/products → PaginatedResponse<ShopProductDTO>
 */

import { z } from 'zod';
import { createPaginatedResponseSchema, ResponseDefaultSchema } from './responseSchema';
/**
 * Shop Address Schema (nested in ShopDetailDTO)
 */
export const ShopAddressSchema = z.object({
    addressId: z.string(),
    address: z.object({
        countryCode: z.string().nullable().optional(),
        countryName: z.string().nullable().optional(),
        provinceCode: z.string().nullable().optional(),
        provinceName: z.string().nullable().optional(),
        wardCode: z.string().nullable().optional(),
        wardName: z.string().nullable().optional(),
        detail: z.string().nullable().optional(),
        districtCode: z.string().nullable().optional(),
        districtName: z.string().nullable().optional(),
    }),
    fullName: z.string(),
    phone: z.string(),
});

/**
 * Shop Verification Info Schema
 */
export const ShopVerificationSchema = z.object({
    canSell: z.boolean(),
    verified: z.boolean(),
    message: z.string().nullable().optional(),
});

/**
 * Shop Detail DTO Schema - Matches API Response exactly
 * Endpoint: GET /api/v1/shops/{shopId}
 */
export const ShopDetailDTOSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    userId: z.string(),
    username: z.string(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(), // Usually null
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
    verifyDate: z.string().nullable().optional(),
    createdDate: z.string(),
    address: ShopAddressSchema.nullable().optional(),
    verificationInfo: ShopVerificationSchema.nullable().optional(),
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
 * Shop Product DTO Schema - Matches API Response for shop products
 * Endpoint: GET /api/v1/shops/{shopId}/products
 */
export const ShopProductDTOSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    basePrice: z.number(),
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
    totalReviews: z.number().nullable().optional(),  //  Usually null
    averageRating: z.number().nullable().optional(), //  Usually null
    createdDate: z.string(),
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
 * Transformed from ShopProductDTO via adapter
 */
export interface ShopProductItemUI {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    /** Display price (min price from variants or basePrice) */
    displayPrice: number;
    /** Original/base price (for strikethrough if different) */
    originalPrice: number | null;
    /** Price range text: "Từ 100.000" or "100.000" */
    priceDisplay: string;
    /** Has multiple prices across variants */
    hasPriceRange: boolean;
    /** Total stock across all variants */
    totalStock: number;
    /** Is product out of stock */
    isOutOfStock: boolean;
    /** Rating - null if not available */
    rating: number | null;
    /** Review count - null if not available */
    reviewCount: number | null;
    /** Sold count - Currently not available from API */
    soldCount: number | null;
}

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
