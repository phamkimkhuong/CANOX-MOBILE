const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

module.exports = {
    "expo": {
        "name": IS_DEV ? "CanoX (Dev)" : (IS_PREVIEW ? "CanoX (Preview)" : "CanoX"),
        "slug": "ebay",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "ebay",
        "userInterfaceStyle": "light",
        "newArchEnabled": true,
        "splash": {
            "image": "./assets/images/splash-icon.png",
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": IS_DEV ? "com.calatha.canox.dev" : (IS_PREVIEW ? "com.calatha.canox.preview" : "com.calatha.canox")
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
                "backgroundColor": "#1e5bc6",
                "monochromeImage": "./assets/images/monochrome-icon.png"
            },
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false,
            "package": IS_DEV ? "com.calatha.canox.dev" : (IS_PREVIEW ? "com.calatha.canox.preview" : "com.calatha.canox")
        },
        "web": {
            "bundler": "metro",
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router",
            "expo-video",
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
                "projectId": "03816dba-37ae-4afa-8018-ac44237ae740"
            }
        }
    }
};
