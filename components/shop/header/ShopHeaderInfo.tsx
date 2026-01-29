/**
 * ==============================================
 * SHOP HEADER INFO - Avatar, Name, Stats, Actions
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import { ShopHeaderUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopHeaderInfoProps {
    shop: ShopHeaderUI;
    onChatPress?: () => void;
    onPrefetchChat?: () => void;
    onFollowPress?: () => void;
    isFollowing?: boolean;
    hasVouchers?: boolean;
}

const AVATAR_SIZE = 64;
const AVATAR_BORDER_WIDTH = 2;

/**
 * ShopHeaderInfo - Display shop info with premium layout
 */
export const ShopHeaderInfo: React.FC<ShopHeaderInfoProps> = ({
    shop,
    onChatPress,
    onPrefetchChat,
    onFollowPress,
    isFollowing = false,
    hasVouchers = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handleChat = () => {
        if (onChatPress) onChatPress();
        else Navigator.push(`/chat/${shop.id}`);
    };

    const dynamicStatusBg = (onVacation: boolean) => ({
        backgroundColor: onVacation ? theme.colors.error : theme.colors.success
    });

    const dynamicStatusColor = (onVacation: boolean) => ({
        color: onVacation ? theme.colors.error : theme.colors.success
    });

    return (
        <View style={[styles.container, hasVouchers && styles.containerNoRadius]}>
            {/* Top Section: Avatar & Basic Info & Buttons */}
            <View style={styles.topSection}>
                {/* Avatar with offset */}
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: shop.logoUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                {/* Right Content */}
                <View style={styles.mainContent}>
                    {/* Left: Name & Meta */}
                    <View style={styles.textContainer}>
                        <View style={styles.nameRow}>
                            <Text style={styles.shopName} numberOfLines={1}>
                                {shop.name}
                            </Text>
                            {shop.isVerified && (
                                <IconSymbol name="verified" size={16} color={theme.colors.primary} />
                            )}
                        </View>

                        {/* Status Badge */}
                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusDot,
                                dynamicStatusBg(!!shop.onVacation)
                            ]} />
                            <Text style={[
                                styles.statusText,
                                dynamicStatusColor(!!shop.onVacation)
                            ]}>
                                {shop.onVacation ? 'Tạm nghỉ' : 'Đang hoạt động'}
                            </Text>
                        </View>

                        {/* Meta info */}
                        <View style={styles.metaRow}>
                            <IconSymbol name="time-outline" size={12} color={theme.colors.typographySecondary} />
                            <Text style={styles.metaText}>Tham gia: {shop.joinDate}</Text>
                        </View>
                        {shop.location && (
                            <View style={[styles.metaRow, { marginTop: 2 }]}>
                                <IconSymbol name="location-outline" size={12} color={theme.colors.typographySecondary} />
                                <Text style={styles.metaText}>{shop.location}</Text>
                            </View>
                        )}
                    </View>

                    {/* Right: Stacked Buttons */}
                    <View style={styles.buttonColumn}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.btn, styles.chatBtn, pressed && styles.btnPressed
                            ]}
                            onPressIn={onPrefetchChat}
                            onPress={handleChat}
                        >
                            <IconSymbol name="chat-bubble-outline" size={14} color={theme.colors.primary} />
                            <Text style={styles.chatBtnText}>Chat</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.btn,
                                isFollowing ? styles.followingBtn : styles.followBtn,
                                pressed && styles.btnPressed
                            ]}
                            onPress={onFollowPress}
                        >
                            <IconSymbol
                                name={isFollowing ? 'check' : 'add'}
                                size={14}
                                color={isFollowing ? theme.colors.typographySecondary : '#FFF'}
                            />
                            <Text style={[styles.btnText, isFollowing && styles.followingBtnText]}>
                                {isFollowing ? 'Hủy' : 'Theo dõi'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Middle Section: Description */}
            {shop.description && (
                <View style={styles.descriptionRow}>
                    <Text style={styles.description} numberOfLines={2}>
                        {shop.description}
                    </Text>
                </View>
            )}

            {/* Bottom Section: Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{shop.stats.productCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Sản phẩm</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{shop.stats.rating?.toFixed(1) ?? '5.0'}</Text>
                    <View style={styles.ratingBox}>
                        <IconSymbol name="star" size={10} color="#facc15" />
                        <Text style={styles.statLabel}>
                            Đánh giá {shop.stats.reviewCount !== null ? `(${shop.stats.reviewCount})` : ''}
                        </Text>
                    </View>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{shop.stats.followerCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Người theo dõi</Text>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        borderBottomLeftRadius: theme.radius.l,
        borderBottomRightRadius: theme.radius.l,
    },
    containerNoRadius: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    topSection: {
        flexDirection: 'row',
        paddingTop: theme.margins.sm,
    },
    avatarContainer: {
        marginTop: -28, // Negative overlap with banner
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: AVATAR_BORDER_WIDTH,
        borderColor: '#FFF',
        backgroundColor: theme.colors.background,
    },
    mainContent: {
        flex: 1,
        marginLeft: theme.margins.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    metaText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    buttonColumn: {
        flexDirection: 'column',
        gap: 6,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        minWidth: 90,
    },
    chatBtn: {
        backgroundColor: '#FFF',
        borderColor: theme.colors.primary,
    },
    chatBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    followBtn: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    btnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    followingBtn: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    followingBtnText: {
        color: theme.colors.typographySecondary,
    },
    btnPressed: {
        opacity: 0.7,
    },
    descriptionRow: {

        // paddingTop: theme.margins.sm,
    },
    description: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        lineHeight: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingTop: 3,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    vDivider: {
        width: 1,
        height: 20,
        backgroundColor: theme.colors.border,
    },
}));

export default ShopHeaderInfo;
