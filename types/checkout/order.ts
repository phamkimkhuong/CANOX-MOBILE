/**
 * Order Creation Types
 */
import { z } from 'zod';

export interface CreateOrderShopRequest {
    shopId: string;
    itemIds: string[];
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
        addressType: number | null;
        taxAddress: string | null;
    };
    loyaltyPoints: number;
    paymentMethod: 'COD' | 'BANK_TRANSFER' | 'PAYOS';
    previewId: string;
    previewAt: string;
    customerNote: string;
    confirmAllSelected: boolean;
    allSelectedItemIds: string[];
}

export interface OrderItemDTO {
    itemId: string;
    productId: string;
    variantId?: string | null;
    sku?: string | null;
    productName?: string | null;
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
    totalPlatformFee?: number | null;
    netRevenue?: number | null;
    itemCount?: number | null;
    totalQuantity?: number | null;
    customerNote?: string | null;
    internalNote?: string | null;
    cancellationReason?: string | null;
    createdAt?: string | null;
    items?: OrderItemDTO[] | null;
    paymentMethod?: string | null;
    paymentUrl?: string | null;
    paymentIntentId?: string | null;
    paymentGroupId?: string | null;
    expiresAt?: string | null;
    trackingNumber?: string | null;
    carrier?: string | null;
    conkinBillId?: string | null;
    conkinShippingCost?: number | null;
    recipientName?: string | null;
    phoneNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
    email?: string | null;
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
    paymentInfo?: PaymentInfoDTO | null;
}

// ============================================
// ZOD SCHEMAS
// ============================================

const OrderItemSchema = z.object({
    itemId: z.string(),
    productId: z.string(),
    variantId: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    productName: z.string().optional().nullable(),
    imageBasePath: z.string().optional().nullable(),
    imageExtension: z.string().optional().nullable(),
    variantAttributes: z.string().optional().nullable(),
    unitPrice: z.number().optional().nullable().default(0),
    quantity: z.number().optional().nullable().default(1),
    discountAmount: z.number().optional().nullable().default(0),
    lineTotal: z.number().optional().nullable().default(0),
    reviewed: z.boolean().optional().nullable().default(false),
});

const OrderShopInfoSchema = z.object({
    shopId: z.string(),
    shopName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    bannerUrl: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    rejectedReason: z.string().optional().nullable(),
    verifyBy: z.string().optional().nullable(),
    verifyDate: z.string().optional().nullable(),
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
    subtotal: z.number().optional().nullable().default(0),
    shopDiscount: z.number().optional().nullable().default(0),
    platformDiscount: z.number().optional().nullable().default(0),
    shippingDiscount: z.number().optional().nullable().default(0),
    originalShippingFee: z.number().optional().nullable().default(0),
    appliedVoucherCodes: z.string().optional().nullable(),
    totalDiscount: z.number().optional().nullable().default(0),
    taxAmount: z.number().optional().nullable().default(0),
    shippingFee: z.number().optional().nullable().default(0),
    grandTotal: z.number().optional().nullable().default(0),
    totalPlatformFee: z.number().optional().nullable().default(0),
    netRevenue: z.number().optional().nullable().default(0),
    itemCount: z.number().optional().nullable().default(0),
    totalQuantity: z.number().optional().nullable().default(0),
    customerNote: z.string().optional().nullable(),
    internalNote: z.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    items: z.array(OrderItemSchema).optional().nullable().default([]),
    paymentMethod: z.string().optional().nullable(),
    paymentUrl: z.string().optional().nullable(),
    paymentIntentId: z.string().optional().nullable(),
    paymentGroupId: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    trackingNumber: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    conkinBillId: z.string().optional().nullable(),
    conkinShippingCost: z.number().optional().nullable().default(0),
    recipientName: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    addressLine1: z.string().optional().nullable(),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
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
    paymentInfo: PaymentInfoSchema.optional().nullable(),
});
