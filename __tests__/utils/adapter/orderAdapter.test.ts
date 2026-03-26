jest.mock('@/utils/date', () => ({
  formatDate: jest.fn(() => '25/03/2026'),
  formatClockTime: jest.fn(() => '11:54'),
  formatDateTime: jest.fn(() => '25/03/2026, 11:54'),
}));

jest.mock('@/utils/url', () => ({
  toPublicUrl: jest.fn((path?: string | null) => (path ? `public:${path}` : 'public:placeholder')),
  toSizedImageUrl: jest.fn((path?: string | null, _extension?: string | null, size?: string) => {
    if (!path) return undefined;
    return `sized:${path.replace('*', size ?? 'orig')}`;
  }),
}));

jest.mock('@/utils/adapter/order/orderStatusMapper', () => ({
  getStatusDisplay: jest.fn(() => ({
    label: 'Created',
    color: '#111111',
    bgColor: '#eeeeee',
    icon: 'clock',
  })),
}));

import type { Order } from '@/types/order/order';
import { OrderDetailApiResponseSchema } from '@/types/order/orderSchema';
import { transformOrder } from '@/utils/adapter/order/orderAdapter';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';

const mockedToPublicUrl = jest.mocked(toPublicUrl);
const mockedToSizedImageUrl = jest.mocked(toSizedImageUrl);
const mockedGetStatusDisplay = jest.mocked(getStatusDisplay);

const createOrder = (overrides: Partial<Order> = {}): Order => ({
  orderId: '824506622667345920',
  orderNumber: 'ORD-MN5KKSP8-BA37',
  shopId: 'ff9e495e-5267-4c86-b284-64b4ca6971cf',
  currency: 'VND',
  shopInfo: {
    shopName: 'TAP HOA IT',
    logoUrl: null,
    logoPath: 'public/shops/logos/2026/02/806097597839532032_*.jpg',
    userId: '331c5916-03e9-456c-ba50-cf2a952b8be2',
  },
  status: 'CREATED',
  statusRaw: 'CREATED',
  pricing: {
    subtotal: 1000000,
    shopDiscount: 50000,
    platformDiscount: 150000,
    shippingDiscount: 0,
    appliedVoucherCodes: 'SHOPTEST2026PROD,TEST_FLATFROM2',
    totalDiscount: 200000,
    taxAmount: 0,
    shippingFee: 36002,
    grandTotal: 836002,
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
  createdDate: '2026-03-25T04:54:57.437041Z',
  items: [
    {
      itemId: '824506622679928832',
      productId: '814689195781955584',
      variantId: '814689196763422720',
      sku: 'CV(ND-5K',
      productName: 'caffee Viet',
      imagePath: 'public/products/2026/02/814688600442445824_*.png',
      variantAttributes: null,
      unitPrice: 1000000,
      quantity: 1,
      discountAmount: 0,
      lineTotal: 1000000,
      reviewed: false,
    },
  ],
  ...overrides,
});

describe('order detail shop logo flow', () => {
  beforeEach(() => {
    mockedToPublicUrl.mockClear();
    mockedToSizedImageUrl.mockClear();
    mockedGetStatusDisplay.mockClear();
  });

  it('keeps shop logoPath after schema validation', () => {
    const parsed = OrderDetailApiResponseSchema.parse({
      code: 1000,
      success: true,
      message: 'Order retrieved successfully',
      data: createOrder(),
      timestamp: '2026-03-25T04:59:37.508254745Z',
    });

    expect(parsed.data.shopInfo?.logoPath).toBe(
      'public/shops/logos/2026/02/806097597839532032_*.jpg'
    );
  });

  it('builds shopLogoUrl from wildcard logoPath using thumb size', () => {
    const result = transformOrder(createOrder());

    expect(mockedToSizedImageUrl).toHaveBeenCalledWith(
      'public/shops/logos/2026/02/806097597839532032_*.jpg',
      null,
      'thumb'
    );
    expect(result.shopLogoUrl).toBe(
      'sized:public/shops/logos/2026/02/806097597839532032_thumb.jpg'
    );
    expect(result.currency).toBe('VND');
  });

  it('keeps backend currency for multi-currency orders', () => {
    const parsed = OrderDetailApiResponseSchema.parse({
      code: 1000,
      success: true,
      message: 'Order retrieved successfully',
      data: createOrder({ currency: 'usd' }),
      timestamp: '2026-03-25T04:59:37.508254745Z',
    });

    const result = transformOrder(parsed.data);

    expect(parsed.data.currency).toBe('USD');
    expect(result.currency).toBe('USD');
  });

  it('falls back to logoUrl when sized conversion returns undefined', () => {
    mockedToSizedImageUrl.mockReturnValueOnce(undefined);

    const result = transformOrder(
      createOrder({
        shopInfo: {
          shopName: 'TAP HOA IT',
          logoUrl: 'public/shops/logos/2026/02/shop-logo.jpg',
          logoPath: null,
          userId: '331c5916-03e9-456c-ba50-cf2a952b8be2',
        },
      })
    );

    expect(mockedToSizedImageUrl).toHaveBeenCalledWith(
      'public/shops/logos/2026/02/shop-logo.jpg',
      null,
      'thumb'
    );
    expect(mockedToPublicUrl).toHaveBeenCalledWith('public/shops/logos/2026/02/shop-logo.jpg');
    expect(result.shopLogoUrl).toBe('public:public/shops/logos/2026/02/shop-logo.jpg');
  });

  it('passes statusRaw to status display for unknown statuses', () => {
    transformOrder(
      createOrder({
        status: 'UNKNOWN_STATUS',
        statusRaw: 'UNDER_REVIEW',
      })
    );

    expect(mockedGetStatusDisplay).toHaveBeenCalledWith('UNKNOWN_STATUS', 'UNDER_REVIEW');
  });
});
