require('ts-node/register');
const packageJson = require('./package.json');


// Helper to load plugins (supports both CJS and ESM via ts-node)
const loadPlugin = (path) => {
    const plugin = require(path);
    return plugin.default || plugin;
};

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

module.exports = {
    "expo": {
        "name": IS_DEV ? "CanoX (Dev)" : (IS_PREVIEW ? "CanoX (Preview)" : "CanoX"),
        "slug": "canox",
        "version": packageJson.version,
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "canox",
        "userInterfaceStyle": "light",
        "newArchEnabled": true,
        "splash": {
            "image": "./assets/images/splash-logo.png",
            "resizeMode": "contain",
            "backgroundColor": "#f6f6f6"
        },
        "runtimeVersion": packageJson.version,
        "updates": {
            "url": "https://u.expo.dev/34490ad6-6863-455c-bac8-4ee18be1a9a0",
            "enabled": true,
            "checkOnLaunch": "ALWAYS",
            "fallbackToCacheTimeout": 3000
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": IS_DEV ? "com.cano.canox.dev" : (IS_PREVIEW ? "com.cano.canox.preview" : "com.cano.canox"),
            "googleServicesFile": IS_DEV
                ? "./google-services/GoogleService-Info.dev.plist"
                : (IS_PREVIEW
                    ? "./google-services/GoogleService-Info.preview.plist"
                    : "./google-services/GoogleService-Info.production.plist"),
            "infoPlist": {
                "ITSAppUsesNonExemptEncryption": false
            }
        },
        "android": {
            "icon": "./assets/images/icon-android.png",
            "adaptiveIcon": {
                // "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
                // "backgroundColor": "#ef4444",
                "foregroundImage": "./assets/images/adaptive-icon-foreground2.png",
                "backgroundColor": "#ffffff",
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
            // loadPlugin("./plugins/withFirebaseiOSFix"),
            loadPlugin("./plugins/withDisableLint"),
            loadPlugin("./plugins/withAndroid16KB"),
            [
                "expo-notifications",
                {
                    "icon": "./assets/images/notification-icon2.png",
                    "color": "#ef4444"
                }
            ],
            "expo-router",
            "expo-video",
            "expo-localization",
            "@react-native-firebase/app",
            "@react-native-firebase/messaging",
            "@react-native-firebase/crashlytics",
            "@react-native-firebase/perf",
            [
                "expo-build-properties",
                {
                    "ios": {
                        "useFrameworks": "static",
                        "forceStaticLinking": [
                            "RNFBApp",
                            "RNFBMessaging",
                            "RNFBCrashlytics",
                            "RNFBPerf",
                            "RNFBAnalytics",
                            "RNFBRemoteConfig"
                        ]
                    }
                }
            ],
            [
                "@react-native-google-signin/google-signin",
                {
                    "iosUrlScheme": "com.googleusercontent.apps.521840324498-qqjs0eje1gl67opcksp8e7rtsvs338d6"
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
