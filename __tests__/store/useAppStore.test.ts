/**
 * Unit Tests for useAppStore
 * Tests the global client state for app settings and persistence behavior.
 */

import { act } from '@testing-library/react-native';
import { useAppStore } from '@/store/useAppStore';

// Mock language utility since it relies on native modules
jest.mock('@/utils/language', () => ({
    getDeviceLanguage: jest.fn(() => 'en'),
}));

// Mock MMKV to simulate persistence successfully
jest.mock('react-native-mmkv', () => {
    return {
        createMMKV: jest.fn(() => ({
            getString: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clearAll: jest.fn(),
            contains: jest.fn(),
        })),
    };
});

describe('useAppStore', () => {
    describe('Theme and Dark Mode', () => {
        it('should initialize with light theme and dark mode disabled', () => {
            const state = useAppStore.getState();
            expect(state.themeMode).toBe('light');
            expect(state.darkModeEnabled).toBe(false);
        });

        it('should allow setting theme mode independently', () => {
            act(() => {
                useAppStore.getState().setThemeMode('system');
            });
            expect(useAppStore.getState().themeMode).toBe('system');
        });

        it('should update themeMode when darkMode is toggled', () => {
            // Enable dark mode
            act(() => {
                useAppStore.getState().setDarkMode(true);
            });
            expect(useAppStore.getState().darkModeEnabled).toBe(true);
            expect(useAppStore.getState().themeMode).toBe('dark');

            // Disable dark mode
            act(() => {
                useAppStore.getState().setDarkMode(false);
            });
            expect(useAppStore.getState().darkModeEnabled).toBe(false);
            expect(useAppStore.getState().themeMode).toBe('light');
        });
    });

    describe('Onboarding and Language', () => {
        it('should initialize with onboarding unseen', () => {
            expect(useAppStore.getState().hasSeenOnboarding).toBe(false);
        });

        it('should update onboarding status', () => {
            act(() => {
                useAppStore.getState().setHasSeenOnboarding(true);
            });
            expect(useAppStore.getState().hasSeenOnboarding).toBe(true);
        });

        it('should initialize language from device default (mocked to en)', () => {
            expect(useAppStore.getState().language).toBe('en');
        });

        it('should allow setting language to vi', () => {
            act(() => {
                useAppStore.getState().setLanguage('vi');
            });
            expect(useAppStore.getState().language).toBe('vi');
        });
    });

    describe('Privacy Consent', () => {
        it('should initialize with no consent', () => {
            const state = useAppStore.getState();
            expect(state.hasAcceptedPrivacy).toBe(false);
            expect(state.crashlyticsConsent).toBe(false);
            expect(state.analyticsConsent).toBe(false);
        });

        it('should update privacy and set hasAcceptedPrivacy to true', () => {
            act(() => {
                useAppStore.getState().updatePrivacyConsent({ crash: true, analytics: false });
            });
            const state = useAppStore.getState();
            expect(state.hasAcceptedPrivacy).toBe(true);
            expect(state.crashlyticsConsent).toBe(true);
            expect(state.analyticsConsent).toBe(false);
        });
    });

    describe('Maintenance and Update State', () => {
        it('should manage system down state', () => {
            expect(useAppStore.getState().isSystemDown).toBe(false);
            act(() => {
                useAppStore.getState().setSystemDown(true);
            });
            expect(useAppStore.getState().isSystemDown).toBe(true);
        });

        it('should initialize update state properly', () => {
            const state = useAppStore.getState();
            expect(state.updateStatus).toBe('none');
            expect(state.updateMessage).toBe('');
            expect(state.skippedVersion).toBeNull();
        });

        it('should update updateInfo', () => {
            act(() => {
                useAppStore.getState().setUpdateInfo({
                    updateStatus: 'force',
                    updateMessage: 'Please update',
                    updateStoreUrl: 'https://store',
                });
            });
            const state = useAppStore.getState();
            expect(state.updateStatus).toBe('force');
            expect(state.updateMessage).toBe('Please update');
            expect(state.updateStoreUrl).toBe('https://store');
        });

        it('should logic for skipping update', () => {
            act(() => {
                useAppStore.getState().skipUpdate();
            });
            const state = useAppStore.getState();
            // Should set status to none and record skip timestamp
            expect(state.updateStatus).toBe('none');
            expect(state.skippedVersion).toBe('skipped');
            expect(state.skippedAt).not.toBeNull();
        });

        it('should clear skipped update info', () => {
            // First skip it
            act(() => {
                useAppStore.getState().skipUpdate();
            });
            
            // Then clear it
            act(() => {
                useAppStore.getState().clearSkippedUpdate();
            });
            const state = useAppStore.getState();
            expect(state.skippedVersion).toBeNull();
            expect(state.skippedAt).toBeNull();
        });
    });
});
