/**
 * Checkout Preview API Types (DTO)
 *
 * Raw types matching exactly the API response structure.
 * Transform to UI types using checkoutPreviewAdapter.
 *
 * @see POST /api/v1/cart/checkout
 */

import { z } from 'zod';

export const CheckoutPreviewItemRequestSchema = z.object({
    itemId: z.string(),
    quantity: z.number(),
});

export const CheckoutPreviewShopRequestSchema = z.object({
    shopId: z.string(),
    items: z.array(CheckoutPreviewItemRequestSchema).optional(),
    vouchers: z.array(z.string()).optional(),
    serviceCode: z.number().optional(),
    shippingFee: z.number().optional(),
    globalVouchers: z.array(z.string()).optional(),
    loyaltyPoints: z.number().optional(),
});

export const CheckoutPreviewShippingAddressSchema = z.object({
    addressId: z.string(),
    addressChanged: z.boolean().optional(),
    country: z.string().optional(),
    taxFee: z.string().optional(),
});

export const CheckoutPreviewDirectItemOptionsSchema = z.object({
    loyaltyPoints: z.number().optional(),
    platformLoyaltyPoints: z.number().optional(),
    serviceCode: z.number().optional(),
}).catchall(z.unknown());

export const CheckoutPreviewDirectItemSchema = z.object({
    variantId: z.string(),
    quantity: z.number(),
    options: CheckoutPreviewDirectItemOptionsSchema.optional(),
});

export const CheckoutPreviewRequestSchema = z.object({
    shops: z.array(CheckoutPreviewShopRequestSchema),
    shippingAddress: CheckoutPreviewShippingAddressSchema.optional(),
    addressId: z.string().optional(),
    effectiveAddressId: z.string().optional(),
    paymentMethod: z.string().optional(),
    allDiscountCodes: z.array(z.string()).optional(),
    buyNow: z.boolean().optional(),
    directItem: CheckoutPreviewDirectItemSchema.optional(),
});

export type CheckoutPreviewItemRequest = z.infer<typeof CheckoutPreviewItemRequestSchema>;
export type CheckoutPreviewShopRequest = z.infer<typeof CheckoutPreviewShopRequestSchema>;
export type CheckoutPreviewRequest = z.infer<typeof CheckoutPreviewRequestSchema>;

// ============================================
// ZOD SCHEMAS - Response Validation
// ============================================

const CheckoutPreviewItemSchema = z.object({
    itemId: z.string().nullish().transform(val => val ?? ''),
    productId: z.string().nullish().transform(val => val ?? ''),
    variantId: z.string().nullish().transform(val => val ?? ''),
    productName: z.string().nullish().transform(val => val ?? ''),
    imageUrl: z.string().nullish(),
    variantAttributes: z.string().nullish().transform(val => val ?? ''),
    unitPrice: z.coerce.number().nullish().transform(val => val ?? 0),
    quantity: z.coerce.number().nullish().transform(val => val ?? 1),
    lineTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    promotionId: z.string().nullish().transform(val => val ?? ''),
});

const CheckoutServicePlanSchema = z.object({
    serviceCode: z.coerce.number().nullish(),
    firstMile: z.coerce.number().nullish(),
    international: z.coerce.number().nullish(),
}).nullish();

const CheckoutShippingOptionSchema = z.object({
    label: z.string().nullish().transform(val => val ?? ''),
    totalFee: z.coerce.number().nullish().transform(val => val ?? 0),
    estimated: z.string().nullish().transform(val => val ?? ''),
    isSelected: z.boolean().nullish(),
    serviceCode: z.coerce.number().nullish(),
    servicePlan: CheckoutServicePlanSchema
}).transform((val) => ({
    ...val,
    serviceCode: val.servicePlan?.international ?? val.servicePlan?.serviceCode ?? val.serviceCode ?? 0,
}));

const CheckoutVoucherDetailSchema = z.object({
    code: z.string().nullish().transform(val => val ?? ''),
    name: z.string().nullish().transform(val => val ?? ''),
    target: z.string().nullish().transform(val => val ?? ''),
    type: z.string().nullish().transform(val => val ?? ''),
    method: z.string().nullish().transform(val => val ?? 'FIXED_AMOUNT'),
    discountValue: z.coerce.number().nullish().transform(val => val ?? 0),
    maxDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    minOrderAmount: z.coerce.number().nullish().transform(val => val ?? 0),
    discount: z.coerce.number().nullish().transform(val => val ?? 0),
    reason: z.string().nullish().transform(val => val ?? ''),
});

const CheckoutVoucherResultSchema = z.object({
    input: z.array(z.string()).nullish(),
    valid: z.array(CheckoutVoucherDetailSchema).nullish().transform(val => val ?? []),
    invalid: z.array(CheckoutVoucherDetailSchema).nullish().transform(val => val ?? []),
});

const CheckoutLoyaltyInfoSchema = z.object({
    availablePoints: z.coerce.number().nullish().transform(val => val ?? 0),
    pointsToRedeem: z.coerce.number().nullish().transform(val => val ?? 0),
    discountAmount: z.coerce.number().nullish().transform(val => val ?? 0),
    maxPointsAllowed: z.coerce.number().nullish().transform(val => val ?? 0),
    maxDiscountPercent: z.coerce.number().nullish().transform(val => val ?? 0),
    expectedPointsEarned: z.coerce.number().nullish().transform(val => val ?? 0),
    canRedeem: z.boolean().nullish().transform(val => val ?? false),
    message: z.string().nullish().transform(val => val ?? ''),
});

const CheckoutShopSummarySchema = z.object({
    subtotal: z.coerce.number().nullish().transform(val => val ?? 0),
    productDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    voucherDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingFee: z.coerce.number().nullish().transform(val => val ?? 0),
    shopTotal: z.coerce.number().nullish().transform(val => val ?? 0),
});

const CheckoutShippingInfoSchema = z.object({
    options: z.array(CheckoutShippingOptionSchema).nullish().transform(val => val ?? []),
});

const CheckoutPreviewShopSchema = z.object({
    shopId: z.string().nullish().transform(val => val ?? ''),
    shopName: z.string().nullish().transform(val => val ?? ''),
    logoPath: z.string().nullish(),
    items: z.array(CheckoutPreviewItemSchema).nullish().transform(val => val ?? []),
    pricing: CheckoutShopSummarySchema,
    shipping: CheckoutShippingInfoSchema,
    loyaltyInfo: CheckoutLoyaltyInfoSchema.nullish(),
    voucher: CheckoutVoucherResultSchema.nullish(),
});

const CheckoutDiscountSummarySchema = z.object({
    voucherProduct: z.coerce.number().nullish().transform(val => val ?? 0),
    voucherShipping: z.coerce.number().nullish().transform(val => val ?? 0),
    voucherTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    loyaltyDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    platformLoyaltyDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
}).nullish().transform(val => val ?? ({
    voucherProduct: 0,
    voucherShipping: 0,
    voucherTotal: 0,
    loyaltyDiscount: 0,
    platformLoyaltyDiscount: 0,
}));

const CheckoutOrderSummarySchema = z.object({
    totalItems: z.coerce.number().nullish().transform(val => val ?? 0),
    totalQuantity: z.coerce.number().nullish().transform(val => val ?? 0),
    subtotal: z.coerce.number().nullish().transform(val => val ?? 0),
    discounts: CheckoutDiscountSummarySchema,
    totalShippingFee: z.coerce.number().nullish().transform(val => val ?? 0),
    grandTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    totalTaxAmount: z.coerce.number().nullish().transform(val => val ?? 0),
});

const CheckoutBuyerAddressSchema = z.object({
    buyerAddressId: z.string().nullish().transform(val => val ?? ''),
    addressType: z.coerce.number().nullish().transform(val => val ?? 0),
    taxAddress: z.string().nullish(),
});

const CheckoutPreviewDataSchema = z.object({
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
        discounts: {
            voucherProduct: 0,
            voucherShipping: 0,
            voucherTotal: 0,
            loyaltyDiscount: 0,
            platformLoyaltyDiscount: 0,
        },
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
    data: CheckoutPreviewDataSchema.nullish(),
}).transform(res => ({
    ...res,
    data: res.data ?? null,
}));

export type CheckoutPreviewItemDTO = z.infer<typeof CheckoutPreviewItemSchema>;
export type CheckoutShippingOptionDTO = z.infer<typeof CheckoutShippingOptionSchema>;
export type CheckoutVoucherDetailDTO = z.infer<typeof CheckoutVoucherDetailSchema>;
export type CheckoutVoucherResultDTO = z.infer<typeof CheckoutVoucherResultSchema>;
export type CheckoutLoyaltyInfoDTO = z.infer<typeof CheckoutLoyaltyInfoSchema>;
export type CheckoutShopSummaryDTO = z.infer<typeof CheckoutShopSummarySchema>;
export type CheckoutPreviewShopDTO = z.infer<typeof CheckoutPreviewShopSchema>;
export type CheckoutOrderSummaryDTO = z.infer<typeof CheckoutOrderSummarySchema>;
export type CheckoutBuyerAddressDTO = z.infer<typeof CheckoutBuyerAddressSchema>;
export type CheckoutPreviewDataDTO = z.infer<typeof CheckoutPreviewDataSchema>;
export type CheckoutPreviewResponse = z.infer<typeof CheckoutPreviewResponseSchema>;
