/**
 * ==============================================
 * ROLLING SEARCH PLACEHOLDER
 * ==============================================
 * Animated placeholder that cycles through hot keywords
 * with smooth vertical slide transitions.
 * 
 * Used in HomeHeader to display trending search terms.
 */

import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutUp,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RollingSearchPlaceholderProps {
    /** Array of keywords to cycle through */
    keywords: string[];
    /** Fallback text when no keywords available */
    fallbackText: string;
    /** Interval between keyword changes in ms (default: 3500) */
    interval?: number;
    /** Whether to animate (disable during loading) */
    animate?: boolean;
}

/**
 * RollingSearchPlaceholder
 * Displays animated cycling placeholder text for search input
 */
export const RollingSearchPlaceholder: React.FC<RollingSearchPlaceholderProps> = ({
    keywords,
    fallbackText,
    interval = 3500,
    animate = true,
}) => {
    const { theme } = useUnistyles();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Only cycle if we have multiple keywords and animation is enabled
    const shouldAnimate = animate && keywords.length > 1;

    useEffect(() => {
        if (!shouldAnimate) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % keywords.length);
        }, interval);

        return () => clearInterval(timer);
    }, [shouldAnimate, keywords.length, interval]);

    // Get current display text
    const displayText = keywords.length > 0
        ? keywords[currentIndex % keywords.length]
        : fallbackText;

    // If no animation needed, render simple text
    if (!shouldAnimate) {
        return (
            <Text
                style={styles.text}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {displayText}
            </Text>
        );
    }

    // Animated version with entering/exiting transitions
    return (
        <Animated.Text
            key={`keyword-${currentIndex}`}
            style={styles.text}
            entering={FadeInUp.duration(300)}
            exiting={FadeOutUp.duration(300)}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {displayText}
        </Animated.Text>
    );
};

const styles = StyleSheet.create((theme) => ({
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.accent,
        paddingHorizontal: 8,
        textAlignVertical: 'center',
    },
}));

export default RollingSearchPlaceholder;
