import React, { useEffect, useState } from 'react';
import { StyleSheet as RNStyleSheet, Text } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutUp,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { cleanAndFlattenStyles } from '@/utils/style';

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

export const RollingSearchPlaceholder: React.FC<RollingSearchPlaceholderProps> = ({
    keywords,
    fallbackText,
    interval = 3500,
    animate = true,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Only cycle if we have multiple keywords and animation is enabled
    const shouldAnimate = animate && keywords.length > 1;

    // If keywords array changes, reset index to 0
    useEffect(() => {
        setCurrentIndex(0);
    }, [keywords]);

    useEffect(() => {
        if (!shouldAnimate) {
            return;
        }

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % keywords.length);
        }, interval);

        return () => clearInterval(timer);
    }, [shouldAnimate, keywords.length, interval]);

    const displayText = keywords.length > 0 ? keywords[currentIndex % keywords.length] : fallbackText;

    // If no animation needed, render simple text
    if (!shouldAnimate) {
        return (
            <Text
                style={cleanAndFlattenStyles(styles.text)}
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
            style={cleanAndFlattenStyles(styles.text)}
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
