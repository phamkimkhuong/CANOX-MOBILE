import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

export const Shimmer = ({ width, height, style }: { width: any, height: any, style?: any }) => {
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
        <View style={[{ width, height, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

export const VideoSkeleton = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.bottomSkeleton}>
                <Shimmer width={120} height={18} style={{ marginBottom: 8, borderRadius: 4 }} />

                <Shimmer width={240} height={14} style={{ marginBottom: 6, borderRadius: 4 }} />
                <Shimmer width={180} height={14} style={{ marginBottom: 16, borderRadius: 4 }} />

                <Shimmer width={220} height={56} style={{ borderRadius: 8 }} />
            </View>


            <View style={styles.rightSkeleton}>

                <Shimmer width={48} height={48} style={{ borderRadius: 24, marginBottom: 20 }} />


                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Shimmer width={40} height={40} style={{ borderRadius: 20, marginBottom: 4 }} />
                        {i < 4 && <Shimmer width={24} height={10} style={{ borderRadius: 4 }} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomSkeleton: {
        position: 'absolute',
        bottom: 40,
        left: 16,
        right: 80,
    },
    rightSkeleton: {
        position: 'absolute',
        bottom: 100,
        right: 12,
        alignItems: 'center',
    }
});
