import { ROUTES } from '@/constants/routes';
import { queryClient } from '@/services/api/queryClient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { useCartStore } from './useCartStore';

const BUYER_ID_KEY = 'user_buyer_id';

interface AuthState {
    token: string | null;
    buyerId: string | null;
    isAuthenticated: boolean;
    hydrated: boolean;
    hydrate: () => Promise<void>;
    login: (accessToken: string, refreshToken: string, buyerId: string | null) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    buyerId: null,
    isAuthenticated: false,
    hydrated: false,
    hydrate: async () => {
        const storedToken = await SecureStore.getItemAsync('user_access_token');
        const storedBuyerId = await SecureStore.getItemAsync(BUYER_ID_KEY);

        if (storedToken) {
            set({
                token: storedToken,
                buyerId: storedBuyerId,
                isAuthenticated: true,
                hydrated: true,
            });
            return;
        }

        set({ token: null, buyerId: null, isAuthenticated: false, hydrated: true });
    },
    login: async (accessToken: string, refreshToken: string, buyerId: string | null) => {
        // Lưu tokens và buyerId vào SecureStore
        await SecureStore.setItemAsync('user_access_token', accessToken);
        await SecureStore.setItemAsync('user_refresh_token', refreshToken);
        if (buyerId) {
            await SecureStore.setItemAsync(BUYER_ID_KEY, buyerId);
        }

        console.log('🚀 Login Success - Access Token & BuyerId stored');

        set({
            token: accessToken,
            buyerId,
            isAuthenticated: true,
            hydrated: true,
        });
    },
    logout: async () => {
        // 1. Clear SecureStore
        await SecureStore.deleteItemAsync('user_access_token');
        await SecureStore.deleteItemAsync('user_refresh_token');
        await SecureStore.deleteItemAsync(BUYER_ID_KEY);

        // 2. Clear Zustand stores
        useCartStore.getState().clear();

        // 3. Clear TanStack Query caches (user-specific data)
        queryClient.removeQueries({ queryKey: ['cart'] });
        queryClient.removeQueries({ queryKey: ['user-addresses'] });
        queryClient.removeQueries({ queryKey: ['profile'] });
        queryClient.removeQueries({ queryKey: ['notifications'] });
        queryClient.removeQueries({ queryKey: ['orders'] });

        // 4. Reset auth state
        set({ token: null, buyerId: null, isAuthenticated: false, hydrated: true });

        // 5. Navigate to login
        router.replace(ROUTES.AUTH.LOGIN);
    },
}));
