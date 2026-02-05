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
        const radius = isCard ? 12 : 12;
        const smallRadius = 4;

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
        return {};
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
    },
    bubbleMe: {
        backgroundColor: theme.colors.primary,
    },
    bubbleOther: {
        backgroundColor: theme.colors.surface,
    },
    cardBubble: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.secondaryLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
}));

export default ChatBubble;
