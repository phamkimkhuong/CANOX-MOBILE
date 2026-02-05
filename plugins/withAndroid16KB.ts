import * as ConfigPlugins from '@expo/config-plugins';
import { ConfigPlugin } from '@expo/config-plugins';

/**
 * Plugin auto add config support 16KB Page Size for Android 15+
 */
const withAndroid16KB: ConfigPlugin = (config) => {
    return ConfigPlugins.withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = add16KBSupport(config.modResults.contents);
        }
        return config;
    });
};

function add16KBSupport(content: string): string {
    // if already added, return
    if (content.includes('ANDROID_ALIGNED_16KB')) {
        return content;
    }

    // find defaultConfig and add config
    const searchPattern = /defaultConfig\s?\{/;
    const replacement = `defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DANDROID_ALIGNED_16KB=ON"
            }
        }\n`;

    return content.replace(searchPattern, replacement);
}

export default withAndroid16KB;
