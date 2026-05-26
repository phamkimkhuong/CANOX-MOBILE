import { logger } from '@/utils/logger';
import { Linking, Platform } from 'react-native';

const FALLBACK_APPLE_SLUG = 'canox';
const FALLBACK_ANDROID_PACKAGE = 'com.cano.canox';

/**
 * Redirects the user to the native store page directly in write-review mode
 * Fallback to standard web store URL if native store is not available (e.g. simulator)
 */
export async function redirectToStoreReview(): Promise<void> {
    // 1. Get standard web URLs from project environment variables
    const webUrl = Platform.select({
        ios: process.env.EXPO_PUBLIC_STORE_URL_IOS || `https://apps.apple.com/app/${FALLBACK_APPLE_SLUG}`,
        android: process.env.EXPO_PUBLIC_STORE_URL_ANDROID || `https://play.google.com/store/apps/details?id=${FALLBACK_ANDROID_PACKAGE}`,
        default: '',
    });

    let nativeUrl = '';

    // 2. Parse and build native deep link dynamically from environment variables
    if (Platform.OS === 'ios' && webUrl) {
        const idMatch = webUrl.match(/id(\d+)/);
        if (idMatch && idMatch[1]) {
            nativeUrl = `itms-apps://itunes.apple.com/app/id${idMatch[1]}?action=write-review`;
        } else {
            // Support slug-based urls like https://apps.apple.com/app/canox
            const slugMatch = webUrl.match(/\/app\/([^/?]+)/);
            const slug = slugMatch && slugMatch[1] ? slugMatch[1] : FALLBACK_APPLE_SLUG;
            nativeUrl = `itms-apps://itunes.apple.com/app/${slug}?action=write-review`;
        }
    } else if (Platform.OS === 'android' && webUrl) {
        const match = webUrl.match(/id=([^&]+)/);
        const packageName = match && match[1] ? match[1] : FALLBACK_ANDROID_PACKAGE;
        nativeUrl = `market://details?id=${packageName}`;
    }

    if (!nativeUrl) return;

    try {
        const isSupported = await Linking.canOpenURL(nativeUrl);
        if (isSupported) {
            await Linking.openURL(nativeUrl);
        } else if (webUrl) {
            await Linking.openURL(webUrl);
        }
    } catch (error) {
        logger.ui.error('Error redirecting to App Store review:', error);
        if (webUrl) {
            try {
                await Linking.openURL(webUrl);
            } catch (fallbackError) {
                logger.ui.error('Fallback redirect failed:', fallbackError);
            }
        }
    }
}
