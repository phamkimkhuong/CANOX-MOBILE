import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useScrollToTopContext } from '@/contexts/ScrollToTopContext';
import { useCart } from '@/hooks/api/cart/useCart';
import { useUnreadNotificationCount } from '@/hooks/api/notification/useNotifications';
import { usePriceTargetMetCount } from '@/hooks/api/wishlist/usePriceTargetMet';
import { Tabs, usePathname } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Helper để render Icon gọn gàng với IconSymbol
function TabBarIcon(props: {
  name: IconSymbolName;
  color: string;
}) {
  return <IconSymbol size={24} name={props.name} color={props.color} />;
}

export const ErrorBoundary = createRouteErrorBoundary({
  scope: 'group',
  titleKey: 'common:crash.tabs.title',
  messageKey: 'common:crash.tabs.message',
});

export default function TabLayout() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const { t } = useTranslation('common');
  useCart();

  // Current pathname to detect if already on home tab
  const pathname = usePathname();

  // Fetch unread notification count for badge
  const { data: unreadNotificationCount } = useUnreadNotificationCount();

  // Fetch price target met count for wishlist badge
  const priceTargetCount = usePriceTargetMetCount();

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
   * Handler: When user presses Notify tab while ALREADY on Notify tab
   * => Scroll to top
   */
  const handleNotifyTabPress = useCallback(() => {
    if (pathname === '/notify') {
      triggerScrollToTop('notify');
    }
  }, [pathname, triggerScrollToTop]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.buttonActive,
        tabBarInactiveTintColor: theme.colors.typographySecondary,
        tabBarStyle: styles.tabBar,
        headerShown: useClientOnlyValue(false, true),
      }}>
      {/* 1. Trang chủ app/(tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('bottomTab.home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
        listeners={{
          tabPress: handleHomeTabPress,
        }}
      />
      {/* 2. Yêu thích/Wishlist ( app/(tabs)/wishlist.tsx) */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('bottomTab.wishlist'),
          tabBarIcon: ({ color }) => <TabBarIcon name="favorite" color={color} />,
          tabBarBadge: priceTargetCount > 0 ? priceTargetCount : undefined,
          tabBarBadgeStyle: priceTargetCount > 0 ? styles.wishlistBadge : undefined,
          headerShown: false,
        }}
      />
      {/* 3. Video ( app/(tabs)/video.tsx) */}
      <Tabs.Screen
        name="video"
        options={{
          title: t('bottomTab.video'),
          tabBarIcon: ({ color }) => <TabBarIcon name="video" color={color} />,
          headerShown: false,
        }}
      />
      {/* 4. Thông báo/Notifications ( app/(tabs)/notify.tsx) */}
      <Tabs.Screen
        name="notify"
        options={{
          title: t('bottomTab.notify'),
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications" color={color} />,
          tabBarBadge: unreadNotificationCount && unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          headerShown: false,
        }}
        listeners={{
          tabPress: handleNotifyTabPress,
        }}
      />
      {/* 5. Tôi/Me ( app/(tabs)/me.tsx) */}
      <Tabs.Screen
        name="me"
        options={{
          title: t('bottomTab.me'),
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  tabIcon: {
    marginBottom: -3,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0,
    elevation: 5,
  },
  wishlistBadge: {
    backgroundColor: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
}));
