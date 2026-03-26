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
    expect(getTimelineProgress('PAID')).toBe(50);

    const steps = generateTimeline('PAID', '2026-03-26T02:28:33.986913871Z');
    expect(steps).toHaveLength(4);
    expect(steps[1].isActive).toBe(true);
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
