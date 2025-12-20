import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ChatSkeletonProps {
    count?: number;
}

const SkeletonItem: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1, // infinite
            true // reverse
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.item}>
            <Animated.View style={[styles.avatarSkeleton, animatedStyle]} />
            <View style={styles.textContainer}>
                <View style={styles.nameRow}>
                    <Animated.View style={[styles.nameSkeleton, animatedStyle]} />
                    <Animated.View style={[styles.timeSkeleton, animatedStyle]} />
                </View>
                <Animated.View style={[styles.messageSkeleton, animatedStyle]} />
            </View>
        </View>
    );
};

export const ChatSkeleton: React.FC<ChatSkeletonProps> = ({ count = 6 }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
    },
    avatarSkeleton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.secondaryLight,
    },
    textContainer: {
        flex: 1,
        gap: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameSkeleton: {
        width: '50%',
        height: 16,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    timeSkeleton: {
        width: 50,
        height: 12,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    messageSkeleton: {
        width: '80%',
        height: 14,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
}));
