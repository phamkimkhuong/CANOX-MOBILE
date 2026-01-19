/**
 * ==============================================
 * SEARCH HISTORY HOOK - MMKV Persistence (Per User)
 * ==============================================
 */

import { mmkvStorage } from '@/store/storage';
import { useAuthStore } from '@/store/useAuthStore';
import type { RecentSearchItem } from '@/types/search';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

const MAX_RECENT_SEARCHES = 10;
const GUEST_KEY = 'guest';

// ============================================
// HELPERS (Functional)
// ============================================

const getStorageKey = (userId: string | null) => {
    return `recent_searches_${userId || GUEST_KEY}`;
};

const getRecentSearches = (userId: string | null): RecentSearchItem[] => {
    try {
        const key = getStorageKey(userId);
        const raw = mmkvStorage.getString(key);
        if (!raw) return [];
        return JSON.parse(raw) as RecentSearchItem[];
    } catch {
        return [];
    }
};

const saveRecentSearches = (userId: string | null, searches: RecentSearchItem[]): void => {
    const key = getStorageKey(userId);
    mmkvStorage.set(key, JSON.stringify(searches));
};

// ============================================
// EXTERNAL STORE SUBSCRIPTION LOGIC
// ============================================

// Global listeners to notify all instances when MMKV changes
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

/**
 * useSearchHistory - Manage recent search keywords
 */
export const useSearchHistory = () => {
    const userId = useAuthStore((state) => state.userId);

    // Create stable snapshot and subscribe functions for this specific userId
    const subscribe = useCallback((onStoreChange: () => void) => {
        listeners.add(onStoreChange);
        return () => listeners.delete(onStoreChange);
    }, []);

    const getSnapshot = useCallback(() => {
        return JSON.stringify(getRecentSearches(userId));
    }, [userId]);

    // useSyncExternalStore returns the stringified array, we parse it for UI
    const snapshotStr = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const searches = useMemo(() => JSON.parse(snapshotStr) as RecentSearchItem[], [snapshotStr]);

    /**
     * Add a keyword to search history
     */
    const addSearch = useCallback((keyword: string): void => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        const current = getRecentSearches(userId);

        // Deduplicate
        const filtered = current.filter(
            (item) => item.keyword.toLowerCase() !== trimmed.toLowerCase()
        );

        const updated: RecentSearchItem[] = [
            { keyword: trimmed, timestamp: Date.now() },
            ...filtered,
        ].slice(0, MAX_RECENT_SEARCHES);

        saveRecentSearches(userId, updated);
        notify();
    }, [userId]);

    /**
     * Remove a specific keyword
     */
    const removeSearch = useCallback((keyword: string): void => {
        const current = getRecentSearches(userId);
        const filtered = current.filter(
            (item) => item.keyword.toLowerCase() !== keyword.toLowerCase()
        );
        saveRecentSearches(userId, filtered);
        notify();
    }, [userId]);

    /**
     * Clear all search history for CURRENT user
     */
    const clearAll = useCallback((): void => {
        const key = getStorageKey(userId);
        mmkvStorage.remove(key);
        notify();
    }, [userId]);

    const keywords = useMemo(() => searches.map((item) => item.keyword), [searches]);

    return {
        searches,
        keywords,
        addSearch,
        removeSearch,
        clearAll,
        isEmpty: searches.length === 0,
    };
};
