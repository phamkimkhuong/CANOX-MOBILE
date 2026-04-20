/**
 * ==============================================
 * LANGUAGE UTILITIES
 * ==============================================
 * Shared language detection logic for i18n and stores.
 * Ensures consistent behavior across the app.
 */

import * as Localization from 'expo-localization';

/** Supported languages in the app */
export type SupportedLanguage = 'vi' | 'en' | 'lo';

/** Default fallback language */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** List of supported language codes */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['vi', 'en', 'lo'];

/**
 * Get device language and map to supported language.
 * Falls back to English if device language is not supported.
 * 
 * @returns 'vi' or 'en'
 */
export const getDeviceLanguage = (): SupportedLanguage => {
    try {
        const deviceLocale = Localization.getLocales()[0]?.languageCode;

        // Check if device language is supported
        if (deviceLocale && SUPPORTED_LANGUAGES.includes(deviceLocale as SupportedLanguage)) {
            return deviceLocale as SupportedLanguage;
        }

        return DEFAULT_LANGUAGE;
    } catch {
        // Fallback in case Localization fails
        return DEFAULT_LANGUAGE;
    }
};
