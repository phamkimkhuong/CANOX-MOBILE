/**
 * ChatBubble - Wrapper component for message bubbles
 * Handles styling: background color, border radius based on position
 */

import { BubblePosition } from '@/utils/adapter/chat/messageAdapter';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ChatBubbleProps {
    isMe: boolean;
    position: BubblePosition;
    children: React.ReactNode;
    maxWidth?: number | string;
    type?: string;
}

/**
 * ChatBubble - Styled wrapper for message content
 */
export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({
    isMe,
    position,
    children,
    maxWidth = '100%',
    type,
}) => {
    const styles = stylesheet;

    const isCard = type === 'PRODUCT_CARD' || type === 'ORDER_CARD';

    // Memoize border radius calculation
    const borderRadius = React.useMemo((): ViewStyle => {
        const radius = isCard ? 12 : 14;
        const smallRadius = 6;

        if (position === 'single') {
            return {
                borderRadius: radius,
            };
        }

        if (isMe) {
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
    }, [isMe, position, isCard]);

    return (
        <View
            style={[
                styles.bubble,
                isMe ? styles.bubbleMe : styles.bubbleOther,
                isCard && styles.cardBubble,
                borderRadius,
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                { maxWidth: maxWidth as any },
            ]}
        >
            {children}
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    bubbleMe: {
        backgroundColor: '#6a95b4ff',
        borderColor: 'rgba(0, 136, 204, 0.12)',
    },
    bubbleOther: {
        backgroundColor: theme.colors.surface,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    cardBubble: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: theme.colors.surface,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
}));

export default ChatBubble;
