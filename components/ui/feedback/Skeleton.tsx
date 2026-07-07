import React, { useEffect } from 'react';
import { type StyleProp, ViewStyle } from 'react-native';
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SkeletonBoxProps {
    width: number | `${number}%`;
    height: number | undefined;
    borderRadius?: number;
    style?: ViewStyle;
    animatedStyle?: any;
}

interface SkeletonCircleProps {
    size: number;
    style?: ViewStyle;
    animatedStyle?: any;
}

interface SkeletonTextProps {
    width?: number | `${number}%`;
    height?: number;
    style?: ViewStyle;
    animatedStyle?: any;
}

const SHIMMER_DURATION = 1000;
const OPACITY_MIN = 0.4;
const OPACITY_MAX = 1.0;

/**
 * Custom hook for shimmer animation
 * Returns an animated style with opacity pulsing effect.
 */
export const useShimmerAnimation = (enabled: boolean = true) => {
    const opacity = useSharedValue(OPACITY_MIN);

    useEffect(() => {
        if (!enabled) {
            opacity.value = OPACITY_MIN;
            return;
        }
        opacity.value = withRepeat(
            withTiming(OPACITY_MAX, { duration: SHIMMER_DURATION }),
            -1, // infinite
            true // reverse
        );
        return () => {
            cancelAnimation(opacity);
        };
    }, [opacity, enabled]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return animatedStyle;
};

/**
 * SkeletonBox - Base rectangular skeleton placeholder
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
    width,
    height,
    borderRadius,
    style,
    animatedStyle,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const internalShimmer = useShimmerAnimation(!animatedStyle);
    const finalAnimatedStyle = animatedStyle ?? internalShimmer;

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width,
                    height,
                    borderRadius: borderRadius ?? theme.radius.s,
                },
                finalAnimatedStyle,
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
    animatedStyle,
}) => {
    const styles = stylesheet;
    const internalShimmer = useShimmerAnimation(!animatedStyle);
    const finalAnimatedStyle = animatedStyle ?? internalShimmer;

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                finalAnimatedStyle,
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
    animatedStyle,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const internalShimmer = useShimmerAnimation(!animatedStyle);
    const finalAnimatedStyle = animatedStyle ?? internalShimmer;

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width,
                    height,
                    borderRadius: theme.radius.s,
                },
                finalAnimatedStyle,
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
