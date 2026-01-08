/**
 * ==============================================
 * SHOP HEADER INFO - Avatar, Name, Stats, Actions
 * ==============================================
 * 
 * Features:
 * - Avatar overlapping banner (negative margin)
 * - Verification badge
 * - Action buttons (Chat, Follow)
 * - Graceful handling of missing data
 */

import { IconSymbol } from '@/components/ui/Icon';
import { ShopHeaderUI } from '@/types/shop';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopHeaderInfoProps {
    /** Shop header data from adapter */
    shop: ShopHeaderUI;
    /** Callback when Chat button pressed */
    onChatPress?: () => void;
    /** Callback when Follow button pressed */
    onFollowPress?: () => void;
    /** Is user following this shop */
    isFollowing?: boolean;
}

const AVATAR_SIZE = 80;
const AVATAR_BORDER_WIDTH = 3;
// Avatar overlaps banner by half its height
const AVATAR_OVERLAP = AVATAR_SIZE / 2;
/**
 * ShopHeaderInfo - Display shop info below banner
 */
export const ShopHeaderInfo: React.FC<ShopHeaderInfoProps> = ({
    shop,
    onChatPress,
    onFollowPress,
    isFollowing = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Handle chat navigation
    const handleChat = () => {
        if (onChatPress) {
            onChatPress();
        } else {
            // Default: Navigate to chat with shop
            // TODO: Implement chat routing when API ready
            router.push(`/chat/${shop.id}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Row: Avatar + Name + Badge */}
            <View style={styles.topRow}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: shop.logoUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                {/* Shop Info */}
                <View style={styles.infoContainer}>
                    {/* Name + Verification */}
                    <View style={styles.nameRow}>
                        <Text style={styles.shopName} numberOfLines={1}>
                            {shop.name}
                        </Text>
                        {shop.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <IconSymbol
                                    name="verified"
                                    size={16}
                                    color={theme.colors.primary}
                                />
                            </View>
                        )}
                    </View>

                    {/* Location */}
                    {shop.location && (
                        <View style={styles.metaRow}>
                            <IconSymbol
                                name="location-on"
                                size={14}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.metaText}>{shop.location}</Text>
                        </View>
                    )}

                    {/* Join Date */}
                    {shop.joinDate && (
                        <View style={styles.metaRow}>
                            <IconSymbol
                                name="calendar-today"
                                size={14}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.metaText}>
                                Tham gia {shop.joinDate}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Description (Expandable - TODO) */}
            {shop.description && shop.description.length > 0 && (
                <Text style={styles.description} numberOfLines={2}>
                    {shop.description}
                </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
                {/* Chat Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.chatButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleChat}
                >
                    <IconSymbol
                        name="chat-bubble-outline"
                        size={18}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.chatButtonText}>Chat</Text>
                </Pressable>

                {/* Follow Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        isFollowing ? styles.followingButton : styles.followButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onFollowPress}
                >
                    <IconSymbol
                        name={isFollowing ? 'check' : 'add'}
                        size={18}
                        color={isFollowing ? theme.colors.secondary : theme.colors.onPrimary}
                    />
                    <Text
                        style={[
                            styles.followButtonText,
                            isFollowing && styles.followingButtonText,
                        ]}
                    >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Text>
                </Pressable>
            </View>

            {/* Stats Row - Hidden if no data */}
            {(shop.stats.productCount !== null ||
                shop.stats.followerCount !== null ||
                shop.stats.rating !== null) && (
                    <View style={styles.statsRow}>
                        {shop.stats.productCount !== null && (
                            <StatItem
                                value={shop.stats.productCount.toString()}
                                label="Sản phẩm"
                            />
                        )}
                        {shop.stats.followerCount !== null && (
                            <StatItem
                                value={formatFollowerCount(shop.stats.followerCount)}
                                label="Người theo dõi"
                            />
                        )}
                        {shop.stats.rating !== null && (
                            <StatItem
                                value={shop.stats.rating.toFixed(1)}
                                label="Đánh giá"
                                icon="star"
                            />
                        )}
                        {shop.stats.responseRate !== null && (
                            <StatItem
                                value={`${shop.stats.responseRate}%`}
                                label="Phản hồi"
                            />
                        )}
                    </View>
                )}
        </View>
    );
};

interface StatItemProps {
    value: string;
    label: string;
    icon?: 'star';
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.statItem}>
            <View style={styles.statValueRow}>
                {icon === 'star' && (
                    <IconSymbol name="star" size={14} color="#facc15" />
                )}
                <Text style={styles.statValue}>{value}</Text>
            </View>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

// ============================================
// HELPERS
// ============================================

const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        // Negative margin to pull up and overlap banner
        marginTop: -AVATAR_OVERLAP,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarContainer: {
        // Avatar overlaps banner
        marginTop: -AVATAR_SIZE / 4,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: AVATAR_BORDER_WIDTH,
        borderColor: theme.colors.surface,
        backgroundColor: theme.colors.background,
    },
    infoContainer: {
        flex: 1,
        marginLeft: theme.margins.smd,
        marginTop: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm / 2,
    },
    shopName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        flexShrink: 1,
    },
    verifiedBadge: {
        marginLeft: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm / 2,
        marginTop: theme.margins.sm / 2,
    },
    metaText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginTop: theme.margins.smd,
        lineHeight: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        marginTop: theme.margins.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm / 2,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    chatButton: {
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    chatButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    followButton: {
        backgroundColor: theme.colors.primary,
    },
    followingButton: {
        backgroundColor: theme.colors.secondaryLight,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    followingButtonText: {
        color: theme.colors.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.secondaryLight,
    },
    statItem: {
        alignItems: 'center',
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
}));

export default ShopHeaderInfo;
