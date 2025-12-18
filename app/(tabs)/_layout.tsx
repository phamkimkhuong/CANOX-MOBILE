import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuthStore } from '@/store/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

// Helper để render Icon gọn gàng
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
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
        }}
      />
      {/* 3. Giỏ hàng/Cart ( app/(tabs)/cart.tsx) */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
          // Hiện badge số lượng sản phẩm trong giỏ hàng khi có (cần update số lượng động)
          tabBarBadge: 4,
        }}
        listeners={
          {
            tabPress: (e) => {
              if (!isAuthenticated) {
                // 1. Chặn hành động chuyển Tab mặc định (Ngăn không cho mount CartScreen)
                e.preventDefault();
                // 2. Chuyển hướng sang trang Login thủ công
                router.push('/(auth)/login');
              }
            },
          }
        }
      />
      {/* 4. Thông báo/Notifications ( app/(tabs)/notify.tsx) */}
      <Tabs.Screen
        name="notify"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications" color={color} />,
          tabBarBadge: 7,
        }}
      />
      {/* 5. Tôi/Me ( app/(tabs)/me.tsx) */}
      <Tabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
