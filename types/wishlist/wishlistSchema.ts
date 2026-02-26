/**
 * ==============================================
 * WISHLIST SCHEMAS - Zod Validation
 * ==============================================
 * Runtime validation for API responses
 */

import { z } from 'zod';
import { createPaginatedResponseSchema, ResponseDefaultSchema } from '../responseSchema';

// Helper to transform nullish arrays to empty arrays
const arrayOrEmpty = <T extends z.ZodType>(schema: T) =>
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
    productId: z.string().nullish().transform((val) => val ?? ''),
    productName: z.string().nullish().transform((val) => val ?? ''),
    imagePath: z.string().nullish().default(null),
    imageBasePath: z.string().nullish().default(null),
    imageExtension: z.string().nullish().default(null),
    productPrice: numberOrDefault(0),
    quantity: numberOrDefault(1),
    notes: z.string().nullish().default(null),
    priority: z.coerce.number().nullish().transform((val) => val ?? 0),
    desiredPrice: z.number().nullish().default(null),
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
    description: z.string().nullish().default(null),
    isPublic: z.coerce.boolean().nullish().transform(val => val ?? false),
    isDefault: z.coerce.boolean().nullish().transform(val => val ?? false),
    buyerName: z.string().nullish().transform((val) => val ?? ''),
    itemCount: numberOrDefault(0),
    createdDate: z.string().nullish().transform((val) => val ?? new Date().toISOString()),
    imagePath: z.string().nullish().default(null),
    imageBasePath: z.string().nullish().default(null),
    imageExtension: z.string().nullish().default(null),
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

export const WishlistPageSchema = createPaginatedResponseSchema(WishlistSummarySchema);

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

export const WishlistListResponseSchema = ResponseDefaultSchema.extend({
    data: WishlistPageSchema.shape.data.unwrap().unwrap(),
});

export const WishlistDetailResponseSchema = ResponseDefaultSchema.extend({
    data: WishlistDetailSchema,
});

export const WishlistItemsResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(WishlistItemSchema).default([]),
});

export const PriceTargetMetResponseSchema = ResponseDefaultSchema.extend({
    data: PriceTargetMetSchema,
});

// ============================================
// TYPE INFERENCE
// ============================================

export type WishlistItemSchemaType = z.infer<typeof WishlistItemSchema>;
export type WishlistSummarySchemaType = z.infer<typeof WishlistSummarySchema>;
export type WishlistDetailSchemaType = z.infer<typeof WishlistDetailSchema>;
export type WishlistPageSchemaType = z.infer<typeof WishlistPageSchema>;
