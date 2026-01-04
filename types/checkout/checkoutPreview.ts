/**
 * Checkout Preview API Types (DTO)
 *
 * Raw types matching exactly the API response structure.
 * Transform to UI types using checkoutPreviewAdapter.
 *
 * @see POST /api/v1/cart/checkout
 */

import { z } from 'zod';

// ============================================
// REQUEST TYPES
// ============================================

export interface CheckoutPreviewShopRequest {
    shopId: string;
    itemIds: string[];
    vouchers: string[];
    serviceCode?: number;
    shippingFee?: number;
    globalVouchers?: string[];
    loyaltyPoints?: number;
}

export interface CheckoutPreviewRequest {
    shops: CheckoutPreviewShopRequest[];
    shippingAddress?: {
        addressId: string;
        addressChanged?: boolean;
        country?: string;
        taxFee?: string;
    };
    loyaltyPoints?: number;
    paymentMethod?: string;
    usingSavedAddress?: boolean;
    allDiscountCodes?: string[];
    previewAllSelected?: boolean;
    allSelectedItemIds?: string[];
}

// ============================================
// RESPONSE DTO - Raw API Response Types
// ============================================

/** Item từ API response - sẽ được transform sang CheckoutItemUI */
export interface CheckoutPreviewItemDTO {
    itemId: string;
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    basePath: string | null;
    extension: string | null;
    variantAttributes: string | null;
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    lineTotal: number;
    isAvailable: boolean;
    availabilityMessage: string | null;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    weightGrams: number;
}

/** Shipping option từ API - sẽ được transform sang ShippingMethod */
export interface CheckoutShippingOptionDTO {
    serviceCode: number;
    serviceType: string;
    displayName: string;
    fee: number;
    estimatedDeliveryTime: string;
}

/** Voucher detail từ API */
export interface CheckoutVoucherDetailDTO {
    voucherCode: string;
    voucherType: string;
    discountAmount: number;
    discountMethod: string;
    discountTarget: string;
    reason: string;
    valid: boolean;
}

/** Voucher result từ API */
export interface CheckoutVoucherResultDTO {
    shopId: string;
    validVouchers: string[];
    invalidVouchers: string[];
    totalDiscount: number;
    discountDetails: CheckoutVoucherDetailDTO[];
    hasValidVouchers: boolean;
}

/** Loyalty info từ API */
export interface CheckoutLoyaltyInfoDTO {
    availablePoints: number;
    pointsToRedeem: number;
    discountAmount: number;
    maxPointsAllowed: number;
    maxDiscountPercent: number;
    expectedPointsEarned: number;
    canRedeem: boolean;
    message: string;
}

/** Shop summary từ API - sẽ được transform sang ShopSubtotal */
export interface CheckoutShopSummaryDTO {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    productDiscount: number;
    shippingDiscount: number;
    totalDiscount: number;
    shippingFee: number;
    taxAmount: number;
    shopTotal: number;
}

/** Shop từ API - sẽ được transform sang CheckoutShopUI */
export interface CheckoutPreviewShopDTO {
    shopId: string;
    shopName: string;
    items: CheckoutPreviewItemDTO[];
    summary: CheckoutShopSummaryDTO;
    selectedShippingMethod: string | null;  // Có thể null khi shipping chưa tính
    availableShippingOptions: CheckoutShippingOptionDTO[] | null;  // Có thể null
    validationErrors: string[] | null;
    warnings: string[] | null;
    loyaltyInfo: CheckoutLoyaltyInfoDTO | null;
    voucherResult: CheckoutVoucherResultDTO;
}

/** Order summary từ API - sẽ được transform sang CheckoutCalculationResult */
export interface CheckoutOrderSummaryDTO {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    totalDiscount: number;
    shippingDiscount: number;
    productDiscount: number;
    totalShippingFee: number;
    totalTaxAmount: number;
    grandTotal: number;
}

/** Buyer address từ API */
export interface CheckoutBuyerAddressDTO {
    addressId: string;
    addressType: number | null;
    taxAddress: string | null;
}

/** Main data từ API response */
export interface CheckoutPreviewDataDTO {
    cartId: string;
    currency: string;
    previewAt: string;
    buyerAddressData: CheckoutBuyerAddressDTO;
    shops: CheckoutPreviewShopDTO[];
    summary: CheckoutOrderSummaryDTO;
    isValid: boolean;
    validationErrors: string[];
    warnings: string[];
}

/** Full API response wrapper */
export interface CheckoutPreviewResponse {
    code: number;
    success: boolean;
    message: string;
    data: CheckoutPreviewDataDTO;
}

// ============================================
// ZOD SCHEMAS - Response Validation
// ============================================

const CheckoutPreviewItemSchema = z.object({
    itemId: z.string(),
    productId: z.string(),
    variantId: z.string(),
    productName: z.string(),
    sku: z.string(),
    basePath: z.string().nullable(),
    extension: z.string().nullable(),
    variantAttributes: z.string().nullable(),
    unitPrice: z.number(),
    quantity: z.number().int().positive(),
    discountAmount: z.number(),
    lineTotal: z.number(),
    isAvailable: z.boolean(),
    availabilityMessage: z.string().nullable(),
    lengthCm: z.number(),
    widthCm: z.number(),
    heightCm: z.number(),
    weightGrams: z.number(),
});

const CheckoutShippingOptionSchema = z.object({
    serviceCode: z.number(),
    serviceType: z.string(),
    displayName: z.string(),
    fee: z.number(),
    estimatedDeliveryTime: z.string(),
});

const CheckoutVoucherDetailSchema = z.object({
    voucherCode: z.string(),
    voucherType: z.string(),
    discountAmount: z.number(),
    discountMethod: z.string(),
    discountTarget: z.string(),
    reason: z.string(),
    valid: z.boolean(),
});

const CheckoutVoucherResultSchema = z.object({
    shopId: z.string(),
    validVouchers: z.array(z.string()),
    invalidVouchers: z.array(z.string()),
    totalDiscount: z.number(),
    discountDetails: z.array(CheckoutVoucherDetailSchema),
    hasValidVouchers: z.boolean(),
});

const CheckoutLoyaltyInfoSchema = z.object({
    availablePoints: z.number(),
    pointsToRedeem: z.number(),
    discountAmount: z.number(),
    maxPointsAllowed: z.number(),
    maxDiscountPercent: z.number(),
    expectedPointsEarned: z.number(),
    canRedeem: z.boolean(),
    message: z.string(),
});

const CheckoutShopSummarySchema = z.object({
    itemCount: z.number().int(),
    totalQuantity: z.number().int(),
    subtotal: z.number(),
    productDiscount: z.number(),
    shippingDiscount: z.number(),
    totalDiscount: z.number(),
    shippingFee: z.number(),
    taxAmount: z.number(),
    shopTotal: z.number(),
});

const CheckoutPreviewShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    items: z.array(CheckoutPreviewItemSchema),
    summary: CheckoutShopSummarySchema,
    selectedShippingMethod: z.string().nullable(),  // Có thể null/empty khi shipping chưa tính
    availableShippingOptions: z.array(CheckoutShippingOptionSchema).nullable().default([]),
    validationErrors: z.array(z.string()).nullable(),
    warnings: z.array(z.string()).nullable(),
    loyaltyInfo: CheckoutLoyaltyInfoSchema.nullable(),
    voucherResult: CheckoutVoucherResultSchema,
});

const CheckoutOrderSummarySchema = z.object({
    totalItems: z.number().int(),
    totalQuantity: z.number().int(),
    subtotal: z.number(),
    totalDiscount: z.number(),
    shippingDiscount: z.number(),
    productDiscount: z.number(),
    totalShippingFee: z.number(),
    totalTaxAmount: z.number(),
    grandTotal: z.number(),
});

const CheckoutBuyerAddressSchema = z.object({
    addressId: z.string(),
    addressType: z.number().nullable(),
    taxAddress: z.string().nullable(),
});

const CheckoutPreviewDataSchema = z.object({
    cartId: z.string(),
    currency: z.string(),
    previewAt: z.string(),
    buyerAddressData: CheckoutBuyerAddressSchema,
    shops: z.array(CheckoutPreviewShopSchema),
    summary: CheckoutOrderSummarySchema,
    isValid: z.boolean(),
    validationErrors: z.array(z.string()),
    warnings: z.array(z.string()),
});

/** Schema để validate full API response */
export const CheckoutPreviewResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: CheckoutPreviewDataSchema,
});
