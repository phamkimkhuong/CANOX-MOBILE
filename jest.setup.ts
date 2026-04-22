import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => { };
  return Reanimated;
});

if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  delete globalThis.ReadableStream;
  if (typeof global !== 'undefined') {
    // @ts-ignore
    delete global.ReadableStream;
  }
}
