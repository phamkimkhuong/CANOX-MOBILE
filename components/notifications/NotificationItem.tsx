import { Notification, NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface NotificationItemProps {
    item: Notification;
    onPress?: (item: Notification) => void;
}

/**
 * Format timestamp to readable time
 */
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Vừa xong' : `${diffMinutes} phút trước`;
    }

    if (diffHours < 24) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const config = NOTIFICATION_TYPE_CONFIG[item.type];

    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    const renderIcon = () => {
        // If has product image, show image instead of icon
        if (item.image) {
            return (
                <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                />
            );
        }

        // Show type-specific icon
        return (
            <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
                <MaterialIcons
                    name={config.icon as MaterialIconName}
                    size={28}
                    color={config.iconColor}
                />
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={[styles.container, !item.isRead && styles.containerUnread]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Unread dot indicator */}
            {!item.isRead && <View style={styles.unreadDot} />}

            <View style={styles.content}>
                {renderIcon()}

                <View style={styles.textContent}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
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

            <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.secondary}
                style={styles.chevron}
            />
        </TouchableOpacity>
    );
};

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
