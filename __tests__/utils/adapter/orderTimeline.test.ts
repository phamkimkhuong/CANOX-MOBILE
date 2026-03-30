import i18n from '@/constants/i18n';
import {
  canShowTimeline,
  generateTimeline,
  getAbnormalStatusMessage,
  getCurrentStepIndex,
  getTimelineProgress,
  isAbnormalStatus,
} from '@/utils/adapter/order/orderTimeline';

describe('orderTimeline', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('vi');
  });

  it('keeps normal known statuses on the main timeline', () => {
    expect(getCurrentStepIndex('PAID')).toBe(1);
    expect(getTimelineProgress('PAID')).toBe(40);

    const steps = generateTimeline('PAID', {
      createdDate: '2026-03-26T02:28:33.986913871Z',
      confirmedAt: '2026-03-26T03:00:00.000000Z',
    });
    expect(steps).toHaveLength(5);
    expect(steps[1].isActive).toBe(true);
    expect(steps[0].time).toBe('2026-03-26T02:28:33.986913871Z');
    expect(steps[1].time).toBe('2026-03-26T03:00:00.000000Z');
  });

  it('keeps delivered separate from completed in the lifecycle tracker', () => {
    const deliveredSteps = generateTimeline('DELIVERED', {
      createdDate: '2026-03-11T10:12:52.967123Z',
      confirmedAt: '2026-03-13T07:30:48.230235Z',
      shippedAt: '2026-03-20T10:10:48.567157Z',
      deliveredAt: '2026-03-20T10:10:48.766560Z',
      completedAt: null,
    });

    expect(getCurrentStepIndex('DELIVERED')).toBe(3);
    expect(getTimelineProgress('DELIVERED')).toBe(80);
    expect(deliveredSteps[3].isActive).toBe(true);
    expect(deliveredSteps[4].isActive).toBe(false);
    expect(deliveredSteps[3].time).toBe('2026-03-20T10:10:48.766560Z');
    expect(deliveredSteps[4].time).toBeNull();
  });

  it('only marks the final milestone when the order is actually completed', () => {
    const steps = generateTimeline('COMPLETED', {
      createdDate: '2026-02-26T02:28:53.205018Z',
      confirmedAt: '2026-02-26T09:39:02.511270Z',
      shippedAt: '2026-02-26T09:39:10.710949Z',
      deliveredAt: '2026-02-26T09:39:19.483356Z',
      completedAt: '2026-02-26T09:46:29.899286Z',
    });

    expect(getCurrentStepIndex('COMPLETED')).toBe(4);
    expect(getTimelineProgress('COMPLETED')).toBe(100);
    expect(steps[4].isActive).toBe(true);
    expect(steps[4].time).toBe('2026-02-26T09:46:29.899286Z');
  });

  it('treats unknown statuses as abnormal and hides the normal timeline', () => {
    expect(isAbnormalStatus('UNKNOWN_STATUS')).toBe(true);
    expect(canShowTimeline('UNKNOWN_STATUS')).toBe(false);
    expect(generateTimeline('UNKNOWN_STATUS')).toEqual([]);
  });

  it('shows raw backend status in abnormal message for unknown statuses', () => {
    expect(getAbnormalStatusMessage('UNKNOWN_STATUS', 'UNDER_REVIEW')).toBe(
      'UNKNOWN: UNDER_REVIEW'
    );
  });
});
