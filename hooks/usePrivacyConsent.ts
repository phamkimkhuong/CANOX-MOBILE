import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { useCallback } from 'react';

import { useAppStore } from '@/store/useAppStore';
import { createLogger } from '@/utils/logger';

const log = createLogger('PrivacyConsent');

/**
 * Hook to manage and apply Privacy Consent (GDPR/Apple)
 * for Analytics using Modular SDK. Sentry handles errors globally.
 */
export const usePrivacyConsent = () => {
    const {
        hasAcceptedPrivacy,
        crashlyticsConsent,
        analyticsConsent,
        updatePrivacyConsent
    } = useAppStore();

    /**
     * Applies the current preferences to Firebase SDKs.
     * Use modular functions to avoid deprecation warnings.
     */
    const applyPrivacyPreferences = useCallback(async () => {
        try {
            const isAnalyticsEnabled = hasAcceptedPrivacy && analyticsConsent;
            const analytics = getAnalytics();

            await setAnalyticsCollectionEnabled(analytics, isAnalyticsEnabled);

            log.info('Applied Privacy Preferences (Modular):', {
                analytics: isAnalyticsEnabled,
            });
        } catch (error) {
            log.error('Failed to apply privacy preferences', error);
        }
    }, [hasAcceptedPrivacy, analyticsConsent]);

    /**
     * Save user consent and apply it immediately.
     */
    const acceptPrivacy = useCallback(async (crash: boolean, analyticsEnabled: boolean) => {
        // Update Zustand Store
        updatePrivacyConsent({ crash, analytics: analyticsEnabled });

        const analytics = getAnalytics();

        // Apply immediately
        await setAnalyticsCollectionEnabled(analytics, analyticsEnabled);

        log.info('User updated privacy consent (Modular):', { crash, analytics: analyticsEnabled });
    }, [updatePrivacyConsent]);

    return {
        hasAcceptedPrivacy,
        crashlyticsConsent,
        analyticsConsent,
        acceptPrivacy,
        applyPrivacyPreferences,
    };
};
