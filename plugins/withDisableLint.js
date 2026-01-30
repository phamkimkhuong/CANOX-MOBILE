const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Plugin to disable Android Lint tasks which frequently fail on Windows
 * due to file locking issues during 'lintVitalAnalyzeRelease'.
 */
const withDisableLint = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const disableLintConfig = `
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
        disable 'MissingTranslation'
        checkDependencies false
    }
`;
            if (!config.modResults.contents.includes('lintOptions')) {
                config.modResults.contents = config.modResults.contents.replace(
                    /android\s*{/,
                    `android {${disableLintConfig}`
                );
            }
        }
        return config;
    });
};

module.exports = withDisableLint;
