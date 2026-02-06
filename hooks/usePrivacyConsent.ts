import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getCrashlytics, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { getPerformance } from '@react-native-firebase/perf';
import { useCallback } from 'react';

import { useAppStore } from '@/store/useAppStore';
import { createLogger } from '@/utils/logger';

const log = createLogger('PrivacyConsent');

/**
 * Hook to manage and apply Privacy Consent (GDPR/Apple)
 * for Crashlytics, Analytics and Performance using Modular SDK.
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
            const isCrashEnabled = hasAcceptedPrivacy && crashlyticsConsent;
            const isAnalyticsEnabled = hasAcceptedPrivacy && analyticsConsent;

            const crashlytics = getCrashlytics();
            const analytics = getAnalytics();
            const performance = getPerformance();

            await Promise.all([
                setCrashlyticsCollectionEnabled(crashlytics, isCrashEnabled),
                setAnalyticsCollectionEnabled(analytics, isAnalyticsEnabled),
            ]);

            // Performance Monitoring (using property for dataCollectionEnabled as per latest SDK)
            performance.dataCollectionEnabled = isAnalyticsEnabled;

            log.info('Applied Privacy Preferences (Modular):', {
                crashlytics: isCrashEnabled,
                analytics: isAnalyticsEnabled,
                performance: isAnalyticsEnabled
            });
        } catch (error) {
            log.error('Failed to apply privacy preferences', error);
        }
    }, [hasAcceptedPrivacy, crashlyticsConsent, analyticsConsent]);

    /**
     * Save user consent and apply it immediately.
     */
    const acceptPrivacy = useCallback(async (crash: boolean, analyticsEnabled: boolean) => {
        // Update Zustand Store
        updatePrivacyConsent({ crash, analytics: analyticsEnabled });

        const crashlytics = getCrashlytics();
        const analytics = getAnalytics();
        const performance = getPerformance();

        // Apply immediately
        await Promise.all([
            setCrashlyticsCollectionEnabled(crashlytics, crash),
            setAnalyticsCollectionEnabled(analytics, analyticsEnabled),
        ]);

        performance.dataCollectionEnabled = analyticsEnabled;

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
