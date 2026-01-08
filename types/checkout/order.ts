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
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    previewId: string;
    previewAt: string;
    customerNote: string;
    confirmAllSelected: boolean;
    allSelectedItemIds: string[];
}

export interface OrderItemDTO {
    itemId: string;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    imageBasePath: string;
    imageExtension: string;
    variantAttributes: string;
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    lineTotal: number;
    reviewed: boolean;
}

export interface OrderShopInfoDTO {
    shopId: string;
    shopName: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    status?: string | null;
    rejectedReason: string | null;
    verifyBy: string | null;
    verifyDate: string | null;
    userId: string;
    username: string;
}

export interface OrderDTO {
    orderId: string;
    orderNumber: string;
    shopId: string;
    shopInfo: OrderShopInfoDTO;
    buyerId: string;
    status: string;
    currency: string;
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    originalShippingFee: number;
    appliedVoucherCodes: string;
    totalDiscount: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;
    totalPlatformFee: number;
    netRevenue: number;
    itemCount: number;
    totalQuantity: number;
    customerNote: string;
    internalNote: string;
    cancellationReason: string | null;
    createdAt: string;
    items: OrderItemDTO[];
    paymentMethod: string;
    paymentUrl: string | null;
    paymentIntentId: string | null;
    paymentGroupId: string | null;
    expiresAt: string;
    trackingNumber: string | null;
    carrier: string | null;
    conkinBillId: string | null;
    conkinShippingCost: number;
    recipientName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    email: string;
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
    code: number;
    success: boolean;
    message: string;
    data: {
        orders: OrderDTO[];
        paymentInfo: PaymentInfoDTO | null;
    };
}

// ============================================
// ZOD SCHEMAS
// ============================================

const OrderItemSchema = z.object({
    itemId: z.string(),
    productId: z.string(),
    variantId: z.string(),
    sku: z.string(),
    productName: z.string(),
    imageBasePath: z.string(),
    imageExtension: z.string(),
    variantAttributes: z.string(),
    unitPrice: z.number(),
    quantity: z.number(),
    discountAmount: z.number(),
    lineTotal: z.number(),
    reviewed: z.boolean(),
});

const OrderShopInfoSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    bannerUrl: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    rejectedReason: z.string().nullable(),
    verifyBy: z.string().nullable(),
    verifyDate: z.string().nullable(),
    userId: z.string(),
    username: z.string(),
});

const OrderSchema = z.object({
    orderId: z.string(),
    orderNumber: z.string(),
    shopId: z.string(),
    shopInfo: OrderShopInfoSchema,
    buyerId: z.string(),
    status: z.string(),
    currency: z.string(),
    subtotal: z.number(),
    shopDiscount: z.number(),
    platformDiscount: z.number(),
    shippingDiscount: z.number(),
    originalShippingFee: z.number(),
    appliedVoucherCodes: z.string(),
    totalDiscount: z.number(),
    taxAmount: z.number(),
    shippingFee: z.number(),
    grandTotal: z.number(),
    totalPlatformFee: z.number(),
    netRevenue: z.number(),
    itemCount: z.number(),
    totalQuantity: z.number(),
    customerNote: z.string(),
    internalNote: z.string(),
    cancellationReason: z.string().nullable(),
    createdAt: z.string(),
    items: z.array(OrderItemSchema),
    paymentMethod: z.string(),
    paymentUrl: z.string().nullable(),
    paymentIntentId: z.string().nullable(),
    paymentGroupId: z.string().nullable(),
    expiresAt: z.string(),
    trackingNumber: z.string().nullable(),
    carrier: z.string().nullable(),
    conkinBillId: z.string().nullable(),
    conkinShippingCost: z.number(),
    recipientName: z.string(),
    phoneNumber: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
    country: z.string(),
    email: z.string(),
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
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        orders: z.array(OrderSchema),
        paymentInfo: PaymentInfoSchema.nullable(),
    }),
});
