import type { OrderUI } from '@/types/order/order';
import {
  canRequestReturn,
  getReturnRequestDeadline,
  getOrderActions,
  isReturnRequestWindowOpen,
} from '@/utils/adapter/order/orderActions';

const createOrderUI = (overrides: Partial<OrderUI> = {}): OrderUI => ({
  orderId: '819513200969129984',
  orderNumber: 'ORD-MMLVRPG2-D11E',
  shopId: '7bbb7677-7024-41c7-82a9-945154acc569',
  shopUserId: 'c496aabb-159c-40d1-b2c9-b4c99392192a',
  shopName: 'Nệm cao su',
  shopLogoUrl: null,
  status: 'DELIVERED',
  statusRaw: 'DELIVERED',
  currency: 'VND',
  statusDisplay: {
    label: 'Đã giao',
    color: '#111111',
    bgColor: '#eeeeee',
    icon: 'shippingbox',
  },
  formattedDate: '25/03/2026',
  formattedTime: '10:10',
  formattedPlacedAt: '25/03/2026, 10:10',
  deliveredAt: '2026-03-25T00:00:00.000Z',
  subtotal: 840000,
  shopDiscount: 0,
  platformDiscount: 0,
  shippingDiscount: 0,
  loyaltyDiscount: 0,
  platformLoyaltyDiscount: 0,
  totalDiscount: 0,
  taxAmount: 0,
  shippingFee: 21001,
  grandTotal: 861001,
  pointsEarned: 0,
  platformPointsEarned: 0,
  items: [
    {
      itemId: '819513201183039488',
      productId: '809699926020116480',
      variantId: '809699928729636864',
      sku: 'RVĐPC-VA',
      productName: 'Rượu vang đỏ Pháp Chateau Haut-Bages Monpelou',
      imageUrl: 'https://example.com/thumb.jpg',
      variantAttributes: 'vang đỏ',
      unitPrice: 840000,
      quantity: 1,
      lineTotal: 840000,
      reviewed: false,
    },
  ],
  itemCount: 1,
  totalQuantity: 1,
  trackingNumber: null,
  carrier: null,
  carrierName: null,
  paymentMethod: 'COD',
  paymentUrl: null,
  paymentMethodDisplay: 'Thanh toán khi nhận hàng',
  returnInfo: null,
  recipientName: 'Nguyễn Văn A',
  phoneNumber: '0961415400',
  fullAddress: 'Độc Lập, Lê Quý Đôn, Hưng Yên',
  customerNote: null,
  cancellationReason: null,
  ...overrides,
});

describe('orderActions return window', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-31T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows return action for delivered orders within 7 days from deliveredAt', () => {
    const actions = getOrderActions(
      createOrderUI({
        deliveredAt: '2026-03-25T00:00:00.000Z',
      })
    );

    expect(actions.map((action) => action.action)).toEqual(['return', 'received']);
    expect(canRequestReturn(createOrderUI())).toBe(true);
    expect(getReturnRequestDeadline('2026-03-25T00:00:00.000Z')?.toISOString()).toBe(
      '2026-04-01T00:00:00.000Z'
    );
  });

  it('hides return action once the 7-day return window reaches its deadline', () => {
    const order = createOrderUI({
      deliveredAt: '2026-03-24T00:00:00.000Z',
    });

    expect(isReturnRequestWindowOpen(order.deliveredAt)).toBe(false);
    expect(canRequestReturn(order)).toBe(false);
    expect(getOrderActions(order).map((action) => action.action)).toEqual(['received']);
  });

  it('hides return action when deliveredAt is missing because the return window cannot be proven', () => {
    const order = createOrderUI({
      deliveredAt: null,
    });

    expect(canRequestReturn(order)).toBe(false);
    expect(getOrderActions(order).map((action) => action.action)).toEqual(['received']);
  });

  it('requires deliveredAt even when only a DELIVERED status string is available', () => {
    expect(canRequestReturn('DELIVERED')).toBe(false);
    expect(canRequestReturn('DELIVERED', '2026-03-25T00:00:00.000Z')).toBe(true);
    expect(getOrderActions('DELIVERED').map((action) => action.action)).toEqual(['received']);
  });
});
