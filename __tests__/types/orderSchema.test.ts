import { OrderSchema } from '@/types/order/orderSchema';

const createRawOrder = (status: string) => ({
  orderId: '824831965117378560',
  orderNumber: 'ORD-MN6URCAA-5797',
  shopId: 'ff9e495e-5267-4c86-b284-64b4ca6971cf',
  shopInfo: {
    shopName: 'TAP HOA IT',
    logoUrl: null,
    logoPath: 'public/shops/logos/2026/02/806097597839532032_*.jpg',
    userId: '331c5916-03e9-456c-ba50-cf2a952b8be2',
  },
  status,
  currency: 'vnd',
  pricing: {
    subtotal: 195000,
    shopDiscount: 19500,
    platformDiscount: 0,
    shippingDiscount: 0,
    appliedVoucherCodes: 'SHOPTEST2026PROD',
    totalDiscount: 19500,
    taxAmount: 0,
    shippingFee: 80000,
    grandTotal: 255500,
  },
  payment: {
    method: 'COD',
    url: null,
  },
  shipment: {
    trackingNumber: null,
    carrier: 'GHN',
  },
  shippingAddress: {
    recipientName: 'Nguyen Van A',
    phoneNumber: '0961415400',
    addressLine1: 'Doc Lap',
    addressLine2: null,
    city: 'Le Quy Don',
    province: 'Hung Yen',
    postalCode: null,
  },
  itemCount: 1,
  totalQuantity: 1,
  customerNote: '',
  cancellationReason: null,
  createdAt: null,
  createdDate: '2026-03-26T02:28:33.986913871Z',
  items: [],
});

describe('OrderSchema status normalization', () => {
  it('keeps known backend status and preserves raw value', () => {
    const parsed = OrderSchema.parse(createRawOrder('PAID'));

    expect(parsed.status).toBe('PAID');
    expect(parsed.statusRaw).toBe('PAID');
    expect(parsed.currency).toBe('VND');
  });

  it('maps UI_COMPLETED to COMPLETED while preserving raw status', () => {
    const parsed = OrderSchema.parse(createRawOrder('UI_COMPLETED'));

    expect(parsed.status).toBe('COMPLETED');
    expect(parsed.statusRaw).toBe('UI_COMPLETED');
  });

  it('maps truly unknown backend status to UNKNOWN_STATUS', () => {
    const parsed = OrderSchema.parse(createRawOrder('UNDER_REVIEW'));

    expect(parsed.status).toBe('UNKNOWN_STATUS');
    expect(parsed.statusRaw).toBe('UNDER_REVIEW');
  });
});
