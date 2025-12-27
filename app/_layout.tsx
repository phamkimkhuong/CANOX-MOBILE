import '@/constants/unistyles';
import { lightTheme } from '@/constants/unistyles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { toastConfig } from '@/components/ui/CustomToast';
import { WebSocketProvider } from '@/components/WebSocketProvider';
import { useAuthGuard } from '@/hooks/useAuthGuard';
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
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Thử lại 2 lần nếu lỗi mạng
      staleTime: 1000 * 60, // Data cũ sau 1 phút
    },
  },
});

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
          <SafeAreaProvider>
            {/* 3. Inject Theme vào Navigation */}

            <ThemeProvider value={NavigationTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                {/* Config UI Chat */}
                <Stack.Screen
                  name="chat"
                  options={{
                    headerShown: false, // Ẩn header mặc định của React Navigation để tự custom
                    title: 'Tin nhắn',
                    presentation: 'card', // Hiệu ứng đẩy sang ngang chuẩn iOS/Android
                    animation: 'slide_from_right'
                  }}
                />
              </Stack>
              <Toast config={toastConfig} />
              {/* 4. StatusBar luôn là Dark Content (chữ đen) vì nền sáng */}
              <StatusBar style="dark" />
            </ThemeProvider>
          </SafeAreaProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
