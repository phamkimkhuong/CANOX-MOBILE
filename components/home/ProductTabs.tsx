import { FeedType } from '@/hooks/api/useHomeProducts';
import React, { memo, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductTabsProps {
    activeTab: FeedType;
    onTabChange: (tab: FeedType) => void;
}

const TABS: { label: string; value: FeedType }[] = [
    // { label: 'Gợi ý', value: 'promoted' },
    // { label: 'Bán chạy', value: 'featured' },
    { label: 'Hàng mới', value: 'new' },
    { label: 'Giảm giá', value: 'sale' },
];

/**
 * ProductTabs - Tab navigation cho Product Feed
 */
export const ProductTabs = memo(({ activeTab, onTabChange }: ProductTabsProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handleTabPress = useCallback((tab: FeedType) => {

        onTabChange(tab);
    }, [onTabChange]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tab, activeTab === tab.value && styles.tabActive]}
                        onPress={() => handleTabPress(tab.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
});

ProductTabs.displayName = 'ProductTabs';

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
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
}));
