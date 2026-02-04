import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useCartStore } from '@/store/useCartStore';
import { Navigator } from '@/utils/navigation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

// CONSTANTS
const NAVBAR_HEIGHT = 56;
const SCROLL_THRESHOLD = 150; // Điểm chuyển màu header

// TYPES
interface ProductNavBarProps {
    scrollY: SharedValue<number>;
    title?: string;
    onCartPress?: () => void;
    onSharePress?: () => void;
    onMorePress?: () => void;
}

interface NavButtonProps {
    icon: React.ComponentProps<typeof IconSymbol>['name'];
    onPress?: () => void;
    badge?: number;
    scrollY: SharedValue<number>;
}

// ============================================
// ANIMATED NAV BUTTON
// ============================================
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const NavButton: React.FC<NavButtonProps> = ({
    icon,
    onPress,
    badge,
    scrollY,
}) => {
    const { theme } = useUnistyles();

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['rgba(0, 0, 0, 0.4)', 'rgba(255, 255, 255, 0)'] // Đen mờ 40% -> Trong suốt
        );
        return { backgroundColor };
    });

    const animatedIconProps = useAnimatedProps(() => {
        const color = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['#FFFFFF', theme.colors.typography] // Trắng -> Đen khi scroll
        );
        return { color };
    });

    /**
     * Map icon names từ custom names sang Ionicons names
     */
    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            back: Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back',
            search: 'search-outline',
            cart: 'cart-outline',
            share: Platform.OS === 'ios' ? 'share-outline' : 'share-social-outline',
            more: Platform.OS === 'ios' ? 'ellipsis-horizontal' : 'ellipsis-vertical',
        };
        return iconMap[icon] ?? (icon as keyof typeof Ionicons.glyphMap);
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.navButton, animatedContainerStyle]}
            hitSlop={8}
        >
            <AnimatedIcon
                name={getIconName()}
                size={24}
                animatedProps={animatedIconProps}
                style={styles.navIcon}
            />
            {badge !== undefined && badge > 0 && (

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {badge > 99 ? '99+' : badge}
                    </Text>
                </View>
            )}
        </AnimatedPressable>
    );
};

export const ProductNavBar: React.FC<ProductNavBarProps> = ({
    scrollY,
    title,
    onCartPress,
    onSharePress,
    onMorePress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');
    const cartItemCount = useCartStore((state) => state.totalQuantity);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace(ROUTES.TABS.HOME);
        }
    };

    // === Animated Styles ===
    const animatedHeaderStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['transparent', theme.colors.surface]
        );
        const borderBottomColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_THRESHOLD],
            ['transparent', theme.colors.border]
        );
        return {
            backgroundColor,
            borderBottomColor,
            borderBottomWidth: 1,
        };
    });

    const animatedTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
            [0, 1],
            'clamp'
        );
        const translateY = interpolate(
            scrollY.value,
            [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
            [10, 0],
            'clamp'
        );
        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                styles.safeTop,
                animatedHeaderStyle,
            ]}
        >
            <View style={styles.content}>
                {/* Left: Back Button */}
                <View style={styles.leftSection}>
                    <NavButton
                        icon="back"
                        onPress={handleGoBack}
                        scrollY={scrollY}
                    />
                </View>

                {/* Center: Title (appears on scroll) */}
                <Animated.View style={[styles.centerSection, animatedTitleStyle]}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title ?? t('navigation.title')}
                    </Text>
                </Animated.View>

                {/* Right: Actions */}
                <View style={styles.rightSection}>
                    <NavButton
                        icon="cart"
                        onPress={onCartPress}
                        badge={cartItemCount}
                        scrollY={scrollY}
                    />
                    <NavButton
                        icon="share"
                        onPress={onSharePress}
                        scrollY={scrollY}
                    />
                    <NavButton
                        icon="more"
                        onPress={onMorePress}
                        scrollY={scrollY}
                    />
                </View>
            </View>
        </Animated.View>
    );
};
const styles = StyleSheet.create((theme) => ({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    safeTop: {
        paddingTop: UnistylesRuntime.insets.top,
    },
    content: {
        height: NAVBAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    navIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.margins.sm,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        maxWidth: 200,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: theme.colors.surface,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
}));

export default ProductNavBar;
