/**
 * ==============================================
 * QUICK TAG CHIP - Single Suggestion Chip
 * ==============================================
 */

import type { QuickTagCategory } from '@/utils/adapter/review/reviewTags';
import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface QuickTagChipProps {
    /** Tag label */
    label: string;
    /** Tag category (positive/negative/neutral) */
    category: QuickTagCategory;
    /** Whether chip is selected */
    selected: boolean;
    /** Callback when pressed */
    onPress: () => void;
}

/**
 * QuickTagChip - Single suggestion chip
 */
export const QuickTagChip: React.FC<QuickTagChipProps> = ({
    label,
    category,
    selected,
    onPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Get colors based on category and selection state
    const getColors = () => {
        if (!selected) {
            return {
                bg: theme.colors.surface,
                border: theme.colors.border,
                text: theme.colors.typography,
            };
        }

        switch (category) {
            case 'positive':
                return {
                    bg: theme.colors.successSoft,
                    border: theme.colors.success,
                    text: theme.colors.success,
                };
            case 'negative':
                return {
                    bg: theme.colors.errorSoft,
                    border: theme.colors.error,
                    text: theme.colors.error,
                };
            case 'neutral':
            default:
                return {
                    bg: theme.colors.warningSoft,
                    border: theme.colors.warning,
                    text: theme.colors.warning,
                };
        }
    };

    const colors = getColors();

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    styles.chip,
                    {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                    },
                    animatedStyle,
                ]}
            >
                <Text style={[styles.label, { color: colors.text }]}>
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    chip: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.full,
        borderWidth: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
    },
}));

export default QuickTagChip;
