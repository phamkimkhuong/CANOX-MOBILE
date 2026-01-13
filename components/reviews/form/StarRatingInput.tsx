/**
 * ==============================================
 * STAR RATING INPUT - 5 Sao Input
 * ==============================================
 * Interactive star rating with animation
 */

import { IconSymbol } from '@/components/ui/Icon';
import { getReviewRatingLabel } from '@/utils/adapter/review/reviewAdapter';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface StarRatingInputProps {
    /** Current rating value (1-5) */
    value: number;
    /** Callback when rating changes */
    onChange: (rating: number) => void;
    /** Star size */
    size?: number;
    /** Read only mode */
    readonly?: boolean;
    /** Show rating label text */
    showLabel?: boolean;
    /** Error state */
    hasError?: boolean;
}

const STAR_COUNT = 5;

/**
 * AnimatedStar - Single star with scale animation
 */
const AnimatedStar: React.FC<{
    index: number;
    filled: boolean;
    size: number;
    onPress: () => void;
    readonly: boolean;
}> = ({ index, filled, size, onPress, readonly }) => {
    const { theme } = useUnistyles();
    const scale = useSharedValue(1);

    const handlePress = useCallback(() => {
        if (readonly) return;

        // Bounce animation
        scale.value = withSequence(
            withSpring(1.3, { damping: 5 }),
            withSpring(1, { damping: 8 })
        );
        onPress();
    }, [readonly, onPress, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable
            onPress={handlePress}
            disabled={readonly}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
            <Animated.View style={animatedStyle}>
                <IconSymbol
                    name={filled ? 'star-fill' : 'star-outline'}
                    size={size}
                    color={filled ? theme.colors.warning : theme.colors.secondary}
                />
            </Animated.View>
        </Pressable>
    );
};

/**
 * StarRatingInput - 5 star rating input
 */
export const StarRatingInput: React.FC<StarRatingInputProps> = ({
    value,
    onChange,
    size = 36,
    readonly = false,
    showLabel = true,
    hasError = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handleStarPress = useCallback(
        (index: number) => {
            onChange(index + 1);
        },
        [onChange]
    );

    const ratingLabel = getReviewRatingLabel(value);

    return (
        <View style={styles.container}>
            {/* Stars Row */}
            <View style={styles.starsContainer}>
                {Array.from({ length: STAR_COUNT }).map((_, index) => (
                    <AnimatedStar
                        key={index}
                        index={index}
                        filled={index < value}
                        size={size}
                        onPress={() => handleStarPress(index)}
                        readonly={readonly}
                    />
                ))}
            </View>

            {/* Rating Label */}
            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        value > 0 && styles.labelActive,
                        hasError && styles.labelError,
                    ]}
                >
                    {value > 0 ? ratingLabel : 'Chạm để đánh giá'}
                </Text>
            )}

            {/* Error Message */}
            {hasError && value === 0 && (
                <Text style={styles.errorText}>Vui lòng chọn số sao</Text>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    labelActive: {
        color: theme.colors.warning,
        fontWeight: '600',
    },
    labelError: {
        color: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: theme.margins.sm / 2,
    },
}));

export default StarRatingInput;
