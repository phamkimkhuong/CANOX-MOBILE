import * as ConfigPlugins from 'expo/config-plugins';
import { ConfigPlugin } from 'expo/config-plugins';

/**
 * Plugin to disable Android Lint tasks which frequently fail on Windows
 * due to file locking issues during 'lintVitalAnalyzeRelease'.
 */
const withDisableLint: ConfigPlugin = (config) => {
    return ConfigPlugins.withAppBuildGradle(config, (config) => {
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

export default withDisableLint;
