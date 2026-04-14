import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { Notification, NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { formatTime } from '@/utils/date';
import { toSizedImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface NotificationItemProps {
    item: Notification;
    onPress?: (item: Notification) => void;
    /** Called when user starts touching - used for prefetching data */
    onPressIn?: (item: Notification) => void;
    /** Called when user releases touch - used to cancel pending prefetch */
    onPressOut?: (item: Notification) => void;
}

export const NotificationItem = memo<NotificationItemProps>(({ item, onPress, onPressIn, onPressOut }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const config = NOTIFICATION_TYPE_CONFIG[item.type] || NOTIFICATION_TYPE_CONFIG.SYSTEM;

    /**
     * Handle press - navigate to target screen
     */
    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    /**
     * Handle press in - trigger prefetch while finger is still on screen
     */
    const handlePressIn = useCallback(() => {
        onPressIn?.(item);
    }, [item, onPressIn]);

    /**
     * Handle press out - cancel prefetch if user moved or released quickly
     */
    const handlePressOut = useCallback(() => {
        onPressOut?.(item);
    }, [item, onPressOut]);

    const renderIcon = () => {
        // If has product image, show image instead of icon
        if (item.image) {
            return (
                <Image
                    source={{ uri: toSizedImageUrl(item.image, null, 'thumb') ?? item.image }}
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                />
            );
        }

        // Show type-specific icon
        return (
            <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
                <IconSymbol
                    name={config.icon as IconSymbolName}
                    size={28}
                    color={config.iconColor}
                />
            </View>
        );
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                !item.isRead && styles.containerUnread,
                pressed && styles.containerPressed,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            {/* Unread dot indicator */}
            {!item.isRead && <View style={styles.unreadDot} />}

            <View style={styles.content}>
                {renderIcon()}

                <View style={styles.textContent}>
                    <Text style={styles.title}>
                        {item.title}
                    </Text>
                    <Text style={styles.message}>
                        {item.message}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                        {item.actionLabel && (
                            <>
                                <View style={styles.dot} />
                                <Text style={styles.actionLabel}>{item.actionLabel}</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            <IconSymbol
                name="chevron-right"
                size={20}
                color={theme.colors.secondary}
                style={styles.chevron}
            />
        </Pressable>
    );
});

NotificationItem.displayName = 'NotificationItem';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    containerUnread: {
        backgroundColor: theme.colors.primarySubtle,
    },
    containerPressed: {
        opacity: 0.85,
    },
    unreadDot: {
        position: 'absolute',
        top: theme.margins.smd,
        right: theme.margins.smd,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.error,
        borderWidth: 2,
        borderColor: theme.colors.surface,
        zIndex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.smd,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
        gap: theme.margins.sm,
    },
    time: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.secondary,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    chevron: {
        marginLeft: theme.margins.sm,
    },
}));
