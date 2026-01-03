import {
    FollowedShopsSection,
    GuestState,
    OrderStatusRail,
    ProfileHeader,
    ServiceGrid,
    SettingsMenu,
    UserInfoCard,
} from '@/components/profile';
import {
    useFollowedShops,
    useOrderStats,
    useRefreshProfile,
    useUserProfile,
    useWalletBalance,
} from '@/hooks/api/profile/useProfile';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigator } from '@/utils/navigation';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Profile/Me screen with parallel data fetching
 * Follows atomic design pattern with config-driven menus
 */
export default function MeScreen() {
    const styles = stylesheet;

    // Auth state
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Parallel data fetching - each query independent
    const {
        data: userProfile,
        isLoading: isLoadingProfile,
        isError: isProfileError,
        refetch: refetchProfile,
    } = useUserProfile();

    const {
        data: orderStats,
        isLoading: isLoadingOrders,
        isError: isOrdersError,
        refetch: refetchOrders,
    } = useOrderStats();

    const {
        data: walletBalance,
        isLoading: isLoadingWallet,
    } = useWalletBalance();

    const {
        data: followedShops,
        isLoading: isLoadingShops,
    } = useFollowedShops();

    // Refresh all queries
    const { refresh, isRefreshing } = useRefreshProfile();

    // Handle pull to refresh
    const handleRefresh = useCallback(() => {
        refresh();
    }, [refresh]);

    // Handle order stats retry
    const handleOrdersRetry = useCallback(() => {
        refetchOrders();
    }, [refetchOrders]);

    // Handle settings menu item press
    const handleSettingsPress = useCallback((route: string) => {
        Navigator.push(route as any);
    }, []);

    // Handle shop press
    const handleShopPress = useCallback((shopId: string) => {
        // TODO: Navigate to shop page
    }, []);

    // Handle view all shops
    const handleViewAllShops = useCallback(() => {
        // TODO: Navigate to followed shops list
    }, []);

    // Memoized refresh control
    const refreshControl = useMemo(() => (
        <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0088cc"
            colors={['#0088cc']}
        />
    ), [isRefreshing, handleRefresh]);

    // Guest state - show login prompt
    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <ProfileHeader />
                <GuestState />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <ProfileHeader />

            {/* Scrollable content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={refreshControl}
            >
                {/* User Info Card */}
                <UserInfoCard
                    profile={userProfile}
                    isLoading={isLoadingProfile}
                />

                {/* Order Status Rail */}
                <OrderStatusRail
                    stats={orderStats}
                    isLoading={isLoadingOrders}
                    isError={isOrdersError}
                    onRetry={handleOrdersRetry}
                />

                {/* Followed Shops */}
                <FollowedShopsSection
                    shops={followedShops ?? []}
                    isLoading={isLoadingShops}
                    onPressShop={handleShopPress}
                    onViewAll={handleViewAllShops}
                />

                {/* Services Grid */}
                <ServiceGrid
                    walletBalance={walletBalance?.balance ?? 0}
                    coinsBalance={walletBalance?.coins ?? 0}
                    voucherCount={walletBalance?.vouchers ?? 0}
                    isLoading={isLoadingWallet}
                />

                {/* Settings Menu */}
                <SettingsMenu onPressItem={handleSettingsPress} />
            </ScrollView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.zero, // Space for tab bar
    },
}));
