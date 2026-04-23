import { IconSymbol } from '@/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface InternationalBadgeProps {
    /** Label text */
    label: string;
    /** Size variant: 'sm' for FeaturedSection cards, 'md' for ProductCard */
    size?: 'sm' | 'md';
    /** Shared shimmer sweep style from parent */
    shimmerStyle?: object;
}

/**
 * International Shipping Badge
 * 
 * Premium gradient pill with shimmer sweep animation.
 * 
 * Usage:
 * <InternationalBadge label={t('badges.international')} />
 */
export const InternationalBadge = React.memo(({ label, size = 'md', shimmerStyle }: InternationalBadgeProps) => {
    const localShimmerX = useSharedValue(-50);

    useEffect(() => {
        if (shimmerStyle) return;
        localShimmerX.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: 0 }),
                withDelay(4000, withTiming(120, { duration: 600 })),
            ),
            -1,
            false,
        );
    }, [localShimmerX, shimmerStyle]);

    const localStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: `${localShimmerX.value}%` as unknown as number }],
    }));

    const effectiveShimmerStyle = shimmerStyle ?? localStyle;

    const isSmall = size === 'sm';

    return (
        <LinearGradient
            colors={['#0ea5e9', '#06b6d4', '#14b8a6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.badge, isSmall ? styles.badgeSm : styles.badgeMd]}
        >
            {/* Shimmer sweep overlay */}
            <View style={styles.shimmerMask}>
                <Animated.View style={[styles.shimmerStrip, effectiveShimmerStyle]}>
                    <LinearGradient
                        colors={[
                            'transparent',
                            'rgba(255,255,255,0.45)',
                            'transparent',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            </View>

            {/* Content */}
            <IconSymbol
                name="globe"
                size={isSmall ? 9 : 10}
                color="#FFF"
            />
            <Text style={[styles.text, isSmall ? styles.textSm : styles.textMd]}>
                {label}
            </Text>
        </LinearGradient>
    );
});

InternationalBadge.displayName = 'InternationalBadge';

const styles = StyleSheet.create((_theme) => ({
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden', // clip the shimmer
        position: 'relative',
    },
    badgeSm: {
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 3,
    },
    badgeMd: {
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 4,
        // Subtle shadow for floating effect
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 2,
    },
    shimmerMask: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: 8,
    },
    shimmerStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '35%',
    },
    shimmerGradient: {
        flex: 1,
    },
    text: {
        fontWeight: '700',
        color: '#FFF',
    },
    textSm: {
        fontSize: 8.5,
        letterSpacing: 0.3,
    },
    textMd: {
        fontSize: 9.5,
        letterSpacing: 0.4,
    },
}));
