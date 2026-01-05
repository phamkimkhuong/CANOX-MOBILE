import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// COMMON SCHEMAS (Reusable)

const AuditFieldsSchema = z.object({
    createdBy: z.string().optional(),
    createdDate: z.string().optional(),
    lastModifiedBy: z.string().optional(),
    lastModifiedDate: z.string().optional(),
    version: z.number().optional(),
});

// ============================================
// MEDIA SCHEMA
// ============================================

export const ProductMediaSchema = z.object({
    id: z.string(),
    basePath: z.string().optional(),
    extension: z.string().optional(),
    mediaAssetId: z.string().optional(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    title: z.string().nullable().optional(),
    altText: z.string().nullable().optional(),
    sortOrder: z.number().optional(),
    isPrimary: z.boolean(),
    productId: z.string().optional(),
}).merge(AuditFieldsSchema); // ← Reuse audit fields

export type ProductMedia = z.infer<typeof ProductMediaSchema>;

// ============================================
// OPTION VALUE SCHEMA (Shared for Variant & Product Options)
// ============================================

/**
 * Option Value - Shared for VariantOption and ProductOption
 * API returns optionValues as flat: { id, name, displayOrder }
 * Ex: "A", "200x200x5", "Red", "Size L"
 */
export const OptionValueSchema = z.object({
    id: z.string(),
    name: z.string(),
    displayOrder: z.number().optional(),
}).merge(AuditFieldsSchema);

export type OptionValue = z.infer<typeof OptionValueSchema>;

// Backward compatibility aliases
export const VariantOptionValueSchema = OptionValueSchema;
export type VariantOptionValue = OptionValue;
export const ProductOptionValueSchema = OptionValueSchema;
export type ProductOptionValue = OptionValue;

// ============================================
// VARIANT INVENTORY SCHEMA
// ============================================

export const VariantInventorySchema = z.object({
    id: z.string(),
    stock: z.number(),
    reserved: z.number().optional(),
    sold: z.number().optional(),
});
export type VariantInventory = z.infer<typeof VariantInventorySchema>;

// ============================================
// PRODUCT VARIANT SCHEMA
// ============================================

export const ProductVariantSchema = z.object({
    id: z.string(),
    sku: z.string().optional(),
    // Image fields (variant can have own image)
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
    imageAssetId: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    // Price
    corePrice: z.number().optional(),
    price: z.number(),
    // Option values  
    optionValues: z.array(OptionValueSchema),
    // Inventory
    inventory: VariantInventorySchema,
    // Dimensions
    lengthCm: z.number().optional(),
    widthCm: z.number().optional(),
    heightCm: z.number().optional(),
    weightGrams: z.number().optional(),
    dimensionsString: z.string().optional(),
    weightString: z.string().optional(),
    volumeCm3: z.number().optional(),
    weightKg: z.number().optional(),
}).merge(AuditFieldsSchema);

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ============================================
// PRODUCT OPTION SCHEMAS (Group options for UI render)
// ============================================

export const ProductOptionSchema = z.object({
    id: z.string(),
    name: z.string(),              // e.g., "SIZE", "Loại A"
    values: z.array(OptionValueSchema), // ← Reuse OptionValueSchema
}).merge(AuditFieldsSchema); // ← Reuse audit fields

export type ProductOption = z.infer<typeof ProductOptionSchema>;

// ============================================
// SHIPPING RESTRICTIONS SCHEMA
// ============================================

export const ShippingRestrictionsSchema = z.object({
    restrictionType: z.string().nullable().optional(),
    maxShippingRadiusKm: z.number().nullable().optional(),
    countryRestrictionType: z.string().nullable().optional(),
    restrictedCountries: z.array(z.string()).nullable().optional(),
    restrictedRegions: z.array(z.string()).nullable().optional(),
});
export type ShippingRestrictions = z.infer<typeof ShippingRestrictionsSchema>;

// ============================================
// CATEGORY SCHEMA
// ============================================

export const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
    parent: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
    }).nullable().optional(),
    children: z.array(z.unknown()).nullable().optional(),
    defaultShippingRestrictions: ShippingRestrictionsSchema.optional(),
}).merge(AuditFieldsSchema); // ← Reuse audit fields

export type Category = z.infer<typeof CategorySchema>;

// ============================================
// SHOP SCHEMA
// ============================================

export const ShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).optional(),
    rejectedReason: z.string().nullable().optional(),
    verifyBy: z.string().nullable().optional(),
    verifyDate: z.string().nullable().optional(),
    userId: z.string().optional(),
    username: z.string(),
    // Extended fields (BE might add later)
    isVerified: z.boolean().optional(),
    rating: z.number().optional(),
    responseRate: z.number().optional(),
    responseTime: z.string().optional(),
    followerCount: z.number().optional(),
    productCount: z.number().optional(),
    location: z.string().optional(),
    lastOnline: z.string().optional(),
});
export type Shop = z.infer<typeof ShopSchema>;

// ============================================
// VOUCHER SCHEMA
// ============================================

export const VoucherSchema = z.object({
    voucherId: z.string(),
    code: z.string(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    voucherScope: z.enum(['SHOP_ORDER', 'PLATFORM_ORDER', 'PRODUCT', 'CATEGORY']).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number(),
    maxDiscount: z.number().nullable().optional(),
    minOrderValue: z.number().optional(),
    sponsorType: z.enum(['PLATFORM', 'SHOP']).optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    // Calculated values from BE
    discountAmount: z.number().optional(),
    priceAfterDiscount: z.number().optional(),
});
export type Voucher = z.infer<typeof VoucherSchema>;

// ============================================
// REVIEW STATISTICS SCHEMA
// ============================================

export const ReviewStatsSchema = z.object({
    reviewableId: z.string().optional(),
    totalReviews: z.number(),
    averageRating: z.number(),
    ratingDistribution: z.record(z.string(), z.number()).optional(),
    ratingPercentage: z.record(z.string(), z.number()).optional(),
    verifiedPurchaseCount: z.number().optional(),
    verifiedPurchasePercentage: z.number().optional(),
    commentCount: z.number().optional(),
    mediaReviewCount: z.number().optional(),
    imageReviewCount: z.number().optional(),
    videoReviewCount: z.number().optional(),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

// ============================================
// FLASH SALE SCHEMA
// ============================================

export const FlashSaleInfoSchema = z.object({
    isActive: z.boolean(),
    endTime: z.string().optional(),
    discountPercentage: z.number().optional(),
    quantityLimit: z.number().optional(),
    quantitySold: z.number().optional(),
});
export type FlashSaleInfo = z.infer<typeof FlashSaleInfoSchema>;

// ============================================
// SHIPPING INFO SCHEMA
// ============================================

export const ShippingInfoSchema = z.object({
    origin: z.string().optional(),
    isFreeShipping: z.boolean().optional(),
    freeShippingMinOrder: z.number().optional(),
    estimatedDelivery: z.object({
        min: z.number(),
        max: z.number(),
        unit: z.enum(['days', 'hours']).default('days'),
    }).optional(),
    shippingFee: z.number().optional(),
});
export type ShippingInfo = z.infer<typeof ShippingInfoSchema>;

// ============================================
// PRODUCT SPECS SCHEMA
// ============================================

export const ProductSpecSchema = z.object({
    label: z.string(),
    value: z.string(),
});
export type ProductSpec = z.infer<typeof ProductSpecSchema>;

// ============================================
// FULL PRODUCT DETAIL RESPONSE SCHEMA
// ============================================

export const ProductDetailResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),

    // Pricing
    basePrice: z.number(),
    priceMin: z.number(),
    priceMax: z.number(),
    priceAfterBestVoucher: z.number().optional(),
    priceAfterBestShopVoucher: z.number().optional(),
    priceAfterBestPlatformVoucher: z.number().optional(),

    // Status (API returns 'active' not 'isActive')
    active: z.boolean(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    approvedBy: z.string().nullable().optional(),
    approvedAt: z.string().nullable().optional(),

    // Feature flags
    promotedUntil: z.string().nullable().optional(),
    isFeatured: z.boolean().optional(),

    // Stats
    totalSold: z.number().optional(),
    viewCount: z.number().optional(),

    // Relations
    media: z.array(ProductMediaSchema),
    variants: z.array(ProductVariantSchema),
    options: z.array(ProductOptionSchema).optional(),
    shop: ShopSchema,
    category: CategorySchema.optional(),
    reviewStatistics: ReviewStatsSchema,

    // Restrictions
    shippingRestrictions: ShippingRestrictionsSchema.optional(),

    // Vouchers
    bestShopVoucher: VoucherSchema.nullable().optional(),
    bestPlatformVoucher: VoucherSchema.nullable().optional(),
    shopVouchers: z.array(VoucherSchema).optional(),

    // Optional features (BE might add later)
    flashSale: FlashSaleInfoSchema.optional(),
    shipping: ShippingInfoSchema.optional(),
    specifications: z.array(ProductSpecSchema).optional(),

    // Version control
    version: z.number().optional(),
});
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;

// ============================================
// API RESPONSE WRAPPER
// ============================================

export const ProductDetailAPIResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().optional(),
    data: ProductDetailResponseSchema,
});
export type ProductDetailAPIResponse = z.infer<typeof ProductDetailAPIResponseSchema>;

// ============================================
// DOMAIN MODELS (Transformed data for UI)
// ============================================

/**
 * Media item normalized for Gallery
 */
export interface GalleryItem {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    isPrimary: boolean;
    variantId?: string | null;
}

/**
 * Variant Matrix Key: Use for quick lookup of variant
 * Format: "OptionName1:ValueName1|OptionName2:ValueName2"
 * Example: "SIZE:200x200x5|Type A:A"
 */
export type VariantMatrixKey = string;

/**
 * Variant Matrix Value: Variant info for display
 */
export interface VariantMatrixValue {
    id: string;
    price: number;
    originalPrice?: number;
    stock: number;
    isAvailable: boolean;
    media?: GalleryItem[];
    sku?: string;
}

/**
 * Variant Matrix: O(1) Lookup Map
 */
export type VariantMatrix = Map<VariantMatrixKey, VariantMatrixValue>;

/**
 * Option Selection State
 */
export interface SelectedOptions {
    [optionName: string]: string; // { "SIZE": "200x200x5", "Loại A": "A" }
}

/**
 * Price Display Info
 */
export interface PriceDisplay {
    currentPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    priceRange?: {
        min: number;
        max: number;
    };
    isRange: boolean;
    voucherDiscount?: number;
    priceAfterVoucher?: number;
}

/**
 * Shop UI Model (normalized from API Shop)
 */
export interface ShopUI {
    id: string;
    userId: string;
    shopName: string;
    username: string;
    avatar?: string | null;
    logoUrl?: string | null;
    description?: string | null;
    isVerified: boolean;
    rating?: number;
    responseRate?: number;
    responseTime?: string;
    followerCount?: number;
    productCount?: number;
    location?: string;
    lastOnline?: string;
}

/**
 * Voucher UI Model (normalized from API Voucher)
 */
export interface VoucherUI {
    id: string;
    code: string;
    name?: string;
    description?: string | null;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxDiscount?: number | null;
    minOrderValue?: number;
    sponsorType?: 'PLATFORM' | 'SHOP';
    endDate?: string | null;
}

/**
 * Product Option UI Model (with UI-specific fields)
 */
export interface ProductOptionUI {
    id: string;
    name: string;
    values: Array<{
        id: string;
        name: string;
        displayOrder?: number;
        image?: string | null;
    }>;
}

export interface ReviewStatistics {
    reviewableId?: string;
    totalReviews: number;
    averageRating: number;
    ratingDistribution?: Record<string, number>;
    ratingPercentage?: Record<string, number>;
    verifiedPurchaseCount?: number;
    verifiedPurchasePercentage?: number;
    commentCount?: number;
    mediaReviewCount?: number;
    imageReviewCount?: number;
    videoReviewCount?: number;
}

/**
 * Product Detail transformed for UI
 */
export interface ProductDetailUI {
    // Basic Info
    id: string;
    name: string;
    slug: string;
    description: string | null;

    // Price
    priceDisplay: PriceDisplay;

    // Media
    gallery: GalleryItem[];

    // Variants
    options: ProductOptionUI[];
    variantMatrix: VariantMatrix;
    hasVariants: boolean;

    // Shop
    shop: ShopUI;

    // Stats
    rating: number;
    totalReviews: number;
    reviewStatistics: ReviewStatistics;
    totalSold: number;

    // Features
    flashSale?: FlashSaleInfo;
    vouchers: VoucherUI[];
    bestVoucher?: {
        discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue: number;
        maxDiscount?: number;
    };
    shipping?: ShippingInfo;
    specifications: ProductSpec[];

    // Category
    categoryPath?: string;

    // Status
    isActive: boolean;
    isAvailable: boolean;
}

/**
 * Inventory Status
 */
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Variant Selection Result
 */
export interface VariantSelectionResult {
    selectedVariant: VariantMatrixValue | null;
    isFullySelected: boolean;
    displayPrice: PriceDisplay;
    inventoryStatus: InventoryStatus;
    availableStock: number;
    canAddToCart: boolean;
    selectionSummary: string; // "SIZE 200x200x5, Loại A A"
}

// ============================================
// HELPER TYPES FOR ADAPTER
// ============================================

/**
 * Normalized Option Value for variant matching
 * Used to map from variant.optionValues to option names
 */
export interface NormalizedOptionValue {
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
}
