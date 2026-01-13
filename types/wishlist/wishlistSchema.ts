/**
 * ==============================================
 * WISHLIST SCHEMAS - Zod Validation
 * ==============================================
 * Runtime validation for API responses
 */

import { z } from 'zod';

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
    id: z.string(),
    wishlistId: z.string(),
    variantId: z.string(),
    sku: z.string(),
    productId: z.string(),
    productName: z.string(),
    imageBasePath: z.string().nullable(),
    imageExtension: z.string().nullable(),
    productImage: z.string().nullable(),
    productPrice: z.number(),
    productDescription: z.string(),
    quantity: z.number(),
    notes: z.string().nullable(),
    priority: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    priorityText: z.enum(['Normal', 'Important', 'Urgent']),
    desiredPrice: z.number().nullable(),
    isPriceTargetMet: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    options: z.array(WishlistItemOptionSchema),
});

// ============================================
// WISHLIST SUMMARY SCHEMA
// ============================================

export const WishlistSummarySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isPublic: z.boolean(),
    isDefault: z.boolean(),
    buyerId: z.string(),
    buyerName: z.string(),
    itemCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    imageBasePath: z.string().nullable(),
    imageExtension: z.string().nullable(),
});

// ============================================
// WISHLIST DETAIL SCHEMA
// ============================================

export const WishlistDetailSchema = WishlistSummarySchema.extend({
    items: z.array(WishlistItemSchema),
    shareToken: z.string().nullable(),
    shareUrl: z.string().nullable(),
    ogMetadata: z.unknown().nullable(),
});

// ============================================
// PAGINATED RESPONSE SCHEMA
// ============================================

export const WishlistPageSchema = z.object({
    content: z.array(WishlistSummarySchema),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
    previousPage: z.number(),
    nextPage: z.number(),
    empty: z.boolean(),
    first: z.boolean(),
    last: z.boolean(),
});

// ============================================
// PRICE TARGET MET SCHEMA
// ============================================

export const PriceTargetMetSchema = z.object({
    wishlists: z.array(WishlistDetailSchema),
    totalItems: z.number(),
    totalWishlists: z.number(),
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
