module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['react-native-unistyles/plugin', { root: __dirname }],
            'react-native-worklets/plugin',
            ['react-native-reanimated/plugin', { enableWorkletsBundleMode: true }]
        ],
    };
};