import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/store/useAuthStore';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('@/hooks/useNavigationUnlockOnFocus', () => ({
    useNavigationUnlockOnFocus: jest.fn(),
}));

jest.mock('@/components/auth/SocialLoginButtons', () => ({
    SocialLoginButtons: () => <MockedSocialLoginButtons />
}));
const MockedSocialLoginButtons = () => null;

jest.mock('@/utils/navigation', () => ({
    Navigator: {
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
    },
}));

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
        push: jest.fn(),
        canGoBack: jest.fn(() => false),
    }
}));

describe('LoginScreen Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({ token: null, userId: null, buyerId: null, shopId: null, isAuthenticated: false });
    });

    const setup = () => {
        return renderWithProviders(<LoginScreen />);
    };

    it('renders all form elements properly', () => {
        setup();

        expect(screen.getByText('login.title')).toBeTruthy();
        expect(screen.getByText('login.welcome')).toBeTruthy();

        // Find inputs by placeholder (since our mock maps t(key) -> key)
        expect(screen.getByPlaceholderText('login.usernamePlaceholder')).toBeTruthy();
        expect(screen.getByPlaceholderText('login.passwordPlaceholder')).toBeTruthy();
        expect(screen.getByText('login.loginButton')).toBeTruthy();
    });

    it('submits form successfully and navigates home', async () => {
        setup();

        // 1. Fill input fields
        const usernameInput = screen.getByPlaceholderText('login.usernamePlaceholder');
        const passwordInput = screen.getByPlaceholderText('login.passwordPlaceholder');

        fireEvent.changeText(usernameInput, 'valid@example.com');
        fireEvent.changeText(passwordInput, 'Password123!');

        // 2. Press login button
        const loginBtn = screen.getByText('login.loginButton');
        fireEvent.press(loginBtn);

        // 3. Wait for success routing via router.replace
        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/(tabs)');
        });

        // 4. Verify auth store updated
        const { isAuthenticated, userId } = useAuthStore.getState();
        expect(isAuthenticated).toBe(true);
        expect(userId).toBe('user-001');
    });

    it('shows input validation errors for invalid data', async () => {
        setup();

        const loginBtn = screen.getByText('login.loginButton');

        // Submit empty form
        fireEvent.press(loginBtn);

        await waitFor(() => {
            expect(router.replace).not.toHaveBeenCalled();
        });
    });
});
