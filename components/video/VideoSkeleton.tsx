import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface ShimmerProps {
    width: number;
    height: number;
    style?: StyleProp<ViewStyle>;
}

export const Shimmer = ({ width, height, style }: ShimmerProps) => {
    const translateX = useSharedValue(-1);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, [translateX]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: interpolate(
                        translateX.value,
                        [-1, 1],
                        [-width, width]
                    ),
                },
            ],
        };
    });

    return (
        <View style={[styles.shimmerContainer(width, height), style]}>
            <Animated.View style={[styles.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

export const VideoSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.bottomSkeleton}>
                <Shimmer width={260} height={70} style={styles.promoShimmer} />
                <Shimmer width={120} height={18} style={styles.textShimmerSm} />
                <Shimmer width={240} height={14} style={styles.textShimmerXs} />
                <Shimmer width={180} height={14} style={styles.textShimmerGap} />
            </View>


            <View style={styles.rightSkeleton}>
                <Shimmer width={48} height={48} style={styles.avatarShimmer} />

                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.actionItem}>
                        <Shimmer width={40} height={40} style={styles.actionIcon} />
                        {i < 4 && <Shimmer width={24} height={10} style={styles.actionLabel} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create((_theme) => ({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomSkeleton: {
        position: 'absolute',
        bottom: 25,
        left: 12,
        right: 80,
    },
    rightSkeleton: {
        position: 'absolute',
        bottom: 40,
        right: 12,
        alignItems: 'center',
    },
    shimmerContainer: (width: number, height: number) => ({
        width,
        height,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    }),
    promoShimmer: {
        borderRadius: 12,
        marginBottom: 16,
    },
    textShimmerSm: {
        marginBottom: 8,
        borderRadius: 4,
    },
    textShimmerXs: {
        marginBottom: 6,
        borderRadius: 4,
    },
    textShimmerGap: {
        marginBottom: 16,
        borderRadius: 4,
    },
    avatarShimmer: {
        borderRadius: 24,
        marginBottom: 20,
    },
    actionItem: {
        alignItems: 'center',
        marginBottom: 20,
    },
    actionIcon: {
        borderRadius: 20,
        marginBottom: 4,
    },
    actionLabel: {
        borderRadius: 4,
    },
}));

