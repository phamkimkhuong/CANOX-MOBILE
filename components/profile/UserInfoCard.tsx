import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useWishlists } from '@/hooks/api/profile/useWishlists';
import { MEMBER_LEVEL_CONFIG, OrderStats, QUICK_STATS_CONFIG, UserProfile } from '@/types/profile/profile';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface UserInfoCardProps {
    profile: UserProfile | undefined;
    stats: OrderStats | undefined;
    isLoading?: boolean;
}

/**
 * User info card with avatar, name, level and quick stats
 */
export const UserInfoCard: React.FC<UserInfoCardProps> = memo(({
    profile,
    stats,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['profile', 'common']);

    // Fetch wishlist data for favorites count
    const { data: wishlistData, isLoading: isLoadingWishlists } = useWishlists();

    const levelConfig = profile?.memberLevel
        ? MEMBER_LEVEL_CONFIG[profile.memberLevel]
        : MEMBER_LEVEL_CONFIG.BRONZE;

    // Memoized stats values with wishlist data
    const statsWithWishlist = useMemo(() => {
        if (!profile) return {};

        // Total items across all wishlists (default 0 if API fails/loading)
        const wishlistItemCount = wishlistData?.items?.reduce(
            (sum, wishlist) => sum + wishlist.itemCount,
            0
        ) ?? 0;

        return {
            orders: stats?.total ?? 0,
            favorites: wishlistItemCount,
            recent: profile.recentViewCount,
        };
    }, [profile, stats, wishlistData]);

    const handleEditProfile = useCallback(() => {
        Navigator.push(ROUTES.USER.EDIT_PROFILE);
    }, []);

    const handleStatPress = useCallback((route: string, key: string) => {
        if (key === 'orders') {
            Navigator.push({
                pathname: ROUTES.ORDERS.LIST,
                params: { tab: 'completed' },
            });
            return;
        }
        Navigator.push(route as never);
    }, []);

    // Skeleton loading state
    if (isLoading) {
        return (
            <View style={styles.card}>
                <View style={styles.profileRow}>
                    <View style={[styles.avatarSkeleton]} />
                    <View style={styles.infoContainer}>
                        <View style={styles.nameSkeleton} />
                        <View style={styles.badgeSkeleton} />
                    </View>
                </View>
                <View style={styles.statsRow}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.statSkeleton} />
                    ))}
                </View>
            </View>
        );
    }

    if (!profile) return null;

    return (
        <View style={styles.card}>
            {/* Decorative gradient circle */}
            <View style={styles.decorCircle} />

            {/* Profile Row */}
            <View style={styles.profileRow}>
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <Image
                        source={{ uri: profile.avatar ?? undefined }}
                        style={styles.avatar}
                        placeholder={require('@/assets/images/default-avatar.png')}
                        contentFit="cover"
                        transition={200}
                    />
                    {/* Level badge */}
                    <View style={[styles.levelBadge, { backgroundColor: levelConfig.color }]}>
                        <IconSymbol
                            name={levelConfig.icon as any}
                            size={10}
                            color="#fff"
                        />
                        <Text style={styles.levelBadgeText}>
                            {t(`memberLevel.${levelConfig.key}`).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {profile.fullName}
                    </Text>

                    <View style={styles.badgesRow}>
                        {profile.isVerified ? (
                            <View style={[styles.statusBadge, styles.verifiedBadge]}>
                                <IconSymbol name="checkmark-circle" size={12} color={theme.colors.primary} />
                                <Text style={[styles.statusText, styles.verifiedText]}>
                                    {t('common:status.verified', { defaultValue: 'Đã xác thực' })}
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.statusBadge, styles.unverifiedBadge]}>
                                <IconSymbol name="error" size={12} color="#f59e0b" />
                                <Text style={[styles.statusText, styles.unverifiedText]}>
                                    {t('common:status.unverified', { defaultValue: 'Chưa xác thực' })}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={handleEditProfile}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.editBtnText}>{t('settings.items.profile')}</Text>
                            <IconSymbol name="chevron-right" size={14} color={theme.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.statsRow}>
                {QUICK_STATS_CONFIG.map((stat) => (
                    <TouchableOpacity
                        key={stat.key}
                        style={[styles.statCard, { backgroundColor: stat.bgColor }]}
                        onPress={() => handleStatPress(stat.route, stat.key)}
                        activeOpacity={0.8}
                    >
                        {/* Background icon */}
                        <View style={styles.statBgIcon}>
                            <IconSymbol
                                name={stat.icon as any}
                                size={50}
                                color={stat.iconColor}
                                style={{ opacity: 0.1 }}
                            />
                        </View>

                        {/* Icon */}
                        <View style={[styles.statIconContainer, { backgroundColor: theme.colors.surface }]}>
                            <IconSymbol
                                name={stat.icon as any}
                                size={20}
                                color={stat.iconColor}
                            />
                        </View>

                        {/* Value & Label */}
                        <Text style={styles.statValue}>
                            {statsWithWishlist[stat.key as keyof typeof statsWithWishlist] ?? 0}
                        </Text>
                        <Text style={styles.statLabel}>{t(`stats.${stat.key}`)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

UserInfoCard.displayName = 'UserInfoCard';

const stylesheet = StyleSheet.create((theme) => ({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 15,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    decorCircle: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: theme.colors.primaryMuted,
        opacity: 0.6,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
        zIndex: 1,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: theme.colors.surface,
        backgroundColor: theme.colors.secondaryLight,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    levelBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#fff',
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    verifiedBadge: {
        backgroundColor: theme.colors.primaryMuted || 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: theme.colors.primaryMuted || 'rgba(59, 130, 246, 0.2)',
    },
    verifiedText: {
        color: theme.colors.primary,
    },
    unverifiedBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    unverifiedText: {
        color: '#f59e0b',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginTop: theme.margins.md,
    },
    statCard: {
        flex: 1,
        padding: theme.margins.smd,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        position: 'relative',
        overflow: 'hidden',
    },
    statBgIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        opacity: 0.1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.typography,
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    // Skeleton styles
    avatarSkeleton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.secondaryLight,
    },
    nameSkeleton: {
        width: '60%',
        height: 20,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
        marginBottom: theme.margins.sm,
    },
    badgeSkeleton: {
        width: '40%',
        height: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    statSkeleton: {
        flex: 1,
        height: 120,
        borderRadius: 20,
        backgroundColor: theme.colors.secondaryLight,
    },
}));
