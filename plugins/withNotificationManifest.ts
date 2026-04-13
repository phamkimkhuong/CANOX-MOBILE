import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';

const withNotificationManifestFix: ConfigPlugin = (config) => {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults.manifest;
        const mainApplication = manifest.application?.[0];

        if (!mainApplication) {
            return config;
        }

        const manifestAttrs = (manifest.$ ?? {}) as Record<string, string>;
        manifestAttrs['xmlns:tools'] = 'http://schemas.android.com/tools';
        manifest.$ = manifestAttrs as any;
        const conflictingKeys = [
            'com.google.firebase.messaging.default_notification_color',
            'com.google.firebase.messaging.default_notification_icon',
        ];

        const metaDataArray: any[] = mainApplication['meta-data'] ?? [];

        let patchCount = 0;
        for (const metaData of metaDataArray) {
            const attrs = metaData?.$;
            if (!attrs) continue;

            const name = attrs['android:name'];
            if (name && conflictingKeys.includes(name)) {
                attrs['tools:replace'] = 'android:resource';
                patchCount++;
            }
        }

        if (patchCount === 0) {
            metaDataArray.push(
                {
                    $: {
                        'android:name': 'com.google.firebase.messaging.default_notification_color',
                        'android:resource': '@color/notification_icon_color',
                        'tools:replace': 'android:resource',
                    },
                },
                {
                    $: {
                        'android:name': 'com.google.firebase.messaging.default_notification_icon',
                        'android:resource': '@drawable/notification_icon',
                        'tools:replace': 'android:resource',
                    },
                }
            );
            mainApplication['meta-data'] = metaDataArray;
        }

        return config;
    });
};

export default withNotificationManifestFix;
