import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface OnlineStatusBadgeProps {
    isOnline: boolean;
    size?: 'small' | 'medium';
    showPulse?: boolean;
}

/**
 * Green dot badge to indicate online status
 * Positioned at bottom-right of parent (avatar)
 */
export const OnlineStatusBadge: React.FC<OnlineStatusBadgeProps> = ({
    isOnline,
    size = 'medium',
    showPulse = true,
}) => {
    const styles = stylesheet;
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isOnline && showPulse) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                false
            );
        }
    }, [isOnline, showPulse, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (!isOnline) return null;

    return (
        <Animated.View
            style={[
                styles.badge,
                size === 'small' ? styles.badgeSmall : styles.badgeMedium,
                animatedStyle,
            ]}
        />
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.success,
        borderWidth: 2,
        borderColor: theme.colors.surface,
        borderRadius: theme.radius.full,
    },
    badgeSmall: {
        width: 10,
        height: 10,
    },
    badgeMedium: {
        width: 14,
        height: 14,
    },
}));
