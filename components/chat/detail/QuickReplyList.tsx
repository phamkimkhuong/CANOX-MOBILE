/**
 * QuickReplyList - Horizontal scrollable quick reply chips
 * Shows suggestion chips above the input area
 */

import { IconSymbol } from '@/components/ui/Icon';
import { QuickReply } from '@/types/chat/contextBar';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface QuickReplyListProps {
    replies: QuickReply[];
    onReplyPress: (reply: QuickReply) => void;
}

/**
 * QuickReplyList - AI-assisted quick reply suggestions
 * 
 * Features:
 * - Horizontal scroll
 * - Primary chip highlighted
 * - One-tap to send
 */
export const QuickReplyList: React.FC<QuickReplyListProps> = ({
    replies,
    onReplyPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (replies.length === 0) return null;

    return (
        <View style={styles.container}>

            {/* Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {replies.map((reply) => (
                    <TouchableOpacity
                        key={reply.id}
                        style={[
                            styles.chip,
                            reply.isPrimary && styles.chipPrimary,
                        ]}
                        onPress={() => onReplyPress(reply)}
                        activeOpacity={0.7}
                    >
                        {reply.icon && (
                            <IconSymbol
                                name={reply.icon as 'help'}
                                size={14}
                                color={reply.isPrimary ? theme.colors.primary : theme.colors.secondary}
                            />
                        )}
                        <Text
                            style={[
                                styles.chipText,
                                reply.isPrimary && styles.chipTextPrimary,
                            ]}
                        >
                            {reply.text}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingLeft: theme.margins.md,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingRight: theme.margins.md,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
    },
    chipPrimary: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySubtle,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    chipTextPrimary: {
        color: theme.colors.primary,
    },
}));

export default QuickReplyList;
