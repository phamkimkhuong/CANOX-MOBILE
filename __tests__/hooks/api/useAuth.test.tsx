import { useLogin, useLogout, useRegister } from '@/hooks/api/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { http, HttpResponse } from 'msw';
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

// ─── Mock loading store (used by useLogout onMutate/onSuccess/onError) ───
jest.mock('@/store/useLoadingStore', () => ({
    showGlobalLoading: jest.fn(),
    hideGlobalLoading: jest.fn(),
}));

// ─── Mock dependent stores (used by useAuthStore.logout) ───
jest.mock('@/store/useCartStore', () => ({
    useCartStore: {
        getState: jest.fn(() => ({ clear: jest.fn() })),
    },
}));
jest.mock('@/store/useCheckoutStore', () => ({
    useCheckoutStore: {
        getState: jest.fn(() => ({ resetSession: jest.fn() })),
    },
}));
jest.mock('@/store/useUserAddressStore', () => ({
    useUserAddressStore: {
        getState: jest.fn(() => ({ clear: jest.fn() })),
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
            http.post('http://app.test/api/v1/auth/login/mobile', () => {
                return HttpResponse.json(loginUnverifiedResponse, { status: 200 });
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
            http.post('http://app.test/api/v1/auth/login/mobile', () => {
                return HttpResponse.json({
                    code: 401,
                    success: false,
                    message: 'Invalid credentials',
                }, { status: 401 });
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
            http.post('http://app.test/api/v1/users/buyer', () => {
                return HttpResponse.json({
                    code: 400,
                    success: false,
                    message: 'Username already taken',
                }, { status: 400 });
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
        // Spy on store.logout to avoid deep dependency chain
        const mockLogout = jest.fn().mockImplementation(async () => {
            useAuthStore.setState({
                token: null,
                userId: null,
                buyerId: null,
                shopId: null,
                isAuthenticated: false,
                hydrated: true,
            });
        });
        useAuthStore.setState({ logout: mockLogout } as never);

        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate();
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify store.logout was called
        expect(mockLogout).toHaveBeenCalled();

        // Store should be cleared
        const storeState = useAuthStore.getState();
        expect(storeState.isAuthenticated).toBe(false);
        expect(storeState.token).toBeNull();
    });

    it('shows error toast on logout failure (non-session-expired)', async () => {
        server.use(
            http.post('http://app.test/api/v1/auth/logout', () => {
                return HttpResponse.json({
                    code: 500,
                    success: false,
                    message: 'Internal server error',
                }, { status: 500 });
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

// ═══════════════════════════════════════
// OTP & Forgot Password Flow
// ═══════════════════════════════════════
import {
    useVerifyOtp,
    useResendOtp,
    useCheckEmailExists,
    useForgotPassword,
    useVerifyForgotPasswordOtp,
    useResetPassword,
} from '@/hooks/api/useAuth';

describe('OTP and Forgot Password Hooks', () => {
    it('useVerifyOtp sends verification data', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useVerifyOtp(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({ email: 'test@example.com', otpCode: '123456' });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.message).toBe('OTP verified');
    });

    it('useResendOtp requests new OTP', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useResendOtp(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate('test@example.com');
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.message).toBe('OTP resent');
    });

    it('useCheckEmailExists returns true for existing email', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useCheckEmailExists(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate('existing@example.com');
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.data).toBe(true);
    });

    it('useForgotPassword sends reset instruction', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate('test@example.com');
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.message).toBe('Password reset OTP sent');
    });

    it('useVerifyForgotPasswordOtp verifies token and returns success', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useVerifyForgotPasswordOtp(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({ email: 'test@example.com', otpCode: '654321' });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.message).toBe('Password reset OTP verified');
    });

    it('useResetPassword successfully changes password', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(() => useResetPassword(), { wrapper: Wrapper });

        await act(async () => {
            result.current.mutate({
                email: 'test@example.com',
                resetToken: 'mock-reset-token-123',
                password: 'NewPassword123',
                confirmPassword: 'NewPassword123',
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.message).toBe('Password reset successful');
    });
});
