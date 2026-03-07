import { ForceUpdateScreen } from '@/components/common/ForceUpdateScreen';
import { MaintenanceScreen } from '@/components/common/MaintenanceScreen';
import { SoftUpdateBanner } from '@/components/common/SoftUpdateBanner';
import '@/constants/i18n';
import i18n from '@/constants/i18n';
import '@/constants/unistyles';
import { lightTheme } from '@/constants/unistyles';
import { queryClient } from '@/services/api/queryClient';
import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';

// Enable React Freeze for all screens in the navigation stack.
// This prevents background screens from re-rendering, saving CPU for the active screen.
enableFreeze(true);

import { IntroPopupProvider } from '@/components/IntroPopupProvider';
import CustomAlert from '@/components/ui/feedback/CustomAlert';
import { toastConfig } from '@/components/ui/feedback/CustomToast';
import GlobalLoadingOverlay from '@/components/ui/feedback/GlobalLoadingOverlay';
import { NavigationBarBackground } from '@/components/ui/navigation/NavigationBarBackground';
import { UserSyncProvider } from '@/components/UserSyncProvider';
import { WebSocketProvider } from '@/components/WebSocketProvider';
import { ScrollToTopProvider } from '@/contexts/ScrollToTopContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useOTAUpdate } from '@/hooks/useOTAUpdate';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePushTokenSync } from '@/hooks/usePushTokenSync';
import { useTokenRefreshOnForeground } from '@/hooks/useTokenRefresh';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import { alertRef } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.buttonActive,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.typography,
    border: lightTheme.colors.secondary,
    notification: lightTheme.colors.error,
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isSystemDown = useAppStore((state) => state.isSystemDown);
  const setSystemDown = useAppStore((state) => state.setSystemDown);
  const updateStatus = useAppStore((state) => state.updateStatus);
  const skippedAt = useAppStore((state) => state.skippedAt);
  const skipUpdate = useAppStore((state) => state.skipUpdate);

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Preload Images/Assets
  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          Asset.loadAsync([
            require('../assets/images/icon.png'),
            require('../assets/images/splash-icon.png'),
            // Add other critical UI assets here
          ]),
        ]);
      } catch (e) {
        logger.ui.warn('Asset preloading failed:', e);
      } finally {
        setAssetsLoaded(true);
      }
    }
    prepare();
  }, []);

  const isReady = fontsLoaded && assetsLoaded;

  useAuthGuard();

  // Version Update Check - Runs on mount and foreground resume
  useUpdateCheck();

  // EAS OTA Update - Silent background download (JS-only updates)
  useOTAUpdate();

  // Layer 1: Token refresh when app returns to foreground
  useTokenRefreshOnForeground();

  // Push Notifications - Get FCM token
  const { fcmToken, tokenChanged } = usePushNotifications();

  // Sync push token with backend (auto register/unregister)
  usePushTokenSync(fcmToken, tokenChanged);

  // Sync persisted language with i18next on startup
  const persistedLanguage = useAppStore((state) => state.language);
  useEffect(() => {
    if (persistedLanguage && i18n.language !== persistedLanguage) {
      i18n.changeLanguage(persistedLanguage);
    }
  }, [persistedLanguage]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Privacy Consent (GDPR/Apple)
  const { applyPrivacyPreferences } = usePrivacyConsent();
  useEffect(() => {
    applyPrivacyPreferences();
  }, [applyPrivacyPreferences]);

  useEffect(() => {
    if (isReady) {
      // Small delay ensures UI is painted before hiding splash
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // MAINTENANCE MODE ──
  if (isSystemDown) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <ThemeProvider value={NavigationTheme}>
          <MaintenanceScreen onRetry={() => setSystemDown(false)} />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  // EMERGENCY FORCE UPDATE — Only triggers when `app_force_update = true`
  // in Firebase Console. Default OFF. Used only for critical security issues.
  if (updateStatus === 'force') {
    return (
      <GestureHandlerRootView style={styles.container}>
        <ThemeProvider value={NavigationTheme}>
          <ForceUpdateScreen />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  if (!isReady) {
    return <View style={styles.container} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider autoConnect={false}>
          <ScrollToTopProvider>
            <SafeAreaProvider>
              <BottomSheetModalProvider>
                <ThemeProvider value={NavigationTheme}>
                  <UserSyncProvider>
                    <IntroPopupProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        {/* Tab Navigator - Has Tab Bar */}
                        <Stack.Screen name="(tabs)" />

                        {/* Auth Flow - No Tab Bar */}
                        <Stack.Screen name="(auth)" />

                        {/* Main Stack - All pushed screens (No Tab Bar) */}
                        <Stack.Screen name="(main)" />

                        {/* Global Modal */}
                        <Stack.Screen
                          name="modal"
                          options={{
                            presentation: 'modal',
                            headerShown: true,
                          }}
                        />
                      </Stack>
                    </IntroPopupProvider>
                    {/* Privacy Consent Popup - Shows if not accepted yet */}
                    {/* <PrivacyConsentPopup
                      visible={!hasAcceptedPrivacy}
                      onClose={() => { }}
                    /> */}
                  </UserSyncProvider>
                  <CustomAlert ref={alertRef} />
                  <Toast
                    config={toastConfig}
                    visibilityTime={3000}
                  />
                  {/* Global Loading Overlay - Blocks all interactions during critical operations */}
                  <GlobalLoadingOverlay />
                  {/* Native Update Banner — Primary update mechanism.
                      Shows when a newer native version is available on the Store.
                      User can choose "Update Now" or "Maybe Later" (7-day cooldown). */}
                  {updateStatus === 'soft' && !skippedAt && (
                    <SoftUpdateBanner onDismiss={skipUpdate} />
                  )}
                  <StatusBar style="dark" />
                  {/* Navigation Bar Background - Dark background for device navigation bar area */}
                  <NavigationBarBackground />
                </ThemeProvider>
              </BottomSheetModalProvider>
            </SafeAreaProvider>
          </ScrollToTopProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.surface,
  },
});
