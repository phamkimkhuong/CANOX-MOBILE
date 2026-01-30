/**
 * Order Creation Types
 */
import { z } from 'zod';

export interface CreateOrderItemRequest {
    itemId: string;
    expectedUnitPrice: number;
    quantity: number;
    promotionId?: string | null;
}

export interface CreateOrderShopRequest {
    shopId: string;
    items: CreateOrderItemRequest[];
    vouchers?: string[];
    serviceCode: number;
    shippingFee: number;
    globalVouchers?: string[];
    loyaltyPoints: number;
}

export interface CreateOrderRequest {
    shops: CreateOrderShopRequest[];
    buyerAddressData: {
        addressId: string;
        buyerAddressId: string;
    };
    loyaltyPoints: number;
    paymentMethod: 'COD' | 'BANK_TRANSFER' | 'PAYOS';
    customerNote: string;
}

// ============================================
// RESPONSE DTO - Nested Structure
// ============================================

export interface OrderPricingDTO {
    subtotal?: number | null;
    shopDiscount?: number | null;
    platformDiscount?: number | null;
    shippingDiscount?: number | null;
    originalShippingFee?: number | null;
    appliedVoucherCodes?: string | null;
    totalDiscount?: number | null;
    taxAmount?: number | null;
    shippingFee?: number | null;
    grandTotal?: number | null;
}

export interface OrderPaymentDTO {
    paymentMethod?: string | null;
    amount?: number | null;
    currency?: string | null;
    success?: boolean | null;
    paymentLink?: string | null;
    qrCode?: string | null;
    orderCode?: string | null;
    expiredAt?: number | null;
    accountName?: string | null;
    accountNumber?: string | null;
    description?: string | null;
    errorMessage?: string | null;
    depositId?: string | null;
}

export interface OrderShipmentDTO {
    carrier?: string | null;
    trackingNumber?: string | null;
}

export interface OrderShippingAddressDTO {
    recipientName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    postalCode?: string | null;
}

export interface OrderLoyaltyDTO {
    pointsUsed?: number | null;
    pointsEarned?: number | null;
    discountAmount?: number | null;
}

export interface OrderItemDTO {
    itemId?: string | null;
    productId: string;
    variantId?: string | null;
    sku?: string | null;
    productName?: string | null;
    imagePath?: string | null;
    imageAssetId?: string | null;
    imageBasePath?: string | null;
    imageExtension?: string | null;
    variantAttributes?: string | null;
    unitPrice?: number | null;
    quantity?: number | null;
    discountAmount?: number | null;
    lineTotal?: number | null;
    reviewed?: boolean | null;
}

export interface OrderShopInfoDTO {
    shopId: string;
    shopName?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    status?: string | null;
    rejectedReason?: string | null;
    verifyBy?: string | null;
    verifyDate?: string | null;
    userId?: string | null;
    username?: string | null;
}

export interface OrderDTO {
    orderId: string;
    orderNumber?: string | null;
    shopId?: string | null;
    shopInfo?: OrderShopInfoDTO | null;
    buyerId?: string | null;
    status?: string | null;
    currency?: string | null;

    // Nested objects
    pricing?: OrderPricingDTO | null;
    payment?: OrderPaymentDTO | null;
    shipment?: OrderShipmentDTO | null;
    shippingAddress?: OrderShippingAddressDTO | null;
    loyalty?: OrderLoyaltyDTO | null;

    itemCount?: number | null;
    totalQuantity?: number | null;
    customerNote?: string | null;
    internalNote?: string | null;
    cancellationReason?: string | null;
    createdAt?: string | null;
    items?: OrderItemDTO[] | null;
}

export interface PaymentInfoDTO {
    paymentMethod: string;
    depositId: string | null;
    paymentLink: string | null;
    qrCode: string | null;
    accountNumber: string | null;
    accountName: string | null;
    orderCode: string | null;
    amount: number;
    currency: string;
    description: string | null;
    expiredAt: number | null;
    success: boolean;
    errorMessage: string | null;
}

export interface CreateOrderResponse {
    code?: number | null;
    success?: boolean | null;
    message?: string | null;
    data?: {
        orders?: OrderDTO[] | null;
        paymentInfo?: PaymentInfoDTO | null;
    } | null;
}

// ============================================
// ZOD SCHEMAS
// ============================================

const OrderPricingSchema = z.object({
    subtotal: z.number().optional().nullable().default(0),
    shopDiscount: z.number().optional().nullable().default(0),
    platformDiscount: z.number().optional().nullable().default(0),
    shippingDiscount: z.number().optional().nullable().default(0),
    totalDiscount: z.number().optional().nullable().default(0),
    shippingFee: z.number().optional().nullable().default(0),
    grandTotal: z.number().optional().nullable().default(0),
});

const OrderPaymentSchema = z.object({
    paymentMethod: z.string().optional().nullable(),
    success: z.boolean().optional().nullable(),
    paymentLink: z.string().optional().nullable(),
    orderCode: z.string().optional().nullable(),
    expiredAt: z.number().optional().nullable(),
    description: z.string().optional().nullable(),
    depositId: z.string().optional().nullable(),
});

const OrderShipmentSchema = z.object({
    carrier: z.string().optional().nullable(),
    trackingNumber: z.string().optional().nullable(),
});

const OrderShippingAddressSchema = z.object({
    recipientName: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    addressLine1: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
});

const OrderLoyaltySchema = z.object({
    pointsUsed: z.number().optional().nullable().default(0),
    pointsEarned: z.number().optional().nullable().default(0),
    discountAmount: z.number().optional().nullable().default(0),
});

const OrderItemSchema = z.object({
    itemId: z.string().optional().nullable(),
    productId: z.string(),
    variantId: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    productName: z.string().optional().nullable(),
    imagePath: z.string().optional().nullable(),
    imageAssetId: z.string().optional().nullable(),
    variantAttributes: z.string().optional().nullable(),
    unitPrice: z.number().optional().nullable().default(0),
    quantity: z.number().optional().nullable().default(1),
    lineTotal: z.number().optional().nullable().default(0),
    reviewed: z.boolean().optional().nullable().default(false),
});

const OrderShopInfoSchema = z.object({
    shopId: z.string(),
    shopName: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
});

const OrderSchema = z.object({
    orderId: z.string(),
    orderNumber: z.string().optional().nullable(),
    shopId: z.string().optional().nullable(),
    shopInfo: OrderShopInfoSchema.optional().nullable(),
    buyerId: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    currency: z.string().optional().nullable().default('VND'),

    // Nested objects in schema
    pricing: OrderPricingSchema.optional().nullable(),
    payment: OrderPaymentSchema.optional().nullable(),
    shipment: OrderShipmentSchema.optional().nullable(),
    shippingAddress: OrderShippingAddressSchema.optional().nullable(),
    loyalty: OrderLoyaltySchema.optional().nullable(),

    itemCount: z.number().optional().nullable().default(0),
    totalQuantity: z.number().optional().nullable().default(0),
    customerNote: z.string().optional().nullable(),
    internalNote: z.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    items: z.array(OrderItemSchema).optional().nullable().default([]),
});

const PaymentInfoSchema = z.object({
    paymentMethod: z.string(),
    depositId: z.string().nullable(),
    paymentLink: z.string().nullable(),
    qrCode: z.string().nullable(),
    accountNumber: z.string().nullable(),
    accountName: z.string().nullable(),
    orderCode: z.string().nullable(),
    amount: z.number(),
    currency: z.string(),
    description: z.string().nullable(),
    expiredAt: z.number().nullable(),
    success: z.boolean(),
    errorMessage: z.string().nullable(),
});

export const CreateOrderResponseSchema = z.object({
    code: z.number().optional().nullable(),
    success: z.boolean().optional().nullable().default(false),
    message: z.string().optional().nullable(),
    data: z.object({
        orders: z.array(OrderSchema).optional().nullable().default([]),
        paymentInfo: PaymentInfoSchema.optional().nullable(),
    }).optional().nullable(),
});
