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
    serviceCode?: number;
    shippingFee?: number;
    globalVouchers?: string[];
    loyaltyPoints?: number;
    platformLoyaltyPoints?: number;
}

export interface CreateOrderRequest {
    shops: CreateOrderShopRequest[];
    buyerAddressData: {
        buyerAddressId: string;
        addressType?: number;
        taxAddress?: string;
    };
    paymentMethod: 'COD' | 'PAYOS' | 'VNPAY';
    customerNote?: string;
    previewId?: string;
    previewChecksum?: string;
    previewAt?: string;
    buyNow?: boolean;
    directItem?: {
        variantId: string;
        quantity: number;
        options?: {
            vouchers?: string[];
            globalVouchers?: string[];
            loyaltyPoints?: number;
            platformLoyaltyPoints?: number;
            serviceCode?: number;
            internationalServiceCode?: number;
            firstMileServiceCode?: number;
        };
    };
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
    depositId?: string | null;
    paymentLink?: string | null;
    qrCode?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    orderCode?: string | null;
    amount: number;
    currency: string;
    description?: string | null;
    expiredAt?: number | null;
    success: boolean;
    errorMessage?: string | null;
}

export interface CreateOrderResponse {
    code: number;
    success: boolean;
    message: string;
    data: {
        orders: OrderDTO[];
        paymentInfo?: PaymentInfoDTO | null;
    };
}

// ============================================
// ZOD SCHEMAS
// ============================================

const OrderPricingSchema = z.object({
    subtotal: z.coerce.number().nullish().transform(val => val ?? 0),
    shopDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    platformDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    totalDiscount: z.coerce.number().nullish().transform(val => val ?? 0),
    shippingFee: z.coerce.number().nullish().transform(val => val ?? 0),
    grandTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    taxAmount: z.coerce.number().nullish().transform(val => val ?? 0),
});

const OrderPaymentSchema = z.object({
    paymentMethod: z.string().nullish().transform(val => val ?? 'COD'),
    success: z.boolean().nullish().transform(val => val ?? false),
    paymentLink: z.string().nullish(),
    orderCode: z.string().nullish(),
    expiredAt: z.coerce.number().nullish(),
    description: z.string().nullish(),
    depositId: z.string().nullish(),
});

const OrderShipmentSchema = z.object({
    carrier: z.string().nullish(),
    trackingNumber: z.string().nullish(),
});

const OrderShippingAddressSchema = z.object({
    recipientName: z.string().nullish(),
    phoneNumber: z.string().nullish(),
    addressLine1: z.string().nullish(),
    addressLine2: z.string().nullish(),
    city: z.string().nullish(),
    province: z.string().nullish(),
});

const OrderLoyaltySchema = z.object({
    pointsUsed: z.coerce.number().nullish().transform(val => val ?? 0),
    pointsEarned: z.coerce.number().nullish().transform(val => val ?? 0),
    discountAmount: z.coerce.number().nullish().transform(val => val ?? 0),
});

const OrderItemSchema = z.object({
    itemId: z.string().nullish(),
    productId: z.string().nullish().transform(val => val ?? ''),
    variantId: z.string().nullish().transform(val => val ?? ''),
    sku: z.string().nullish(),
    productName: z.string().nullish().transform(val => val ?? ''),
    imagePath: z.string().nullish(),
    variantAttributes: z.string().nullish().transform(val => val ?? ''),
    unitPrice: z.coerce.number().nullish().transform(val => val ?? 0),
    quantity: z.coerce.number().nullish().transform(val => val ?? 1),
    lineTotal: z.coerce.number().nullish().transform(val => val ?? 0),
    reviewed: z.boolean().nullish().transform(val => val ?? false),
});

const OrderShopInfoSchema = z.object({
    shopId: z.string().nullish().transform(val => val ?? ''),
    shopName: z.string().nullish().transform(val => val ?? ''),
    logoUrl: z.string().nullish(),
    userId: z.string().nullish(),
    username: z.string().nullish(),
});

const OrderSchema = z.object({
    orderId: z.string().nullish().transform(val => val ?? ''),
    orderNumber: z.string().nullish(),
    shopId: z.string().nullish(),
    shopInfo: OrderShopInfoSchema.nullish(),
    buyerId: z.string().nullish(),
    status: z.string().nullish().transform(val => val ?? 'CREATED'),
    currency: z.string().nullish().transform(val => val ?? 'VND'),

    // Nested objects in schema
    pricing: OrderPricingSchema.nullish(),
    payment: OrderPaymentSchema.nullish(),
    shipment: OrderShipmentSchema.nullish(),
    shippingAddress: OrderShippingAddressSchema.nullish(),
    loyalty: OrderLoyaltySchema.nullish(),

    itemCount: z.coerce.number().nullish().transform(val => val ?? 0),
    totalQuantity: z.coerce.number().nullish().transform(val => val ?? 0),
    customerNote: z.string().nullish(),
    cancellationReason: z.string().nullish(),
    createdAt: z.string().nullish(),
    items: z.array(OrderItemSchema).nullish().transform(val => val ?? []),
});

const PaymentInfoSchema = z.object({
    paymentMethod: z.string().nullish().transform(val => val ?? 'COD'),
    depositId: z.string().nullish(),
    paymentLink: z.string().nullish(),
    qrCode: z.string().nullish(),
    accountNumber: z.string().nullish(),
    accountName: z.string().nullish(),
    orderCode: z.string().nullish(),
    amount: z.coerce.number().nullish().transform(val => val ?? 0),
    currency: z.string().nullish().transform(val => val ?? 'VND'),
    description: z.string().nullish(),
    expiredAt: z.coerce.number().nullish(),
    success: z.boolean().nullish().transform(val => val ?? false),
    errorMessage: z.string().nullish(),
});

export const CreateOrderResponseSchema = z.object({
    code: z.coerce.number().nullish().transform(val => val ?? 200),
    success: z.boolean().nullish().transform(val => val ?? true),
    message: z.string().nullish().transform(val => val ?? ''),
    data: z.object({
        orders: z.array(OrderSchema).nullish().transform(val => val ?? []),
        paymentInfo: PaymentInfoSchema.nullish(),
    }).nullish().transform(val => val ?? ({
        orders: [],
        paymentInfo: null
    })),
}).transform(res => ({
    ...res,
    data: res.data // Ensure data is not null if parsed correctly
}));
