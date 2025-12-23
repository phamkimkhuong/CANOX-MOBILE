import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    hydrated: boolean;
    hydrate: () => Promise<void>;
    login: (token: string) => Promise<void>;
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
    login: async (token) => {
        await SecureStore.setItemAsync('user_access_token', token);
        set({ token, isAuthenticated: true, hydrated: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('user_access_token');
        set({ token: null, isAuthenticated: false, hydrated: true });
        router.replace('/(auth)/login'); // Đá về trang login
    },
}));