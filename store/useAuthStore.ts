/**
 * useAuthStore - Zustand store for authentication state
 * 
 * Features:
 * - Secure token storage via TokenManager
 * - Hydration from SecureStore on app launch
 * - Session management (login/logout)
 * - Integration with TokenManager for 3-layer refresh strategy
 */

import { ROUTES } from '@/constants/routes';
import { queryClient } from '@/services/api/queryClient';
import {
    checkTokenOnAppLaunch,
    clearTokens,
    getAccessToken,
    saveTokens,
    setOnRefreshFailedCallback,
} from '@/services/auth/tokenManager';
import { logger } from '@/utils/logger';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { useCartStore } from './useCartStore';
import { useUserAddressStore } from './useUserAddressStore';

const BUYER_ID_KEY = 'user_buyer_id';
const USER_ID_KEY = 'user_id';
const SHOP_ID_KEY = 'user_shop_id';

interface AuthState {
    /** Current access token (in-memory) */
    token: string | null;
    /** UserId from identity system (UUID) */
    userId: string | null;
    /** Buyer ID from backend (Profile ID) */
    buyerId: string | null;
    /** Shop ID from backend (if user is a seller) */
    shopId: string | null;
    /** Authentication status */
    isAuthenticated: boolean;
    /** Whether store has been hydrated from storage */
    hydrated: boolean;

    // Actions
    hydrate: () => Promise<void>;
    login: (accessToken: string, refreshToken: string, userId: string | null, buyerId: string | null, shopId?: string | null) => Promise<void>;
    setShopId: (shopId: string | null) => void;
    logout: () => Promise<void>;
}

// ============================================
// STORE
// ============================================

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    userId: null,
    buyerId: null,
    shopId: null,
    isAuthenticated: false,
    hydrated: false,

    /**
     * Hydrate auth state from secure storage on app launch
     * Also triggers eager token refresh if needed (Layer 1)
     */
    hydrate: async () => {
        try {
            const [storedToken, storedUserId, storedBuyerId, storedShopId] = await Promise.all([
                getAccessToken(),
                SecureStore.getItemAsync(USER_ID_KEY),
                SecureStore.getItemAsync(BUYER_ID_KEY),
                SecureStore.getItemAsync(SHOP_ID_KEY),
            ]);

            if (storedToken) {
                set({
                    token: storedToken,
                    userId: storedUserId,
                    buyerId: storedBuyerId,
                    shopId: storedShopId,
                    isAuthenticated: true,
                    hydrated: true,
                });

                // Register callback for when token refresh fails
                // This will trigger logout flow
                setOnRefreshFailedCallback(() => {
                    logger.auth.warn('Token refresh failed - triggering auto-logout');
                    get().logout();
                });

                // Layer 1: Check token health and refresh if needed
                // This runs in background, doesn't block hydration
                checkTokenOnAppLaunch().catch((error) => {
                    logger.auth.error('Error during token health check:', error);
                });

                return;
            }

            set({ token: null, userId: null, buyerId: null, shopId: null, isAuthenticated: false, hydrated: true });
        } catch (error) {
            logger.auth.error('Error hydrating auth state:', error);
            set({ token: null, userId: null, buyerId: null, shopId: null, isAuthenticated: false, hydrated: true });
        }
    },

    /**
     * Login - Save tokens and update state
     * TokenManager handles proactive refresh scheduling (Layer 2)
     */
    login: async (accessToken: string, refreshToken: string, userId: string | null, buyerId: string | null, shopId: string | null = null) => {
        try {
            // Save tokens using TokenManager (handles expiry tracking & proactive refresh)
            await saveTokens(accessToken, refreshToken);

            // Save IDs separately
            const storagePromises: Promise<any>[] = [];
            if (userId) storagePromises.push(SecureStore.setItemAsync(USER_ID_KEY, userId));
            if (buyerId) storagePromises.push(SecureStore.setItemAsync(BUYER_ID_KEY, buyerId));
            if (shopId) storagePromises.push(SecureStore.setItemAsync(SHOP_ID_KEY, shopId));

            if (storagePromises.length > 0) {
                await Promise.all(storagePromises);
            }

            logger.auth.info('Login Success - Tokens stored, proactive refresh scheduled');

            set({
                token: accessToken,
                userId,
                buyerId,
                shopId,
                isAuthenticated: true,
                hydrated: true,
            });
        } catch (error) {
            logger.auth.error('Error during login:', error);
            throw error;
        }
    },

    setShopId: (shopId: string | null) => {
        if (shopId) {
            SecureStore.setItemAsync(SHOP_ID_KEY, shopId);
        } else {
            SecureStore.deleteItemAsync(SHOP_ID_KEY);
        }
        set({ shopId });
    },

    /**
     * Logout - Clear all auth data and redirect to login
     */
    logout: async () => {
        try {
            // 1. Clear tokens and IDs
            await Promise.all([
                clearTokens(),
                SecureStore.deleteItemAsync(USER_ID_KEY),
                SecureStore.deleteItemAsync(BUYER_ID_KEY),
                SecureStore.deleteItemAsync(SHOP_ID_KEY),
            ]);

            // 2. Clear stores
            useCartStore.getState().clear();
            useUserAddressStore.getState().clear();

            // 3. Clear user-specific query caches
            queryClient.removeQueries({ queryKey: ['cart'] });
            queryClient.removeQueries({ queryKey: ['user-addresses'] });
            queryClient.removeQueries({ queryKey: ['profile'] });
            queryClient.removeQueries({ queryKey: ['notifications'] });
            queryClient.removeQueries({ queryKey: ['orders'] });
            queryClient.removeQueries({ queryKey: ['conversations'] });

            logger.auth.info('Logout complete - User data cleared');

            // 4. Reset auth state
            set({ token: null, userId: null, buyerId: null, shopId: null, isAuthenticated: false, hydrated: true });

            // 5. Navigate to login
            router.replace(ROUTES.AUTH.LOGIN);
        } catch (error) {
            logger.auth.error('Error during logout:', error);
            // Force reset state even if cleanup fails
            set({ token: null, userId: null, buyerId: null, shopId: null, isAuthenticated: false, hydrated: true });
        }
    },
}));

// ============================================
// SELECTORS (Optimized subscriptions)
// ============================================

/**
 * Check if user is authenticated
 * Use this instead of accessing store directly for better performance
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Get current userId (Identity ID)
 */
export const useUserId = () => useAuthStore((state) => state.userId);

/**
 * Get current buyer ID (Profile ID)
 */
export const useBuyerId = () => useAuthStore((state) => state.buyerId);

/**
 * Get current shop ID (Seller ID)
 */
export const useShopId = () => useAuthStore((state) => state.shopId);
