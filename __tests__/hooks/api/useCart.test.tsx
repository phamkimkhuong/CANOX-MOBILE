import { waitFor } from '@testing-library/react-native';
import { rest } from 'msw';
import { useCart } from '@/hooks/api/cart/useCart';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/services/api/client';
import { renderHookWithProviders } from '../../utils/test-utils';
import { server } from '../../setup/server';

jest.mock('@/services/auth/tokenManager', () => ({
    getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
    getTokenExpiry: jest.fn(() => Promise.resolve(Date.now() + 1000 * 60 * 60)),
    isTokenRefreshing: jest.fn(() => false),
    waitForTokenRefresh: jest.fn(() => Promise.resolve('mock-token')),
    performTokenRefresh: jest.fn(() => Promise.resolve('mock-token')),
    handle401Error: jest.fn()
}));

describe('useCart Hook Integration Test', () => {
    beforeAll(() => {
        apiClient.defaults.baseURL = 'http://app.test'; // Ensure consistent routing for MSW
    });

    afterEach(() => {
        useAuthStore.setState({ isAuthenticated: false });
    });

    it('does not send API request when user is unauthenticated', async () => {
        useAuthStore.setState({ isAuthenticated: false });

        const { result } = renderHookWithProviders(() => useCart());

        // When enabled is false due to isAuthenticated = false
        expect(result.current.isPending).toBe(true);
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches cart data cleanly via MSW interceptor when authenticated', async () => {
        useAuthStore.setState({ isAuthenticated: true });

        // Provide a deterministic mock response according to the CartApi Schema
        const mockCartResponse = {
            status: 200,
            message: 'Success',
            data: {
                id: 'cart-12345',
                itemCount: 5,
                shops: [
                    {
                        shopId: 'shop-abc',
                        shopName: 'Mock Shop Vietnam',
                        logoPath: '/images/mock.png',
                        items: [
                            {
                                id: 'item-xyz',
                                variantId: 'var-1',
                                productName: 'Mock Product',
                                unitPrice: 200000,
                                quantity: 5,
                                totalPrice: 1000000,
                                stockStatus: 'IN_STOCK',
                            }
                        ]
                    }
                ]
            }
        };

        server.use(
            rest.get('http://app.test/api/v1/cart', (req, res, ctx) => {
                return res(ctx.status(200), ctx.json(mockCartResponse));
            })
        );

        const { result } = renderHookWithProviders(() => useCart());

        // Wait until hook completes the fetch
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.itemCount).toBe(5);
        expect(result.current.data?.shops).toHaveLength(1);
        expect(result.current.data?.shops[0].items[0].productName).toBe('Mock Product');
    });
});
