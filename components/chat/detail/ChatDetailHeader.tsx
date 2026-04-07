/**
 * ChatDetailHeader - Header component for chat detail screen
 * Shows shop info, online status, and actions
 */

import { IconSymbol } from '@/components/ui/Icon';
import { shopRoutes } from '@/constants/routes';
import { ConversationPartner } from '@/types/chat';
import { Navigator } from '@/utils/navigation';
import { buildImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ChatDetailHeaderProps {
    partner: ConversationPartner | null;
    onMorePress?: () => void;
}

/**
 * ChatDetailHeader - Top navigation bar for chat detail
 *
 * Features:
 * - Back button
 * - Partner avatar + name + online status
 * - Verified badge for shops
 * - More actions menu
 */
export const ChatDetailHeader: React.FC<ChatDetailHeaderProps> = ({
    partner,
    onMorePress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace('/(tabs)/chat');
        }
    };

    const handlePartnerPress = useCallback(() => {
        if (partner?.shopId) {
            Navigator.push(shopRoutes.detail(partner.shopId));
        }
    }, [partner?.shopId]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </TouchableOpacity>

                {/* Partner info */}
                <TouchableOpacity
                    style={styles.partnerInfo}
                    activeOpacity={partner?.shopId ? 0.7 : 1}
                    onPress={handlePartnerPress}
                    disabled={!partner?.shopId}
                >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {partner?.avatar ? (
                            <Image
                                source={{ uri: buildImageUrl(partner.avatar, null, 'thumb') }}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        ) : partner?.type === 'SHOP' ? (
                            <Image
                                source={require('@/assets/images/default_avatar.png')}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <IconSymbol
                                    name="storefront"
                                    size={20}
                                    color={theme.colors.secondary}
                                />
                            </View>
                        )}
                        {/* Online indicator */}
                        {partner?.isOnline && <View style={styles.onlineIndicator} />}
                    </View>

                    {/* Name and status */}
                    <View style={styles.nameContainer}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                {partner?.name || 'Đang tải...'}
                            </Text>
                            {partner?.isVerified && (
                                <IconSymbol
                                    name="verified"
                                    size={14}
                                    color={theme.colors.primary}
                                />
                            )}
                        </View>
                        <Text style={styles.status}>
                            {partner?.isOnline ? 'Đang hoạt động' : 'Offline'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* More button */}
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={onMorePress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="more" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.smd,
    },
    backButton: {
        padding: 8,
    },
    partnerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundInput,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    nameContainer: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        maxWidth: '85%',
    },
    status: {
        fontSize: 12,
        color: '#22c55e',
        fontWeight: '500',
        marginTop: 1,
    },
    moreButton: {
        padding: 8,
    },
}));

export default ChatDetailHeader;
