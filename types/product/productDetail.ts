import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// COMMON SCHEMAS (Reusable)

// ============================================
// CAMPAIGN & PROMOTION SCHEMAS (New BE Response)
// ============================================

export const CampaignSchema = z.object({
    campaignId: z.string().nullable().optional(),
    campaignName: z.string().nullable().optional(),
    campaignType: z.string().nullable().optional(), // FLASH_SALE, SHOP_SALE, etc.
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    secondsRemaining: z.number().nullable().optional(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const PromotionSchema = z.object({
    promotionId: z.string().nullable().optional(),
    campaignId: z.string().nullable().optional(),
    campaignName: z.string().nullable().optional(),
    campaignType: z.string().nullable().optional(),
    originalPrice: z.number().nullable().optional(),
    salePrice: z.number().nullable().optional(),
    discountPercent: z.number().nullable().optional(),
});
export type Promotion = z.infer<typeof PromotionSchema>;

// ============================================
// MEDIA SCHEMA
// ============================================

export const ProductMediaSchema = z.object({
    id: z.string(),
    imagePath: z.string().nullable().optional(),
    basePath: z.string().nullable().optional(),
    extension: z.string().nullable().optional(),
    url: z.string().nullable().optional().default(''),
    type: z.string().nullable().optional().default('IMAGE'),
    title: z.string().nullable().optional(),
    altText: z.string().nullable().optional(),
    sortOrder: z.number().nullable().optional().default(0),
    isPrimary: z.boolean().nullable().optional().default(false),
});

export type ProductMedia = z.infer<typeof ProductMediaSchema>;

// ============================================
// OPTION VALUE SCHEMA
// ============================================

export const OptionValueSchema = z.object({
    id: z.string(),
    name: z.string(),
    displayOrder: z.number().optional(),
});

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
    available: z.coerce.number().nullish().transform(val => val ?? 0),
});
export type VariantInventory = z.infer<typeof VariantInventorySchema>;

// ============================================
// VARIANT PRICING SCHEMA
// ============================================

const VariantPricingSchema = z.object({
    current: z.number().nullable().optional().default(0),
    original: z.number().nullable().optional().default(0),
});

// ============================================
// VARIANT DIMENSIONS SCHEMA (Packaging info)
// ============================================

export const VariantDimensionsSchema = z.object({
    lengthCm: z.number().nullable().optional(),
    widthCm: z.number().nullable().optional(),
    heightCm: z.number().nullable().optional(),
    weightGrams: z.number().nullable().optional(),
});
export type VariantDimensions = z.infer<typeof VariantDimensionsSchema>;

// ============================================
// PRODUCT VARIANT SCHEMA
// ============================================

export const ProductVariantSchema = z.object({
    id: z.string(),
    sku: z.string().nullable().optional(),
    imagePath: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    // Pricing 
    pricing: VariantPricingSchema.nullable().optional(),
    // Option values  
    optionValues: z.array(OptionValueSchema).nullable().optional().default([]),
    // Inventory
    inventory: VariantInventorySchema.nullable().optional(),
    // Promotion
    promotion: PromotionSchema.nullable().optional(),
    // Dimensions (packaging size/weight)
    dimensions: VariantDimensionsSchema.nullable().optional(),
}).transform(({ pricing, ...rest }) => ({
    ...rest,
    price: pricing?.current ?? 0,
    priceBeforeDiscount: pricing?.original ?? 0,
}));

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ============================================
// PRODUCT OPTION SCHEMAS
// ============================================

export const ProductOptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    values: z.array(OptionValueSchema),
});

export type ProductOption = z.infer<typeof ProductOptionSchema>;

// ============================================
// CATEGORY SCHEMA
// ============================================

export const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    imagePath: z.string().nullable().optional(),
    parent: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

// ============================================
// SHOP SCHEMA
// ============================================

export const ShopSchema = z.object({
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional().default(''),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    logoPath: z.string().nullable().optional(),
    bannerPath: z.string().nullable().optional(),
    verifyBy: z.string().nullable().optional(),
    userId: z.string().nullable().optional(),
    username: z.string().nullable().optional().default(''),
    rating: z.number().nullable().optional(),
    responseRate: z.number().nullable().optional(),
    responseTime: z.string().nullable().optional(),
    followerCount: z.number().nullable().optional(),
    productCount: z.number().nullable().optional(),
    location: z.string().nullable().optional(),
    shop_location: z.string().nullable().optional(),
    lastOnline: z.string().nullable().optional(),
});
export type Shop = z.infer<typeof ShopSchema>;

// ============================================
// VOUCHER SCHEMA
// ============================================

export const VoucherSchema = z.object({
    voucherId: z.string().nullable().optional(),
    code: z.string().nullable().optional().default(''),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).nullable().optional().default('PERCENTAGE'),
    discountValue: z.number().nullable().optional().default(0),
    maxDiscount: z.number().nullable().optional(),
    minOrderValue: z.number().nullable().optional(),
    voucherScope: z.string().nullable().optional(),
    sponsorType: z.enum(['PLATFORM', 'SHOP']).nullable().optional(),
    discountAmount: z.number().nullable().optional(),
    endDate: z.string().nullable().optional(),
});
export type Voucher = z.infer<typeof VoucherSchema>;

// ============================================
// REVIEW STATISTICS SCHEMA
// ============================================

export const ReviewStatsSchema = z.object({
    reviewableId: z.string().nullish(),
    totalReviews: z.coerce.number().nullish().transform(val => val ?? 0),
    averageRating: z.coerce.number().nullish().transform(val => val ?? 0),
    ratingDistribution: z.record(z.string(), z.number()).nullish().transform(val => val ?? {}),
    ratingPercentage: z.record(z.string(), z.number()).nullish().transform(val => val ?? {}),
    mediaReviewCount: z.coerce.number().nullish().transform(val => val ?? 0),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

// ============================================
// FLASH SALE SCHEMA
// ============================================

export const FlashSaleInfoSchema = z.object({
    isActive: z.boolean(),
    endTime: z.string().optional(),
    secondsRemaining: z.number().optional(),
    campaignType: z.string().optional(),
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
    name: z.string().nullable().optional().default(''),
    slug: z.string().nullable().optional().default(''),
    description: z.string().nullable().optional(),

    // Pricing
    priceMin: z.number().nullable().optional().default(0),
    priceMax: z.number().nullable().optional().default(0),
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    showDiscount: z.number().nullable().optional(),
    priceAfterBestVoucher: z.number().nullable().optional(),

    // Status 
    active: z.boolean().nullable().optional().default(true),

    // Stats
    totalSold: z.number().nullable().optional().default(0),

    // Relations
    media: z.array(ProductMediaSchema).nullable().optional().default([]),
    variants: z.array(ProductVariantSchema).nullable().optional().default([]),
    options: z.array(ProductOptionSchema).nullable().optional().default([]),
    shop: ShopSchema.nullable().optional(),
    category: CategorySchema.nullable().optional(),
    activeCampaigns: z.array(CampaignSchema).nullable().optional().default([]),
    reviewStatistics: ReviewStatsSchema.nullable().optional(),

    // Vouchers
    bestShopVoucher: VoucherSchema.nullable().optional(),
    bestPlatformVoucher: VoucherSchema.nullable().optional(),
    shopVouchers: z.array(VoucherSchema).nullable().optional().default([]),

    // Optional features
    flashSale: FlashSaleInfoSchema.nullable().optional(),
    shipping: ShippingInfoSchema.nullable().optional(),
    specifications: z.array(ProductSpecSchema).nullable().optional().default([]),
    availableRegions: z.array(z.string()).nullish().transform(val => val ?? []),
});
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;

// ============================================
// API RESPONSE WRAPPER
// ============================================

export const ProductDetailAPIResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().optional(),
    data: ProductDetailResponseSchema,
}).transform(res => ({
    ...res,
    data: res.data // Ensure data is not null if parsed correctly
}));
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
    promotionId?: string;
    promotionName?: string;
    promotionPercentage?: number;
    campaignType?: string;
    dimensions?: VariantDimensions;
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
 * Price Breakdown Info for BottomSheet
 */
export interface PriceBreakdown {
    basePrice: number;
    productDiscount?: {
        id: string;
        name: string;
        amount: number;
        percentage?: number;
        campaignType?: string;
    };
    shopVoucher?: {
        id: string;
        name: string;
        amount: number;
        discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue?: number | null;
        maxDiscount?: number | null;
    };
    platformVoucher?: {
        id: string;
        name: string;
        amount: number;
        discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue?: number | null;
        maxDiscount?: number | null;
    };
    finalPrice: number;
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
    shopVoucherDiscount?: number;
    platformVoucherDiscount?: number;
    priceAfterVoucher?: number;
    breakdown?: PriceBreakdown;
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

export type VariantOptionPromotionState = 'none' | 'active' | 'possible';

export interface ProductOptionValueWithAvailability {
    id: string;
    name: string;
    displayOrder?: number;
    image?: string | null;
    isSelected: boolean;
    isAvailable: boolean;
    promotionState: VariantOptionPromotionState;
    promotionType?: string;
}

export interface ProductOptionWithAvailability extends ProductOptionUI {
    values: ProductOptionValueWithAvailability[];
}

export interface ReviewStatistics {
    reviewableId?: string;
    totalReviews: number;
    averageRating: number;
    ratingDistribution?: Record<string, number>;
    ratingPercentage?: Record<string, number>;
    mediaReviewCount?: number;
}

export type ProductShippingScope =
    | 'domestic_only'
    | 'international_only'
    | 'both'
    | 'unknown';

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
    isInternational: boolean;
    shippingScope: ProductShippingScope;
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

