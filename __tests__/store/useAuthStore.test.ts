/**
 * Unit Tests for useAuthStore
 * Tests the global client state for authentication, hydration, login, and nuclear logout.
 */

import { act } from '@testing-library/react-native';
import { useAuthStore } from '@/store/useAuthStore';
import * as SecureStore from 'expo-secure-store';
import { getAccessToken, saveTokens, clearTokens } from '@/services/auth/tokenManager';
import { queryClient } from '@/services/api/queryClient';
import { useCartStore } from '@/store/useCartStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { router } from 'expo-router';

// Make sure to mock all dependencies gracefully
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('@/services/auth/tokenManager', () => ({
    getAccessToken: jest.fn(),
    saveTokens: jest.fn(),
    clearTokens: jest.fn(),
    checkTokenOnAppLaunch: jest.fn(() => Promise.resolve()),
    setOnRefreshFailedCallback: jest.fn(),
}));

jest.mock('@/services/api/queryClient', () => ({
    queryClient: {
        cancelQueries: jest.fn(),
        clear: jest.fn(),
    },
}));

jest.mock('@/utils/cache', () => ({
    clearAllCache: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

// We don't need to manually mock useCartStore, etc., because our __mocks__/zustand.ts handles them!

describe('useAuthStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with completely unauthenticated state', () => {
            const state = useAuthStore.getState();
            expect(state.token).toBeNull();
            expect(state.userId).toBeNull();
            expect(state.buyerId).toBeNull();
            expect(state.shopId).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.hydrated).toBe(false);
        });
    });

    describe('Hydrate', () => {
        it('should hydrate an authenticated session if tokens exist', async () => {
            (getAccessToken as jest.Mock).mockResolvedValueOnce('mock_access_token');
            (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
                if (key === 'user_id') return 'user-1';
                if (key === 'user_buyer_id') return 'buyer-1';
                if (key === 'user_shop_id') return 'shop-1';
                return null;
            });

            await act(async () => {
                await useAuthStore.getState().hydrate();
            });

            const state = useAuthStore.getState();
            expect(state.token).toBe('mock_access_token');
            expect(state.userId).toBe('user-1');
            expect(state.buyerId).toBe('buyer-1');
            expect(state.shopId).toBe('shop-1');
            expect(state.isAuthenticated).toBe(true);
            expect(state.hydrated).toBe(true);
        });

        it('should complete hydration passively if no tokens exist', async () => {
            (getAccessToken as jest.Mock).mockResolvedValueOnce(null);

            await act(async () => {
                await useAuthStore.getState().hydrate();
            });

            const state = useAuthStore.getState();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.hydrated).toBe(true);
        });
    });

    describe('Login', () => {
        it('should trigger login correctly and store everything', async () => {
            await act(async () => {
                await useAuthStore.getState().login(
                    'new_access_token',
                    'new_refresh_token',
                    'new-user',
                    'new-buyer',
                    'new-shop'
                );
            });

            expect(saveTokens).toHaveBeenCalledWith('new_access_token', 'new_refresh_token');
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_id', 'new-user');
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_buyer_id', 'new-buyer');
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_shop_id', 'new-shop');

            const state = useAuthStore.getState();
            expect(state.token).toBe('new_access_token');
            expect(state.isAuthenticated).toBe(true);
            expect(state.shopId).toBe('new-shop');
        });

        it('should setShopId correctly', () => {
            act(() => {
                useAuthStore.getState().setShopId('shop-999');
            });
            
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_shop_id', 'shop-999');
            expect(useAuthStore.getState().shopId).toBe('shop-999');

            act(() => {
                useAuthStore.getState().setShopId(null);
            });
            
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_shop_id');
            expect(useAuthStore.getState().shopId).toBeNull();
        });
    });

    describe('Logout', () => {
        it('should perform nuclear cleanup horizontally across all stores', async () => {
            // Setup a fake authenticated state first
            act(() => {
                useAuthStore.setState({ token: '123', isAuthenticated: true, hydrated: true });
                // Also setup some fake cart data to test if the reset mock is correctly used via module integration
                // Actually we just spy on their `clear` functions
            });

            const cartClearSpy = jest.spyOn(useCartStore.getState(), 'clear');
            const addressClearSpy = jest.spyOn(useUserAddressStore.getState(), 'clear');
            const checkoutResetSpy = jest.spyOn(useCheckoutStore.getState(), 'resetSession');

            await act(async () => {
                await useAuthStore.getState().logout();
            });

            // 1. Should wipe Auth data
            const state = useAuthStore.getState();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);

            // 2. Should cancel APIs and clear Tanstack
            expect(queryClient.cancelQueries).toHaveBeenCalled();
            expect(queryClient.clear).toHaveBeenCalled();

            // 3. Should wipe tokens from SecureStore
            expect(clearTokens).toHaveBeenCalled();
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_id');
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_buyer_id');
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_shop_id');

            // 4. Should signal sibling stores to reset 
            expect(cartClearSpy).toHaveBeenCalled();
            expect(addressClearSpy).toHaveBeenCalled();
            expect(checkoutResetSpy).toHaveBeenCalled();

            // 5. Navigate to login
            expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
        });
    });
});
