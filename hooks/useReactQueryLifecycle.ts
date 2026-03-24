import { logger } from '@/utils/logger';
import { focusManager, onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

/**
 * Bridges React Native lifecycle/network events into TanStack Query.
 *
 * - AppState -> focusManager
 * - expo-network -> onlineManager
 *
 * This should be mounted once at the app root.
 */
export const useReactQueryLifecycle = (): void => {
    useEffect(() => {
        if (Platform.OS === 'web') return;

        const handleAppStateChange = (status: AppStateStatus) => {
            focusManager.setFocused(status === 'active');
        };

        focusManager.setFocused(AppState.currentState === 'active');

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            focusManager.setFocused(undefined);
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web') return;

        onlineManager.setEventListener((setOnline) => {
            let initialized = false;

            const eventSubscription = Network.addNetworkStateListener((state) => {
                initialized = true;
                setOnline(!!state.isConnected);
            });

            void Network.getNetworkStateAsync()
                .then((state) => {
                    if (!initialized) {
                        setOnline(!!state.isConnected);
                    }
                })
                .catch((error: unknown) => {
                    logger.api.warn('[ReactQueryLifecycle] Failed to read initial network state', error);
                });

            return () => {
                eventSubscription.remove();
            };
        });

        return () => {
            onlineManager.setEventListener(() => undefined);
        };
    }, []);
};

export default useReactQueryLifecycle;
