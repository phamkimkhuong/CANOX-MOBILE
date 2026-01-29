/**
 * ==============================================
 * SHOP NAV BAR - Animated Header with Search
 * ==============================================
 *
 * Features:
 * - Transparent → Solid background on scroll
 * - Color transition for icons and search bar
 * - Matches ProductNavBar animation pattern
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const SCROLL_THRESHOLD = 120;

export interface ShopNavBarProps {
    scrollY: SharedValue<number>;
    onBackPress: () => void;
    onSearchPress: () => void;
    onMorePress: () => void;
    searchPlaceholder?: string;
}

export const ShopNavBar: React.FC<ShopNavBarProps> = ({
    scrollY,
    onBackPress,
    onSearchPress,
    onMorePress,
    searchPlaceholder = 'Tìm sản phẩm trong Shop',
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;

    // Header background: transparent → surface
    const animatedHeaderStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['transparent', theme.colors.surface]
        );
        const borderBottomColor = interpolateColor(
            scrollY.value,
            [SCROLL_THRESHOLD - 10, SCROLL_THRESHOLD],
            ['transparent', theme.colors.border]
        );
        return {
            backgroundColor,
            borderBottomColor,
            borderBottomWidth: 1,
        };
    });

    // Search bar background: translucent dark → solid background on scroll
    const animatedSearchStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['rgba(0, 0, 0, 0.25)', theme.colors.background]
        );
        return { backgroundColor };
    });

    // Icon/Text color: white → typography
    const animatedContentStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['#FFFFFF', theme.colors.typography]
        );
        return { color };
    });

    // Placeholder color: white translucent → typographySecondary
    const animatedPlaceholderStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['rgba(255, 255, 255, 0.9)', theme.colors.typographySecondary]
        );
        return { color };
    });

    // Icon background opacity: visible → hidden
    const animatedIconBgStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, SCROLL_THRESHOLD / 2],
            [1, 0],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    return (
        <Animated.View style={[styles.container, { paddingTop: insets.top }, animatedHeaderStyle]}>
            <View style={styles.content}>
                {/* Back Button */}
                <Pressable onPress={onBackPress} style={styles.actionBtn}>
                    <View style={styles.iconContainer}>
                        <Animated.View style={[styles.iconBg, animatedIconBgStyle]} />
                        <IconSymbol
                            name="arrow-back"
                            size={24}
                            color="#FFF"
                            animatedStyle={animatedContentStyle as never}
                        />
                    </View>
                </Pressable>

                {/* Search Bar */}
                <Pressable onPress={onSearchPress} style={styles.searchWrapper}>
                    <Animated.View style={[styles.searchBar, animatedSearchStyle]}>
                        <IconSymbol
                            name="search"
                            size={18}
                            color="#FFF"
                            animatedStyle={animatedPlaceholderStyle as never}
                        />
                        <Animated.Text style={[styles.searchText, animatedPlaceholderStyle]}>
                            {searchPlaceholder}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>

                {/* More Button */}
                <View style={styles.rightActions}>
                    <Pressable onPress={onMorePress} style={styles.actionBtn}>
                        <View style={styles.iconContainer}>
                            <Animated.View style={[styles.iconBg, animatedIconBgStyle]} />
                            <IconSymbol
                                name="more-vert"
                                size={24}
                                color="#FFF"
                                animatedStyle={animatedContentStyle as never}
                            />
                        </View>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        height: 56,
        gap: theme.margins.sm,
    },
    actionBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    searchWrapper: {
        flex: 1,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 8,
        paddingHorizontal: theme.margins.smd,
        gap: 8,
    },
    searchText: {
        fontSize: 14,
        fontWeight: '500',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}));

export default ShopNavBar;
