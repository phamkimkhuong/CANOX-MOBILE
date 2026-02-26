/**
 * Checkout Preview API Types (DTO)
 *
 * Raw types matching exactly the API response structure.
 * Transform to UI types using checkoutPreviewAdapter.
 *
 * @see POST /api/v1/cart/checkout
 */

import { z } from 'zod';

export interface CheckoutPreviewItemRequest {
    itemId: string;
    quantity: number;
}

export interface CheckoutPreviewShopRequest {
    shopId: string;
    items?: CheckoutPreviewItemRequest[];
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
    effectiveAddressId?: string;
    loyaltyPoints?: number;
    paymentMethod?: string;
    usingSavedAddress?: boolean;
    allDiscountCodes?: string[];
}

// ============================================
// RESPONSE DTO - Raw API Response Types
// ============================================

/** Promotion detail */
export interface CheckoutPromotionDTO {
    promotionId: string;
    campaignId: string;
    campaignName: string;
    campaignType: string;
    originalPrice: number;
    salePrice: number;
    discountPercent: number;
}

/** Item từ API response - sẽ được transform sang CheckoutItemUI */
export interface CheckoutPreviewItemDTO {
    itemId: string;
    productId: string;
    variantId: string;
    productName: string;
    imagePath?: string | null;
    basePath?: string | null;
    extension?: string | null;
    variantAttributes?: string | null;
    unitPrice?: number | null;
    quantity?: number | null;
    lineTotal?: number | null;
    promotion?: CheckoutPromotionDTO | null;
}

/** Shipping option từ API */
export interface CheckoutShippingOptionDTO {
    serviceType?: string | null;
    label?: string | null;
    totalFee?: number | null;
    estimated?: string | null;
    isSelected?: boolean | null;
    serviceCode?: number | null;
    servicePlan?: {
        serviceCode?: number | null;
        firstMile?: number | null;
        international?: number | null;
    } | null;
}

/** Voucher detail từ API */
export interface CheckoutVoucherDetailDTO {
    voucherCode?: string | null;
    voucherType?: string | null;
    discountAmount?: number | null;
    discountMethod?: string | null;
    discountTarget?: string | null;
    reason?: string | null;
    valid?: boolean | null;
}

/** Voucher result từ API */
export interface CheckoutVoucherResultDTO {
    shopId?: string | null;
    discountDetails?: CheckoutVoucherDetailDTO[] | null;
}

/** Loyalty info từ API */
export interface CheckoutLoyaltyInfoDTO {
    availablePoints?: number | null;
    pointsToRedeem?: number | null;
    discountAmount?: number | null;
    maxPointsAllowed?: number | null;
    maxDiscountPercent?: number | null;
    expectedPointsEarned?: number | null;
    canRedeem?: boolean | null;
    message?: string | null;
}

/** Shop summary từ API - sẽ được transform sang ShopSubtotal */
export interface CheckoutShopSummaryDTO {
    itemCount?: number | null;
    subtotal?: number | null;
    productDiscount?: number | null;
    shippingDiscount?: number | null;
    voucherDiscount?: number | null;
    shippingFee?: number | null;
    shopTotal?: number | null;
}

export interface CheckoutPreviewShopDTO {
    shopId?: string;
    shopName?: string;
    logoUrl?: string | null;
    items?: CheckoutPreviewItemDTO[];
    pricing: CheckoutShopSummaryDTO;
    shipping: {
        type: string;
        options: CheckoutShippingOptionDTO[];
        selectedMethodId?: string | null;
    };
    loyaltyInfo?: CheckoutLoyaltyInfoDTO | null;
    voucher?: CheckoutVoucherResultDTO | null;
}

export interface CheckoutOrderSummaryDTO {
    totalItems?: number | null;
    totalQuantity?: number | null;
    subtotal?: number | null;
    discounts: {
        voucherProduct: number;
        voucherShipping: number;
        voucherTotal: number;
    };
    totalShippingFee?: number | null;
    totalTaxAmount?: number | null;
    grandTotal?: number | null;
}

/** Buyer address từ API */
export interface CheckoutBuyerAddressDTO {
    addressId?: string;
    addressType?: number | null;
    taxAddress?: string | null;
}

export interface CheckoutPreviewDataDTO {
    previewId: string;
    cartId: string;
    currency: string;
    previewAt: string;
    previewChecksum?: string | null;
    buyerAddressData?: CheckoutBuyerAddressDTO | null;
    shops: CheckoutPreviewShopDTO[];
    summary: CheckoutOrderSummaryDTO;
    validation: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
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
    itemId: z.string().nullish().transform(val => val ?? ''),
    productId: z.string().nullish().transform(val => val ?? ''),
    variantId: z.string().nullish().transform(val => val ?? ''),
    productName: z.string().nullish().transform(val => val ?? ''),
    imagePath: z.string().nullish(),
    basePath: z.string().nullish(),
    extension: z.string().nullish(),
    variantAttributes: z.string().nullish().transform(val => val ?? ''),
    unitPrice: z.coerce.number().nullish().transform(val => val ?? 0),
    quantity: z.coerce.number().nullish().transform(val => val ?? 1),
    lineTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    promotion: z.object({
        promotionId: z.string().nullish().transform(val => val ?? ''),
        campaignId: z.string().nullish().transform(val => val ?? ''),
        campaignName: z.string().nullish().transform(val => val ?? ''),
        campaignType: z.string().nullish().transform(val => val ?? ''),
        originalPrice: z.coerce.number().nullish().transform(val => val ?? 0),
        salePrice: z.coerce.number().nullish().transform(val => val ?? 0),
        discountPercent: z.coerce.number().nullish().transform(val => val ?? 0),
    }).nullish(),
});

const CheckoutShippingOptionSchema = z.object({
    serviceType: z.string().nullish().transform(val => val ?? 'standard'),
    label: z.string().nullish().transform(val => val ?? ''),
    totalFee: z.coerce.number().nullish().transform(val => val ?? 0),
    estimated: z.string().nullish().transform(val => val ?? ''),
    isSelected: z.boolean().nullish(),

    serviceCode: z.coerce.number().nullish(),
    servicePlan: z.object({
        serviceCode: z.coerce.number().nullish(),
        firstMile: z.coerce.number().nullish(),
        international: z.coerce.number().nullish(),
    }).nullish()
}).transform((val) => ({
    ...val,
    serviceCode: val.servicePlan?.international ?? val.servicePlan?.serviceCode ?? val.serviceCode ?? 0,
}));

const CheckoutVoucherDetailSchema = z.object({
    voucherCode: z.string().nullish().transform(val => val ?? ''),
    voucherType: z.string().nullish().transform(val => val ?? ''),
    discountAmount: z.coerce.number().nullish().transform(val => val ?? 0),
    discountMethod: z.string().nullish().transform(val => val ?? 'FIXED_AMOUNT'),
    discountTarget: z.string().nullish().transform(val => val ?? ''),
    reason: z.string().nullish().transform(val => val ?? ''),
    valid: z.boolean().nullish().transform(val => val ?? false),
});

const CheckoutVoucherResultSchema = z.object({
    shopId: z.string().nullish(),
    discountDetails: z.array(CheckoutVoucherDetailSchema).nullish().transform(val => val ?? []),
});

const CheckoutLoyaltyInfoSchema = z.object({
    pointsToRedeem: z.coerce.number().nullish().transform(val => val ?? 0),
});

const CheckoutShopSummarySchema = z.object({
    itemCount: z.coerce.number().nullish().transform(val => val ?? 0),
    subtotal: z.coerce.number().nullish().transform(val => val ?? 0),
    productDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    voucherDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingFee: z.coerce.number().nullish().transform(val => val ?? 0),
    shopTotal: z.coerce.number().nullish().transform(val => val ?? 0),
});

const CheckoutPreviewShopSchema = z.object({
    shopId: z.string().nullish().transform(val => val ?? ''),
    shopName: z.string().nullish().transform(val => val ?? ''),
    logoUrl: z.string().nullish(),
    items: z.array(CheckoutPreviewItemSchema).nullish().transform(val => val ?? []),
    pricing: CheckoutShopSummarySchema,
    shipping: z.object({
        type: z.string().nullish().transform(val => val ?? 'DOMESTIC'),
        options: z.array(CheckoutShippingOptionSchema).nullish().transform(val => val ?? []),
        selectedMethodId: z.string().nullish(),
    }),
    loyaltyInfo: CheckoutLoyaltyInfoSchema.nullish(),
    voucher: CheckoutVoucherResultSchema.nullish(),
});

const CheckoutOrderSummarySchema = z.object({
    totalItems: z.coerce.number().nullish().transform(val => val ?? 0),
    totalQuantity: z.coerce.number().nullish().transform(val => val ?? 0),
    subtotal: z.coerce.number().nullish().transform(val => val ?? 0),
    discounts: z.object({
        voucherProduct: z.coerce.number().nullish().transform(val => val ?? 0),
        voucherShipping: z.coerce.number().nullish().transform(val => val ?? 0),
        voucherTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    }).nullish().transform(val => val ?? ({
        voucherProduct: 0,
        voucherShipping: 0,
        voucherTotal: 0,
    })),
    totalShippingFee: z.coerce.number().nullish().transform(val => val ?? 0),
    grandTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    totalTaxAmount: z.coerce.number().nullish().transform(val => val ?? 0),
});

const CheckoutBuyerAddressSchema = z.object({
    addressId: z.string().nullish().transform(val => val ?? ''),
    addressType: z.coerce.number().nullish().transform(val => val ?? 0),
    taxAddress: z.string().nullish(),
});

const CheckoutPreviewDataSchema = z.object({
    previewId: z.string().nullish().transform(val => val ?? ''),
    cartId: z.string().nullish().transform(val => val ?? ''),
    currency: z.string().nullish().transform(val => val ?? 'VND'),
    previewAt: z.string().nullish().transform(val => val ?? new Date().toISOString()),
    previewChecksum: z.string().nullish(),
    buyerAddressData: CheckoutBuyerAddressSchema.nullish(),
    shops: z.array(CheckoutPreviewShopSchema).nullish().transform(val => val ?? []),
    summary: CheckoutOrderSummarySchema.nullish().transform(val => val ?? ({
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        discounts: { voucherProduct: 0, voucherShipping: 0, voucherTotal: 0 },
        totalShippingFee: 0,
        grandTotal: 0,
        totalTaxAmount: 0,
    })),
    validation: z.object({
        isValid: z.boolean().nullish().transform(val => val ?? true),
        errors: z.array(z.string()).nullish().transform(val => val ?? []),
        warnings: z.array(z.string()).nullish().transform(val => val ?? []),
    }).nullish().transform(val => val ?? ({
        isValid: true,
        errors: [],
        warnings: [],
    })),
});

/** Schema để validate full API response */
export const CheckoutPreviewResponseSchema = z.object({
    code: z.coerce.number().nullish().transform(val => val ?? 200),
    success: z.boolean().nullish().transform(val => val ?? true),
    message: z.string().nullish().transform(val => val ?? ''),
    data: CheckoutPreviewDataSchema,
}).transform(res => ({
    ...res,
    data: res.data // Ensure data is not null if parsed correctly
}));
