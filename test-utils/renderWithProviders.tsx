import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react-native';
import {
  renderRouter,
  type MockContextConfig,
  type RenderRouterOptions,
} from 'expo-router/testing-library';
import i18next, { type i18n as I18nInstance, type Resource } from 'i18next';
import React, { type PropsWithChildren } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

type WrapperComponent = React.ComponentType<PropsWithChildren>;

type ProviderOverrides = {
  queryClient?: QueryClient;
  i18n?: I18nInstance;
  locale?: 'en' | 'vi';
};

export type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> &
  ProviderOverrides & {
    wrapper?: WrapperComponent;
  };

export type RenderRouterWithProvidersOptions = Omit<
  RenderRouterOptions,
  'wrapper'
> &
  ProviderOverrides & {
    wrapper?: WrapperComponent;
  };

const defaultMessages: Resource = {
  en: {
    common: {
      status: {
        loading: 'Loading...',
      },
      actions: {
        save: 'Save',
      },
    },
  },
  vi: {
    common: {
      status: {
        loading: 'Dang tai...',
      },
      actions: {
        save: 'Luu',
      },
    },
  },
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const createTestI18n = (locale: 'en' | 'vi' = 'en'): I18nInstance => {
  const instance = i18next.createInstance();

  void instance.use(initReactI18next).init({
    resources: defaultMessages,
    lng: locale,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

  return instance;
};

const createProvidersWrapper = ({
  queryClient = createTestQueryClient(),
  i18n = createTestI18n(),
}: ProviderOverrides): WrapperComponent => {
  return function ProvidersWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </QueryClientProvider>
    );
  };
};

const combineWrappers = (
  providersWrapper: WrapperComponent,
  customWrapper?: WrapperComponent
): WrapperComponent => {
  if (!customWrapper) {
    return providersWrapper;
  }

  return function CombinedWrapper({ children }: PropsWithChildren) {
    const ProvidersWrapper = providersWrapper;
    const CustomWrapper = customWrapper;

    return (
      <ProvidersWrapper>
        <CustomWrapper>{children}</CustomWrapper>
      </ProvidersWrapper>
    );
  };
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult => {
  const {
    queryClient,
    i18n,
    locale = 'en',
    wrapper,
    ...renderOptions
  } = options;

  const providersWrapper = createProvidersWrapper({
    queryClient,
    i18n: i18n ?? createTestI18n(locale),
  });

  return render(ui, {
    wrapper: combineWrappers(providersWrapper, wrapper),
    ...renderOptions,
  });
};

export const renderRouterWithProviders = (
  context: MockContextConfig = './app',
  options: RenderRouterWithProvidersOptions = {}
) => {
  const {
    queryClient,
    i18n,
    locale = 'en',
    wrapper,
    ...routerOptions
  } = options;

  const providersWrapper = createProvidersWrapper({
    queryClient,
    i18n: i18n ?? createTestI18n(locale),
  });

  return renderRouter(context, {
    wrapper: combineWrappers(providersWrapper, wrapper),
    ...routerOptions,
  });
};
