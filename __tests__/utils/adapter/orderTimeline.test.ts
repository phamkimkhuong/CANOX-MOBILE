import i18n from '@/constants/i18n';
import {
  buildOrderLifecycleEvents,
  buildOrderLifecycleSummary,
  canShowLifecycleTimeline,
  getAbnormalStatusMessage,
  isAbnormalStatus,
} from '@/utils/adapter/order/orderTimeline';

describe('orderTimeline', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('vi');
  });

  it('builds a delivered summary from the delivered milestone instead of the paid event', () => {
    const summary = buildOrderLifecycleSummary('DELIVERED', {
      createdDate: '2026-03-11T10:12:52.967123Z',
      paidAt: '2026-03-20T10:10:48.766560Z',
      confirmedAt: '2026-03-13T07:30:48.230235Z',
      shippedAt: '2026-03-20T10:10:48.567157Z',
      deliveredAt: '2026-03-20T10:10:48.766560Z',
      completedAt: null,
    });

    expect(summary).toEqual(
      expect.objectContaining({
        title: 'Đơn hàng đã được giao tới bạn',
        timestamp: '2026-03-20T10:10:48.766560Z',
        icon: 'shippingbox',
      })
    );
  });

  it('shows only occurred events and keeps paid as a secondary event', () => {
    const events = buildOrderLifecycleEvents('DELIVERED', {
      createdDate: '2026-03-11T10:12:52.967123Z',
      paidAt: '2026-03-20T10:10:48.766560Z',
      confirmedAt: '2026-03-13T07:30:48.230235Z',
      shippedAt: '2026-03-20T10:10:48.567157Z',
      deliveredAt: '2026-03-20T10:10:48.766560Z',
      completedAt: null,
    });

    expect(events.map((event) => event.key)).toEqual([
      'CREATED',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'PAID',
    ]);
    expect(events.find((event) => event.key === 'DELIVERED')?.isCurrent).toBe(true);
    expect(events.find((event) => event.key === 'PAID')).toEqual(
      expect.objectContaining({
        kind: 'secondary',
        isCurrent: false,
      })
    );
  });

  it('marks completed as the latest primary milestone only when completedAt exists', () => {
    const events = buildOrderLifecycleEvents('COMPLETED', {
      createdDate: '2026-02-26T02:28:53.205018Z',
      confirmedAt: '2026-02-26T09:39:02.511270Z',
      shippedAt: '2026-02-26T09:39:10.710949Z',
      deliveredAt: '2026-02-26T09:39:19.483356Z',
      completedAt: '2026-02-26T09:46:29.899286Z',
    });

    expect(events.at(-1)).toEqual(
      expect.objectContaining({
        key: 'COMPLETED',
        isCurrent: true,
      })
    );
  });

  it('treats return/refund statuses as abnormal until after-sales timeline is modeled', () => {
    expect(isAbnormalStatus('RETURN_REQUESTED')).toBe(true);
    expect(canShowLifecycleTimeline('RETURN_REQUESTED')).toBe(false);
  });

  it('shows raw backend status in abnormal message for unknown statuses', () => {
    expect(getAbnormalStatusMessage('UNKNOWN_STATUS', 'UNDER_REVIEW')).toBe(
      'UNKNOWN: UNDER_REVIEW'
    );
  });
});
