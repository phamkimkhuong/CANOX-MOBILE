import { IconSymbol } from '@/components/ui/Icon';
import { SmartNavButton } from '@/components/ui/navigation/SmartNavButton';
import { ROUTES } from '@/constants/routes';
import { usePrefetchCart } from '@/hooks/api/cart/useCart';
import { useUnreadMessageCount } from '@/hooks/api/chat';
import { usePrefetchChat } from '@/hooks/api/chat/useChatList';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Navigator } from '@/utils/navigation';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface HeaderButtonProps {
    color?: string;
    badgeBorderColor?: string;
}

/**
 * CartHeaderButton - Nút giỏ hàng dùng chung cho header
 * Hiển thị số lượng item hiện có.
 */
export const CartHeaderButton: React.FC<HeaderButtonProps> = ({ color, badgeBorderColor }) => {
    const { theme } = useUnistyles();
    const cartItemCount = useCartStore((state) => state.totalQuantity);
    const prefetchCart = usePrefetchCart();
    const styles = stylesheet;

    // Default to white if no color provided (Standard red header)
    const iconColor = color || theme.colors.header.onHeader;
    const borderColor = badgeBorderColor || theme.colors.header.headerBackground;

    const handlePress = useCallback(() => {
        Navigator.push(ROUTES.CART.INDEX);
    }, []);

    return (
        <SmartNavButton
            route={ROUTES.CART.INDEX}
            onPress={handlePress}
            style={styles.iconBtn}
            onPressIn={prefetchCart}
        >
            {({ pressed }) => (
                <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                    <IconSymbol name="cart" size={26} color={iconColor} />
                    {cartItemCount > 0 && (
                        <View style={[styles.badge, { borderColor }]}>
                            <Text style={styles.badgeText}>
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SmartNavButton>
    );
};

/**
 * ChatHeaderButton - Nút chat dùng chung cho header
 * Hiển thị số tin nhắn chưa đọc.
 */
export const ChatHeaderButton: React.FC<HeaderButtonProps> = ({ color, badgeBorderColor }) => {
    const { theme } = useUnistyles();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { data: unreadMessageCount } = useUnreadMessageCount();
    const prefetchChat = usePrefetchChat();
    const styles = stylesheet;

    // Default to white if no color provided (Standard red header)
    const iconColor = color || theme.colors.header.onHeader;
    const borderColor = badgeBorderColor || theme.colors.header.headerBackground;

    const handlePress = useCallback(() => {
        Navigator.push(ROUTES.TABS.CHAT);
    }, []);

    // Chỉ hiển thị tin nhắn nếu đã đăng nhập
    if (!isAuthenticated) return null;

    return (
        <SmartNavButton
            route={ROUTES.TABS.CHAT}
            onPress={handlePress}
            style={styles.iconBtn}
            onPressIn={prefetchChat}
        >
            {({ pressed }) => (
                <View style={[styles.iconWrapper, pressed && styles.pressedOpacity]}>
                    <IconSymbol name="chatbubble-ellipses-outline" size={26} color={iconColor} />
                    {unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                        <View style={[styles.badge, { borderColor }]}>
                            <Text style={styles.badgeText}>
                                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SmartNavButton>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    iconBtn: {
        padding: 4,
        position: 'relative',
    },
    iconWrapper: {
        position: 'relative',
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressedOpacity: {
        opacity: 0.7,
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
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
}));
