import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SkeletonBoxProps {
    width: number | `${number}%`;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
}

interface SkeletonCircleProps {
    size: number;
    style?: ViewStyle;
}

interface SkeletonTextProps {
    width?: number | `${number}%`;
    height?: number;
    style?: ViewStyle;
}

const SHIMMER_DURATION = 800;

/**
 * Custom hook for shimmer animation
 * Returns an animated style with opacity pulsing effect
 */
const useShimmerAnimation = () => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: SHIMMER_DURATION }),
            -1, // infinite
            true // reverse
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return animatedStyle;
};

/**
 * SkeletonBox - Base rectangular skeleton placeholder
 * 
 * @example
 * <SkeletonBox width={100} height={20} />
 * <SkeletonBox width="80%" height={16} borderRadius={8} />
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
    width,
    height,
    borderRadius,
    style,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation();

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width,
                    height,
                    borderRadius: borderRadius ?? theme.radius.s,
                },
                shimmerStyle,
                style,
            ]}
            accessibilityLabel="Đang tải nội dung"
            accessibilityRole="progressbar"
        />
    );
};

/**
 * SkeletonCircle - Circular skeleton placeholder (for avatars, icons)
 * 
 * @example
 * <SkeletonCircle size={48} />
 */
export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
    size,
    style,
}) => {
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation();

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                shimmerStyle,
                style,
            ]}
            accessibilityLabel="Đang tải nội dung"
            accessibilityRole="progressbar"
        />
    );
};

/**
 * SkeletonText - Text line skeleton placeholder
 * 
 * @example
 * <SkeletonText width="70%" />
 * <SkeletonText width={100} height={12} />
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
    width = '100%',
    height = 14,
    style,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation();

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width,
                    height,
                    borderRadius: theme.radius.s,
                },
                shimmerStyle,
                style,
            ]}
            accessibilityLabel="Đang tải nội dung"
            accessibilityRole="progressbar"
        />
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    box: {
        backgroundColor: theme.colors.secondaryLight,
    },
}));
