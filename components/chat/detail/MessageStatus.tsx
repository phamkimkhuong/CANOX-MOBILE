/**
 * MessageStatus - Shows message status icon and time
 */

import { IconSymbol } from '@/components/ui/Icon';
import { MESSAGE_STATUS_CONFIG, MessageStatus as Status } from '@/types/chat/message';
import { formatMessageTime } from '@/utils/adapter/chat/messageAdapter';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface MessageStatusProps {
    status: Status;
    sentAt: string;
    isMe: boolean;
    showStatus?: boolean;
}

/**
 * MessageStatus - Displays time and delivery status
 * 
 * For my messages: Shows time + status icon
 * For other's messages: Shows time only
 */
export const MessageStatusComponent: React.FC<MessageStatusProps> = ({
    status,
    sentAt,
    isMe,
    showStatus = true,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const config = MESSAGE_STATUS_CONFIG[status];
    const time = formatMessageTime(sentAt);

    const getStatusColor = () => {
        switch (config.color) {
            case 'primary':
                return theme.colors.primary;
            case 'error':
                return theme.colors.error;
            case 'success':
                return theme.colors.success;
            case 'secondary':
            default:
                return isMe ? 'rgba(255,255,255,0.7)' : theme.colors.secondary;
        }
    };

    return (
        <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
            <Text style={[styles.time, isMe && styles.timeMe]}>{time}</Text>
            {isMe && showStatus && (
                <IconSymbol
                    name={config.icon as 'check' | 'done-all' | 'schedule' | 'error-outline'}
                    size={14}
                    color={getStatusColor()}
                />
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    containerMe: {
        justifyContent: 'flex-end',
    },
    containerOther: {
        justifyContent: 'flex-start',
        marginLeft: 4,
    },
    time: {
        fontSize: 11,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    timeMe: {
        color: 'rgba(255,255,255,0.7)',
    },
}));

export default MessageStatusComponent;
