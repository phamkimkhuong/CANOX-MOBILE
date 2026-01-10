import { SkeletonCircle, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ChatSkeletonProps {
    count?: number;
}

/**
 * Single chat conversation item skeleton
 * Mirrors the layout of ConversationItem component
 */
const SkeletonItem: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.item}>
            {/* Avatar skeleton */}
            <SkeletonCircle size={48} />

            {/* Text content skeleton */}
            <View style={styles.textContainer}>
                {/* Name row: name + time */}
                <View style={styles.nameRow}>
                    <SkeletonText width="50%" height={16} />
                    <SkeletonText width={50} height={12} />
                </View>

                {/* Message preview */}
                <SkeletonText width="80%" height={14} />
            </View>
        </View>
    );
};

/**
 * ChatSkeleton - Loading placeholder for chat conversation list
 * 
 * @example
 * if (isLoading) return <ChatSkeleton count={6} />;
 */
export const ChatSkeleton: React.FC<ChatSkeletonProps> = ({ count = 6 }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={`chat-skeleton-${index}`} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
    },
    textContainer: {
        flex: 1,
        gap: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));
