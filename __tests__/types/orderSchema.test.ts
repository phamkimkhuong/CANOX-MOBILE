import { OrderSchema } from '@/types/order/orderSchema';

const createRawOrder = (status: string, overrides: Record<string, unknown> = {}) => ({
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
  paidAt: null,
  confirmedAt: null,
  shippedAt: null,
  deliveredAt: null,
  completedAt: null,
  cancelledAt: null,
  resolvedAt: null,
  items: [],
  ...overrides,
});

describe('OrderSchema status normalization', () => {
  it('keeps known backend status and preserves raw value', () => {
    const parsed = OrderSchema.parse(createRawOrder('PAID'));

    expect(parsed.status).toBe('PAID');
    expect(parsed.statusRaw).toBe('PAID');
    expect(parsed.currency).toBe('VND');
  });

  it('maps the UI_COMPLETED aggregate filter value to actual COMPLETED status while preserving raw status', () => {
    const parsed = OrderSchema.parse(createRawOrder('UI_COMPLETED'));

    expect(parsed.status).toBe('COMPLETED');
    expect(parsed.statusRaw).toBe('UI_COMPLETED');
  });

  it('maps truly unknown backend status to UNKNOWN_STATUS', () => {
    const parsed = OrderSchema.parse(createRawOrder('UNDER_REVIEW'));

    expect(parsed.status).toBe('UNKNOWN_STATUS');
    expect(parsed.statusRaw).toBe('UNDER_REVIEW');
  });

  it('preserves lifecycle timestamps from the backend detail payload', () => {
    const parsed = OrderSchema.parse(
      createRawOrder('DELIVERED', {
        paidAt: '2026-03-20T10:10:48.766560Z',
        confirmedAt: '2026-03-13T07:30:48.230235Z',
        shippedAt: '2026-03-20T10:10:48.567157Z',
        deliveredAt: '2026-03-20T10:10:48.766560Z',
        completedAt: null,
        resolvedAt: '2026-03-27T11:02:00.193375Z',
      })
    );

    expect(parsed.confirmedAt).toBe('2026-03-13T07:30:48.230235Z');
    expect(parsed.shippedAt).toBe('2026-03-20T10:10:48.567157Z');
    expect(parsed.deliveredAt).toBe('2026-03-20T10:10:48.766560Z');
    expect(parsed.completedAt).toBeNull();
    expect(parsed.resolvedAt).toBe('2026-03-27T11:02:00.193375Z');
  });
});
