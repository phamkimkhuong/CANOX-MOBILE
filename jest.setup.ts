import 'react-native-gesture-handler/jestSetup';

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
