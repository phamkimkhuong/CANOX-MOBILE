import type { UpdateStatus } from '@/services/updateChecker';

/**
 * ==============================================
 * APP STORE - Global Client State
 * ==============================================
 * Uses MMKV for fast synchronous persistence.
 * For NON-SENSITIVE data only.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getDeviceLanguage, type SupportedLanguage } from '@/utils/language';
import { zustandMMKVStorage } from './storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
    // Theme preferences
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;

    // Dark mode (simplified toggle)
    darkModeEnabled: boolean;
    setDarkMode: (enabled: boolean) => void;

    // Onboarding
    hasSeenOnboarding: boolean;
    setHasSeenOnboarding: (value: boolean) => void;

    // Language - Uses SupportedLanguage type for type safety
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;

    // Privacy Consent
    hasAcceptedPrivacy: boolean;
    crashlyticsConsent: boolean;
    analyticsConsent: boolean;
    updatePrivacyConsent: (consent: { crash: boolean; analytics: boolean }) => void;

    // Maintenance / System Down state
    isSystemDown: boolean;
    setSystemDown: (status: boolean) => void;

    // App Update state
    /** Runtime: current update check result (not persisted) */
    updateStatus: UpdateStatus;
    updateMessage: string;
    updateStoreUrl: string;
    setUpdateInfo: (info: { updateStatus: UpdateStatus; updateMessage: string; updateStoreUrl: string }) => void;
    /** Persisted: skipped version tracking for soft update cooldown */
    skippedVersion: string | null;
    skippedAt: number | null;
    skipUpdate: () => void;
    clearSkippedUpdate: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Theme
            themeMode: 'light',
            setThemeMode: (mode) => set({ themeMode: mode }),

            // Dark mode
            darkModeEnabled: false,
            setDarkMode: (enabled) => set({
                darkModeEnabled: enabled,
                themeMode: enabled ? 'dark' : 'light',
            }),

            // Onboarding
            hasSeenOnboarding: false,
            setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

            // Language - Default to device language
            language: getDeviceLanguage(),
            setLanguage: (lang) => set({ language: lang }),

            // Privacy
            hasAcceptedPrivacy: true, // Clickwrap consent active on registration/launch
            crashlyticsConsent: true, // Sentry active globally by default
            analyticsConsent: true, // Firebase Analytics active globally by default
            updatePrivacyConsent: (consent) => set({
                hasAcceptedPrivacy: true,
                crashlyticsConsent: true,
                analyticsConsent: consent.analytics,
            }),

            // Maintenance
            isSystemDown: false,
            setSystemDown: (status) => set({ isSystemDown: status }),

            // App Update
            updateStatus: 'none' as UpdateStatus,
            updateMessage: '',
            updateStoreUrl: '',
            setUpdateInfo: (info) => set(info),
            skippedVersion: null,
            skippedAt: null,
            skipUpdate: () => set({
                skippedVersion: 'skipped',
                skippedAt: Date.now(),
                updateStatus: 'none' as UpdateStatus,
            }),
            clearSkippedUpdate: () => set({
                skippedVersion: null,
                skippedAt: null,
            }),
        }),
        {
            name: 'app-settings',
            storage: zustandMMKVStorage,
            // Only persist UI preferences, exclude runtime states like isSystemDown
            // Persist UI prefs + skip cooldown. Exclude runtime states (isSystemDown, updateStatus).
            partialize: (state) => ({
                themeMode: state.themeMode,
                darkModeEnabled: state.darkModeEnabled,
                hasSeenOnboarding: state.hasSeenOnboarding,
                language: state.language,
                hasAcceptedPrivacy: state.hasAcceptedPrivacy,
                crashlyticsConsent: state.crashlyticsConsent,
                analyticsConsent: state.analyticsConsent,
                skippedVersion: state.skippedVersion,
                skippedAt: state.skippedAt,
            }),
        }
    )
);
