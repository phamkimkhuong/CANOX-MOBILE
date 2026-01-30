const { withDangerousMod, withAndroidManifest, withAndroidColors } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withNotificationMetadata = (config, { iconColor }) => {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        const mainApplication = manifest.application[0];

        // Đảm bảo namespace tools tồn tại để dùng tools:replace
        if (!manifest.$['xmlns:tools']) {
            manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        const iconMetadataName = 'com.google.firebase.messaging.default_notification_icon';
        const colorMetadataName = 'com.google.firebase.messaging.default_notification_color';

        // Đảm bảo meta-data là một mảng
        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        // Loại bỏ các entry cũ để tránh trùng lặp nội bộ
        mainApplication['meta-data'] = mainApplication['meta-data'].filter(
            (m) => m.$['android:name'] !== iconMetadataName && m.$['android:name'] !== colorMetadataName
        );

        // Thêm meta-data cho Icon (Dùng tools:replace để đè lên giá trị của Firebase library)
        mainApplication['meta-data'].push({
            $: {
                'android:name': iconMetadataName,
                'android:resource': '@drawable/notification_icon',
                'tools:replace': 'android:resource',
            },
        });

        // Thêm meta-data cho Color (Dùng tools:replace)
        if (iconColor) {
            mainApplication['meta-data'].push({
                $: {
                    'android:name': colorMetadataName,
                    'android:resource': '@color/notification_icon_color',
                    'tools:replace': 'android:resource',
                },
            });
        }

        return config;
    });
};

/**
 * Copy Asset: Đưa file PNG vào thư mục drawable của Android
 */
const withNotificationAssets = (config, { iconPath }) => {
    return withDangerousMod(config, [
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

/**
 * Tạo Color Resource: Thêm mã màu vào colors.xml
 */
const withNotificationColor = (config, { iconColor }) => {
    return withAndroidColors(config, (config) => {
        if (iconColor) {
            // Đảm bảo cấu trúc XML JSON chuẩn
            if (!config.modResults.resources) {
                config.modResults.resources = { color: [] };
            }
            if (!config.modResults.resources.color) {
                config.modResults.resources.color = [];
            }

            // Xóa mã màu cũ nếu có
            config.modResults.resources.color = config.modResults.resources.color.filter(
                (c) => c.$.name !== 'notification_icon_color'
            );

            // Thêm mã màu mới
            config.modResults.resources.color.push({
                _: iconColor,
                $: { name: 'notification_icon_color' },
            });
        }
        return config;
    });
};

module.exports = (config, props) => {
    config = withNotificationMetadata(config, props);
    config = withNotificationAssets(config, props);
    config = withNotificationColor(config, props);
    return config;
};
