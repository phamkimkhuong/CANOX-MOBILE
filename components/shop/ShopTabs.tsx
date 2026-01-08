/**
 * ==============================================
 * SHOP TABS - Sticky Tab Navigation
 * ==============================================
 * 
 * Features:
 * - Sticky positioning when scrolling
 * - Active/inactive states
 * - Animated indicator
 * - Badge support (for product count)
 */

import { SHOP_TABS, ShopTabType } from '@/types/shop';
import React, { useCallback, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopTabsProps {
    /** Currently active tab */
    activeTab: ShopTabType;
    /** Callback when tab changes */
    onTabChange: (tab: ShopTabType) => void;
    /** Product count to show in badge */
    productCount?: number | null;
}

/**
 * ShopTabs - Horizontal tab navigation for shop detail
 * 
 * Used as StickyHeader in FlashList to remain visible
 * while scrolling through products
 */
export const ShopTabs: React.FC<ShopTabsProps> = ({
    activeTab,
    onTabChange,
    productCount,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Track tab positions for animated indicator
    const tabWidths = useRef<Record<ShopTabType, number>>({
        products: 0,
        profile: 0,
        categories: 0,
    });
    const tabPositions = useRef<Record<ShopTabType, number>>({
        products: 0,
        profile: 0,
        categories: 0,
    });

    // Animated indicator position
    const indicatorX = useSharedValue(0);
    const indicatorWidth = useSharedValue(80);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
        width: indicatorWidth.value,
    }));

    // Handle tab layout measurement
    const handleTabLayout = useCallback(
        (key: ShopTabType, x: number, width: number) => {
            tabPositions.current[key] = x;
            tabWidths.current[key] = width;

            // Update indicator for active tab
            if (key === activeTab) {
                indicatorX.value = withSpring(x, { damping: 20, stiffness: 200 });
                indicatorWidth.value = withSpring(width, { damping: 20, stiffness: 200 });
            }
        },
        [activeTab, indicatorX, indicatorWidth]
    );

    // Handle tab press
    const handleTabPress = useCallback(
        (tab: ShopTabType) => {
            onTabChange(tab);

            // Animate indicator
            const x = tabPositions.current[tab] || 0;
            const width = tabWidths.current[tab] || 80;
            indicatorX.value = withSpring(x, { damping: 20, stiffness: 200 });
            indicatorWidth.value = withSpring(width, { damping: 20, stiffness: 200 });
        },
        [onTabChange, indicatorX, indicatorWidth]
    );

    // Get label with optional count
    const getTabLabel = (tab: ShopTabType, label: string): string => {
        if (tab === 'products' && productCount !== null && productCount !== undefined) {
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
                    <Pressable
                        key={tab.key}
                        style={styles.tabButton}
                        onPress={() => handleTabPress(tab.key)}
                        onLayout={(e) => {
                            const { x, width } = e.nativeEvent.layout;
                            handleTabLayout(tab.key, x, width);
                        }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.key && styles.tabTextActive,
                            ]}
                        >
                            {getTabLabel(tab.key, tab.label)}
                        </Text>
                    </Pressable>
                ))}

                {/* Animated Indicator */}
                <Animated.View style={[styles.indicator, indicatorStyle]} />
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.secondaryLight,
        // Ensure it's on top when sticky
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
    },
    tabButton: {
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        marginRight: theme.margins.sm,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    tabTextActive: {
        fontWeight: '700',
        color: theme.colors.primary,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
}));

export default ShopTabs;
