import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ROUTES } from '@/constants/routes';
import { useCart } from '@/hooks/api/useCart';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { router, Tabs } from 'expo-router';
import React from 'react';
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
      {/* 3. Tin nhắn/Chat ( app/(tabs)/chat.tsx)
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <TabBarIcon name="chat-bubble" color={color} />,
          tabBarBadge: 3,
          headerShown: false,
        }}
      /> */}
      {/* 4. Thông báo/Notifications ( app/(tabs)/notify.tsx) */}
      <Tabs.Screen
        name="notify"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications" color={color} />,
          tabBarBadge: 7,
          headerShown: false,
        }}
      />
      {/* 4. Tin nhắn/Chat ( app/(tabs)/chat.tsx) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <TabBarIcon name="chat-bubble" color={color} />,
          tabBarBadge: 3,
          headerShown: false,
        }}
        listeners={
          {
            tabPress: (e) => {
              if (!isAuthenticated) {
                // Chặn hành động chuyển Tab mặc định (Ngăn không cho mount CartScreen)
                e.preventDefault();
                // Chuyển hướng sang trang Login thủ công
                router.push(ROUTES.AUTH.LOGIN);
              }
            },
          }
        }
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
