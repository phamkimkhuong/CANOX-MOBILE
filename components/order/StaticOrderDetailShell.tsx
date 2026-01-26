import { IconSymbol } from '@/components/ui/Icon';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface StaticOrderDetailShellProps {
    /**
     * Only start shimmer animation when CPU is idle
     * true = Animation active, false = Static
     */
    showShimmer?: boolean;
}

/**
 * StaticOrderDetailShell - A lightweight shell with optional shimmer.
 * Synchronized with Safe Area to prevent layout shifts.
 */
export const StaticOrderDetailShell: React.FC<StaticOrderDetailShellProps> = ({
    showShimmer = false
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (showShimmer) {
            opacity.value = withRepeat(
                withTiming(0.4, { duration: 800 }),
                -1,
                true
            );
        } else {
            opacity.value = 1;
        }
    }, [showShimmer]);

    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* Mock Header with Safe Area Padding */}
            <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
                <IconSymbol name="chevron-left" size={24} color={theme.colors.typography} />
                <View style={styles.titlePlaceholder} />
            </View>

            <View style={styles.content}>
                {/* Status Section Shell */}
                <View style={styles.section}>
                    <Animated.View style={[styles.box, { height: 80 }, shimmerStyle]} />
                </View>

                {/* Shipping Info Shell */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Animated.View style={[styles.iconPlaceholder, shimmerStyle]} />
                        <View style={styles.textStack}>
                            <Animated.View style={[styles.line, { width: '40%' }, shimmerStyle]} />
                            <Animated.View style={[styles.line, { width: '80%' }, shimmerStyle]} />
                        </View>
                    </View>
                </View>

                {/* Product List Shell */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Animated.View style={[styles.imagePlaceholder, shimmerStyle]} />
                        <View style={styles.textStack}>
                            <Animated.View style={[styles.line, { width: '60%' }, shimmerStyle]} />
                            <Animated.View style={[styles.line, { width: '30%' }, shimmerStyle]} />
                        </View>
                    </View>
                </View>

                {/* Summary Shell */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Animated.View style={[styles.line, { width: '30%' }, shimmerStyle]} />
                        <Animated.View style={[styles.line, { width: '20%' }, shimmerStyle]} />
                    </View>
                    <View style={styles.footerRow}>
                        <Animated.View style={[styles.line, { width: '30%' }, shimmerStyle]} />
                        <Animated.View style={[styles.line, { width: '25%' }, shimmerStyle]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.md,
    },
    titlePlaceholder: {
        width: 120,
        height: 18,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
    },
    content: {
        flex: 1,
        padding: theme.margins.md,
    },
    section: {
        marginBottom: theme.margins.lg,
    },
    box: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    row: {
        flexDirection: 'row',
        gap: theme.margins.md,
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.border,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.border,
    },
    textStack: {
        flex: 1,
        gap: 8,
    },
    line: {
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 12,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
}));
