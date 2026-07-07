module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['babel-preset-expo', {
                reanimated: {
                    enableWorkletsBundleMode: true,
                },
            }]
        ],
        plugins: [
            ['react-native-unistyles/plugin', { root: __dirname }]
        ],
    };
};