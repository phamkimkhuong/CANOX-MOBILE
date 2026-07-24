// MMKV storage adapter for Zustand persist middleware
// Use this for NON-SENSITIVE data like: Theme mode, Cart draft, Onboarding status
// For SENSITIVE data (tokens), continue using expo-secure-store

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

export const mmkvStorage: MMKV = createMMKV({
    id: 'tcano-app-storage',
});

// Zustand-compatible storage adapter with proper typing
export const zustandMMKVStorage: PersistStorage<unknown> = {
    getItem: (name) => {
        const value = mmkvStorage.getString(name);
        if (!value) return null;

        return JSON.parse(value) as StorageValue<unknown>;
    },
    setItem: (name, value) => {
        mmkvStorage.set(name, JSON.stringify(value));
    },
    removeItem: (name) => {
        mmkvStorage.remove(name);
    },
};
