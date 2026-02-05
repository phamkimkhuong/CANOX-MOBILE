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
import { toPublicUrl } from '@/utils/url';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * FlashSaleScreen - Premium Liquid Glass Experience
 */
export default function FlashSaleScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const { t } = useTranslation(['home']);

    // 1. Data Fetching
    const { data: tabs = [], isLoading: isLoadingTabs } = useFlashSaleTabs();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Auto-select first active or upcoming tab
    useEffect(() => {
        if (tabs.length > 0 && !activeTabId) {
            const activeTab = tabs.find(t => t.isActive) || tabs[0];
            setActiveTabId(activeTab.id);
        }
    }, [tabs, activeTabId]);

    const activeTab = tabs.find(t => t.id === activeTabId);

    const {
        data: slotDetail,
        isLoading: isLoadingSlot,
        refetch: refetchSlot
    } = useSlotDetail(activeTabId);

    const products = slotDetail?.transformedProducts || [];
    const isLoadingProducts = isLoadingSlot;

    // Campaign Banner Data
    const campaignId = (activeTab?.campaignId || slotDetail?.campaignId) as string | undefined;
    const { data: campaign } = useCampaignDetail(campaignId);

    const bannerImage = (campaign?.bannerUrl || campaign?.thumbnailUrl) ? toPublicUrl(campaign.bannerUrl || campaign.thumbnailUrl) : null;
    const handleRemindMe = useCallback((_id: string) => {
        // Implement remind logic here if needed
    }, []);

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleProductPress = useCallback((productId: string) => {
        Navigator.push(productRoutes.detail(productId));
    }, []);

    if (isLoadingTabs) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header Gradient - Matches Home vibrancy but with Liquid Glass depth */}
            <LinearGradient
                colors={['#EF4444', '#FF6B00', '#0F172A']}
                locations={[0, 0.35, 0.8]}
                style={StyleSheet.absoluteFill}
            />

            {/* Liquid Glass Background Layers */}
            <View style={styles.bgGlow2} />

            {/* Header Area */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backBtnWrapper}
                >
                    <BlurView intensity={25} tint="light" style={styles.backBtnBlur}>
                        <IconSymbol name="chevron.left" size={24} color="#FFF" />
                    </BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('home:flashSale.title')}</Text>
                <View style={styles.headerSpace} />
            </View>

            {/* Timeline Filter */}
            <FlashSaleTimeline
                tabs={tabs}
                activeTabId={activeTabId}
                onTabPress={(tab) => setActiveTabId(tab.id)}
            />

            {/* Countdown Area - Sitting on gradient */}
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

            {/* Content Area */}
            <View style={styles.content}>
                {/* Product List */}
                <View style={styles.listWrapper}>
                    {isLoadingProducts ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={theme.colors.primary} />
                        </View>
                    ) : products.length === 0 ? (
                        <Animated.View entering={FadeIn.duration(800)} style={styles.center}>
                            <View style={styles.emptyIconWrapper}>
                                <BlurView intensity={10} tint="light" style={styles.emptyBlur}>
                                    <IconSymbol name="cart.badge.minus" size={64} color="rgba(255,255,255,0.2)" />
                                </BlurView>
                            </View>
                            <Text style={styles.emptyText}>Chưa có sản phẩm nào cho đợt này</Text>
                        </Animated.View>
                    ) : (
                        <FlashList
                            data={products}
                            renderItem={({ item, index }: { item: FlashSaleItem, index: number }) => (
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
                                            resizeMode="cover"
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
        backgroundColor: '#0f172a', // Deep Navy
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    // Background Glow Effects
    bgGlow2: {
        position: 'absolute',
        top: 200,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(238, 77, 45, 0.1)', // Warm glow from top
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.3,
    },
    headerSpace: {
        width: 44,
    },
    backBtnWrapper: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    backBtnBlur: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10
    },
    content: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    listWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    bannerContainer: {
        width: '100%',
        aspectRatio: 3.2,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        marginBottom: 20,
    },
    emptyBlur: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.secondary,
        textAlign: 'center',
        fontWeight: '500',
    },
}));
