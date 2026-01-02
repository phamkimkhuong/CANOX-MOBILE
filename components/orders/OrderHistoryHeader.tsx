/**
 * ==============================================
 * ORDER HISTORY HEADER - Custom Header Component
 * ==============================================
 * Header cho màn hình lịch sử đơn hàng
 * Bao gồm: Back button + Title + Cart button
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderHistoryHeaderProps {
    onCartPress?: () => void;
    cartBadge?: number;
}

export const OrderHistoryHeader: React.FC<OrderHistoryHeaderProps> = ({
    onCartPress,
    cartBadge = 0,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Back Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => router.back()}
                >
                    <IconSymbol
                        name="arrow-left"
                        size={24}
                        color={theme.colors.typography}
                    />
                </Pressable>

                {/* Title */}
                <Text style={styles.title}>Đơn hàng của tôi</Text>

                {/* Cart Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onCartPress ?? (() => router.push('/(main)/cart'))}
                >
                    <IconSymbol
                        name="cart"
                        size={24}
                        color={theme.colors.typography}
                    />
                    {cartBadge > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {cartBadge > 99 ? '99+' : cartBadge}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        flex: 1,
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
}));
