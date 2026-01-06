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
    vouchers?: string[];
    serviceCode?: number;
    shippingMethodCode?: string;
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
    addressId?: string;
    globalVouchers?: string[];
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
    reason: string | null;
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
    previewId?: string;
    previewChecksum?: string;
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
    sku: z.string().nullable().optional(),
    basePath: z.string().nullable().optional(),
    extension: z.string().nullable().optional(),
    variantAttributes: z.string().nullable().optional(),
    unitPrice: z.number().nullable().optional().default(0),
    quantity: z.number().int().positive().nullable().optional().default(1),
    discountAmount: z.number().nullable().optional().default(0),
    lineTotal: z.number().nullable().optional().default(0),
    isAvailable: z.boolean().nullable().optional().default(true),
    availabilityMessage: z.string().nullable().optional(),
    lengthCm: z.number().nullable().optional(),
    widthCm: z.number().nullable().optional(),
    heightCm: z.number().nullable().optional(),
    weightGrams: z.number().nullable().optional(),
});

const CheckoutShippingOptionSchema = z.object({
    serviceCode: z.number().nullable().optional(),
    serviceType: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    fee: z.number().nullable().optional(),
    estimatedDeliveryTime: z.string().nullable().optional(),
});

const CheckoutVoucherDetailSchema = z.object({
    voucherCode: z.string().nullable().optional(),
    voucherType: z.string().nullable().optional(),
    discountAmount: z.number().nullable().optional(),
    discountMethod: z.string().nullable().optional(),
    discountTarget: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    valid: z.boolean().nullable().optional(),
});

const CheckoutVoucherResultSchema = z.object({
    shopId: z.string().nullable().optional(),
    validVouchers: z.array(z.string()).nullable().optional().default([]),
    invalidVouchers: z.array(z.string()).nullable().optional().default([]),
    totalDiscount: z.number().nullable().optional(),
    discountDetails: z.array(CheckoutVoucherDetailSchema).nullable().optional().default([]),
    hasValidVouchers: z.boolean().nullable().optional(),
});

const CheckoutLoyaltyInfoSchema = z.object({
    availablePoints: z.number().nullable().optional(),
    pointsToRedeem: z.number().nullable().optional(),
    discountAmount: z.number().nullable().optional(),
    maxPointsAllowed: z.number().nullable().optional(),
    maxDiscountPercent: z.number().nullable().optional(),
    expectedPointsEarned: z.number().nullable().optional(),
    canRedeem: z.boolean().nullable().optional(),
    message: z.string().nullable().optional(),
});

const CheckoutShopSummarySchema = z.object({
    itemCount: z.number().int().nullable().optional().default(0),
    totalQuantity: z.number().int().nullable().optional().default(0),
    subtotal: z.number().nullable().optional().default(0),
    productDiscount: z.number().nullable().optional().default(0),
    shippingDiscount: z.number().nullable().optional().default(0),
    totalDiscount: z.number().nullable().optional().default(0),
    shippingFee: z.number().nullable().optional().default(0),
    taxAmount: z.number().nullable().optional().default(0),
    shopTotal: z.number().nullable().optional().default(0),
});

const CheckoutPreviewShopSchema = z.object({
    shopId: z.string().optional(),
    shopName: z.string().optional(),
    items: z.array(CheckoutPreviewItemSchema).optional().default([]),
    summary: CheckoutShopSummarySchema,
    selectedShippingMethod: z.string().nullable(),  // Có thể null/empty khi shipping chưa tính
    availableShippingOptions: z.array(CheckoutShippingOptionSchema).nullable().optional().default([]),
    validationErrors: z.array(z.string()).nullable().optional().default([]),
    warnings: z.array(z.string()).nullable().optional().default([]),
    loyaltyInfo: CheckoutLoyaltyInfoSchema.nullable().optional(),
    voucherResult: CheckoutVoucherResultSchema.optional(),
});

const CheckoutOrderSummarySchema = z.object({
    totalItems: z.number().int().nullable().optional().default(0),
    totalQuantity: z.number().int().nullable().optional().default(0),
    subtotal: z.number().nullable().optional().default(0),
    totalDiscount: z.number().nullable().optional().default(0),
    shippingDiscount: z.number().nullable().optional().default(0),
    productDiscount: z.number().nullable().optional().default(0),
    totalShippingFee: z.number().nullable().optional().default(0),
    totalTaxAmount: z.number().nullable().optional().default(0),
    grandTotal: z.number().nullable().optional().default(0),
});

const CheckoutBuyerAddressSchema = z.object({
    addressId: z.string().optional(),
    addressType: z.number().nullable().optional(),
    taxAddress: z.string().nullable().optional(),
});

const CheckoutPreviewDataSchema = z.object({
    previewId: z.string().optional(),
    previewChecksum: z.string().optional(),
    cartId: z.string().optional().default(''),
    currency: z.string().optional().default('VND'),
    previewAt: z.string().optional().default(new Date().toISOString()),
    buyerAddressData: CheckoutBuyerAddressSchema.optional(),
    shops: z.array(CheckoutPreviewShopSchema).optional().default([]),
    summary: CheckoutOrderSummarySchema.optional().default({
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        totalDiscount: 0,
        shippingDiscount: 0,
        productDiscount: 0,
        totalShippingFee: 0,
        totalTaxAmount: 0,
        grandTotal: 0,
    }),
    isValid: z.boolean().optional().default(true),
    validationErrors: z.array(z.string()).optional().default([]),
    warnings: z.array(z.string()).optional().default([]),
});

/** Schema để validate full API response */
export const CheckoutPreviewResponseSchema = z.object({
    code: z.number().optional().default(200),
    success: z.boolean().optional().default(true),
    message: z.string().optional().nullable(),
    data: CheckoutPreviewDataSchema.optional(),
});
