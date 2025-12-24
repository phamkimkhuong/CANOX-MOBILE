// Global client state for NON-SENSITIVE data
// Uses MMKV for fast synchronous persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

    // Language
    language: string;
    setLanguage: (lang: string) => void;
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

            // Language
            language: 'vi',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'app-settings',
            storage: zustandMMKVStorage,
        }
    )
);
