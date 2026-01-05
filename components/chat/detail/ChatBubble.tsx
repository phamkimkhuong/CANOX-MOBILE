/**
 * ChatBubble - Wrapper component for message bubbles
 * Handles styling: background color, border radius based on position
 */

import { BubblePosition } from '@/utils/adapter/chat/messageAdapter';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ChatBubbleProps {
    isMe: boolean;
    position: BubblePosition;
    children: React.ReactNode;
    maxWidth?: number | string;
}

/**
 * ChatBubble - Styled wrapper for message content
 * 
 * Position affects border radius:
 * - single: All corners rounded
 * - first: Top corners rounded, bottom corner flat on same side
 * - middle: Flat corners on same side
 * - last: Bottom corners rounded, top corner flat on same side
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
    isMe,
    position,
    children,
    maxWidth = '100%',
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const getBorderRadius = (): ViewStyle => {
        const radius = 10;
        const smallRadius = 4;

        if (position === 'single') {
            return {
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
                borderBottomLeftRadius: radius,
                borderBottomRightRadius: radius,
            };
        }

        if (isMe) {
            // My messages: flat corner on right side
            switch (position) {
                case 'first':
                    return {
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: smallRadius,
                    };
                case 'middle':
                    return {
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: smallRadius,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: smallRadius,
                    };
                case 'last':
                    return {
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: smallRadius,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: radius,
                    };
            }
        } else {
            // Other's messages: flat corner on left side
            switch (position) {
                case 'first':
                    return {
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        borderBottomLeftRadius: smallRadius,
                        borderBottomRightRadius: radius,
                    };
                case 'middle':
                    return {
                        borderTopLeftRadius: smallRadius,
                        borderTopRightRadius: radius,
                        borderBottomLeftRadius: smallRadius,
                        borderBottomRightRadius: radius,
                    };
                case 'last':
                    return {
                        borderTopLeftRadius: smallRadius,
                        borderTopRightRadius: radius,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: radius,
                    };
            }
        }

    };

    return (
        <View
            style={[
                styles.bubble,
                isMe ? styles.bubbleMe : styles.bubbleOther,
                getBorderRadius(),
                { maxWidth: maxWidth as any },
            ]}
        >
            {children}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    bubbleMe: {
        backgroundColor: theme.colors.primary,
    },
    bubbleOther: {
        backgroundColor: theme.colors.surface,
    },
}));

export default ChatBubble;
