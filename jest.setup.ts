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

