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

    // Onboarding
    hasSeenOnboarding: boolean;
    setHasSeenOnboarding: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Theme
            themeMode: 'light',
            setThemeMode: (mode) => set({ themeMode: mode }),

            // Onboarding
            hasSeenOnboarding: false,
            setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
        }),
        {
            name: 'app-settings',
            storage: zustandMMKVStorage,
        }
    )
);
