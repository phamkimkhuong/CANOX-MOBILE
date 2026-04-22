import { useLogin, useLogout, useRegister } from '@/hooks/api/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { rest } from 'msw';
import React from 'react';
import Toast from 'react-native-toast-message';
import { loginUnverifiedResponse } from '../../setup/handlers/auth.handlers';
import { server } from '../../setup/server';

// ─── Mock tokenManager so Request Interceptor doesn't block ───
jest.mock('@/services/auth/tokenManager', () => ({
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token-xyz'),
    getRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token-xyz'),
    getTokenExpiry: jest.fn().mockResolvedValue(Date.now() + 10 * 60 * 60 * 1000),
    saveTokens: jest.fn().mockResolvedValue(undefined),
    clearTokens: jest.fn().mockResolvedValue(undefined),
    isTokenRefreshing: jest.fn().mockReturnValue(false),
    waitForTokenRefresh: jest.fn(),
    performTokenRefresh: jest.fn(),
    checkTokenOnAppLaunch: jest.fn().mockResolvedValue(undefined),
    setOnRefreshFailedCallback: jest.fn(),
    handle401Error: jest.fn(),
    isTokenExpiringSoon: jest.fn().mockResolvedValue(false),
}));

// ─── Mock expo-secure-store (used by useAuthStore.login/logout) ───
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn().mockResolvedValue(null),
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock cache clearing (used by logout) ───
jest.mock('@/utils/cache', () => ({
    clearAllCache: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock queryClient.cancelQueries and .clear (used by logout) ───
jest.mock('@/services/api/queryClient', () => ({
    queryClient: {
        cancelQueries: jest.fn().mockResolvedValue(undefined),
        clear: jest.fn(),
        getDefaultOptions: jest.fn(() => ({})),
        setDefaultOptions: jest.fn(),
        mount: jest.fn(),
        unmount: jest.fn(),
    },
}));

// ─── Suppress expected console noise from logger ───
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
beforeAll(() => {
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = (...args: unknown[]) => {
        const msg = typeof args[0] === 'string' ? args[0] : '';
        if (msg.includes('not wrapped in act') || msg.includes('API') || msg.includes('Auth')) return;
        originalConsoleError(...args);
    };
});
afterAll(() => {
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});

// ─── Helper: create isolated QueryClient + wrapper ───
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { Wrapper, queryClient };
};

// ═══════════════════════════════════════
// useLogin
// ═══════════════════════════════════════
describe('useLogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            isAuthenticated: false,
            token: null,
            userId: null,
            buyerId: null,
        });
    });

    it('logs in successfully and calls store.login + navigates home', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                username: 'testuser',
                password: 'Password123',
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify store was updated (login was called)
        const storeState = useAuthStore.getState();
        expect(storeState.isAuthenticated).toBe(true);
        expect(storeState.token).toBe('mock-access-token-xyz');

        // Verify navigation to home
        expect(router.replace).toHaveBeenCalled();
    });

    it('redirects to OTP verification when email is not verified', async () => {
        // Override handler to return unverified response
        server.use(
            rest.post('http://app.test/api/v1/auth/login/mobile', (_req, res, ctx) => {
                return res(ctx.status(200), ctx.json(loginUnverifiedResponse));
            })
        );

        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                username: 'unverified',
                password: 'Password123',
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Should NOT have logged in to store
        expect(useAuthStore.getState().isAuthenticated).toBe(false);

        // Should show warning toast
        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'warning' })
        );

        // Should redirect to OTP verification
        expect(router.push).toHaveBeenCalled();
    });

    it('shows error toast on login failure (wrong credentials)', async () => {
        server.use(
            rest.post('http://app.test/api/v1/auth/login/mobile', (_req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({
                        code: 401,
                        success: false,
                        message: 'Invalid credentials',
                    })
                );
            })
        );

        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                username: 'wronguser',
                password: 'WrongPass1',
            });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        // Should NOT have logged in
        expect(useAuthStore.getState().isAuthenticated).toBe(false);

        // Should show error toast
        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error' })
        );
    });
});

// ═══════════════════════════════════════
// useRegister
// ═══════════════════════════════════════
describe('useRegister', () => {
    it('registers successfully and returns user data', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                username: 'newuser',
                email: 'new@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify response data
        expect(result.current.data?.data.userId).toBe('user-002');
        expect(result.current.data?.data.status).toBe('INACTIVE');
    });

    it('shows error toast on registration failure (non-208/209 error)', async () => {
        server.use(
            rest.post('http://app.test/api/v1/users/buyer', (_req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({
                        code: 400,
                        success: false,
                        message: 'Username already taken',
                    })
                );
            })
        );

        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                username: 'takenuser',
                email: 'taken@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error' })
        );
    });
});

// ═══════════════════════════════════════
// useLogout
// ═══════════════════════════════════════
describe('useLogout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Start as authenticated
        useAuthStore.setState({
            isAuthenticated: true,
            token: 'mock-access-token-xyz',
            userId: 'user-001',
            buyerId: 'buyer-001',
        });
    });

    it('logs out successfully and clears store', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate();
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Store should be cleared
        const storeState = useAuthStore.getState();
        expect(storeState.isAuthenticated).toBe(false);
        expect(storeState.token).toBeNull();
    });

    it('shows error toast on logout failure (non-session-expired)', async () => {
        server.use(
            rest.post('http://app.test/api/v1/auth/logout', (_req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({
                        code: 500,
                        success: false,
                        message: 'Internal server error',
                    })
                );
            })
        );

        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate();
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error' })
        );
    });
});
