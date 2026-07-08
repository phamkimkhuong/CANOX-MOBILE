import { useCart } from '@/hooks/api/cart/useCart';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { server } from '../../setup/server';
import { renderHookWithProviders } from '../../utils/test-utils';

jest.mock('@/services/auth/tokenManager', () => ({
    getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
    getRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
    getTokenExpiry: jest.fn(() => Promise.resolve(Date.now() + 1000 * 60 * 60)),
    isTokenRefreshing: jest.fn(() => false),
    waitForTokenRefresh: jest.fn(() => Promise.resolve('mock-token')),
    performTokenRefresh: jest.fn(() => Promise.resolve('mock-token')),
    handle401Error: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
}));

describe('useCart Hook Integration Test', () => {
    beforeAll(() => {
        apiClient.defaults.baseURL = 'http://app.test';
    });

    afterEach(() => {
        act(() => {
            useAuthStore.setState({ isAuthenticated: false });
        });
    });

    it('does not send API request when user is unauthenticated', async () => {
        act(() => {
            useAuthStore.setState({ isAuthenticated: false });
        });
        const { result, queryClient, unmount } = renderHookWithProviders(() => useCart());

        expect(result.current.isPending).toBe(true);
        expect(result.current.fetchStatus).toBe('idle');
        
        unmount();
        queryClient.clear();
    });

    it('trả về dữ liệu giỏ hàng trống thành công', async () => {
        act(() => {
            useAuthStore.setState({ isAuthenticated: true });
        });

        const mockEmptyCart = {
            code: 200,
            success: true,
            data: {
                id: 'cart-123',
                itemCount: 0,
                shops: []
            }
        };

        server.use(
            http.get('http://app.test/api/v1/cart', () => {
                return HttpResponse.json(mockEmptyCart, { status: 200 });
            })
        );

        const { result, queryClient, unmount } = renderHookWithProviders(() => useCart());

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        }, { timeout: 3000 });

        expect(result.current.data?.shops).toHaveLength(0);
        
        unmount();
        queryClient.clear();
    });

    it('xử lý lỗi khi server trả về 500', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        
        act(() => {
            useAuthStore.setState({ isAuthenticated: true });
        });
        server.use(
            http.get(`http://app.test/api/v1/cart`, () => {
                return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
            })
        );
        const { result, queryClient, unmount } = renderHookWithProviders(() => useCart());

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeDefined();
        
        consoleErrorSpy.mockRestore();
        consoleInfoSpy.mockRestore();
        unmount();
        queryClient.clear();
    });
});
