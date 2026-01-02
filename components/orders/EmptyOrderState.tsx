/**
 * ==============================================
 * EMPTY ORDER STATE - Khi không có đơn hàng
 * ==============================================
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface EmptyOrderStateProps {
    status: string;
    onShopNow?: () => void;
}

const STATUS_MESSAGES: Record<string, { title: string; description: string; icon: IconSymbolName }> = {
    CREATED: {
        title: 'Chưa có đơn hàng chờ xác nhận',
        description: 'Các đơn hàng mới đặt sẽ hiển thị ở đây',
        icon: 'clock-outline',
    },
    FULFILLING: {
        title: 'Không có đơn hàng đang giao',
        description: 'Đơn hàng đang được xử lý sẽ hiển thị ở đây',
        icon: 'truck-fast-outline',
    },
    DELIVERED: {
        title: 'Chưa có đơn hàng đã giao',
        description: 'Đơn hàng đã giao thành công sẽ hiển thị ở đây',
        icon: 'package-variant-closed-check',
    },
    COMPLETED: {
        title: 'Chưa có đơn hàng hoàn thành',
        description: 'Đơn hàng đã hoàn tất sẽ hiển thị ở đây',
        icon: 'check-all',
    },
    CANCELLED: {
        title: 'Không có đơn hàng đã hủy',
        description: 'Đơn hàng bị hủy sẽ hiển thị ở đây',
        icon: 'close-circle-outline',
    },
};

export const EmptyOrderState: React.FC<EmptyOrderStateProps> = ({
    status,
    onShopNow,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const message = STATUS_MESSAGES[status] || STATUS_MESSAGES.CREATED;

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name={message.icon}
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.description}>{message.description}</Text>

            {onShopNow && (
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onShopNow}
                >
                    <IconSymbol
                        name="shopping-outline"
                        size={18}
                        color={theme.colors.onPrimary}
                    />
                    <Text style={styles.buttonText}>Mua sắm ngay</Text>
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.xxl,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.backgroundSurface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        marginTop: theme.margins.lg,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
