import { ROUTES } from '@/constants/routes';
import { queryClient } from '@/services/api/queryClient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { useCartStore } from './useCartStore';
interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    hydrated: boolean;
    hydrate: () => Promise<void>;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    isAuthenticated: false,
    hydrated: false,
    hydrate: async () => {
        const storedToken = await SecureStore.getItemAsync('user_access_token');

        if (storedToken) {
            set({ token: storedToken, isAuthenticated: true, hydrated: true });
            return;
        }

        set({ token: null, isAuthenticated: false, hydrated: true });
    },
    login: async (accessToken: string, refreshToken: string) => {
        // Lưu cả 2 vào SecureStore
        await SecureStore.setItemAsync('user_access_token', accessToken);
        await SecureStore.setItemAsync('user_refresh_token', refreshToken);

        console.log('🚀 Login Success - Access Token stored');

        // State lưu accessToken làm định danh chính
        set({ token: accessToken, isAuthenticated: true, hydrated: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('user_access_token');
        await SecureStore.deleteItemAsync('user_refresh_token');

        // Dọn dẹp Store và Cache
        useCartStore.getState().clear();
        queryClient.removeQueries({ queryKey: ['cart'] });

        set({ token: null, isAuthenticated: false, hydrated: true });
        router.replace(ROUTES.AUTH.LOGIN); // Đá về trang login
    },
}));