/**
 * ==============================================
 * WISHLIST SCHEMAS - Zod Validation
 * ==============================================
 * Runtime validation for API responses
 */

import { z } from 'zod';

// Helper to transform nullish arrays to empty arrays
const arrayOrEmpty = <T extends z.ZodTypeAny>(schema: T) =>
    z.array(schema).nullish().transform((val) => val ?? []);

// Helper to transform nullish numbers to default
const numberOrDefault = (defaultValue: number) =>
    z.coerce.number().nullish().transform((val) => val ?? defaultValue);

// Helper to transform nullish booleans to default
const booleanOrDefault = (defaultValue: boolean) =>
    z.coerce.boolean().nullish().transform((val) => val ?? defaultValue);

// ============================================
// ITEM OPTION SCHEMA
// ============================================

export const WishlistItemOptionSchema = z.object({
    option: z.string(),
    value: z.string(),
});

// ============================================
// WISHLIST ITEM SCHEMA
// ============================================

export const WishlistItemSchema = z.object({
    id: z.string().nullish().transform((val) => val ?? ''),
    wishlistId: z.string().nullish().transform((val) => val ?? ''),
    variantId: z.string().nullish().transform((val) => val ?? ''),
    sku: z.string().nullish().transform((val) => val ?? ''),
    productId: z.string().nullish().transform((val) => val ?? ''),
    productName: z.string().nullish().transform((val) => val ?? ''),
    imageBasePath: z.string().nullish(),
    imageExtension: z.string().nullish(),
    productImage: z.string().nullish(),
    productPrice: numberOrDefault(0),
    productDescription: z.string().nullish().transform((val) => val ?? ''),
    quantity: numberOrDefault(1),
    notes: z.string().nullish(),
    priority: z.coerce.number().nullish().transform((val) => val ?? 0),
    priorityText: z.string().nullish().transform((val) => val ?? 'Normal'),
    desiredPrice: z.number().nullish(),
    isPriceTargetMet: booleanOrDefault(false),
    createdDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    lastModifiedDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    options: arrayOrEmpty(WishlistItemOptionSchema),
});

// ============================================
// WISHLIST SUMMARY SCHEMA
// ============================================

export const WishlistSummarySchema = z.object({
    id: z.string().nullish().transform((val) => val ?? ''),
    name: z.string().nullish().transform((val) => val ?? 'Untitled Wishlist'),
    description: z.string().nullish(),
    isPublic: z.coerce.boolean().nullish().transform(val => val ?? false),
    isDefault: z.coerce.boolean().nullish().transform(val => val ?? false),
    buyerId: z.string().nullish().transform((val) => val ?? ''),
    buyerName: z.string().nullish().transform((val) => val ?? ''),
    itemCount: numberOrDefault(0),
    createdDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    lastModifiedDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    imageBasePath: z.string().nullish(),
    imageExtension: z.string().nullish(),
});

// ============================================
// WISHLIST DETAIL SCHEMA
// ============================================

export const WishlistDetailSchema = WishlistSummarySchema.extend({
    items: arrayOrEmpty(WishlistItemSchema),
    shareToken: z.string().nullish(),
    shareUrl: z.string().nullish(),
    ogMetadata: z.unknown().nullish(),
});

// ============================================
// PAGINATED RESPONSE SCHEMA
// ============================================

export const WishlistPageSchema = z.object({
    content: arrayOrEmpty(WishlistSummarySchema),
    page: numberOrDefault(0),
    size: numberOrDefault(10),
    totalElements: numberOrDefault(0),
    totalPages: numberOrDefault(0),
    hasNext: booleanOrDefault(false),
    hasPrevious: booleanOrDefault(false),
    previousPage: numberOrDefault(0),
    nextPage: numberOrDefault(0),
    empty: booleanOrDefault(true),
    first: booleanOrDefault(true),
    last: booleanOrDefault(true),
});

// ============================================
// PRICE TARGET MET SCHEMA
// ============================================

export const PriceTargetMetSchema = z.object({
    wishlists: arrayOrEmpty(WishlistDetailSchema),
    totalItems: numberOrDefault(0),
    totalWishlists: numberOrDefault(0),
});

// ============================================
// API RESPONSE SCHEMAS
// ============================================

export const WishlistListResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: WishlistPageSchema,
});

export const WishlistDetailResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: WishlistDetailSchema,
});

export const WishlistItemsResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: z.array(WishlistItemSchema),
});

export const PriceTargetMetResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: PriceTargetMetSchema,
});

// ============================================
// TYPE INFERENCE
// ============================================

export type WishlistItemSchemaType = z.infer<typeof WishlistItemSchema>;
export type WishlistSummarySchemaType = z.infer<typeof WishlistSummarySchema>;
export type WishlistDetailSchemaType = z.infer<typeof WishlistDetailSchema>;
export type WishlistPageSchemaType = z.infer<typeof WishlistPageSchema>;
