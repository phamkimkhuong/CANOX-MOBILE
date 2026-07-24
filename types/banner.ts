/**
 * ==============================================
 * BANNER TYPES
 * ==============================================
 *
 * Types for Homepage Banner API according to Swagger Spec.
 * Used for Category Page, Homepage, Product Page banners.
 *
 * @see API: GET /api/v1/homepage/banners/active
 * @see API: GET /api/v1/homepage/banners/page
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

/**
 * Banner display locations matching backend enum
 */
export const BannerDisplayLocationSchema = z.enum([
    'HOMEPAGE_INTRO',
    'HOMEPAGE_HERO',
    'HOMEPAGE_SIDEBAR',
    'HOMEPAGE_FOOTER',
    'PRODUCT_PAGE_TOP',
    'PRODUCT_PAGE_BOTTOM',
    'PRODUCT_PAGE_SIDEBAR',
    'CATEGORY_PAGE_TOP',
    'CATEGORY_PAGE_SIDEBAR',
    'PRODUCT_LIST_TOP',
    'PRODUCT_LIST_SIDEBAR',
    'CART_PAGE',
    'CHECKOUT_PAGE',
    'GLOBAL',
]);

export type BannerDisplayLocation = z.infer<typeof BannerDisplayLocationSchema>;

/**
 * Device target for banners
 */
export const BannerDeviceTargetSchema = z.enum([
    'ALL',
    'DESKTOP',
    'MOBILE',
]);

export type BannerDeviceTarget = z.infer<typeof BannerDeviceTargetSchema>;

// ============================================
// BANNER ENTITY
// ============================================

/**
 * Banner response from API
 */
export const BannerSchema = z.object({
    id: z.string(),
    title: z.string().nullable().optional(),

    /** Assets */
    imageAssetId: z.string().nullable().optional(),
    imageAssetIdMobile: z.string().nullable().optional(),
    imageAssetIdDesktop: z.string().nullable().optional(),
    imagePath: z.string().nullable().optional(),
    imagePathMobile: z.string().nullable().optional(),
    imagePathDesktop: z.string().nullable().optional(),

    /** Action & Tracking */
    href: z.string().nullable().optional(),
});

export type Banner = z.infer<typeof BannerSchema>;

// ============================================
// API REQUEST PARAMS
// ============================================

/**
 * Parameters for GET /api/v1/homepage/banners/active
 */
export interface GetActiveBannersParams {
    /** Locale code (e.g., 'en', 'vi') */
    locale?: string;

    /** Banner position filter */
    position?: number;

    /** Device type filter */
    device?: BannerDeviceTarget;

    /** Display location filter (e.g., CATEGORY_PAGE_TOP) */
    displayLocation?: BannerDisplayLocation;

    /** Category ID for category-specific banners */
    categoryId?: string;
}

/**
 * Parameters for GET /api/v1/homepage/banners/page
 */
export interface GetBannersByPageParams {
    /** Page name prefix (e.g., 'HOMEPAGE', 'PRODUCT_PAGE') */
    prePage?: string;

    /** Device type filter */
    device?: BannerDeviceTarget;

    /** Locale code */
    locale?: string;
}

// ============================================
// API RESPONSES
// ============================================

/**
 * Response for GET /api/v1/homepage/banners/active
 */
export const BannerListResponseSchema = z.object({
    status: z.string().optional(),
    data: z.array(BannerSchema),
    message: z.string().nullable().optional(),
});

export type BannerListResponse = z.infer<typeof BannerListResponseSchema>;

/**
 * Response for GET /api/v1/homepage/banners/page
 * Returns banners grouped by displayLocation
 */
export const BannersByPageResponseSchema = z.object({
    status: z.string().optional(),
    data: z.record(z.string(), z.array(BannerSchema)),
    message: z.string().nullable().optional(),
});

export type BannersByPageResponse = z.infer<typeof BannersByPageResponseSchema>;

// ============================================
// UI TYPES
// ============================================

/**
 * UI-ready banner data for rendering
 */
export interface BannerUI {
    id: string;
    imageUrl: string;
    href?: string;
    title?: string;
    // Default aspect ratio for UI components
    aspectRatio?: number;
}
