import { ResponseDefaultSchema } from '@/types/responseSchema';
import type { OrderStatus, PaymentMethod } from './order';
import { z } from 'zod';

const numberOrZero = z.coerce.number().nullish().transform((value) => value ?? 0);
const nullableString = z.string().nullish().transform((value) => value ?? null);
const stringOrEmpty = z.string().nullish().transform((value) => value ?? '');
const currencyCodeOrDefault = z
  .string()
  .nullish()
  .transform((value) => value?.trim().toUpperCase() || 'VND');
const arrayOrEmpty = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).nullish().transform((value) => value ?? []);
const booleanOrFalse = z.coerce.boolean().nullish().transform((value) => value ?? false);

const ORDER_STATUS_VALUES = [
  'CREATED',
  'AWAITING_PAYMENT',
  'PAID',
  'REJECTED',
  'FULFILLING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'FINALIZED',
  'DELIVERY_FAILED',
  'RETURNING_TO_SENDER',
  'RETURNED_TO_SENDER',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  'RETURNING',
  'RETURNED',
  'RETURN_DISPUTED',
  'REFUND_PENDING',
  'REFUNDED',
  'CANCELLED',
] as const;

const ORDER_STATUS_SET = new Set<string>(ORDER_STATUS_VALUES);

const normalizeOrderStatus = (value: string): OrderStatus => {
  if (value === 'UI_COMPLETED') return 'COMPLETED';
  if (ORDER_STATUS_SET.has(value)) return value as OrderStatus;
  return 'UNKNOWN_STATUS';
};

export const RawOrderStatusSchema = z
  .string()
  .nullish()
  .transform((value) => value?.trim().toUpperCase() || 'UNKNOWN_STATUS');

export const OrderStatusSchema = RawOrderStatusSchema.transform((value): OrderStatus => {
  return normalizeOrderStatus(value);
});

const PAYMENT_METHOD_VALUES = ['COD', 'PAYOS', 'VNPAY', 'STRIPE', 'BANK_TRANSFER'] as const;
const PAYMENT_METHOD_SET = new Set<string>(PAYMENT_METHOD_VALUES);

export const PaymentMethodSchema = z.string().nullish().transform((value): PaymentMethod => {
  const normalized = value?.trim().toUpperCase() || 'COD';
  if (PAYMENT_METHOD_SET.has(normalized)) return normalized as PaymentMethod;
  return normalized as PaymentMethod;
});

const CARRIER_VALUES = ['GHN', 'SUPERSHIP', 'GHTK', 'VIETTEL_POST'] as const;
type KnownCarrier = (typeof CARRIER_VALUES)[number];
const CARRIER_SET = new Set<string>(CARRIER_VALUES);

export const OrderPricingSchema = z.looseObject({
    subtotal: numberOrZero,
    shopDiscount: numberOrZero,
    platformDiscount: numberOrZero,
    shippingDiscount: numberOrZero,
    appliedVoucherCodes: nullableString,
    totalDiscount: numberOrZero,
    taxAmount: numberOrZero,
    shippingFee: numberOrZero,
    grandTotal: numberOrZero,
  });

export const OrderPaymentSchema = z.looseObject({
    method: PaymentMethodSchema,
    url: nullableString,
  });

export const OrderShipmentSchema = z.looseObject({
    trackingNumber: nullableString,
    carrier: z.string().nullish().transform((value): KnownCarrier | null => {
      if (!value) return null;
      const normalized = value.toUpperCase();
      if (CARRIER_SET.has(normalized)) return normalized as KnownCarrier;
      return null;
    }),
  });

export const OrderShippingAddressSchema = z
  .looseObject({
    recipientName: stringOrEmpty,
    phoneNumber: stringOrEmpty,
    addressLine1: stringOrEmpty,
    addressLine2: nullableString,
    city: stringOrEmpty,
    province: stringOrEmpty,
    postalCode: nullableString,
  })
  .nullish()
  .transform((value) => value ?? null);

export const OrderItemSchema = z.looseObject({
    itemId: nullableString,
    productId: stringOrEmpty,
    variantId: stringOrEmpty,
    sku: stringOrEmpty,
    productName: stringOrEmpty,
    imagePath: nullableString,
    variantAttributes: nullableString,
    unitPrice: numberOrZero,
    quantity: numberOrZero,
    discountAmount: numberOrZero,
    lineTotal: numberOrZero,
    reviewed: z.coerce.boolean().nullish().transform((value) => value ?? false),
  });

export const OrderShopInfoSchema = z
  .looseObject({
    shopName: stringOrEmpty,
    logoUrl: nullableString,
    logoPath: nullableString,
    userId: stringOrEmpty,
  })
  .nullish()
  .transform((value) => value ?? null);

export const OrderSchema = z.looseObject({
    orderId: z.string(),
    orderNumber: z.string(),
    shopId: nullableString,
    shopInfo: OrderShopInfoSchema,
    status: RawOrderStatusSchema,
    currency: currencyCodeOrDefault,
    pricing: OrderPricingSchema,
    payment: OrderPaymentSchema,
    shipment: OrderShipmentSchema,
    shippingAddress: OrderShippingAddressSchema,
    itemCount: numberOrZero,
    totalQuantity: numberOrZero,
    customerNote: nullableString,
    cancellationReason: nullableString,
    createdAt: nullableString,
    createdDate: nullableString,
    paidAt: nullableString,
    confirmedAt: nullableString,
    shippedAt: nullableString,
    deliveredAt: nullableString,
    completedAt: nullableString,
    cancelledAt: nullableString,
    resolvedAt: nullableString,
    items: arrayOrEmpty(OrderItemSchema),
  }).transform((value) => ({
    ...value,
    statusRaw: value.status,
    status: normalizeOrderStatus(value.status),
  }));

export const OrdersPageResponseSchema = z.looseObject({
    content: z.array(OrderSchema).default([]),
    page: numberOrZero,
    totalElements: numberOrZero,
    hasNext: booleanOrFalse,
    nextPage: numberOrZero,
  });

export const OrdersApiResponseSchema = ResponseDefaultSchema.extend({
  data: OrdersPageResponseSchema,
});

export const OrderDetailApiResponseSchema = ResponseDefaultSchema.extend({
  data: OrderSchema,
});

export type OrderSchemaType = z.infer<typeof OrderSchema>;
export type OrdersPageResponseSchemaType = z.infer<typeof OrdersPageResponseSchema>;
export type OrdersApiResponseSchemaType = z.infer<typeof OrdersApiResponseSchema>;
export type OrderDetailApiResponseSchemaType = z.infer<typeof OrderDetailApiResponseSchema>;
