import React from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/**
 * BankListSkeleton - Loading state for bank accounts
 */
export const BankListSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {[1, 2].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </View>
    );
};

const SkeletonCard = () => {
    const opacity = useSharedValue(0.3);
    const styles = stylesheet;

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.skeletonCard, animatedStyle]}>
            <View style={styles.skeletonHeader}>
                <View style={styles.skeletonLogo} />
                <View style={styles.skeletonTitle} />
            </View>
            <View style={styles.skeletonNumber} />
            <View style={styles.skeletonFooter}>
                <View style={styles.skeletonHolder} />
            </View>
        </Animated.View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '100%',
    },
    skeletonCard: {
        width: '100%',
        height: 180,
        borderRadius: 24,
        backgroundColor: theme.colors.secondarySoft,
        marginBottom: theme.margins.md,
        padding: 20,
        justifyContent: 'space-between',
    },
    skeletonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    skeletonLogo: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.colors.border,
    },
    skeletonTitle: {
        width: 120,
        height: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
    },
    skeletonNumber: {
        width: '80%',
        height: 24,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
    },
    skeletonFooter: {
        width: 100,
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
    },
    skeletonHolder: {
        width: 140,
        height: 18,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
        marginTop: 8,
    },
}));
