import * as ConfigPlugins from '@expo/config-plugins';
import { ConfigPlugin } from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

interface NotificationIconProps {
    iconPath: string;
    iconColor?: string;
}

interface AndroidManifestMetadata {
    $: {
        'android:name': string;
        'android:resource'?: string;
        'android:value'?: string;
        'tools:replace'?: string;
    };
}

interface AndroidColor {
    $: {
        name: string;
    };
    _: string;
}

const withNotificationMetadata: ConfigPlugin<NotificationIconProps> = (config, { iconColor }) => {
    return ConfigPlugins.withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        const mainApplication = manifest.application?.[0];

        if (!mainApplication) {
            return config;
        }

        // Ensure tools namespace exists
        if (!manifest.$['xmlns:tools']) {
            manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        const iconMetadataName = 'com.google.firebase.messaging.default_notification_icon';
        const colorMetadataName = 'com.google.firebase.messaging.default_notification_color';

        // Ensure meta-data is an array
        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        // Filter out old entries
        mainApplication['meta-data'] = (mainApplication['meta-data'] as AndroidManifestMetadata[]).filter(
            (m) => m.$['android:name'] !== iconMetadataName && m.$['android:name'] !== colorMetadataName
        );

        // Add Icon meta-data
        mainApplication['meta-data'].push({
            $: {
                'android:name': iconMetadataName,
                'android:resource': '@drawable/notification_icon',
                'tools:replace': 'android:resource',
            },
        } as AndroidManifestMetadata);

        // Add Color meta-data
        if (iconColor) {
            mainApplication['meta-data'].push({
                $: {
                    'android:name': colorMetadataName,
                    'android:resource': '@color/notification_icon_color',
                    'tools:replace': 'android:resource',
                },
            } as AndroidManifestMetadata);
        }

        return config;
    });
};

const withNotificationAssets: ConfigPlugin<NotificationIconProps> = (config, { iconPath }) => {
    return ConfigPlugins.withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const resDir = path.join(projectRoot, 'android/app/src/main/res');
            const drawableDir = path.join(resDir, 'drawable');

            if (!fs.existsSync(drawableDir)) {
                fs.mkdirSync(drawableDir, { recursive: true });
            }

            const sourcePath = path.resolve(projectRoot, iconPath);
            const destPath = path.join(drawableDir, 'notification_icon.png');

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
            } else {
                console.warn(`[withNotificationIcon] Source icon not found at: ${sourcePath}`);
            }

            return config;
        },
    ]);
};

const withNotificationColor: ConfigPlugin<NotificationIconProps> = (config, { iconColor }) => {
    return ConfigPlugins.withAndroidColors(config, (config) => {
        if (iconColor) {
            if (!config.modResults.resources) {
                config.modResults.resources = { color: [] };
            }
            if (!config.modResults.resources.color) {
                config.modResults.resources.color = [];
            }

            const colors = config.modResults.resources.color as AndroidColor[];

            // Clean old color
            config.modResults.resources.color = colors.filter(
                (c) => c.$.name !== 'notification_icon_color'
            );

            // Add new color
            config.modResults.resources.color.push({
                _: iconColor,
                $: { name: 'notification_icon_color' },
            } as AndroidColor);
        }
        return config;
    });
};

const withNotificationIcon: ConfigPlugin<NotificationIconProps> = (config, props) => {
    config = withNotificationMetadata(config, props);
    config = withNotificationAssets(config, props);
    config = withNotificationColor(config, props);
    return config;
};

export default withNotificationIcon;
