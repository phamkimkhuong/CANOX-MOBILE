const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Add metadata for Firebase Notification Icon and Color
 */
const withNotificationMetadata = (config, { iconColor }) => {
    return withAndroidManifest(config, (config) => {
        const mainApplication = config.modResults.manifest.application[0];

        // Add icon metadata
        const iconMetadataName = 'com.google.firebase.messaging.default_notification_icon';
        const iconMetadataValue = '@drawable/notification_icon';

        // Remove old if any to avoid duplication
        mainApplication['meta-data'] = mainApplication['meta-data'] || [];
        mainApplication['meta-data'] = mainApplication['meta-data'].filter(
            (m) => m.$['android:name'] !== iconMetadataName
        );

        mainApplication['meta-data'].push({
            $: {
                'android:name': iconMetadataName,
                'android:resource': iconMetadataValue,
            },
        });

        // Add color metadata
        const colorMetadataName = 'com.google.firebase.messaging.default_notification_color';
        if (iconColor) {
            mainApplication['meta-data'] = mainApplication['meta-data'].filter(
                (m) => m.$['android:name'] !== colorMetadataName
            );
            mainApplication['meta-data'].push({
                $: {
                    'android:name': colorMetadataName,
                    'android:resource': '@color/notification_icon_color',
                },
            });
        }

        return config;
    });
};

/**
 * Copy file icon to drawable folder of Android
 */
const withNotificationAssets = (config, { iconPath }) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const resDir = path.join(projectRoot, 'android/app/src/main/res');
            // Copy icon sang drawable-mdpi
            const drawableDir = path.join(resDir, 'drawable');
            if (!fs.existsSync(drawableDir)) {
                fs.mkdirSync(drawableDir, { recursive: true });
            }

            const sourcePath = path.resolve(projectRoot, iconPath);
            const destPath = path.join(drawableDir, 'notification_icon.png');

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
            }

            return config;
        },
    ]);
};

/**
 * Define color in strings.xml or colors.xml
 */
const withNotificationColorResource = (config, { iconColor }) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const colorsXmlPath = path.join(projectRoot, 'android/app/src/main/res/values/colors.xml');

            if (fs.existsSync(colorsXmlPath) && iconColor) {
                let colorsXml = fs.readFileSync(colorsXmlPath, 'utf8');
                const colorTag = `<color name="notification_icon_color">${iconColor}</color>`;

                if (!colorsXml.includes('name="notification_icon_color"')) {
                    colorsXml = colorsXml.replace('</resources>', `    ${colorTag}\n</resources>`);
                    fs.writeFileSync(colorsXmlPath, colorsXml);
                }
            }
            return config;
        }
    ]);
};

module.exports = (config, props) => {
    config = withNotificationMetadata(config, props);
    config = withNotificationAssets(config, props);
    config = withNotificationColorResource(config, props);
    return config;
};
