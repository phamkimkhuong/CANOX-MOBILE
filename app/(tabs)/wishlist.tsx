import { CartHeaderButton, ChatHeaderButton } from '@/components/ui/navigation/HeaderButtons';
import { PriceTargetTab } from '@/components/wishlist/PriceTargetTab';
import { PrivateWishlistTab } from '@/components/wishlist/PrivateWishlistTab';
import { usePriceTargetMetCount } from '@/hooks/api/wishlist/usePriceTargetMet';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { LinearGradient } from 'expo-linear-gradient';
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
        setActiveTab((prev) => {
            if (priceTargetCount === 0 && prev === 'price_target') {
                return 'private';
            } else if (priceTargetCount > 0 && prev === 'private') {
                return 'price_target';
            }
            return prev;
        });
    }, [priceTargetCount]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.newPrimary, '#FF512F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{t('title', { defaultValue: 'Yêu thích' })}</Text>

                    <View style={styles.actions}>
                        <CartHeaderButton color="#FFFFFF" badgeBorderColor={theme.colors.newPrimary} />
                        <ChatHeaderButton color="#FFFFFF" badgeBorderColor={theme.colors.newPrimary} />
                    </View>
                </View>

                {/* Segmented Tabs */}
                <View style={styles.tabBarContainer}>
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
            </LinearGradient>

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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
        height: 56,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    actions: {
        position: 'absolute',
        right: theme.margins.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tabBarContainer: {
        paddingHorizontal: theme.margins.md,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 100,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 100, // Inner indicator pill shape
        gap: 6,
    },
    tabActive: {
        backgroundColor: '#FFFFFF', // Pop out as a white pill
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
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
}));
