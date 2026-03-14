const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const customBlockList = [
  /.*[\\/]__tests__[\\/].*/,
  /.*[\\/]test-utils[\\/].*/,
  /.*\.(test|spec)\.(js|jsx|ts|tsx)$/,
];

const existingBlockList = config.resolver.blockList ?? [];
config.resolver.blockList = Array.isArray(existingBlockList)
  ? [...existingBlockList, ...customBlockList]
  : [existingBlockList, ...customBlockList];

module.exports = config;
