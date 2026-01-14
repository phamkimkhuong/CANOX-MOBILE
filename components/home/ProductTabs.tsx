/**
 * ==============================================
 * PRODUCT TABS - Home Feed Filter Tabs
 * ==============================================
 * Tabs with animated icons to filter product feed by category
 */

import { IconSymbol } from '@/components/ui/Icon';
import { FeedType } from '@/hooks/api/useHomeProducts';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductTabsProps {
    activeTab: FeedType;
    onTabChange: (tab: FeedType) => void;
}

// ============================================
// ANIMATED ICON COMPONENTS
// ============================================

/**
 * Animated NEW Badge with Pulse Effect
 */
const AnimatedNewBadge = memo(({ isActive }: { isActive: boolean }) => {
    const styles = stylesheet;
    const scale = useSharedValue(1);

    useEffect(() => {
        // Pulse animation: scale 1 → 1.08 → 1, repeat infinite
        scale.value = withRepeat(
            withSequence(
                withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Infinite repeat
            false
        );
    }, [scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <LinearGradient
                colors={isActive ? ['#FF4757', '#FF6B81'] : ['#FF6B81', '#FF8A9B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newBadge}
            >
                <Text style={styles.newBadgeText}>NEW</Text>
            </LinearGradient>
        </Animated.View>
    );
});

AnimatedNewBadge.displayName = 'AnimatedNewBadge';

/**
 * Animated Flash Icon with Shimmer Effect
 */
const AnimatedFlashIcon = memo(({ isActive, color }: { isActive: boolean; color: string }) => {
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Flash animation: opacity blink
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
                withDelay(1000, withTiming(1, { duration: 0 })) // Pause 1s before repeat
            ),
            -1,
            false
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animatedStyle}>
            <IconSymbol name="flash" size={18} color={color} />
        </Animated.View>
    );
});

AnimatedFlashIcon.displayName = 'AnimatedFlashIcon';

/**
 * Animated Flame Icon with Wiggle Effect
 */
const AnimatedFlameIcon = memo(({ isActive, color }: { isActive: boolean; color: string }) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Wiggle animation: rotate left-right like a flame
        rotation.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 200, easing: Easing.inOut(Easing.ease) }),
                withTiming(8, { duration: 200, easing: Easing.inOut(Easing.ease) }),
                withTiming(-5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
                withTiming(5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) }),
                withDelay(800, withTiming(0, { duration: 0 })) // Pause before repeat
            ),
            -1,
            false
        );
    }, [rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <IconSymbol name="flame" size={18} color={color} />
        </Animated.View>
    );
});

AnimatedFlameIcon.displayName = 'AnimatedFlameIcon';

/**
 * Animated Trophy Icon with Bounce Effect
 */
const AnimatedTrophyIcon = memo(({ isActive, color }: { isActive: boolean; color: string }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        // Bounce animation: scale with elastic feel
        scale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 400, easing: Easing.out(Easing.back(2)) }),
                withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                withDelay(1500, withTiming(1, { duration: 0 })) // Longer pause for subtle effect
            ),
            -1,
            false
        );
    }, [scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <IconSymbol name="trophy" size={18} color={color} />
        </Animated.View>
    );
});

AnimatedTrophyIcon.displayName = 'AnimatedTrophyIcon';

// ============================================
// TAB CONFIGURATION
// ============================================

interface TabConfig {
    label: string;
    value: FeedType;
    iconType: 'new' | 'flash' | 'flame' | 'trophy';
    iconColor: string;
    activeIconColor: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ProductTabs = memo(({ activeTab, onTabChange }: ProductTabsProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');

    /**
     * Tab configuration with animated icons
     */
    const tabs = useMemo((): TabConfig[] => [
        {
            label: t('tabs.new'),
            value: 'new',
            iconType: 'new',
            iconColor: '#FF6B81',
            activeIconColor: '#FF4757',
        },
        {
            label: t('tabs.sale'),
            value: 'sale',
            iconType: 'flash',
            iconColor: '#FFB800',
            activeIconColor: '#FF9500',
        },
        {
            label: t('tabs.popular'),
            value: 'promoted',
            iconType: 'flame',
            iconColor: '#FF8A65',
            activeIconColor: '#FF5722',
        },
        {
            label: t('tabs.featured'),
            value: 'featured',
            iconType: 'trophy',
            iconColor: '#D4AF37',
            activeIconColor: '#B8860B',
        },
    ], [t]);

    const handleTabPress = useCallback((tab: FeedType) => {
        onTabChange(tab);
    }, [onTabChange]);

    /**
     * Render animated icon based on tab type
     */
    const renderTabIcon = useCallback((tab: TabConfig, isActive: boolean) => {
        const color = isActive ? tab.activeIconColor : tab.iconColor;

        switch (tab.iconType) {
            case 'new':
                return <AnimatedNewBadge isActive={isActive} />;
            case 'flash':
                return <AnimatedFlashIcon isActive={isActive} color={color} />;
            case 'flame':
                return <AnimatedFlameIcon isActive={isActive} color={color} />;
            case 'trophy':
                return <AnimatedTrophyIcon isActive={isActive} color={color} />;
            default:
                return null;
        }
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <TouchableOpacity
                            key={tab.value}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => handleTabPress(tab.value)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tabContent}>
                                {renderTabIcon(tab, isActive)}
                                <Text style={[
                                    styles.tabText,
                                    isActive && styles.tabTextActive
                                ]}>
                                    {tab.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
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
        paddingHorizontal: theme.margins.sm,
        gap: 14,
    },
    tab: {
        paddingVertical: 11,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.primary,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
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
    newBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
    },
    newBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
}));
