import '@/constants/i18n';
import '@/constants/unistyles';
import { lightTheme } from '@/constants/unistyles';
import { queryClient } from '@/services/api/queryClient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CustomAlert from '@/components/ui/CustomAlert';
import { toastConfig } from '@/components/ui/CustomToast';
import { UserSyncProvider } from '@/components/UserSyncProvider';
import { WebSocketProvider } from '@/components/WebSocketProvider';
import { ScrollToTopProvider } from '@/contexts/ScrollToTopContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTokenRefreshOnForeground } from '@/hooks/useTokenRefresh';
import { alertRef } from '@/utils/AlertHelper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary,
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
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useAuthGuard();

  // Layer 1: Token refresh when app returns to foreground
  useTokenRefreshOnForeground();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    // return null;
    return <View />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider autoConnect={false}>
          <ScrollToTopProvider>
            <SafeAreaProvider>
              {/* 3. Inject Theme into Navigation */}

              <ThemeProvider value={NavigationTheme}>
                <UserSyncProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Tab Navigator - Has Tab Bar */}
                    <Stack.Screen name="(tabs)" />

                    {/* Auth Flow - No Tab Bar */}
                    <Stack.Screen name="(auth)" />

                    {/* Main Stack - All pushed screens (No Tab Bar) */}
                    {/* Header managed by (main)/_layout.tsx */}
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
                </UserSyncProvider>
                <CustomAlert ref={alertRef} />
                <Toast
                  config={toastConfig}
                  visibilityTime={3000}
                />
                {/* 4. StatusBar always Dark Content (black text) because of light background */}
                <StatusBar style="dark" />
              </ThemeProvider>
            </SafeAreaProvider>
          </ScrollToTopProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
