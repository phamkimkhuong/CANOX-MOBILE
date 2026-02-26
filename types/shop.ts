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

// Re-export Shop Identity types (API Spec v1.0.0)
export * from './shop/shopIdentity';
/**
 * Shop Statistics Schema
 */
export const ShopStatisticsSchema = z.object({
    totalProducts: z.coerce.number().nullish().transform(val => val ?? 0),
    averageRating: z.coerce.number().nullish().transform(val => val ?? 0),
    totalReviews: z.coerce.number().nullish().transform(val => val ?? 0),
});

/**
 * Shop Detail DTO Schema - Matches API Response exactly
 * Endpoint: GET /api/v1/public/shops/{shopId}
 */
export const ShopDetailDTOSchema = z.object({
    shopId: z.string().nullish().transform(val => val ?? ''),
    userId: z.string().nullish(),
    shopName: z.string().nullish().transform(val => val ?? 'Shop'),
    description: z.string().nullish(),
    logoUrl: z.string().nullish(),
    bannerUrl: z.string().nullish(),
    onVacation: z.boolean().nullish().transform(val => val ?? false),
    createdAt: z.string().nullish(),
    statistics: ShopStatisticsSchema.nullish(),
});

export type ShopDetailDTO = z.infer<typeof ShopDetailDTOSchema>;

/**
 * API Response wrapper for Shop Detail
 */
export const ShopDetailResponseSchema = ResponseDefaultSchema.extend({
    data: ShopDetailDTOSchema,
}).transform(res => ({
    ...res,
    data: res.data // Ensure data is not null if parsed correctly
}));

export type ShopDetailResponse = z.infer<typeof ShopDetailResponseSchema>;

// ============================================
// SECTION 2: SHOP PRODUCT TYPES
// ============================================

/**
 * Product Media Schema (for shop products)
 */
export const ShopProductMediaSchema = z.object({
    id: z.string().nullish().transform(val => val ?? ''),
    imageAssetId: z.string().nullish(),
    url: z.string().nullish().transform(val => val ?? ''),
    isPrimary: z.boolean().nullish().transform(val => val ?? false),
});

export type ShopProductMedia = z.infer<typeof ShopProductMediaSchema>;

/**
 * Product Review Statistics Schema
 */
export const ShopProductReviewStatisticsSchema = z.object({
    reviewableId: z.string().nullish(),
    totalReviews: z.coerce.number().nullish().transform(val => val ?? 0),
    averageRating: z.coerce.number().nullish().transform(val => val ?? 0),
});

/**
 * Shop Product DTO Schema - Matches API Response for shop products
 * Endpoint: GET /api/v1/public/products/shop/{shopId}
 */
export const ShopProductDTOSchema = z.object({
    id: z.string().nullish().transform(val => val ?? ''),
    name: z.string().nullish().transform(val => val ?? ''),
    priceBeforeDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    priceAfterBestVoucher: z.coerce.number().nullish().transform(val => val ?? 0),
    shop: z.object({
        shop_location: z.string().nullish().transform(val => val ?? ''),
    }).nullish().transform(val => val ?? { shop_location: '' }),
    media: z.array(ShopProductMediaSchema).nullish().transform(val => val ?? []),
    reviewStatistics: ShopProductReviewStatisticsSchema.nullish(),
    availableRegions: z.array(z.string()).nullish().transform(val => val ?? []),
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
    /** Owner's userId - required for chat */
    userId: string | null;
    name: string;
    description: string | null;
    logoUrl: string;
    bannerUrl: string | null;
    isVerified: boolean;
    onVacation: boolean | null;
    location: string | null;
    /** Shop join date - formatted for display */
    joinDate: string;
    /** Stats - all nullable since API may not return */
    stats: {
        productCount: number | null;
        followerCount: number | null;
        rating: number | null;
        reviewCount: number | null;
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
 * Shop detail tabs - Brand-First Strategy
 * 'home' (Trang chủ) is the default tab - prioritizing trust/profile over products
 */
export type ShopTabType = 'home' | 'products' | 'categories';

export interface ShopTab {
    key: ShopTabType;
    label: string;
}

export const SHOP_TABS: ShopTab[] = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'products', label: 'Sản phẩm' },
    { key: 'categories', label: 'Danh mục' },
];
// ============================================
// SHOP VOUCHER TYPES
// ============================================

/**
 * Voucher Scope - Phạm vi áp dụng voucher
 */
export const VoucherScopeEnum = z.enum(['SHOP_ORDER', 'SHIPPING', 'PRODUCT']);
export type VoucherScope = z.infer<typeof VoucherScopeEnum>;

/**
 * Shop Voucher DTO Schema - Matches API response
 * Endpoint: GET /api/v1/public/shops/{shopId}/vouchers
 */
export const ShopVoucherDTOSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string().nullable().optional().default(''),
    description: z.string().nullable().optional().default(''),
    voucherScope: VoucherScopeEnum.nullable().optional().default('SHOP_ORDER'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).nullable().optional().default('PERCENTAGE'),
    discountValue: z.number().nullable().optional().default(0),
    minOrderAmount: z.number().nullable().optional().default(0),
    maxDiscount: z.number().nullable().optional().default(0),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    maxUsage: z.number().nullable().optional().default(0),
    sponsorType: z.string().nullable().optional().default('SHOP'),
    applyToAllProducts: z.boolean().nullable().optional().default(true),
    imageAssetId: z.string().nullable().optional(),
});

export type ShopVoucherDTO = z.infer<typeof ShopVoucherDTOSchema>;

/**
 * Shop Vouchers Response Schema (Array of Vouchers)
 */
export const ShopVouchersResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(ShopVoucherDTOSchema).default([]),
});

export type ShopVouchersResponse = z.infer<typeof ShopVouchersResponseSchema>;

/**
 * Shop Voucher UI Model - For rendering in Shop list and Detail
 */
export interface ShopVoucherUI {
    id: string;
    code: string;
    name: string;
    description: string;
    titleDisplay: string;
    discountDisplay: string;
    minOrderDisplay: string;
    scopeLabel: string;
    voucherScope: VoucherScope;
    maxDiscount: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    isExpired: boolean;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxUsage: number;
    sponsorType: string;
    shopName?: string;
    applyToAllProducts: boolean;
}

// ============================================
// SECTION 7: SHOP PROFILE TYPES (Brand-First)
// ============================================

/**
 * Shop Profile Type - Determines which profile template to render
 * - 'brand': Full profile with video, gallery, certifications (Big brands)
 * - 'verified': Business verification info (New distributors)
 * - 'new': Onboarding template with platform guarantees (New shops)
 */
export type ShopProfileType = 'brand' | 'verified' | 'new';

/**
 * Trust Badge - Certification/Achievement for shop
 */
export interface ShopTrustBadge {
    id: string;
    icon: string;
    label: string;
    description?: string;
}

/**
 * Gallery Item - Media in shop profile
 */
export interface ShopGalleryItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    caption?: string;
}

/**
 * Brand Commitment/Promise
 */
export interface ShopCommitment {
    id: string;
    icon: string;
    title: string;
    description: string;
}

/**
 * Business Verification Info
 */
export interface ShopBusinessInfo {
    businessName?: string;
    businessType?: string;
    registrationNumber?: string;
    taxId?: string;
    address?: string;
    verifiedAt?: string;
}

/**
 * Shop Profile UI - Complete profile data for rendering
 */
export interface ShopProfileUI {
    /** Profile type determines template */
    type: ShopProfileType;

    /** Hero section */
    heroVideoUrl?: string | null;
    heroImageUrl?: string | null;
    tagline?: string | null;

    /** Brand story */
    brandStory?: string | null;
    foundedYear?: number | null;

    /** Trust metrics */
    trustBadges: ShopTrustBadge[];

    /** Gallery */
    gallery: ShopGalleryItem[];

    /** Commitments */
    commitments: ShopCommitment[];

    /** Business info (for verified type) */
    businessInfo?: ShopBusinessInfo;

    /** Featured products (for home tab) */
    featuredProductIds?: string[];
}
