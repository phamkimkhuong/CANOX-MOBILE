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

    // Biometrics
    biometricsEnabled: boolean;
    setBiometrics: (enabled: boolean) => void;

    // Onboarding
    hasSeenOnboarding: boolean;
    setHasSeenOnboarding: (value: boolean) => void;

    // Language - Uses SupportedLanguage type for type safety
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;

    // Maintenance / System Down state
    isSystemDown: boolean;
    setSystemDown: (status: boolean) => void;
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

            // Biometrics
            biometricsEnabled: false,
            setBiometrics: (enabled) => set({ biometricsEnabled: enabled }),

            // Onboarding
            hasSeenOnboarding: false,
            setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

            // Language - Default to device language
            language: getDeviceLanguage(),
            setLanguage: (lang) => set({ language: lang }),

            // Maintenance
            isSystemDown: false,
            setSystemDown: (status) => set({ isSystemDown: status }),
        }),
        {
            name: 'app-settings',
            storage: zustandMMKVStorage,
            // Only persist UI preferences, exclude runtime states like isSystemDown
            partialize: (state) => ({
                themeMode: state.themeMode,
                darkModeEnabled: state.darkModeEnabled,
                biometricsEnabled: state.biometricsEnabled,
                hasSeenOnboarding: state.hasSeenOnboarding,
                language: state.language,
            }),
        }
    )
);
