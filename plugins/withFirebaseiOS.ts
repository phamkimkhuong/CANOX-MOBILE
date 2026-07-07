import { ConfigPlugin, withDangerousMod } from 'expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Expo Config Plugin to fix "include of non-modular header inside framework module"
 * error when using @react-native-firebase with useFrameworks: 'static' on iOS.
 *
 * @see https://github.com/expo/expo/issues/39607
 * @see https://github.com/invertase/react-native-firebase/issues/8657
 */

/** Only patch the RNFB targets we actually use in this project */
const RNFB_TARGETS = [
    'RNFBApp',
    'RNFBMessaging',
    'RNFBAnalytics',
    'RNFBRemoteConfig',
];

const withFirebaseiOSFix: ConfigPlugin = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            // Use platformProjectRoot as recommended by Expo docs for Podfile mods
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

            if (!fs.existsSync(podfilePath)) {
                return config;
            }

            let podfileContent = fs.readFileSync(podfilePath, 'utf8');

            // Build the Ruby target name filter
            const targetList = RNFB_TARGETS.map((t) => `'${t}'`).join(', ');

            const patch = `
    # [withFirebaseiOSFix] Allow non-modular headers for RNFB targets only (Expo #39607)
    installer.pods_project.targets.each do |target|
      next unless [${targetList}].include?(target.name)

      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
`;

            // Avoid duplicate patches
            if (!podfileContent.includes('withFirebaseiOSFix')) {
                if (podfileContent.includes('post_install do |installer|')) {
                    // Inject into existing post_install block
                    podfileContent = podfileContent.replace(
                        /post_install do \|installer\|/,
                        `post_install do |installer|${patch}`
                    );
                } else {
                    // Append a new post_install block
                    podfileContent += `\npost_install do |installer|${patch}end\n`;
                }

                fs.writeFileSync(podfilePath, podfileContent);
            }

            return config;
        },
    ]);
};

export default withFirebaseiOSFix;
