import i18n from '@/constants/i18n';
import {
  ORDER_TABS,
  getStatusDisplay,
  getTabColor,
} from '@/utils/adapter/order/orderStatusMapper';

describe('orderStatusMapper', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('vi');
  });

  it('renders raw backend value for unknown statuses', () => {
    const display = getStatusDisplay('UNKNOWN_STATUS', 'UNDER_REVIEW');

    expect(display.label).toBe('UNKNOWN: UNDER_REVIEW');
    expect(display.icon).toBe('warning');
  });

  it('keeps known statuses human-readable without unknown prefix', () => {
    const display = getStatusDisplay('PAID', 'PAID');

    expect(display.label).toBe('Đã thanh toán');
  });

  it('includes ALL and RETURN_REFUND tabs with expected API keys', () => {
    expect(ORDER_TABS[0]).toMatchObject({
      key: 'ALL',
      apiStatus: 'ALL',
    });
    expect(ORDER_TABS.find((tab) => tab.key === 'RETURN_REFUND')).toMatchObject({
      key: 'RETURN_REFUND',
      apiStatus: 'RETURN_REFUND',
    });
    expect(getTabColor('ALL')).toBe('#6b7280');
  });
});
