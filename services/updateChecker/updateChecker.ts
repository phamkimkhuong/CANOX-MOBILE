/**
 * Update Checker Service — Native Version Check via Firebase Remote Config
 *
 * Part of the 3-layer update strategy:
 *   Layer 1: EAS OTA       → JS/UI updates, silent, no user interruption
 *   Layer 2: This service  → Native updates, SoftUpdateBanner (recommend, user chooses)
 *   Layer 3: ForceUpdate   → Emergency only, `app_force_update = true` in Firebase Console
 *
 * Uses MMKV cache (2h TTL) to avoid spamming Firebase on every app launch.
 */

import { mmkvStorage } from '@/store/storage';
import { createLogger } from '@/utils/logger';
import { isLowerThan } from '@/utils/semver';
import {
    fetchAndActivate,
    getBoolean,
    getRemoteConfig,
    getString,
} from '@react-native-firebase/remote-config';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const log = createLogger('UpdateChecker');

// Types

export type UpdateStatus = 'none' | 'soft' | 'force';

export interface UpdateCheckResult {
    status: UpdateStatus;
    message: string;
    storeUrl: string;
    latestVersion: string;
    currentVersion: string;
}

// Constants

/** Cache key for the last check timestamp in MMKV */
const CACHE_KEY_LAST_CHECK = 'update_checker_last_check_at';
/** Cache key for the last check result in MMKV */
const CACHE_KEY_LAST_RESULT = 'update_checker_last_result';
/** How often to fetch Remote Config (2 hours in ms) */
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

/** Remote Config parameter keys (must match Firebase Console) */
const RC_KEYS = {
    LATEST_VERSION: 'app_latest_version',
    MIN_SUPPORTED_VERSION: 'app_min_supported_version',
    FORCE_UPDATE: 'app_force_update',
    STORE_URL_ANDROID: 'app_store_url_android',
    STORE_URL_IOS: 'app_store_url_ios',
    UPDATE_MESSAGE_VI: 'app_update_message_vi',
} as const;

const RC_DEFAULTS: Record<string, string | boolean> = {
    [RC_KEYS.LATEST_VERSION]: '1.0.0',
    [RC_KEYS.MIN_SUPPORTED_VERSION]: '1.0.0',
    [RC_KEYS.FORCE_UPDATE]: false,
    [RC_KEYS.STORE_URL_ANDROID]: process.env.EXPO_PUBLIC_STORE_URL_ANDROID || '',
    [RC_KEYS.STORE_URL_IOS]: process.env.EXPO_PUBLIC_STORE_URL_IOS || '',
    [RC_KEYS.UPDATE_MESSAGE_VI]: '',
};

// ─── Core Logic ──────────────────────────────────────────────────────

/**
 * Get the current native app version.
 * Falls back to '1.0.0' if unavailable (e.g., Expo Go).
 */
function getCurrentVersion(): string {
    return Application.nativeApplicationVersion ?? '1.0.0';
}

/**
 * Get the appropriate store URL based on platform.
 */
function getStoreUrl(): string {
    const rc = getRemoteConfig();
    const remoteUrl = Platform.OS === 'ios'
        ? getString(rc, RC_KEYS.STORE_URL_IOS)
        : getString(rc, RC_KEYS.STORE_URL_ANDROID);

    if (remoteUrl) return remoteUrl;

    // Fallback to environment variables if Remote Config is empty
    return Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_STORE_URL_IOS || ''
        : process.env.EXPO_PUBLIC_STORE_URL_ANDROID || '';
}

/**
 * Determine update status by comparing versions.
 *
 * Strategy (user-first approach):
 * - 'force' is ONLY triggered by explicit `app_force_update = true` in Firebase Console.
 *   This is an emergency kill switch — default OFF, used only for critical security issues.
 * - 'soft' is triggered when a newer native version is available.
 *   The user can choose to update or skip. App continues to work normally.
 * - EAS OTA handles all JS/UI/API updates silently (not managed here).
 */
function determineUpdateStatus(
    currentVersion: string,
    latestVersion: string,
    _minSupportedVersion: string,
    forceUpdate: boolean,
): UpdateStatus {
    // Emergency only: Force flag is explicitly enabled in Firebase Console
    if (forceUpdate && isLowerThan(currentVersion, latestVersion)) {
        return 'force';
    }

    // Newer native version available → recommend (not force)
    if (isLowerThan(currentVersion, latestVersion)) {
        return 'soft';
    }

    // Up to date
    return 'none';
}

/**
 * Check if the MMKV cache is still valid (within TTL).
 */
function isCacheValid(): boolean {
    const lastCheck = mmkvStorage.getNumber(CACHE_KEY_LAST_CHECK);
    if (!lastCheck) return false;

    return Date.now() - lastCheck < CACHE_TTL_MS;
}

/**
 * Get cached result from MMKV.
 */
function getCachedResult(): UpdateCheckResult | null {
    const cached = mmkvStorage.getString(CACHE_KEY_LAST_RESULT);
    if (!cached) return null;

    try {
        return JSON.parse(cached) as UpdateCheckResult;
    } catch {
        return null;
    }
}

/**
 * Save result to MMKV cache.
 */
function saveToCache(result: UpdateCheckResult): void {
    mmkvStorage.set(CACHE_KEY_LAST_CHECK, Date.now());
    mmkvStorage.set(CACHE_KEY_LAST_RESULT, JSON.stringify(result));
}

/**
 * Fetch latest config from Firebase Remote Config.
 * Uses `fetchAndActivate` to get the latest values.
 */
async function fetchRemoteConfig(): Promise<void> {
    const rc = getRemoteConfig();

    // Set defaults for first-time / offline scenarios
    rc.defaultConfig = RC_DEFAULTS;

    // Set minimum fetch interval (0 for dev, 3600 for production)
    rc.settings = {
        minimumFetchIntervalMillis: __DEV__ ? 0 : 3600 * 1000,
        fetchTimeoutMillis: 30000, // 30 seconds
    };

    // Fetch and activate
    await fetchAndActivate(rc);
}

// Public API

/**
 * Main entry point - Check if app needs update.
 *
 * Flow:
 * 1. Check MMKV cache (2h TTL) → return cached result if valid
 * 2. Fetch Firebase Remote Config → get latest version config
 * 3. Compare versions → determine update status
 * 4. Cache result for next check
 * 5. Return result (never throws - returns 'none' on error)
 *
 * @returns UpdateCheckResult with status, message, and store URL
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
    const currentVersion = getCurrentVersion();

    // Check cache (Skip cache check in development to make testing easier)
    if (!__DEV__ && isCacheValid()) {
        const cached = getCachedResult();
        if (cached) {
            log.info(`Using cached result: ${cached.status} (v${cached.currentVersion} → v${cached.latestVersion})`);
            return cached;
        }
    }

    // Fetch Remote Config
    try {
        await fetchRemoteConfig();
    } catch (error) {
        log.warn('Failed to fetch Remote Config, assuming no update needed:', error);
        // Never block user on network failure
        return {
            status: 'none',
            message: '',
            storeUrl: '',
            latestVersion: currentVersion,
            currentVersion,
        };
    }

    // Read values
    const rc = getRemoteConfig();
    const latestVersion = getString(rc, RC_KEYS.LATEST_VERSION) || currentVersion;
    const minSupportedVersion = getString(rc, RC_KEYS.MIN_SUPPORTED_VERSION) || '1.0.0';
    const forceUpdate = getBoolean(rc, RC_KEYS.FORCE_UPDATE);
    const updateMessage = getString(rc, RC_KEYS.UPDATE_MESSAGE_VI) || '';
    const storeUrl = getStoreUrl();

    // Determine status
    const status = determineUpdateStatus(
        currentVersion,
        latestVersion,
        minSupportedVersion,
        forceUpdate,
    );

    const result: UpdateCheckResult = {
        status,
        message: updateMessage,
        storeUrl,
        latestVersion,
        currentVersion,
    };

    log.info(`Version check: v${currentVersion} → v${latestVersion} | Status: ${status}`);

    // ── Step 5: Cache result ──
    saveToCache(result);

    return result;
}

/**
 * Force clear the cache and recheck.
 * Useful for Settings screen "Check for updates" button.
 */
export async function forceCheckForUpdate(): Promise<UpdateCheckResult> {
    mmkvStorage.remove(CACHE_KEY_LAST_CHECK);
    mmkvStorage.remove(CACHE_KEY_LAST_RESULT);
    return checkForUpdate();
}
