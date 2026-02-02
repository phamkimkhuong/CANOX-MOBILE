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
                                <IconSymbol name="verified" size={16} color={theme.colors.vibrantRed} />
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
                            <IconSymbol name="chat-bubble-outline" size={14} color={theme.colors.forestGreen} />
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
        backgroundColor: theme.colors.surfaceGlass,
        marginHorizontal: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        marginTop: -15,
        marginBottom: 5,
        // Premium Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 100,
    },
    containerNoRadius: {
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
    },
    topSection: {
        flexDirection: 'row',
        paddingTop: theme.margins.md,
    },
    avatarContainer: {
        // marginTop: -35, // Negative overlap with banner
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
        borderColor: '#FFF',
        backgroundColor: theme.colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
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
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.vibrantRed, // Subtle brand recognition
        letterSpacing: -0.3,
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
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.2,
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
        fontWeight: '500',
    },
    buttonColumn: {
        flexDirection: 'column',
        gap: 8,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        minWidth: 85,
    },
    // Green Button for Trust/Communication
    chatBtn: {
        backgroundColor: theme.colors.greenSoft,
        borderWidth: 1,
        borderColor: 'rgba(46, 125, 50, 0.2)',
    },
    chatBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.forestGreen,
    },
    // Primary Red Button (Polished)
    followBtn: {
        backgroundColor: theme.colors.vibrantRed,
        shadowColor: theme.colors.vibrantRed,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    btnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    followingBtn: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderWidth: 0,
    },
    followingBtnText: {
        color: theme.colors.typographySecondary,
    },
    btnPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    descriptionRow: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    description: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.inkBlack,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    vDivider: {
        width: 1,
        height: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
}));

export default ShopHeaderInfo;
