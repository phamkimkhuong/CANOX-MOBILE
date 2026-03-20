import { IconSymbol } from '@/components/ui/Icon';
import type { ShopHeaderUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useState } from 'react';
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
 * ShopHeaderInfo - Premium Shop Header with Bank Card influence
 */
export const ShopHeaderInfo: React.FC<ShopHeaderInfoProps> = memo(({
    shop,
    onChatPress,
    onPrefetchChat,
    onFollowPress,
    isFollowing = false,
    hasVouchers = false,
}) => {
    const { theme } = useUnistyles();
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const handleChat = () => {
        if (onChatPress) onChatPress();
        else Navigator.push(`/chat/${shop.id}`);
    };

    const toggleDescription = useCallback(() => {
        setIsDescExpanded(prev => !prev);
    }, []);

    // Status logic: check both status and onVacation
    const isInactive = shop.status !== 'ACTIVE';
    const isOnVacation = !isInactive && shop.onVacation === true;
    const statusColor = isInactive
        ? theme.colors.error
        : isOnVacation
            ? theme.colors.warning
            : theme.colors.success;
    const statusLabel = isInactive
        ? 'Ngừng hoạt động'
        : isOnVacation
            ? 'Đang nghỉ'
            : 'Đang hoạt động';

    return (
        <View style={[stylesheet.container, hasVouchers && stylesheet.containerNoRadius]}>
            <View style={stylesheet.highlight} />

            {/* Top Section */}
            <View style={stylesheet.topSection}>
                <View style={stylesheet.avatarWrapper}>
                    <Image
                        source={{ uri: shop.logoUrl }}
                        style={stylesheet.avatar}
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                <View style={stylesheet.mainContent}>
                    <View style={stylesheet.textContainer}>
                        <View style={stylesheet.nameRow}>
                            <Text style={stylesheet.shopName} numberOfLines={1}>
                                {shop.name}
                            </Text>
                            {shop.isVerified && (
                                <IconSymbol name="verified" size={16} color={theme.colors.vibrantRed} />
                            )}
                        </View>

                        <View style={stylesheet.statusRow}>
                            <View style={[
                                stylesheet.statusDot,
                                { backgroundColor: statusColor }
                            ]} />
                            <Text style={[
                                stylesheet.statusText,
                                { color: statusColor }
                            ]}>
                                {statusLabel}
                            </Text>
                        </View>
                        {/* Meta info */}
                        <View style={stylesheet.metaRow}>
                            <IconSymbol name="time-outline" size={12} color={theme.colors.typographySecondary} />
                            <Text style={stylesheet.metaText}>Tham gia: {shop.joinDate}</Text>
                        </View>
                        {shop.location && (
                            <View style={stylesheet.locationRow}>
                                <IconSymbol name="location-outline" size={12} color={theme.colors.typographySecondary} />
                                <Text style={stylesheet.metaText}>{shop.location}</Text>
                            </View>
                        )}
                    </View>

                    <View style={stylesheet.actionColumn}>
                        <Pressable
                            style={({ pressed }) => [
                                stylesheet.chatBtn,
                                pressed && stylesheet.btnPressed
                            ]}
                            onPressIn={onPrefetchChat}
                            onPress={handleChat}
                        >
                            <IconSymbol name="chat-bubble-outline" size={14} color={theme.colors.forestGreen} />
                            <Text style={stylesheet.chatBtnText}>Chat</Text>
                        </Pressable>

                        <Pressable
                            onPress={onFollowPress}
                            style={stylesheet.followBtnWrapper}
                        >
                            {({ pressed }) => (
                                <LinearGradient
                                    colors={isFollowing
                                        ? ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)']
                                        : [theme.colors.buttonActive, theme.colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        stylesheet.followGradient,
                                        pressed && stylesheet.btnPressed
                                    ]}
                                >
                                    <IconSymbol
                                        name={isFollowing ? 'check' : 'add'}
                                        size={14}
                                        color={isFollowing ? theme.colors.typographySecondary : '#FFF'}
                                    />
                                    <Text style={[
                                        stylesheet.btnText,
                                        isFollowing && stylesheet.followingText
                                    ]}>
                                        {isFollowing ? 'Hủy' : 'Theo dõi'}
                                    </Text>
                                </LinearGradient>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Description - tap to expand/collapse */}
            {shop.description && (
                <Pressable style={stylesheet.descriptionRow} onPress={toggleDescription}>
                    <Text
                        style={stylesheet.description}
                        numberOfLines={isDescExpanded ? undefined : 2}
                    >
                        {shop.description}
                    </Text>
                    <Text style={stylesheet.expandToggle}>
                        {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </Pressable>
            )}

            {/* Stats */}
            <View style={stylesheet.statsRow}>
                <View style={stylesheet.statItem}>
                    <Text style={stylesheet.statValue}>{shop.stats.productCount ?? 0}</Text>
                    <Text style={stylesheet.statLabel}>Sản phẩm</Text>
                </View>
                <View style={stylesheet.vDivider} />
                <View style={stylesheet.statItem}>
                    <Text style={stylesheet.statValue}>{shop.stats.rating?.toFixed(1) ?? '5.0'}</Text>
                    <View style={stylesheet.ratingBox}>
                        <IconSymbol name="star" size={10} color="#facc15" />
                        <Text style={stylesheet.statLabel}>
                            Đánh giá {shop.stats.reviewCount != null ? `(${shop.stats.reviewCount})` : ''}
                        </Text>
                    </View>
                </View>
                <View style={stylesheet.vDivider} />
                <View style={stylesheet.statItem}>
                    <Text style={stylesheet.statValue}>{shop.stats.followerCount ?? 0}</Text>
                    <Text style={stylesheet.statLabel}>Người theo dõi</Text>
                </View>
            </View>
        </View>
    );
});

ShopHeaderInfo.displayName = 'ShopHeaderInfo';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        marginTop: -15,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    containerNoRadius: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 10,
    },
    topSection: {
        flexDirection: 'row',
        paddingTop: 16,
    },
    avatarWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 2,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
    },
    mainContent: {
        flex: 1,
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shopName: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
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
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    actionColumn: {
        gap: 8,
    },
    chatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.greenSoft,
        borderWidth: 1,
        borderColor: 'rgba(46, 125, 50, 0.1)',
    },
    chatBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.forestGreen,
    },
    followBtnWrapper: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    followGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 90,
    },
    btnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    followingText: {
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
    },
    expandToggle: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.primary,
        marginTop: 4,
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
        color: theme.colors.typography,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '700',
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
