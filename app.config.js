const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

module.exports = {
    "expo": {
        "name": IS_DEV ? "ebay (Dev)" : (IS_PREVIEW ? "ebay (Preview)" : "ebay"),
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
            "bundleIdentifier": IS_DEV ? "com.calatha.ebay.dev" : (IS_PREVIEW ? "com.calatha.ebay.preview" : "com.calatha.ebay")
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false,
            "androidNavigationBar": {
                "barStyle": "dark-content"
            },
            "package": IS_DEV ? "com.calatha.ebay.dev" : (IS_PREVIEW ? "com.calatha.ebay.preview" : "com.calatha.ebay")
        },
        "web": {
            "bundler": "metro",
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router"
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
