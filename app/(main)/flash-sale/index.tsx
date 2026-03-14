import { FlashSaleCountdown } from '@/components/flash-sale/FlashSaleCountdown';
import { FlashSaleProductCard } from '@/components/flash-sale/FlashSaleProductCard';
import { FlashSaleTimeline } from '@/components/flash-sale/FlashSaleTimeline';
import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { useCampaignDetail } from '@/hooks/api/campaign/useCampaignDetail';
import { useFlashSaleTabs } from '@/hooks/api/campaign/useFlashSaleTabs';
import { useSlotDetail } from '@/hooks/api/campaign/useSlotDetail';
import { SlotStatus } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { Navigator } from '@/utils/navigation';
import { buildImageUrl } from '@/utils/url';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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

    const { data: tabs = [], isLoading: isLoadingTabs } = useFlashSaleTabs();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    useEffect(() => {
        if (tabs.length > 0 && !activeTabId) {
            const activeTab = tabs.find((tab) => tab.isActive) || tabs[0];
            setActiveTabId(activeTab.id);
        }
    }, [tabs, activeTabId]);

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    const {
        data: slotDetail,
        isLoading: isLoadingSlot,
        refetch: refetchSlot,
    } = useSlotDetail(activeTabId);

    const products = slotDetail?.transformedProducts || [];
    const isLoadingProducts = isLoadingSlot;

    const campaignId = (activeTab?.campaignId || slotDetail?.campaignId) as string | undefined;
    const { data: campaign } = useCampaignDetail(campaignId);

    const bannerImage = campaign?.bannerUrl || campaign?.thumbnailUrl
        ? buildImageUrl(campaign.bannerUrl || campaign.thumbnailUrl, null, 'large')
        : null;

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleRemindMe = useCallback((_id: string) => {
        // Reminder flow can be implemented later without blocking UI polish now.
    }, []);

    const handleProductPress = useCallback((productId: string) => {
        Navigator.push(productRoutes.detail(productId));
    }, []);

    const renderHeader = () => (
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
    );

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

            <View style={styles.heroSection}>
                <FlashSaleTimeline
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabPress={(tab) => setActiveTabId(tab.id)}
                />

                {activeTab && (
                    <View style={styles.countdownContainer}>
                        <FlashSaleCountdown
                            endTime={slotDetail?.endTime || activeTab.endTime}
                            secondsUntilStart={slotDetail?.secondsUntilStart ?? activeTab.secondsUntilStart}
                            secondsUntilEnd={slotDetail?.secondsUntilEnd ?? activeTab.secondsUntilEnd}
                            label={activeTab.isActive ? t('home:flashSale.endingIn') : t('home:flashSale.startingIn')}
                            onEnd={() => {
                                refetchSlot();
                            }}
                        />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.listWrapper}>
                    {isLoadingProducts ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={theme.colors.newPrimary} />
                        </View>
                    ) : products.length === 0 ? (
                        <Animated.View entering={FadeIn.duration(800)} style={styles.center}>
                            <View style={styles.emptyIconWrapper}>
                                <BlurView intensity={12} tint="light" style={styles.emptyBlur}>
                                    <IconSymbol name="cart.badge.minus" size={64} color={theme.colors.secondaryLight} />
                                </BlurView>
                            </View>
                            <Text style={styles.emptyText}>Chua co san pham nao cho dot nay</Text>
                        </Animated.View>
                    ) : (
                        <FlashList
                            data={products}
                            renderItem={({ item, index }: { item: FlashSaleItem; index: number }) => (
                                <FlashSaleProductCard
                                    item={item}
                                    index={index}
                                    status={activeTab?.status || SlotStatus.UPCOMING}
                                    onPress={(productId) => handleProductPress(productId)}
                                    onRemindMe={handleRemindMe}
                                />
                            )}
                            ListHeaderComponent={() => (
                                bannerImage ? (
                                    <View style={styles.bannerContainer}>
                                        <Image
                                            source={{ uri: bannerImage }}
                                            style={styles.bannerImage}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    </View>
                                ) : null
                            )}
                            keyExtractor={(item: FlashSaleItem) => item.id}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
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
        paddingBottom: theme.margins.xs,
    },
    countdownContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },
    content: {
        flex: 1,
        marginTop: theme.margins.xs,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        overflow: 'hidden',
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 18,
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
    listWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.xl + theme.margins.sm,
    },
    bannerContainer: {
        width: '100%',
        aspectRatio: 3.2,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        marginBottom: theme.margins.md,
        backgroundColor: theme.colors.surfaceTranslucent,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
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
