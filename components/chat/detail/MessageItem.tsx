/**
 * MessageItem - Smart message renderer
 * Routes to appropriate component based on message type
 */

import { IconSymbol } from '@/components/ui/Icon';
import { Message } from '@/types/chat/message';
import {
    BubblePosition,
    formatFileSize,
    isMyMessage,
} from '@/utils/adapter/chat/messageAdapter';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import ChatBubble from './ChatBubble';
import MessageStatusComponent from './MessageStatus';

interface MessageItemProps {
    message: Message;
    currentUserId: string;
    position: BubblePosition;
    showAvatar: boolean;
    showTime: boolean;
    onPress?: (message: Message) => void;
    onLongPress?: (message: Message) => void;
    onImagePress?: (url: string) => void;
    onRetry?: (message: Message) => void;
}

/**
 * MessageItem - Renders different message types
 * 
 * Supports:
 * - TEXT: Plain text message
 * - IMAGE: Image with optional caption
 * - FILE: File attachment with download
 * - SYSTEM: System notification (centered)
 * - And more...
 */
export const MessageItem: React.FC<MessageItemProps> = ({
    message,
    currentUserId,
    position,
    showAvatar,
    showTime,
    onPress,
    onLongPress,
    onImagePress,
    onRetry,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const isMe = isMyMessage(message, currentUserId);
    const isFailed = message.status === 'FAILED';

    // System messages render differently
    if (message.type === 'SYSTEM') {
        return <SystemMessage content={message.content} />;
    }

    const renderContent = () => {
        switch (message.type) {
            case 'TEXT':
                return <TextContent content={message.content} isMe={isMe} />;
            case 'IMAGE':
                return (
                    <ImageContent
                        attachments={message.attachments}
                        caption={message.content}
                        isMe={isMe}
                        onPress={onImagePress}
                    />
                );
            case 'FILE':
                return (
                    <FileContent
                        attachments={message.attachments}
                        isMe={isMe}
                    />
                );
            case 'PRODUCT_CARD':
                return <ProductCardContent content={message.content} isMe={isMe} />;
            case 'ORDER_CARD':
                return <OrderCardContent content={message.content} isMe={isMe} />;
            default:
                return <TextContent content={message.content} isMe={isMe} />;
        }
    };

    const handlePress = () => {
        if (isFailed && onRetry) {
            onRetry(message);
        } else {
            onPress?.(message);
        }
    };

    return (
        <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
            {/* Avatar placeholder for alignment */}
            {!isMe && (
                <View style={styles.avatarContainer}>
                    {showAvatar && (
                        <Image
                            source={{ uri: message.sender.shopLogo || message.sender.avatar }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    )}
                </View>
            )}

            {/* Message bubble */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                onLongPress={() => onLongPress?.(message)}
                style={styles.bubbleWrapper}
            >
                <ChatBubble isMe={isMe} position={position}>
                    {renderContent()}
                </ChatBubble>

                {/* Status & Time */}
                {showTime && (
                    <MessageStatusComponent
                        status={message.status}
                        sentAt={message.sentAt}
                        isMe={isMe}
                    />
                )}

                {/* Failed indicator */}
                {isFailed && (
                    <View style={styles.failedContainer}>
                        <IconSymbol name="error-outline" size={14} color={theme.colors.error} />
                        <Text style={styles.failedText}>Nhấn để thử lại</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

// ============================================
// CONTENT COMPONENTS
// ============================================

const TextContent: React.FC<{ content: string; isMe: boolean }> = ({ content, isMe }) => {
    const styles = stylesheet;
    return (
        <Text style={[styles.textContent, isMe && styles.textContentMe]}>
            {content}
        </Text>
    );
};

const ImageContent: React.FC<{
    attachments: Message['attachments'];
    caption?: string;
    isMe: boolean;
    onPress?: (url: string) => void;
}> = ({ attachments, caption, isMe, onPress }) => {
    const styles = stylesheet;
    const image = attachments[0];
    if (!image) return null;

    // Calculate aspect ratio from metadata if available
    const aspectRatio =
        image.dimensions && image.dimensions.height > 0
            ? image.dimensions.width / image.dimensions.height
            : 4 / 3;

    return (
        <View style={styles.imageContainer}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress?.(image.url)}
            >
                <Image
                    source={{ uri: image.thumbnail || image.url }}
                    style={[styles.image, { aspectRatio }]}
                    contentFit="cover"
                />
            </TouchableOpacity>
            {caption && caption.length > 0 && (
                <Text style={[styles.textContent, isMe && styles.textContentMe, styles.caption]}>
                    {caption}
                </Text>
            )}
        </View>
    );
};

const FileContent: React.FC<{
    attachments: Message['attachments'];
    isMe: boolean;
}> = ({ attachments, isMe }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const file = attachments[0];
    if (!file) return null;

    const getFileIcon = () => {
        const mimeType = file.mimeType || '';
        if (mimeType.includes('pdf')) return 'picture-as-pdf';
        if (mimeType.includes('image')) return 'image';
        if (mimeType.includes('video')) return 'video-file';
        return 'attach-file';
    };

    return (
        <View style={styles.fileContainer}>
            <View style={[styles.fileIcon, isMe && styles.fileIconMe]}>
                <IconSymbol
                    name={getFileIcon()}
                    size={24}
                    color={isMe ? theme.colors.surface : theme.colors.error}
                />
            </View>
            <View style={styles.fileInfo}>
                <Text
                    style={[styles.fileName, isMe && styles.fileNameMe]}
                    numberOfLines={1}
                >
                    {file.fileName || 'File'}
                </Text>
                <Text style={[styles.fileSize, isMe && styles.fileSizeMe]}>
                    {file.fileSize ? formatFileSize(file.fileSize) : 'Unknown size'}
                </Text>
            </View>
            <IconSymbol
                name="download"
                size={20}
                color={isMe ? 'rgba(255,255,255,0.7)' : theme.colors.secondary}
            />
        </View>
    );
};

const ProductCardContent: React.FC<{ content: string; isMe: boolean }> = ({
    content,
    isMe,
}) => {
    const styles = stylesheet;
    // TODO: Parse product data from content/metadata
    return (
        <View style={styles.cardContainer}>
            <IconSymbol name="cart" size={20} color="#0088cc" />
            <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                [Sản phẩm] {content}
            </Text>
        </View>
    );
};

const OrderCardContent: React.FC<{ content: string; isMe: boolean }> = ({
    content,
    isMe,
}) => {
    const styles = stylesheet;
    return (
        <View style={styles.cardContainer}>
            <IconSymbol name="shipping" size={20} color="#0088cc" />
            <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                [Đơn hàng] {content}
            </Text>
        </View>
    );
};

const SystemMessage: React.FC<{ content: string }> = ({ content }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.systemContainer}>
            <View style={styles.systemPill}>
                <IconSymbol name="info" size={14} color={theme.colors.info} />
                <Text style={styles.systemText}>{content}</Text>
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const stylesheet = StyleSheet.create((theme, runtime) => ({
    container: {
        flexDirection: 'row',
        // paddingHorizontal: theme.margins.md,
        marginBottom: 2,
    },
    containerMe: {
        justifyContent: 'flex-end',
    },
    containerOther: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.backgroundInput,
    },
    bubbleWrapper: {
        maxWidth: '80%',
    },
    // Text content
    textContent: {
        fontSize: 15,
        lineHeight: 20,
        color: theme.colors.typography,
    },
    textContentMe: {
        color: theme.colors.surface,
    },
    // Image content
    imageContainer: {
        overflow: 'hidden',
        marginHorizontal: -14,
        marginVertical: -10,
    },
    image: {
        width: runtime.screen.width * 0.65,
        maxWidth: 300,
        maxHeight: runtime.screen.height * 0.4,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundInput,
    },
    caption: {
        marginTop: 8,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    // File content
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 200,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileIconMe: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    fileNameMe: {
        color: theme.colors.surface,
    },
    fileSize: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    fileSizeMe: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    // Card content
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // System message
    systemContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    systemPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.infoSoft,
        paddingHorizontal: theme.margins.md,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.infoLight,
    },
    systemText: {
        fontSize: 12,
        color: theme.colors.info,
        fontWeight: '500',
    },
    // Failed state
    failedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        justifyContent: 'flex-end',
    },
    failedText: {
        fontSize: 11,
        color: theme.colors.error,
    },
}));

export default MessageItem;
