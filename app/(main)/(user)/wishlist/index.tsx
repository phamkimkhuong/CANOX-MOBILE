/**
 * ==============================================
 * WISHLIST HUB SCREEN - Màn hình chính Yêu thích
 * ==============================================
 * Route: /wishlist
 * 
 * Features:
 * - 3 tabs: Bộ sưu tập | Săn giá | Khám phá
 * - Lazy load each tab content
 * - Price alert badge
 * - Create new wishlist
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    EmptyMyWishlists,
    EmptyPriceAlerts,
    WishlistCard,
    WishlistItemCard,
    WishlistItemListSkeleton,
    WishlistListSkeleton,
    WishlistTabBar,
    WishlistTabKey,
} from '@/components/wishlist';
import { productRoutes, ROUTES, wishlistRoutes } from '@/constants/routes';
import {
    flattenWishlists,
    usePriceTargetMet,
    useWishlists,
} from '@/hooks/api/wishlist';
import type { WishlistCardUI, WishlistItemUI } from '@/types/wishlist';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/**
 * Header component with back button and create action
 */
const WishlistHeader: React.FC<{
    onBack: () => void;
    onCreate: () => void;
}> = ({ onBack, onCreate }) => {
    const { theme } = useUnistyles();
    const styles = headerStyles;

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={onBack}>
                <IconSymbol name="back" size={24} color={theme.colors.typography} />
            </Pressable>

            <Text style={styles.title}>Yêu thích</Text>

            <Pressable style={styles.createButton} onPress={onCreate}>
                <IconSymbol name="add" size={24} color={theme.colors.primary} />
            </Pressable>
        </View>
    );
};

const headerStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: UnistylesRuntime.insets.top,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginLeft: theme.margins.sm,
    },
    createButton: {
        padding: theme.margins.sm,
        marginRight: -theme.margins.sm,
    },
}));

/**
 * My Collections Tab Content
 */
const MyCollectionsTab: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const {
        data,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useWishlists();

    const wishlists = useMemo(() => flattenWishlists(data), [data]);

    const handleWishlistPress = useCallback((wishlistId: string) => {
        Navigator.push(wishlistRoutes.detail(wishlistId));
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleCreateNew = useCallback(() => {
        // TODO: Open create wishlist bottom sheet
    }, []);

    const renderItem = useCallback(({ item }: { item: WishlistCardUI }) => (
        <WishlistCard
            wishlist={item}
            onPress={handleWishlistPress}
        />
    ), [handleWishlistPress]);

    if (isLoading) {
        return <WishlistListSkeleton count={5} />;
    }

    if (wishlists.length === 0) {
        return <EmptyMyWishlists onCreateNew={handleCreateNew} />;
    }

    return (
        <FlashList<WishlistCardUI>
            data={wishlists}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching && !isFetchingNextPage}
                    onRefresh={handleRefresh}
                    colors={[theme.colors.buttonActive]}
                    tintColor={theme.colors.buttonActive}
                />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View style={styles.loadingFooter}>
                        <ActivityIndicator color={theme.colors.buttonActive} />
                    </View>
                ) : null
            }
        />
    );
};

/**
 * Price Alerts Tab Content (Săn giá)
 */
const PriceAlertsTab: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const { data, isLoading, refetch, isRefetching } = usePriceTargetMet();

    const handleItemPress = useCallback((item: WishlistItemUI) => {
        Navigator.push(productRoutes.detail(item.productId));
    }, []);

    const handleAddToCart = useCallback((_item: WishlistItemUI) => {
        // TODO: Add to cart mutation
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleExplore = useCallback(() => {
        Navigator.push(ROUTES.TABS.HOME);
    }, []);

    const renderItem = useCallback(({ item }: { item: WishlistItemUI }) => (
        <WishlistItemCard
            item={item}
            onPress={handleItemPress}
            onAddToCart={handleAddToCart}
        />
    ), [handleItemPress, handleAddToCart]);

    if (isLoading) {
        return <WishlistItemListSkeleton count={4} />;
    }

    if (!data || data.items.length === 0) {
        return <EmptyPriceAlerts onExplore={handleExplore} />;
    }

    return (
        <View style={styles.tabContent}>
            {/* Success Banner */}
            <View style={styles.successBanner}>
                <IconSymbol name="celebration" size={24} color={theme.colors.success} />
                <View style={styles.successBannerText}>
                    <Text style={styles.successTitle}>
                        {data.totalItems} sản phẩm đã đạt giá!
                    </Text>
                    <Text style={styles.successSubtitle}>
                        Mua ngay trước khi giá tăng trở lại
                    </Text>
                </View>
            </View>

            <FlashList<WishlistItemUI>
                data={data.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.buttonActive]}
                        tintColor={theme.colors.buttonActive}
                    />
                }
            />
        </View>
    );
};

/**
 * Discover Tab Content (Khám phá - Placeholder)
 */
const DiscoverTab: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.tabContent}>
            <View style={styles.comingSoon}>
                <IconSymbol name="explore" size={48} color="#ccc" />
                <Text style={styles.comingSoonText}>Đang phát triển...</Text>
            </View>
        </View>
    );
};

/**
 * Main Wishlist Hub Screen
 */
export default function WishlistHubScreen() {
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<WishlistTabKey>('collections');

    // Get price alert count for badge
    const { data: priceAlertData } = usePriceTargetMet();
    const priceAlertCount = priceAlertData?.totalItems ?? 0;

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleCreate = useCallback(() => {
        // TODO: Open create wishlist modal
    }, []);

    const handleTabChange = useCallback((tab: WishlistTabKey) => {
        setActiveTab(tab);
    }, []);

    /**
     * Render active tab content
     */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'collections':
                return <MyCollectionsTab />;
            case 'price-alerts':
                return <PriceAlertsTab />;
            case 'discover':
                return <DiscoverTab />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <WishlistHeader onBack={handleBack} onCreate={handleCreate} />

            {/* Tab Bar */}
            <WishlistTabBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                priceAlertCount={priceAlertCount}
            />

            {/* Tab Content */}
            <View style={[styles.content, { paddingBottom: bottom }]}>
                {renderTabContent()}
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    tabContent: {
        flex: 1,
    },
    listContent: {
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.xl,
    },
    loadingFooter: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successLight,
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.sm,
        marginBottom: theme.margins.sm,
        padding: theme.margins.md,
        borderRadius: theme.radius.l,
        gap: theme.margins.smd,
    },
    successBannerText: {
        flex: 1,
    },
    successTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.success,
    },
    successSubtitle: {
        fontSize: 13,
        color: theme.colors.success,
        marginTop: 2,
    },
    comingSoon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    comingSoonText: {
        fontSize: 16,
        color: theme.colors.secondary,
    },
}));
