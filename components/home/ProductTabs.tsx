import { FeedType } from '@/hooks/api/useHomeProducts';
import React from 'react';
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

export const ProductTabs = ({ activeTab, onTabChange }: ProductTabsProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handleTabPress = (tab: FeedType) => {
        onTabChange(tab);
    };

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
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.lg,
    },
    tab: {
        paddingVertical: 12,
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
