/**
 * ChatDetailSkeleton - Loading placeholder for chat details
 * Mirrors the bubble layout of MessageItem
 */

import { SkeletonBox, SkeletonCircle } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ChatDetailSkeletonProps {
    count?: number;
}

/**
 * Single bubble skeleton item
 */
const SkeletonBubble: React.FC<{ isMe: boolean }> = ({ isMe }) => {
    const styles = stylesheet;

    return (
        <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperMe]}>
            {!isMe && <SkeletonCircle size={32} style={styles.avatar} />}
            <View style={styles.content}>
                <SkeletonBox
                    width={isMe ? 180 : 200}
                    height={44}
                    borderRadius={16}
                    style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther
                    ] as any}
                />
            </View>
        </View>
    );
};

export const ChatDetailSkeleton: React.FC<ChatDetailSkeletonProps> = ({ count = 6 }) => {
    const styles = stylesheet;

    // Create alternating bubbles (other, me, other, other, me...)
    const bubbles = [false, true, false, false, true, false];

    return (
        <View style={styles.container}>
            {bubbles.slice(0, count).map((isMe, index) => (
                <SkeletonBubble key={`detail-skeleton-${index}`} isMe={isMe} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        gap: 16,
    },
    bubbleWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: '85%',
    },
    bubbleWrapperMe: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    avatar: {
        marginTop: 0,
    },
    content: {
        gap: 4,
    },
    bubble: {
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
    },
    bubbleMe: {
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        borderBottomLeftRadius: 4,
    },
}));

export default ChatDetailSkeleton;
