/**
 * ==============================================
 * WISHLIST TAB BAR - Custom Tab Navigation
 * ==============================================
 * 3 tabs: Bộ sưu tập | Săn giá | Khám phá
 * With badge support for price alerts
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type WishlistTabKey = 'collections' | 'price-alerts' | 'discover';

interface TabConfig {
    key: WishlistTabKey;
    label: string;
    icon: IconSymbolName;
}

const TABS: TabConfig[] = [
    { key: 'collections', label: 'Bộ sưu tập', icon: 'favorite' },
    { key: 'price-alerts', label: 'Săn giá', icon: 'notifications' },
    { key: 'discover', label: 'Khám phá', icon: 'explore' },
];

interface WishlistTabBarProps {
    activeTab: WishlistTabKey;
    onTabChange: (tab: WishlistTabKey) => void;
    priceAlertCount?: number;
}

/**
 * WishlistTabBar - Custom tab bar for wishlist hub
 * 
 * @example
 * <WishlistTabBar
 *   activeTab="collections"
 *   onTabChange={setActiveTab}
 *   priceAlertCount={3}
 * />
 */
export const WishlistTabBar: React.FC<WishlistTabBarProps> = ({
    activeTab,
    onTabChange,
    priceAlertCount = 0,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const showBadge = tab.key === 'price-alerts' && priceAlertCount > 0;

                return (
                    <Pressable
                        key={tab.key}
                        style={[
                            styles.tab,
                            isActive && styles.activeTab,
                        ]}
                        onPress={() => onTabChange(tab.key)}
                    >
                        <View style={styles.iconContainer}>
                            <IconSymbol
                                name={tab.icon}
                                size={20}
                                color={isActive ? theme.colors.primary : theme.colors.secondary}
                            />
                            {showBadge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {priceAlertCount > 9 ? '9+' : priceAlertCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text
                            style={[
                                styles.label,
                                isActive && styles.activeLabel,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.xl,
        gap: 6,
    },
    activeTab: {
        backgroundColor: theme.colors.primaryMuted,
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -10,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    activeLabel: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
}));
