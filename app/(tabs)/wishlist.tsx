import { PriceTargetTab } from '@/components/wishlist/PriceTargetTab';
import { PrivateWishlistTab } from '@/components/wishlist/PrivateWishlistTab';
import { usePriceTargetMetCount } from '@/hooks/api/wishlist/usePriceTargetMet';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React, { useState } from 'react';
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

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('price_target');

    // Total deals badge
    const priceTargetCount = usePriceTargetMetCount();

    // Default to private if no deals
    React.useEffect(() => {
        if (priceTargetCount === 0 && activeTab === 'price_target') {
            setActiveTab('private');
        } else if (priceTargetCount > 0 && activeTab === 'private') {
            setActiveTab('price_target');
        }
    }, [priceTargetCount]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{t('title', { defaultValue: 'Yêu thích' })}</Text>
                </View>

                {/* Segmented Tabs */}
                <View style={styles.tabBar}>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'price_target' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('price_target')}
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
                        onPress={() => setActiveTab('private')}
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

                    {/* TEMPORARILY HIDDEN: Discover/Public Tab
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'public' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('public')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'public' && styles.tabTextActive,
                            ]}
                        >
                            {t('tabs.public')}
                        </Text>
                    </Pressable>
                    */}
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'price_target' && <PriceTargetTab onSwitchToPrivateTab={() => setActiveTab('private')} />}
                {activeTab === 'private' && <PrivateWishlistTab />}
                {/* {activeTab === 'public' && <PublicWishlistTab />} */}
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
        backgroundColor: theme.colors.surface,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
        paddingBottom: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: 6,
    },
    tabActive: {
        borderBottomColor: theme.colors.newPrimary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    tabTextActive: {
        color: theme.colors.newPrimary,
        fontWeight: 'bold',
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
}));
