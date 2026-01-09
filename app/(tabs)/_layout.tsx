import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ROUTES } from '@/constants/routes';
import { useScrollToTopContext } from '@/contexts/ScrollToTopContext';
import { useCart } from '@/hooks/api/cart/useCart';
import { useUnreadMessageCount } from '@/hooks/api/chat';
import { useUnreadNotificationCount } from '@/hooks/api/notification/useNotifications';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { router, Tabs, usePathname } from 'expo-router';
import React, { useCallback } from 'react';
import { useUnistyles } from 'react-native-unistyles';

// Helper để render Icon gọn gàng với IconSymbol
function TabBarIcon(props: {
  name: IconSymbolName;
  color: string;
}) {
  return <IconSymbol size={24} style={{ marginBottom: -3 }} {...props} />;
}

// // You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
// function TabBarIcon(props: {
//   name: React.ComponentProps<typeof FontAwesome>['name'];
//   color: string;
// }) {
//   return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
// }

export default function TabLayout() {
  const { theme } = useUnistyles();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useCart();
  const cartItemCount = useCartStore((state) => state.totalQuantity);

  // Current pathname to detect if already on home tab
  const pathname = usePathname();

  // Fetch unread notification count for badge
  const { data: unreadNotificationCount } = useUnreadNotificationCount();

  // Fetch unread message count for chat badge
  const { data: unreadMessageCount } = useUnreadMessageCount();

  // Scroll to top context
  const { triggerScrollToTop } = useScrollToTopContext();

  /**
   * Handler: When user presses Home tab while ALREADY on Home tab
   * => Scroll to top
   */
  const handleHomeTabPress = useCallback(() => {
    // Only trigger scroll-to-top if already on home tab
    const isAlreadyOnHome = pathname === '/' || pathname === '/index' || pathname === '';
    if (isAlreadyOnHome) {
      triggerScrollToTop('index');
    }
  }, [pathname, triggerScrollToTop]);

  /**
   * Create protected tab press handler
   * Prevents tab navigation and redirects to login if not authenticated
   * This prevents the 'child already has parent' crash on Android
   */
  const createProtectedTabListener = useCallback(() => ({
    tabPress: (e: { preventDefault: () => void }) => {
      if (!isAuthenticated) {
        e.preventDefault();
        router.push(ROUTES.AUTH.LOGIN);
      }
    },
  }), [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.typographySecondary,
        // default background for tab bar
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 5, // Đổ bóng trên Android
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        // headerShown: false,
      }}>
      {/* 1. Trang chủ app/(tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
        listeners={{
          tabPress: handleHomeTabPress,
        }}
      />
      {/* 2. Danh mục/Category ( app/(tabs)/category.tsx) */}
      <Tabs.Screen
        name="category"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color }) => <TabBarIcon name="category" color={color} />,
          headerShown: false,
        }}
      />
      {/* 4. Thông báo/Notifications ( app/(tabs)/notify.tsx) */}
      <Tabs.Screen
        name="notify"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications" color={color} />,
          tabBarBadge: unreadNotificationCount && unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          headerShown: false,
        }}
        listeners={createProtectedTabListener}
      />
      {/* 5. Tin nhắn/Chat ( app/(tabs)/chat.tsx) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <TabBarIcon name="chat-bubble" color={color} />,
          tabBarBadge: unreadMessageCount && unreadMessageCount > 0 ? unreadMessageCount : undefined,
          headerShown: false,
        }}
        listeners={createProtectedTabListener}
      />
      {/* 5. Tôi/Me ( app/(tabs)/me.tsx) */}
      <Tabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
