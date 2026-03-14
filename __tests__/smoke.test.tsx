import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { renderRouterWithProviders, renderWithProviders } from '@/test-utils/renderWithProviders';

const SmokeProbe = () => {
  const { t } = useTranslation('common');
  const { data } = useQuery({
    queryKey: ['smoke-query'],
    queryFn: async () => 'ok',
  });

  if (!data) {
    return <Text>{t('status.loading')}</Text>;
  }

  return (
    <Text>
      {t('actions.save')}:{data}
    </Text>
  );
};

describe('testing setup smoke', () => {
  it('renders with QueryClient + i18n providers', async () => {
    renderWithProviders(<SmokeProbe />);

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(await screen.findByText('Save:ok')).toBeTruthy();
  });

  it('renders Expo Router context with shared providers', () => {
    const result = renderRouterWithProviders({
      '/index': () => <Text>Router Ready</Text>,
    });

    expect(screen.getByText('Router Ready')).toBeTruthy();
    expect(result.getPathname()).toBe('/');
  });
});
