/**
 * SwipeableRow - Atomic wrapper for swipe-to-delete functionality
 * 
 * Uses react-native-reanimated for 60fps swipe animations
 * Reveals action buttons when swiped left
 * 
 * @example
 * <SwipeableRow 
 *   onDelete={() => removeItem(id)}
 *   onFindSimilar={() => findSimilar(id)}
 * >
 *   <CartItem {...props} />
 * </SwipeableRow>
 */

import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from './Icon';

// ============================================
// TYPES
// ============================================

interface SwipeableRowProps {
    children: React.ReactNode;
    /** Callback when delete button is pressed */
    onDelete?: () => void;
    /** Callback when "Find Similar" button is pressed */
    onFindSimilar?: () => void;
    /** Disable swipe functionality */
    disabled?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const ACTION_WIDTH = 72; // Width of each action button
const SWIPE_THRESHOLD = ACTION_WIDTH * 0.5;
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 200,
};

// ============================================
// COMPONENT
// ============================================

export const SwipeableRow: React.FC<SwipeableRowProps> = memo(({
    children,
    onDelete,
    onFindSimilar,
    disabled = false,
}) => {
    const { theme } = useUnistyles();

    // Number of action buttons
    const actionCount = [onDelete, onFindSimilar].filter(Boolean).length;
    const maxTranslate = ACTION_WIDTH * actionCount;

    // Animation values
    const translateX = useSharedValue(0);
    const isOpen = useSharedValue(false);

    /**
     * Close the swipe row
     */
    const closeRow = useCallback(() => {
        translateX.value = withSpring(0, SPRING_CONFIG);
        isOpen.value = false;
    }, [translateX, isOpen]);

    /**
     * Pan gesture handler
     */
    const panGesture = Gesture.Pan()
        .enabled(!disabled)
        .activeOffsetX([-10, 10])
        .failOffsetY([-10, 10])
        .onUpdate((event) => {
            const newValue = isOpen.value
                ? -maxTranslate + event.translationX
                : event.translationX;

            // Clamp between -maxTranslate and 0
            translateX.value = Math.max(-maxTranslate, Math.min(0, newValue));
        })
        .onEnd((event) => {
            const shouldOpen = event.translationX < -SWIPE_THRESHOLD;
            const shouldClose = event.translationX > SWIPE_THRESHOLD;

            if (isOpen.value) {
                // Currently open
                if (shouldClose) {
                    translateX.value = withSpring(0, SPRING_CONFIG);
                    isOpen.value = false;
                } else {
                    translateX.value = withSpring(-maxTranslate, SPRING_CONFIG);
                }
            } else {
                // Currently closed
                if (shouldOpen) {
                    translateX.value = withSpring(-maxTranslate, SPRING_CONFIG);
                    isOpen.value = true;
                } else {
                    translateX.value = withSpring(0, SPRING_CONFIG);
                }
            }
        });

    /**
     * Handle delete press
     */
    const handleDelete = useCallback(() => {
        translateX.value = withTiming(-300, { duration: 200 }, () => {
            if (onDelete) {
                runOnJS(onDelete)();
            }
        });
    }, [onDelete, translateX]);

    /**
     * Handle find similar press
     */
    const handleFindSimilar = useCallback(() => {
        closeRow();
        onFindSimilar?.();
    }, [closeRow, onFindSimilar]);

    // Animated styles
    const contentAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const actionsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value + maxTranslate }],
    }));

    // If no actions, just render children
    if (actionCount === 0) {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            {/* Action Buttons (Behind) */}
            <Animated.View
                style={[
                    styles.actionsContainer,
                    actionsAnimatedStyle,
                    { width: maxTranslate },
                ]}
            >
                {onFindSimilar && (
                    <Pressable
                        onPress={handleFindSimilar}
                        style={[
                            styles.actionButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        accessibilityLabel="Tìm sản phẩm tương tự"
                        accessibilityRole="button"
                    >
                        <IconSymbol name="search" size={20} color={theme.colors.onPrimary} />
                        <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
                            Tìm SP tương tự
                        </Text>
                    </Pressable>
                )}

                {onDelete && (
                    <Pressable
                        onPress={handleDelete}
                        style={[
                            styles.actionButton,
                            { backgroundColor: theme.colors.error },
                        ]}
                        accessibilityLabel="Xóa sản phẩm"
                        accessibilityRole="button"
                    >
                        <IconSymbol name="delete" size={20} color={theme.colors.onPrimary} />
                        <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
                            Xóa
                        </Text>
                    </Pressable>
                )}
            </Animated.View>

            {/* Main Content (Front) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.content, contentAnimatedStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
});

SwipeableRow.displayName = 'SwipeableRow';

const styles = StyleSheet.create((theme) => ({
    container: {
        overflow: 'hidden',
    },
    content: {
        backgroundColor: theme.colors.surface,
    },
    actionsContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
    },
    actionButton: {
        width: ACTION_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
}));
