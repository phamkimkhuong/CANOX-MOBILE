import { RollingSearchPlaceholder } from '@/components/search/RollingSearchPlaceholder';
import { IconSymbol } from '@/components/ui/Icon';
import { SmartNavButton } from '@/components/ui/navigation/SmartNavButton';
import { ROUTES, searchRoutes } from '@/constants/routes';
import '@/constants/unistyles';
import { usePrefetchCart } from '@/hooks/api/cart/useCart';
import { useUnreadMessageCount } from '@/hooks/api/chat';
import { usePrefetchChat } from '@/hooks/api/chat/useChatList';
import { useHotKeywords } from '@/hooks/api/search';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Navigator } from '@/utils/navigation';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/**
 * HomeHeader - Header component cho trang chủ
 * Bao gồm thanh tìm kiếm với Rolling Keywords và các nút chức năng.
 */
export const HomeHeader = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const cartItemCount = useCartStore((state) => state.totalQuantity);

    // Abstracted Prefetch Actions (Architecture compliant)
    const prefetchCart = usePrefetchCart();
    const prefetchChat = usePrefetchChat();

    // Fetch hot keywords for rolling placeholder
    const { data: hotKeywords, isLoading: isLoadingKeywords } = useHotKeywords({ limit: 10 });

    // Extract keywords array from hot keywords data
    const rollingKeywords = useMemo(() => {
        if (!hotKeywords || hotKeywords.length === 0) return [];
        return hotKeywords.map((item) => item.keyword);
    }, [hotKeywords]);

    // Fetch unread message count for chat badge
    const { data: unreadMessageCount } = useUnreadMessageCount();
    const { t } = useTranslation('home');

    // Navigate to search entry screen
    const handleSearchPress = useCallback(() => {
        Navigator.push(searchRoutes.entry());
    }, []);

    // Navigate to cart screen with double-tap protection
    const handleCartPress = useCallback(() => {
        Navigator.push(isAuthenticated ? ROUTES.CART.INDEX : ROUTES.AUTH.LOGIN);
    }, [isAuthenticated]);

    // Navigate to chat screen with double-tap protection
    const handleChatPress = useCallback(() => {
        Navigator.push(isAuthenticated ? ROUTES.TABS.CHAT : ROUTES.AUTH.LOGIN);
    }, [isAuthenticated]);

    return (
        <View style={styles.headerContainer}>
            {/* 1. Thanh tìm kiếm - Rolling Keywords */}
            <Pressable
                style={({ pressed }) => [
                    styles.searchContainer,
                    pressed && styles.searchContainerPressed,
                ]}
                onPress={handleSearchPress}
            >
                <IconSymbol name="search" size={20} color={theme.colors.header.onHeader} style={styles.searchIcon} />

                <View style={styles.placeholderContainer}>
                    <RollingSearchPlaceholder
                        keywords={rollingKeywords}
                        fallbackText={t('search.placeholder')}
                        animate={!isLoadingKeywords && rollingKeywords.length > 1}
                        interval={3500}
                    />
                </View>
            </Pressable>

            {/* 2. Các nút chức năng */}
            <View style={styles.actions}>
                <SmartNavButton
                    route={isAuthenticated ? ROUTES.CART.INDEX : ROUTES.AUTH.LOGIN}
                    onPress={handleCartPress}
                    style={styles.iconBtn}
                    onPressIn={prefetchCart}
                >
                    {({ pressed }) => (
                        <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                            <IconSymbol name="cart" size={26} color={theme.colors.header.onHeader} />
                            {cartItemCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </SmartNavButton>

                {/* {Router to chat.tsx} */}
                <SmartNavButton
                    route={isAuthenticated ? ROUTES.TABS.CHAT : ROUTES.AUTH.LOGIN}
                    onPress={handleChatPress}
                    style={styles.iconBtn}
                    onPressIn={prefetchChat}
                >
                    {({ pressed }) => (
                        <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                            <IconSymbol name="chatbubble-ellipses-outline" size={26} color={theme.colors.header.onHeader} />
                            {isAuthenticated && unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </SmartNavButton>
            </View>

        </View>
    );
};
const stylesheet = StyleSheet.create((theme) => ({
    headerContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        paddingTop: UnistylesRuntime.insets.top + 10,
        backgroundColor: theme.colors.header.headerBackground,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceOverlay,
        paddingHorizontal: 5,
    },
    searchIcon: {
        marginLeft: 10,
    },
    placeholderContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    searchContainerPressed: {
        backgroundColor: theme.colors.backgroundInput,
    },
    searchPlaceholder: {
        flex: 1,
        paddingHorizontal: 8,
        fontSize: theme.fontSizes.md,
        color: theme.colors.secondary,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        fontSize: theme.fontSizes.md,
        color: theme.colors.typography,
        fontFamily: 'System', // Thay bằng font custom nếu có
    },
    cameraBtn: {
        padding: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        padding: 4,
        position: 'relative',
    },
    iconWrapper: {
        position: 'relative',
    },
    pressedOpacity: {
        opacity: 0.9,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff', // Tạo viền trắng cho badge nổi bật
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    }
}));
