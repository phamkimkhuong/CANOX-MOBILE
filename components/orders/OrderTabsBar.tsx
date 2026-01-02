/**
 * ==============================================
 * ORDER TABS BAR - Custom Tab Navigation
 * ==============================================
 * Tab bar ngang scrollable cho các trạng thái đơn hàng
 */

import { OrderTabStatus } from '@/types/order/order';
import { ORDER_TABS } from '@/utils/adapter/order/orderStatusMapper';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderTabsBarProps {
    activeTab: OrderTabStatus;
    onTabChange: (tab: OrderTabStatus) => void;
}

export const OrderTabsBar: React.FC<OrderTabsBarProps> = ({
    activeTab,
    onTabChange,
}) => {
    const { theme } = useUnistyles();
    const { width: screenWidth } = useWindowDimensions();
    const styles = stylesheet;
    const scrollViewRef = useRef<ScrollView>(null);

    // Track tab positions for indicator and scrolling
    const tabPositions = useRef<Record<string, { x: number; width: number }>>({});
    const indicatorLeft = useSharedValue(0);
    const indicatorWidth = useSharedValue(80);

    // Track layout readiness for initial scroll
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const measuredTabsCount = useRef(0);

    // ==============================================
    // AUTO-SCROLL TO ACTIVE TAB
    // ==============================================
    const scrollToTab = useCallback((tab: OrderTabStatus, animated = true) => {
        const position = tabPositions.current[tab];
        if (!position || !scrollViewRef.current) return;

        // Tính toán để căn giữa tab trong viewport
        const tabCenterX = position.x + position.width / 2;
        const viewportCenter = screenWidth / 2;
        const targetScrollX = tabCenterX - viewportCenter;

        // Clamp để không scroll quá đầu (không thể scroll quá 0)
        const clampedScrollX = Math.max(0, targetScrollX);

        scrollViewRef.current.scrollTo({
            x: clampedScrollX,
            animated,
        });
    }, [screenWidth]);

    // ==============================================
    // HANDLE TAB LAYOUT - Track when all tabs measured
    // ==============================================
    const handleTabLayout = useCallback((
        tab: OrderTabStatus,
        event: LayoutChangeEvent
    ) => {
        const { x, width } = event.nativeEvent.layout;

        // Chỉ increment count nếu là lần đầu đo tab này
        const isFirstMeasurement = !tabPositions.current[tab];
        if (isFirstMeasurement) {
            measuredTabsCount.current += 1;
        }

        tabPositions.current[tab] = { x, width };

        if (isFirstMeasurement && tab === activeTab) {
            indicatorLeft.value = x; // No animation for initial position
            indicatorWidth.value = width;
        }

        // Mark layout ready khi đã đo hết tất cả tabs
        if (measuredTabsCount.current >= ORDER_TABS.length && !isLayoutReady) {
            setIsLayoutReady(true);
        }
    }, [activeTab, indicatorLeft, indicatorWidth, isLayoutReady]);

    // ==============================================
    // EFFECT: Update indicator when activeTab changes
    // ==============================================
    useEffect(() => {
        const position = tabPositions.current[activeTab];
        if (position && isLayoutReady) {
            indicatorLeft.value = withTiming(position.x, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });
            indicatorWidth.value = withTiming(position.width, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });
        }
    }, [activeTab, isLayoutReady, indicatorLeft, indicatorWidth]);

    // ==============================================
    // EFFECT: Scroll to active tab when it changes or on initial load
    // ==============================================
    useEffect(() => {
        if (isLayoutReady) {
            // Small delay để đảm bảo layout ổn định
            const timer = setTimeout(() => {
                scrollToTab(activeTab);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [activeTab, isLayoutReady, scrollToTab]);

    // ==============================================
    // HANDLE TAB PRESS - Trigger change only
    // ==============================================
    const handleTabPress = useCallback((tab: OrderTabStatus) => {
        onTabChange(tab);
    }, [onTabChange]);

    const indicatorStyle = useAnimatedStyle(() => ({
        left: indicatorLeft.value,
        width: indicatorWidth.value,
    }));

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {ORDER_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={styles.tab}
                            onPress={() => handleTabPress(tab.key)}
                            onLayout={(e) => handleTabLayout(tab.key, e)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isActive && styles.tabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </Pressable>
                    );
                })}

                {/* Animated Indicator */}
                <Animated.View style={[styles.indicator, indicatorStyle]} />
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        position: 'relative',
    },
    tab: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        marginRight: theme.margins.sm,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
}));
