import type { BiometricStatus } from '@/types/settings';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseBiometricsReturn {
    /** Current biometric status */
    status: BiometricStatus;
    /** Whether biometrics is enabled by user preference */
    isEnabled: boolean;
    /** Whether hardware supports biometrics */
    isSupported: boolean;
    /** Whether user has enrolled biometrics on device */
    isEnrolled: boolean;
    /** Loading state during detection */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Toggle biometric authentication */
    toggleBiometrics: () => Promise<boolean>;
    /** Authenticate with biometrics */
    authenticate: (options?: { promptMessage?: string }) => Promise<boolean>;
}

/**
 * Hook for managing biometric authentication
 * Handles hardware detection, enrollment status, and user preference
 */
export function useBiometrics(
    initialEnabled: boolean = false,
    onToggle?: (enabled: boolean) => void
): UseBiometricsReturn {
    const [status, setStatus] = useState<BiometricStatus>({
        isSupported: false,
        isEnrolled: false,
        biometryType: null,
    });
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const appState = useRef(AppState.currentState);

    /**
     * Detect biometric capabilities & enrollment status
     */
    const detectBiometrics = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setIsLoading(true);
            setError(null);

            // Check hardware support
            const hasHardware = await LocalAuthentication.hasHardwareAsync();

            // Check if user has enrolled biometrics
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            // Get supported authentication types
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            // Determine biometry type
            let biometryType: BiometricStatus['biometryType'] = null;
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                biometryType = 'face';
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                biometryType = 'fingerprint';
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                biometryType = 'iris';
            }

            setStatus({
                isSupported: hasHardware,
                isEnrolled,
                biometryType,
            });

            // If hardware doesn't support or not enrolled, and it was previously enabled, disable it
            if (!hasHardware || !isEnrolled) {
                if (isEnabled) {
                    setIsEnabled(false);
                    onToggle?.(false);
                }
            }
        } catch (err) {
            setError('Không thể kiểm tra sinh trắc học');
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [isEnabled, onToggle]);

    // Detect on mount
    useEffect(() => {
        detectBiometrics();
    }, []);

    // Sync status when app returns from background
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // Refresh silently when coming to foreground
                detectBiometrics(true);
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [detectBiometrics]);

    /**
     * Authenticate user with biometrics
     */
    const authenticate = useCallback(async (options?: { promptMessage?: string }): Promise<boolean> => {
        if (!status.isSupported || !status.isEnrolled) {
            return false;
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: options?.promptMessage ?? 'Xác thực để tiếp tục',
                cancelLabel: 'Hủy',
                disableDeviceFallback: false,
                fallbackLabel: 'Sử dụng mật khẩu',
            });

            return result.success;
        } catch (err) {
            setError('Xác thực thất bại');
            return false;
        }
    }, [status.isSupported, status.isEnrolled]);

    /**
     * Toggle biometric authentication
     * If enabling, requires successful authentication first
     */
    const toggleBiometrics = useCallback(async (): Promise<boolean> => {
        // Cannot enable if not supported or enrolled
        if (!status.isSupported) {
            setError('Thiết bị không hỗ trợ sinh trắc học');
            return false;
        }

        if (!status.isEnrolled) {
            setError('Vui lòng thiết lập sinh trắc học trong cài đặt thiết bị');
            return false;
        }

        const newValue = !isEnabled;

        // If enabling, require authentication first
        if (newValue) {
            const authenticated = await authenticate({
                promptMessage: 'Xác thực để bật sinh trắc học',
            });

            if (!authenticated) {
                // User cancelled or failed - don't toggle
                return false;
            }
        }

        setIsEnabled(newValue);
        setError(null);
        onToggle?.(newValue);
        return true;
    }, [status, isEnabled, authenticate, onToggle]);

    return {
        status,
        isEnabled,
        isSupported: status.isSupported,
        isEnrolled: status.isEnrolled,
        isLoading,
        error,
        toggleBiometrics,
        authenticate,
    };
}

/**
 * Get display name for biometry type
 */
export function getBiometryDisplayName(type: BiometricStatus['biometryType']): string {
    switch (type) {
        case 'face':
            return 'Face ID';
        case 'fingerprint':
            return 'Touch ID / Vân tay';
        case 'iris':
            return 'Iris';
        default:
            return 'Sinh trắc học';
    }
}
