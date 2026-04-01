import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { Conversation, MessageType, PARTNER_TYPE_CONFIG } from '@/types/chat';
import { formatTime } from '@/utils/date';
import { toSizedImageUrl } from '@/utils/url';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';
import { OnlineStatusBadge } from './OnlineStatusBadge';

// Current user ID for checking message sender
const CURRENT_USER_ID = 'user_001';

// Swipe thresholds
const SWIPE_THRESHOLD_LEFT = 80; // Ngưỡng mở Mute/Delete
const SWIPE_THRESHOLD_RIGHT = 40; // Ngưỡng mở Pin
const MAX_SWIPE_LEFT = 160;
const MAX_SWIPE_RIGHT = 80;
const HAPTIC_THRESHOLD = 50; // Ngưỡng rung nhẹ khi kéo

interface ConversationItemProps {
    item: Conversation;
    /** Currently opened row ID for mutual exclusion */
    openedRowId?: string | null;
    /** Callback when this row is swiped open */
    onSwipeOpen?: (id: string | null) => void;
    onPress?: (item: Conversation) => void;
    onPin?: (item: Conversation) => void;
    onMute?: (item: Conversation) => void;
    onDelete?: (item: Conversation) => void;
}

/**
 * ConversationItem - Hiển thị một cuộc trò chuyện với swipe actions
 */
export const ConversationItem = memo<ConversationItemProps>(({
    item,
    openedRowId,
    onSwipeOpen,
    onPress,
    onPin,
    onMute,
    onDelete,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['chat', 'common']);
    const styles = stylesheet;

    const translateX = useSharedValue(0);
    useAnimatedReaction(
        () => openedRowId,
        (currentOpenId) => {
            if (currentOpenId && currentOpenId !== item.id && translateX.value !== 0) {
                translateX.value = withTiming(0, { duration: 300 });
            }
        },
        [openedRowId, item.id]
    );
    const contextX = useRef(0);

    const isFromMe = item.lastMessage.senderId === CURRENT_USER_ID;
    const hasUnread = item.unreadCount > 0;
    const partnerConfig = PARTNER_TYPE_CONFIG[item.partner.type];

    /**
     * Get message preview with icon based on type
     */
    const getMessagePreview = (
        lastMessage: Conversation['lastMessage'],
        isFromMe: boolean
    ): { icon?: IconSymbolName; text: string } => {
        const prefix = isFromMe ? t('chat:list.messageYou') : '';

        switch (lastMessage.type) {
            case MessageType.IMAGE:
                return { icon: 'image', text: `${prefix}${t('chat:list.messageSentImage')}` };
            case MessageType.VIDEO:
                return { icon: 'video', text: `${prefix}${t('chat:list.messageSentVideo')}` };
            case MessageType.PRODUCT_CARD:
                return {
                    icon: 'bag',
                    text: `${prefix}${t('chat:list.messageProduct', { name: lastMessage.content })}`
                };
            case MessageType.ORDER_CARD:
                return { icon: 'shipping', text: lastMessage.content };
            case MessageType.FILE:
                return { icon: 'attach', text: lastMessage.content };
            default:
                return { text: `${prefix}${lastMessage.content}` };
        }
    };

    const messagePreview = getMessagePreview(item.lastMessage, isFromMe);

    // Auto-close this row when another row is opened (mutual exclusion)
    useEffect(() => {
        if (openedRowId !== null && openedRowId !== item.id && translateX.value !== 0) {
            translateX.value = withSpring(0, { damping: 20 });
        }
    }, [openedRowId, item.id, translateX]);

    // Notify parent when this row is swiped open
    const notifySwipeOpen = useCallback(
        (isOpen: boolean) => {
            onSwipeOpen?.(isOpen ? item.id : null);
        },
        [item.id, onSwipeOpen]
    );

    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    const handlePin = useCallback(() => {
        translateX.value = withSpring(0);
        onPin?.(item);
    }, [item, onPin, translateX]);

    const handleMute = useCallback(() => {
        translateX.value = withSpring(0);
        onMute?.(item);
    }, [item, onMute, translateX]);

    const handleDelete = useCallback(() => {
        translateX.value = withSpring(0);
        onDelete?.(item);
    }, [item, onDelete, translateX]);

    // Track if haptic has been triggered for current gesture
    const hasTriggeredHaptic = useRef(false);

    // Pan gesture for swipe actions
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-5, 5])
        .onStart(() => {
            contextX.current = translateX.value;
            hasTriggeredHaptic.current = false;
        })
        .onUpdate((event) => {
            const newValue = contextX.current + event.translationX;
            // Clamp between -MAX_SWIPE_LEFT and MAX_SWIPE_RIGHT
            translateX.value = Math.max(-MAX_SWIPE_LEFT, Math.min(MAX_SWIPE_RIGHT, newValue));

            // Trigger haptic feedback khi vượt ngưỡng rung
            if (!hasTriggeredHaptic.current && Math.abs(newValue) > HAPTIC_THRESHOLD) {
                hasTriggeredHaptic.current = true;
                scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
            }
        })
        .onEnd((event) => {
            const velocity = event.velocityX;
            const currentX = translateX.value;

            // Tính toán điểm dừng
            const isSwipeLeft = currentX < 0;
            const isSwipeRight = currentX > 0;

            if (isSwipeLeft) {
                // Kéo trái: Cần vượt ngưỡng 80px hoặc vận tốc nhanh
                const shouldOpen = currentX < -SWIPE_THRESHOLD_LEFT || velocity < -500;
                translateX.value = withSpring(shouldOpen ? -MAX_SWIPE_LEFT : 0, {
                    damping: 25,
                    stiffness: 150,
                    overshootClamping: true
                });
                scheduleOnRN(notifySwipeOpen, shouldOpen);
            } else if (isSwipeRight) {
                // Kéo phải (Pin): Chỉ cần vượt ngưỡng 40px là "dính"
                const shouldOpen = currentX > SWIPE_THRESHOLD_RIGHT || velocity > 500;
                translateX.value = withSpring(shouldOpen ? MAX_SWIPE_RIGHT : 0, {
                    damping: 25,
                    stiffness: 150,
                    overshootClamping: true
                });
                scheduleOnRN(notifySwipeOpen, shouldOpen);
            } else {
                translateX.value = withSpring(0, { damping: 25 });
                scheduleOnRN(notifySwipeOpen, false);
            }
        });

    // Tap gesture for press
    const tapGesture = Gesture.Tap()
        .maxDuration(250)
        .onEnd(() => {
            if (translateX.value === 0) {
                scheduleOnRN(handlePress);
            } else {
                translateX.value = withSpring(0, { damping: 25 });
                scheduleOnRN(notifySwipeOpen, false);
            }
        });

    // Combine gestures - Use Exclusive to ensure they don't fight each other
    const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // Right actions (visible on swipe left) 
    const rightActionsStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [-40, -20],
            [1, 0],
            Extrapolation.CLAMP
        ),
    }));

    // Left actions (visible on swipe right)
    const leftActionsStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [20, 40],
            [0, 1],
            Extrapolation.CLAMP
        ),
    }));

    /**
     * Render avatar - hiển thị ảnh partner hoặc icon dựa theo loại partner
     */
    const renderAvatar = () => {
        // If partner has avatar image
        if (item.partner.avatar) {
            return (
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: toSizedImageUrl(item.partner.avatar, null, 'thumb') ?? item.partner.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                    />
                    <OnlineStatusBadge isOnline={item.partner.isOnline} />
                </View>
            );
        }

        // System/AI/Promo - show icon
        return (
            <View style={styles.avatarContainer}>
                <View style={[styles.iconAvatar, { backgroundColor: partnerConfig.backgroundColor }]}>
                    <IconSymbol
                        name={partnerConfig.icon as IconSymbolName}
                        size={24}
                        color={partnerConfig.iconColor}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.wrapper}>
            {/* Left Action - Pin (swipe right) */}
            <Animated.View style={[styles.leftActions, leftActionsStyle]}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.pinButton]}
                    onPress={handlePin}
                    activeOpacity={0.8}
                >
                    <IconSymbol
                        name="pin"
                        size={22}
                        color="#fff"
                    />
                    <Text style={styles.actionText}>
                        {item.isPinned ? t('chat:list.actionUnpin') : t('chat:list.actionPin')}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Right Actions - Mute + Delete (swipe left) */}
            <Animated.View style={[styles.rightActions, rightActionsStyle]}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.muteButton]}
                    onPress={handleMute}
                    activeOpacity={0.8}
                >
                    <IconSymbol
                        name={item.isMuted ? 'notifications' : 'notifications-off'}
                        size={22}
                        color="#fff"
                    />
                    <Text style={styles.actionText}>
                        {item.isMuted ? t('chat:list.actionUnmute') : t('chat:list.actionMute')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="delete" size={22} color="#fff" />
                    <Text style={styles.actionText}>{t('common:actions.delete')}</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Main Content */}
            <GestureDetector gesture={composedGesture}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    {renderAvatar()}

                    <View style={styles.content}>
                        {/* Name Row */}
                        <View style={styles.nameRow}>
                            <View style={styles.nameContainer}>
                                <Text
                                    style={[styles.name, hasUnread && styles.nameUnread]}
                                    numberOfLines={1}
                                >
                                    {item.partner.name}
                                </Text>
                                {item.partner.isVerified && (
                                    <IconSymbol
                                        name="verified"
                                        size={14}
                                        color={theme.colors.primary}
                                        style={styles.verifiedIcon}
                                    />
                                )}
                                {item.isPinned && (
                                    <IconSymbol
                                        name="pin"
                                        size={12}
                                        color={theme.colors.secondary}
                                        style={styles.pinnedIcon}
                                    />
                                )}
                                {item.isMuted && (
                                    <IconSymbol
                                        name="notifications-off"
                                        size={12}
                                        color={theme.colors.secondary}
                                        style={styles.mutedIcon}
                                    />
                                )}
                            </View>
                            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                                {formatTime(item.lastMessage.createdAt)}
                            </Text>
                        </View>

                        {/* Message Row */}
                        <View style={styles.messageRow}>
                            <View style={styles.messagePreview}>
                                {messagePreview.icon && (
                                    <IconSymbol
                                        name={messagePreview.icon}
                                        size={16}
                                        color={theme.colors.secondary}
                                        style={styles.messageIcon}
                                    />
                                )}
                                <Text
                                    style={[styles.message, hasUnread && styles.messageUnread]}
                                    numberOfLines={1}
                                >
                                    {messagePreview.text}
                                </Text>
                            </View>

                            {/* Badge or Read status */}
                            {hasUnread ? (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                    </Text>
                                </View>
                            ) : item.lastMessage.isRead && isFromMe ? (
                                <IconSymbol
                                    name="done-all"
                                    size={16}
                                    color={theme.colors.secondary}
                                />
                            ) : null}
                        </View>

                        {/* Response rate label */}
                        {item.partner.responseRate && item.partner.responseRate >= 90 && (
                            <View style={styles.responseRow}>
                                <IconSymbol
                                    name="time"
                                    size={12}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.responseText}>
                                    {t('chat:list.responseRate', { rate: item.partner.responseRate })}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
});

ConversationItem.displayName = 'ConversationItem';

const stylesheet = StyleSheet.create((theme) => ({
    wrapper: {
        position: 'relative',
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.margins.sm,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
        flexShrink: 1,
    },
    nameUnread: {
        fontWeight: '700',
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    pinnedIcon: {
        marginLeft: 4,
        transform: [{ rotate: '45deg' }],
    },
    mutedIcon: {
        marginLeft: 4,
    },
    time: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    timeUnread: {
        color: theme.colors.primary,
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.margins.sm,
    },
    messageIcon: {
        marginRight: 4,
    },
    message: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        flex: 1,
    },
    messageUnread: {
        color: theme.colors.typography,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: theme.colors.error,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    responseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    responseText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    // Swipe Actions
    leftActions: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightActions: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    pinButton: {
        backgroundColor: theme.colors.primary,
    },
    muteButton: {
        backgroundColor: theme.colors.warning,
    },
    deleteButton: {
        backgroundColor: theme.colors.error,
    },
}));
