import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductTabsProps {
    onTabChange?: (tab: string) => void;
}

const TABS = ['Recommended', 'Best Selling', 'New Arrivals', 'Near You'];

export const ProductTabs = ({ onTabChange }: ProductTabsProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        onTabChange?.(tab);
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
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => handleTabPress(tab)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab}
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
