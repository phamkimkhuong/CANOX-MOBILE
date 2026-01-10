/**
 * GlobalLoadingOverlay - Fullscreen blocking loader with Reanimated animations
 * 
 * PURPOSE:
 * Displays a semi-transparent overlay with a spinning indicator to block all user
 * interactions during critical async operations. This prevents double-taps and
 * provides clear visual feedback that the app is processing.
 * 
 * ARCHITECTURE:
 * - Listens to useLoadingStore for visibility state
 * - Uses `pointerEvents` to block/allow touch interactions
 * - Positioned absolutely to cover entire screen including safe areas
 * - Z-index ensures it's above all other content
 * 
 * VISUAL DESIGN:
 * - Semi-transparent dark overlay (rgba black with 0.4 opacity)
 * - Centered white/light container with rounded corners
 * - Custom animated spinner with brand color
 * - Optional loading message below spinner
 */

import { useIsGlobalLoading, useLoadingMessage } from '@/store/useLoadingStore';
import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

/**
 * Animated Spinner Component
 * Uses Reanimated's withRepeat for infinite rotation on native thread
 */
const AnimatedSpinner = memo(() => {
    const { theme } = useUnistyles();

    // Shared value for rotation - lives on native thread
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Start infinite rotation animation
        // - Duration: 1000ms per full rotation (smooth but not too fast)
        // - Easing: Linear for consistent speed
        // - withRepeat(-1) = infinite loops
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1, // Infinite repeat
            false // Don't reverse
        );

        // Cleanup: Cancel animation when component unmounts
        return () => {
            cancelAnimation(rotation);
        };
    }, [rotation]);

    // Animated style runs entirely on UI thread
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    return (
        <Animated.View style={[styles.spinner, animatedStyle]}>
            {/* Spinner visual: Arc/partial circle */}
            <View style={[styles.spinnerArc, { borderTopColor: theme.colors.primary }]} />
        </Animated.View>
    );
});

AnimatedSpinner.displayName = 'AnimatedSpinner';

/**
 * Main Overlay Component
 */
const GlobalLoadingOverlay = memo(() => {
    const isLoading = useIsGlobalLoading();
    const message = useLoadingMessage();
    const { theme } = useUnistyles();

    // Opacity animation: fade-in on show, instant hide on close
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isLoading) {
            // Fade-in when showing (smooth appearance)
            opacity.value = withTiming(1, {
                duration: 150,
                easing: Easing.out(Easing.ease),
            });
        } else {
            opacity.value = 0;
        }
    }, [isLoading, opacity]);

    // Animated style for overlay fade
    const overlayAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    // Don't render anything if not loading (after fade out completes)
    // We keep it mounted but invisible during fade for smooth animation
    // pointerEvents handles interaction blocking

    return (
        <Animated.View
            style={[
                styles.overlay,
                overlayAnimatedStyle,
            ]}
            pointerEvents={isLoading ? 'auto' : 'none'}
        >
            <View style={styles.container}>
                <AnimatedSpinner />
                {message && (
                    <Text style={[styles.message, { color: theme.colors.typography }]}>
                        {message}
                    </Text>
                )}
            </View>
        </Animated.View>
    );
});

GlobalLoadingOverlay.displayName = 'GlobalLoadingOverlay';

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it's above everything
        elevation: 9999, // Android elevation
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        minHeight: 72,
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    spinner: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerArc: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: 'transparent',
        // Only top border is visible - creates arc effect
        borderTopWidth: 3,
    },
    message: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: 200,
    },
});

export default GlobalLoadingOverlay;
