import { FlashSaleCountdown } from '@/components/flash-sale/FlashSaleCountdown';
import { FlashSaleEmptyState } from '@/components/flash-sale/FlashSaleEmptyState';
import { FlashSaleProductCard } from '@/components/flash-sale/FlashSaleProductCard';
import { FlashSaleTimeline } from '@/components/flash-sale/FlashSaleTimeline';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, productRoutes } from '@/constants/routes';
import { useCampaignDetail } from '@/hooks/api/campaign/useCampaignDetail';
import { refreshFlashSaleQueries } from '@/hooks/api/campaign/useFlashSaleDataSource';
import { useFlashSaleTabs } from '@/hooks/api/campaign/useFlashSaleTabs';
import { useSlotDetail } from '@/hooks/api/campaign/useSlotDetail';
import { SlotStatus } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { Navigator } from '@/utils/navigation';
import { formatClockTime } from '@/utils/date';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Toast from 'react-native-toast-message';

const formatSlotRange = (startTime: string, endTime: string) => {
    return `${formatClockTime(startTime)} - ${formatClockTime(endTime)}`;
};

/**
 * FlashSaleScreen
 *
 * Design goal:
 * - Keep the promo identity of Flash Sale
 * - Avoid a full-screen dark first paint that feels disconnected from Home
 * - Preserve the current navigation pattern used by other pushed screens
 */
export default function FlashSaleScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const { t } = useTranslation(['home']);
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: tabs = [], isLoading: isLoadingTabs } = useFlashSaleTabs();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    useEffect(() => {
        if (tabs.length === 0) {
            if (activeTabId !== null) {
                setActiveTabId(null);
            }
            return;
        }

        const currentTabStillExists = activeTabId
            ? tabs.some((tab) => tab.id === activeTabId)
            : false;

        if (!currentTabStillExists) {
            const nextTab = tabs.find((tab) => tab.isActive) || tabs[0];
            setActiveTabId(nextTab.id);
        }
    }, [tabs, activeTabId]);

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    const {
        data: slotDetail,
        isLoading: isLoadingSlot,
    } = useSlotDetail(activeTabId);

    const products = slotDetail?.transformedProducts || [];
    const isLoadingProducts = isLoadingSlot;

    const campaignId = (activeTab?.campaignId || slotDetail?.campaignId) as string | undefined;
    const { data: campaign } = useCampaignDetail(campaignId);
    const heroTitle = campaign?.name || t('home:flashSale.title');
    const heroRangeLabel = activeTab ? formatSlotRange(activeTab.startTime, activeTab.endTime) : '';
    const heroStatusLabel = activeTab?.isActive ? t('home:flashSale.statusLive') : t('home:flashSale.statusUpcoming');

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshFlashSaleQueries(queryClient, {
                slotId: activeTabId,
                campaignId,
                hours: 24,
            });
        } finally {
            setRefreshing(false);
        }
    }, [activeTabId, campaignId, queryClient]);

    const handleCountdownEnd = useCallback(() => {
        void refreshFlashSaleQueries(queryClient, {
            slotId: activeTabId,
            campaignId,
            hours: 24,
        });
    }, [activeTabId, campaignId, queryClient]);

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleEmptyRemindMe = useCallback(() => {
        Toast.show({
            type: 'info',
            text1: t('home:flashSale.emptyState.reminderToastTitle'),
            text2: t('home:flashSale.emptyState.reminderToastMessage'),
        });
    }, [t]);

    const handleProductRemindMe = useCallback((_id: string) => {
        Toast.show({
            type: 'info',
            text1: t('home:flashSale.productReminderToastTitle'),
            text2: t('home:flashSale.productReminderToastMessage'),
        });
    }, [t]);

    const handleBrowseProducts = useCallback(() => {
        Navigator.replace(ROUTES.TABS.HOME);
    }, []);

    const handleOpenCategories = useCallback(() => {
        Navigator.push(ROUTES.CATEGORY.INDEX);
    }, []);

    const handleOpenTrustedShops = useCallback(() => {
        Navigator.replace(ROUTES.TABS.HOME);
    }, []);

    const handleOpenCart = useCallback(() => {
        Navigator.push(ROUTES.CART.INDEX);
    }, []);

    const handleProductPress = useCallback((productId: string) => {
        Navigator.push(productRoutes.detail(productId));
    }, []);

    const renderHeader = () => (
        <View pointerEvents="box-none" style={styles.headerOverlay}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backBtnWrapper}
                >
                    <BlurView intensity={18} tint="light" style={styles.backBtnBlur}>
                        <IconSymbol name="chevron.left" size={24} color={theme.colors.onPrimary} />
                    </BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('home:flashSale.title')}</Text>
                <View style={styles.headerSpace} />
            </View>
        </View>
    );

    const renderListHeader = () => (
        <>
            <View style={{ height: insets.top + 58 }} />

            <View style={styles.heroSection}>
                <View style={styles.heroCard}>
                    <LinearGradient
                        colors={[theme.colors.surfaceGlassOverlay, theme.colors.surfaceGlass, theme.colors.warningSubtle]}
                        locations={[0, 0.7, 1]}
                        style={styles.heroCardBackground}
                    />
                    <View style={styles.heroCardGlowPrimary} />
                    <View style={styles.heroCardGlowAccent} />

                    <FlashSaleTimeline
                        tabs={tabs}
                        activeTabId={activeTabId}
                        onTabPress={(tab) => setActiveTabId(tab.id)}
                        embedded
                    />

                    {activeTab && (
                        <>
                            <View style={styles.heroDivider} />

                            <View style={styles.heroSummary}>
                                <Text style={styles.heroTitleText} numberOfLines={1}>
                                    {heroTitle}
                                </Text>

                                <View style={styles.heroMetaRow}>
                                    {heroRangeLabel ? (
                                        <Text style={styles.heroSubtitle} numberOfLines={1}>
                                            {heroRangeLabel}
                                        </Text>
                                    ) : null}

                                    <View style={[
                                        styles.heroStatusBadge,
                                        activeTab.isActive ? styles.heroStatusBadgeLive : styles.heroStatusBadgeUpcoming,
                                    ]}>
                                        {activeTab.isActive ? (
                                            <IconSymbol name="flame" size={10} color={theme.colors.onPrimary} />
                                        ) : (
                                            <View style={styles.heroStatusDot} />
                                        )}
                                        <Text style={[
                                            styles.heroStatusText,
                                            activeTab.isActive ? styles.heroStatusTextLive : styles.heroStatusTextUpcoming,
                                        ]}>
                                            {heroStatusLabel}
                                        </Text>
                                    </View>
                                </View>

                                <FlashSaleCountdown
                                    embedded
                                    endTime={slotDetail?.endTime || activeTab.endTime}
                                    startTime={slotDetail?.startTime || activeTab.startTime}
                                    secondsUntilStart={slotDetail?.secondsUntilStart ?? activeTab.secondsUntilStart}
                                    secondsUntilEnd={slotDetail?.secondsUntilEnd ?? activeTab.secondsUntilEnd}
                                    isUpcoming={!activeTab.isActive}
                                    label={activeTab.isActive ? t('home:flashSale.endingIn') : t('home:flashSale.startingIn')}
                                    onEnd={handleCountdownEnd}
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>

            <View style={styles.listSurfaceTop} />
        </>
    );

    const renderListEmpty = () => {
        if (isLoadingProducts && !refreshing) {
            return (
                <View style={[styles.emptyStateSurface, styles.center]}>
                    <ActivityIndicator color={theme.colors.newPrimary} />
                </View>
            );
        }

        return (
            <View style={[styles.emptyStateSurface, styles.center]}>
                <Animated.View entering={FadeIn.duration(800)}>
                    <View style={styles.emptyIconWrapper}>
                        <BlurView intensity={12} tint="light" style={styles.emptyBlur}>
                            <IconSymbol name="cart.badge.minus" size={64} color={theme.colors.secondaryLight} />
                        </BlurView>
                    </View>
                    <Text style={styles.emptyText}>{t('home:flashSale.emptyState.slotEmptyTitle')}</Text>
                </Animated.View>
            </View>
        );
    };

    if (isLoadingTabs) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle="light-content" />

                <LinearGradient
                    colors={[theme.colors.newPrimary, theme.colors.accent, theme.colors.header.background]}
                    locations={[0, 0.52, 1]}
                    style={styles.heroBackground}
                />
                <View style={styles.heroGlow} />

                {renderHeader()}

                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color={theme.colors.newPrimary} />
                </View>
            </View>
        );
    }

    if (tabs.length === 0) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle="dark-content" />
                <FlashSaleEmptyState
                    onBack={handleBack}
                    onNotifyPress={handleEmptyRemindMe}
                    onBrowsePress={handleBrowseProducts}
                    onCategoriesPress={handleOpenCategories}
                    onTrustedShopsPress={handleOpenTrustedShops}
                    onCartPress={handleOpenCart}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={[theme.colors.newPrimary, theme.colors.accent, theme.colors.header.background]}
                locations={[0, 0.52, 1]}
                style={styles.heroBackground}
            />
            <View style={styles.heroGlow} />

            {renderHeader()}

            <FlashList<FlashSaleItem>
                data={products}
                renderItem={({ item, index }: { item: FlashSaleItem; index: number }) => (
                    <View style={styles.listItemContainer}>
                        <FlashSaleProductCard
                            item={item}
                            index={index}
                            status={activeTab?.status || SlotStatus.UPCOMING}
                            onPress={(productId) => handleProductPress(productId)}
                            onRemindMe={handleProductRemindMe}
                        />
                    </View>
                )}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderListEmpty}
                ListFooterComponent={<View style={styles.listFooterSurface} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.newPrimary]}
                        tintColor={theme.colors.newPrimary}
                        progressViewOffset={insets.top + 54}
                    />
                }
                keyExtractor={(item: FlashSaleItem) => item.id}
                contentContainerStyle={[
                    styles.listContentContainer,
                    products.length === 0 && styles.listContentContainerEmpty,
                ]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    heroBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 304,
    },
    heroGlow: {
        position: 'absolute',
        top: 48,
        right: -72,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: theme.colors.accentSoft,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: theme.colors.onPrimary,
        letterSpacing: 0.3,
    },
    headerSpace: {
        width: 44,
    },
    backBtnWrapper: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    backBtnBlur: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceGlass,
    },
    heroSection: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    heroCard: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        backgroundColor: theme.colors.surfaceGlass,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 10,
    },
    heroCardBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    heroCardGlowPrimary: {
        position: 'absolute',
        top: -32,
        right: -20,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: theme.colors.activeSoft,
    },
    heroCardGlowAccent: {
        position: 'absolute',
        bottom: -48,
        left: -24,
        width: 180,
        height: 120,
        borderRadius: 90,
        backgroundColor: theme.colors.warningSubtle,
    },
    heroDivider: {
        height: 1,
        marginHorizontal: theme.margins.md,
        backgroundColor: theme.colors.borderGlass,
    },
    heroSummary: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.md,
        gap: theme.margins.xs + 2,
    },
    heroMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        minHeight: 28,
    },
    heroStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        flexShrink: 0,
    },
    heroStatusBadgeLive: {
        backgroundColor: theme.colors.newPrimary,
        borderColor: theme.colors.newPrimary,
    },
    heroStatusBadgeUpcoming: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    heroStatusDot: {
        width: 6,
        height: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.warning,
    },
    heroStatusText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    heroStatusTextLive: {
        color: theme.colors.onPrimary,
    },
    heroStatusTextUpcoming: {
        color: theme.colors.warning,
    },
    heroTitleText: {
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        letterSpacing: 0.2,
    },
    heroSubtitle: {
        fontSize: theme.fontSizes.md,
        color: theme.colors.typographySecondary,
        fontWeight: theme.fontWeights.medium,
        flexShrink: 1,
    },
    loadingCard: {
        flex: 1,
        marginTop: theme.margins.xs,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 18,
    },
    listContentContainer: {
        paddingBottom: theme.margins.xl + theme.margins.sm,
    },
    listContentContainerEmpty: {
        flexGrow: 1,
    },
    listSurfaceTop: {
        marginTop: theme.margins.xs,
        height: theme.margins.md + 2,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 18,
    },
    listItemContainer: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
    },
    listFooterSurface: {
        height: theme.margins.xl + theme.margins.sm,
        backgroundColor: theme.colors.surface,
    },
    emptyStateSurface: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.xl + theme.margins.sm,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: theme.margins.lg - 4,
    },
    emptyBlur: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceTranslucent,
    },
    emptyText: {
        fontSize: theme.fontSizes.base,
        color: theme.colors.secondary,
        textAlign: 'center',
        fontWeight: '500',
    },
}));
