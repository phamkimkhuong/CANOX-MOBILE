import { CartHeaderButton, ChatHeaderButton } from '@/components/ui/navigation/HeaderButtons';
import { WishlistLoginPrompt } from '@/components/wishlist';
import { PriceTargetTab } from '@/components/wishlist/PriceTargetTab';
import { PrivateWishlistTab } from '@/components/wishlist/PrivateWishlistTab';
import { WishlistEmptyStateSkeleton } from '@/components/wishlist/WishlistEmptyState';
import { flattenWishlists, useWishlists } from '@/hooks/api/wishlist';
import { usePriceTargetMet } from '@/hooks/api/wishlist/usePriceTargetMet';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useAuthStore } from '@/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type TabType = 'price_target' | 'private' | 'public';

export default function WishlistTabsScreen() {
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const { t } = useTranslation('wishlist');
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Null means the screen has not decided the first visible tab yet.
    const [selectedTab, setSelectedTab] = useState<TabType | null>(null);

    // Query snapshots are read at the screen level so the header and body
    // resolve loading/empty states in the same render pass.
    const {
        data: priceTargetData,
        isFetched: isPriceTargetFetched,
        isError: isPriceTargetError,
    } = usePriceTargetMet();
    const {
        data: wishlistListData,
        isLoading: isWishlistListLoading,
        isFetched: isWishlistListFetched,
        isError: isWishlistListError,
    } = useWishlists();

    const priceTargetCount = priceTargetData?.totalItems ?? 0;
    const hasResolvedPriceTarget =
        !isAuthenticated || !!priceTargetData || isPriceTargetFetched || isPriceTargetError;
    const defaultTab: TabType | null = hasResolvedPriceTarget
        ? (priceTargetCount > 0 ? 'price_target' : 'private')
        : null;
    const activeTab = selectedTab ?? defaultTab;
    const privateWishlists = useMemo(() => flattenWishlists(wishlistListData), [wishlistListData]);
    const hasResolvedWishlistList =
        !isAuthenticated || !!wishlistListData || isWishlistListFetched || isWishlistListError;
    const canEvaluatePrivateWishlistEmpty =
        isAuthenticated && (!!wishlistListData || (isWishlistListFetched && !isWishlistListError));
    const isPrivateWishlistEmpty =
        canEvaluatePrivateWishlistEmpty &&
        privateWishlists.every((wishlist) => wishlist.itemCount === 0);
    const isPrivateWishlistListLoading =
        isAuthenticated && activeTab === 'private' && !hasResolvedWishlistList && isWishlistListLoading;
    const isResolvingPrivateDefault =
        hasResolvedPriceTarget && priceTargetCount === 0 && !hasResolvedWishlistList && isWishlistListLoading;
    const isResolvingWishlistEntry =
        isAuthenticated && (!hasResolvedPriceTarget || isResolvingPrivateDefault);

    const isEmptyWishlistExperience =
        isAuthenticated && hasResolvedPriceTarget && priceTargetCount === 0 && isPrivateWishlistEmpty;
    const useEmptyChrome = isResolvingWishlistEntry || isEmptyWishlistExperience;
    const useLightHeader = true;
    const headerIconColor = useLightHeader ? theme.colors.inkBlack : theme.colors.onPrimary;
    const headerBadgeBorderColor = useLightHeader ? theme.colors.surface : theme.colors.newPrimary;

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={useLightHeader
                    ? [theme.colors.surface, theme.colors.surface]
                    : [theme.colors.newPrimary, theme.colors.vibrantRed]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.header,
                    useLightHeader && styles.headerLight,
                    useEmptyChrome && styles.headerEmpty,
                    { paddingTop: insets.top },
                ]}
            >
                <View style={[styles.headerContent, useEmptyChrome && styles.headerContentEmpty]}>
                    <Text style={[styles.title, useLightHeader && styles.titleLight]}>
                        {t('title', { defaultValue: 'Yêu thích' })}
                    </Text>

                    <View style={styles.actions}>
                        <CartHeaderButton
                            color={headerIconColor}
                            badgeBorderColor={headerBadgeBorderColor}
                            showBadge={isAuthenticated}
                        />
                        <ChatHeaderButton
                            color={headerIconColor}
                            badgeBorderColor={headerBadgeBorderColor}
                            showBadge={isAuthenticated}
                            showWhenGuest
                        />
                    </View>
                </View>

                {/* Segmented Tabs */}
                {isAuthenticated && !useEmptyChrome && activeTab !== null && (
                    <View style={styles.tabBarContainer}>
                        <View style={styles.tabBar}>
                            <Pressable
                                style={[
                                    styles.tab,
                                    activeTab === 'price_target' && styles.tabActive,
                                ]}
                                onPress={() => setSelectedTab('price_target')}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'price_target' && styles.tabTextActive,
                                    ]}
                                >
                                    {t('tabs.priceTarget')}
                                </Text>
                                {priceTargetCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {priceTargetCount > 99 ? '99+' : priceTargetCount}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.tab,
                                    activeTab === 'private' && styles.tabActive,
                                ]}
                                onPress={() => setSelectedTab('private')}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'private' && styles.tabTextActive,
                                    ]}
                                >
                                    {t('tabs.private')}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </LinearGradient>

            {/* Content */}
            <View style={[styles.content, useEmptyChrome && styles.contentEmpty]}>
                {!isAuthenticated ? (
                    <WishlistLoginPrompt />
                ) : isResolvingWishlistEntry ? (
                    <View style={styles.initialSkeletonContainer}>
                        <WishlistEmptyStateSkeleton />
                    </View>
                ) : isEmptyWishlistExperience ? (
                    <PrivateWishlistTab
                        isWishlistEmpty={isPrivateWishlistEmpty}
                        isWishlistListLoading={false}
                    />
                ) : (
                    <>
                        {activeTab === 'price_target' && <PriceTargetTab onSwitchToPrivateTab={() => setSelectedTab('private')} />}
                        {activeTab === 'private' && (
                            <PrivateWishlistTab
                                isWishlistEmpty={isPrivateWishlistEmpty}
                                isWishlistListLoading={isPrivateWishlistListLoading}
                            />
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingBottom: theme.margins.md,
        // Premium subtle soft shadow
        shadowColor: theme.colors.newPrimary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
        zIndex: 10,
    },
    headerLight: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: theme.margins.sm,
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    headerEmpty: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 0,
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
        height: 56,
        marginBottom: 8,
    },
    headerContentEmpty: {
        marginBottom: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    titleLight: {
        color: theme.colors.inkBlack,
        letterSpacing: 0,
    },
    actions: {
        position: 'absolute',
        right: theme.margins.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tabBarContainer: {
        paddingHorizontal: theme.margins.xs,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        paddingVertical: 9,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: 6,
    },
    tabActive: {
        borderBottomColor: theme.colors.newPrimary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    tabTextActive: {
        color: theme.colors.newPrimary,
        fontWeight: '800',
    },
    badge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentEmpty: {
        backgroundColor: theme.colors.surface,
    },
    initialSkeletonContainer: {
        flex: 1,
        paddingTop: theme.margins.md,
        backgroundColor: theme.colors.surface,
    },
}));
