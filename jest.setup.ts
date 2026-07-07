process.env.EXPO_PUBLIC_API_URL = 'http://app.test';

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () => {
  return {
    createSerializable: (x: any) => x,
    isWorkletFunction: () => false,
    RuntimeKind: { Main: 1, UI: 2 },
    scheduleOnUI: (fn: any) => fn?.(),
    scheduleOnRN: (fn: any, ...args: any[]) => fn?.(...args),
    serializableMappingCache: new Map(),
    Worklets: {
      createRunInContextFn: () => () => { },
      createRunInJSFn: () => () => { },
    }
  };
});

require('react-native-unistyles/mocks');
require('./constants/unistyles');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => { };
  return Reanimated;
});

if (typeof globalThis !== 'undefined') {
  // @ts-expect-error -- globalThis typings don't include delete for ReadableStream
  delete globalThis.ReadableStream;
  if (typeof global !== 'undefined') {
    // @ts-expect-error -- globalThis typings don't include delete for ReadableStream
    delete global.ReadableStream;
  }
}

import { server } from './__tests__/setup/server';
const isApiContractTest = process.env.RUN_API_CONTRACT_TESTS === 'true';

if (!isApiContractTest) {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getBoolean: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(() => false),
    clearAll: jest.fn(),
  }),
}));

// Mock Firebase modules
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setAnalyticsCollectionEnabled: jest.fn(),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  getMessaging: jest.fn(() => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    onMessage: jest.fn(() => () => {}),
    onTokenRefresh: jest.fn(() => () => {}),
    onNotificationOpenedApp: jest.fn(() => () => {}),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn(),
  })),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  requestPermission: jest.fn(() => Promise.resolve(1)),
  onMessage: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  setBackgroundMessageHandler: jest.fn(),
  unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
  subscribeToTopic: jest.fn(() => Promise.resolve()),
  hasPermission: jest.fn(() => Promise.resolve(1)),
}));

jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: jest.fn(() => ({
    fetchAndActivate: jest.fn(() => Promise.resolve(true)),
    getValue: jest.fn(() => ({ asBoolean: () => false, asString: () => '' })),
    getBoolean: jest.fn(() => false),
    getString: jest.fn(() => ''),
    setConfigSettings: jest.fn(() => Promise.resolve()),
  })),
  fetchAndActivate: jest.fn(() => Promise.resolve(true)),
  getBoolean: jest.fn(() => false),
  getString: jest.fn(() => ''),
  setConfigSettings: jest.fn(() => Promise.resolve()),
}));

