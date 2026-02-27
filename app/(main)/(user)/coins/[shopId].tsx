import {
    ShopBatchesTab,
    ShopHistoryTab,
    ShopLoyaltyHero,
} from '@/components/loyalty';
import { IconSymbol } from '@/components/ui/Icon';
import { useShopLoyalty } from '@/hooks/api/loyalty/useLoyalty';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function ShopLoyaltyDetailScreen() {
    const { shopId, shopName, shopLogo } = useLocalSearchParams<{ shopId: string, shopName?: string, shopLogo?: string }>();
    const { theme } = useUnistyles();
    const { t } = useTranslation(['loyalty']);
    const styles = stylesheet;
    const { top } = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<'BATCH' | 'HISTORY'>('BATCH');

    const shopQuery = useShopLoyalty(shopId);

    const pointBalance = shopQuery.data;

    return (
        <View style={styles.container}>
            {/* Background Image / Blur Effect */}
            <View style={StyleSheet.absoluteFillObject}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=2000&auto=format&fit=crop' }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    blurRadius={80} // Heavy blur for liquid glass base
                />
                <View style={[StyleSheet.absoluteFillObject, styles.darkOverlay]} />
            </View>

            {/* Custom Transparent Header */}
            <View style={[styles.header, { paddingTop: top + 10 }]}>
                <TouchableOpacity onPress={() => Navigator.back()} style={styles.iconButton}>
                    <IconSymbol name="chevron-left" size={28} color={theme.colors.onPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('loyalty:shopDetail.title')}</Text>
                <View style={styles.iconButton} />
            </View>

            {/* Hero Card */}
            <ShopLoyaltyHero
                shopLogo={shopLogo}
                pointBalance={pointBalance}
                shopName={shopName || t('loyalty:shopDetail.hero.defaultShopName')} // Fallback name
            />

            {/* Floating Glass Tabs */}
            <View style={styles.tabContainer}>
                <View style={[styles.tabSegment, { borderColor: theme.colors.borderGlass }]}>
                    <Pressable
                        style={[styles.tabButton, activeTab === 'BATCH' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('BATCH')}
                    >
                        <Text style={[styles.tabText, activeTab === 'BATCH' && styles.tabTextActive]}>
                            {t('loyalty:shopDetail.tabs.batches')}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tabButton, activeTab === 'HISTORY' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('HISTORY')}
                    >
                        <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActive]}>
                            {t('loyalty:shopDetail.tabs.history')}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {activeTab === 'BATCH' && (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.flex1}>
                        <ShopBatchesTab shopId={shopId} />
                    </Animated.View>
                )}

                {activeTab === 'HISTORY' && (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.flex1}>
                        <ShopHistoryTab shopId={shopId} />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.inkBlack,
    },
    darkOverlay: {
        backgroundColor: 'rgba(50, 0, 0, 0.5)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    tabContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        alignItems: 'center',
        zIndex: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabSegment: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 100,
        padding: 4,
        borderWidth: 0.5,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 100,
    },
    tabButtonActive: {
        backgroundColor: theme.colors.vibrantRed,
        shadowColor: theme.colors.vibrantRed,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    tabTextActive: {
        color: theme.colors.onPrimary,
    },
    contentArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        paddingTop: theme.margins.md,
    },
    flex1: {
        flex: 1,
    }
}));
