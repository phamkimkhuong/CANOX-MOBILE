/**
 * ==============================================
 * SHOP TABS - Synced with Home Screen Style
 * ==============================================
 */

import { SHOP_TABS, ShopTabType } from '@/types/shop';
import React, { memo, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ShopTabsProps {
    activeTab: ShopTabType;
    onTabChange: (tab: ShopTabType) => void;
    productCount?: number | null;
}

export const ShopTabs = memo(({
    activeTab,
    onTabChange,
    productCount,
}: ShopTabsProps) => {
    const styles = stylesheet;

    const handleTabPress = useCallback((tab: ShopTabType) => {
        onTabChange(tab);
    }, [onTabChange]);

    const getTabLabel = (tab: ShopTabType, label: string): string => {
        if (tab === 'products' && typeof productCount === 'number') {
            return `${label} (${productCount})`;
        }
        return label;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {SHOP_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && styles.tabActive
                        ]}
                        onPress={() => handleTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.key && styles.tabTextActive,
                            ]}
                        >
                            {getTabLabel(tab.key, tab.label)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
});

ShopTabs.displayName = 'ShopTabs';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        borderRadius: theme.radius.m,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.lg,
    },
    tab: {
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.newPrimary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    tabTextActive: {
        color: theme.colors.newPrimary,
        fontWeight: '600',
    },
}));

export default ShopTabs;
