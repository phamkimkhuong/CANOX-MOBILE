const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

module.exports = {
    "expo": {
        "name": IS_DEV ? "CanoX (Dev)" : (IS_PREVIEW ? "CanoX (Preview)" : "CanoX"),
        "slug": "canox",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "canox",
        "userInterfaceStyle": "light",
        "newArchEnabled": true,
        "splash": {
            "image": "./assets/images/splash-icon.png",
            "resizeMode": "contain",
            "backgroundColor": "#f6f6f6"
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": IS_DEV ? "com.cano.canox.dev" : (IS_PREVIEW ? "com.cano.canox.preview" : "com.cano.canox")
        },
        "android": {
            "icon": "./assets/images/icon-android.png",
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
                "backgroundColor": "#ef4444",
                "monochromeImage": "./assets/images/monochrome-icon.png"
            },
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false,
            "package": IS_DEV ? "com.cano.canox.dev" : (IS_PREVIEW ? "com.cano.canox.preview" : "com.cano.canox"),
            "googleServicesFile": IS_DEV
                ? "./google-services/google-services.dev.json"
                : (IS_PREVIEW
                    ? "./google-services/google-services.preview.json"
                    : "./google-services/google-services.production.json")
        },

        "plugins": [
            "expo-router",
            "expo-video",
            "expo-localization",
            "@react-native-firebase/app",
            "@react-native-firebase/messaging",
            [
                "@react-native-google-signin/google-signin",
                {
                    "iosUrlScheme": "com.googleusercontent.apps.521840324498-qqjs0eje1gl67opcksp8e7rtsvs338d6"
                }
            ],
            [
                "expo-notifications",
                {
                    "icon": "./assets/images/notification-icon.png",
                    "color": "#ef4444",
                    "defaultChannel": "default"
                }
            ]
        ],
        "experiments": {
            "typedRoutes": true
        },
        "extra": {
            "router": {},
            "eas": {
                "projectId": "34490ad6-6863-455c-bac8-4ee18be1a9a0"
            }
        }
    }
};
