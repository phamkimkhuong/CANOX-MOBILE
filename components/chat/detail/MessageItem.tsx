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
import { formatMessageTime } from '@/utils/date';
import { toPublicUrl } from '@/utils/url';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import ChatBubble from './ChatBubble';

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
 */
const MessageItem: React.FC<MessageItemProps> = React.memo(({
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

    const renderContent = () => {
        if (message.isDeleted) {
            return (
                <Text style={[styles.textContent, styles.deletedText, isMe && styles.textContentMe]}>
                    Tin nhắn đã được thu hồi
                </Text>
            );
        }

        switch (message.type) {
            case 'TEXT':
                return <TextContent content={message.content} isMe={isMe} sentAt={message.sentAt} />;
            case 'IMAGE':
                return (
                    <ImageContent
                        attachments={message.attachments}
                        isMe={isMe}
                        onPress={onImagePress}
                        sentAt={message.sentAt}
                    />
                );
            case 'FILE':
                return (
                    <FileContent
                        attachments={message.attachments}
                        isMe={isMe}
                        sentAt={message.sentAt}
                    />
                );
            case 'PRODUCT_CARD':
                return (
                    <ProductCardContent
                        content={message.content}
                        metadata={message.metadata}
                        isMe={isMe}
                        sentAt={message.sentAt}
                    />
                );
            case 'ORDER_CARD':
                return (
                    <OrderCardContent
                        content={message.content}
                        metadata={message.metadata}
                        isMe={isMe}
                        sentAt={message.sentAt}
                    />
                );
            default:
                return <TextContent content={message.content} isMe={isMe} sentAt={message.sentAt} />;
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
            {!isMe && (
                <View style={styles.avatarContainer}>
                    {showAvatar && (
                        <Image
                            source={{ uri: message.sender.avatar }}
                            style={styles.avatar}
                        />
                    )}
                </View>
            )}

            <View style={styles.bubbleWrapper}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePress}
                    onLongPress={() => onLongPress?.(message)}
                >
                    <ChatBubble
                        isMe={isMe}
                        position={position}
                        type={message.type}
                    >
                        {renderContent()}
                    </ChatBubble>

                    {isFailed && (
                        <View style={styles.failedContainer}>
                            <Text style={styles.failedText}>Gửi thất bại</Text>
                            <IconSymbol name="error" size={12} color={theme.colors.error} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
});

// ============================================
// SUB-COMPONENTS
// ============================================

const MessageTime: React.FC<{
    sentAt: string;
    isMe: boolean;
    onImage?: boolean;
    forceDark?: boolean;
}> = ({
    sentAt,
    isMe,
    onImage,
    forceDark = false,
}) => {
        const { theme } = useUnistyles();
        const styles = stylesheet;
        const time = formatMessageTime(sentAt);

        const getTimeStyle = () => {
            if (onImage) return styles.timeOnImage;
            if (forceDark) return { color: theme.colors.typographySecondary };
            return isMe ? styles.timeInsideMe : styles.timeInsideOther;
        };

        return (
            <Text numberOfLines={1} style={[styles.timeInside, getTimeStyle()]}>
                {time}
            </Text>
        );
    };

const TextContent: React.FC<{ content: string; isMe: boolean; sentAt: string }> = ({
    content,
    isMe,
    sentAt,
}) => {
    const styles = stylesheet;

    return (
        <View style={styles.textContainerFixed}>
            <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                {content}
                <Text>{"          "}</Text>
            </Text>
            <View style={styles.timeOverlayText}>
                <MessageTime sentAt={sentAt} isMe={isMe} />
            </View>
        </View>
    );
};

const ImageContent: React.FC<{
    attachments: any[];
    isMe: boolean;
    sentAt: string;
    onPress?: (url: string) => void;
}> = ({
    attachments,
    isMe,
    sentAt,
    onPress,
}) => {
        const styles = stylesheet;
        const image = attachments[0];

        if (!image) return null;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress?.(image.url)}
                style={styles.imageContainer}
            >
                <Image
                    source={{ uri: image.url }}
                    style={styles.messageImage}
                    contentFit="cover"
                />
                <View style={styles.timeOverlayImage}>
                    <MessageTime sentAt={sentAt} isMe={isMe} onImage />
                </View>
            </TouchableOpacity>
        );
    };

const FileContent: React.FC<{ attachments: any[]; isMe: boolean; sentAt: string }> = ({
    attachments,
    isMe,
    sentAt,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const file = attachments[0];

    if (!file) return null;

    return (
        <View style={styles.fileContainerMain}>
            <View style={styles.fileContainer}>
                <View style={styles.fileIconContainer}>
                    <IconSymbol
                        name="description"
                        size={24}
                        color={isMe ? theme.colors.surface : theme.colors.primary}
                    />
                </View>
                <View style={styles.fileInfo}>
                    <Text
                        style={[styles.fileName, isMe && styles.textContentMe]}
                        numberOfLines={1}
                    >
                        {file.fileName || 'Untitled File'}
                    </Text>
                    <Text style={[styles.fileSize, isMe && styles.fileSizeMe]}>
                        {formatFileSize(file.fileSize || 0)}
                    </Text>
                </View>
            </View>
            <View style={styles.timeOverlayFile}>
                <MessageTime sentAt={sentAt} isMe={isMe} />
            </View>
        </View>
    );
};

// Types for parsed metadata
interface OrderMetadata {
    orderId: string;
    orderCode: string;
    status: string;
    totalAmount: number;
    createdDate?: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        image?: string;
    }>;
    buyerId: string;
    shopId: string;
}

interface ProductMetadata {
    productId: string;
    productName: string;
    price: number;
    image?: string;
    shopId: string;
    shopName: string;
    slug?: string;
    description?: string;
}

const parseMetadata = <T,>(metadata?: string): T | null => {
    if (!metadata) return null;
    try {
        return JSON.parse(metadata) as T;
    } catch {
        return null;
    }
};

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    CREATED: { label: 'Mới tạo', color: '#3B82F6' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#8B5CF6' },
    PROCESSING: { label: 'Đang xử lý', color: '#F59E0B' },
    SHIPPING: { label: 'Đang giao', color: '#10B981' },
    DELIVERED: { label: 'Đã giao', color: '#059669' },
    COMPLETED: { label: 'Hoàn thành', color: '#059669' },
    CANCELLED: { label: 'Đã hủy', color: '#EF4444' },
    RETURNED: { label: 'Hoàn trả', color: '#F97316' },
};

interface CardContentProps {
    content: string;
    metadata?: string;
    isMe: boolean;
    sentAt: string;
}

const ProductCardContent: React.FC<CardContentProps> = ({
    content,
    metadata,
    isMe,
    sentAt,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const data = parseMetadata<ProductMetadata>(metadata);

    if (!data) {
        return (
            <View style={styles.cardContainerMain}>
                <View style={styles.cardContainer}>
                    <IconSymbol name="cart" size={20} color={theme.colors.primary} />
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Text style={styles.textContent}>
                            {content}
                        </Text>
                        <MessageTime sentAt={sentAt} isMe={isMe} forceDark />
                    </View>
                </View>
            </View>
        );
    }

    const imageUrl = toPublicUrl(data.image);

    return (
        <View style={styles.productCard}>
            {content && (
                <View style={styles.cardMessageHeader}>
                    <Text style={styles.cardMessageText}>
                        {content}
                    </Text>
                </View>
            )}

            <View style={styles.productCardHeader}>
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.productImageLarge}
                    contentFit="cover"
                />
            </View>
            <View style={styles.productCardContent}>
                <Text style={styles.productNameLarge} numberOfLines={2}>
                    {data.productName}
                </Text>
                <View style={styles.productPriceRow}>
                    <Text style={styles.productPriceLarge}>
                        {formatPrice(data.price)}
                    </Text>
                    <MessageTime sentAt={sentAt} isMe={isMe} forceDark />
                </View>
            </View>
        </View>
    );
};

const OrderCardContent: React.FC<CardContentProps> = ({
    content,
    metadata,
    isMe,
    sentAt,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const data = parseMetadata<OrderMetadata>(metadata);

    if (!data) {
        return (
            <View style={styles.cardContainerMain}>
                <View style={styles.cardContainer}>
                    <IconSymbol name="shipping" size={20} color={theme.colors.primary} />
                    <Text style={styles.textContent}>
                        {content}
                    </Text>
                </View>
                <View style={styles.timeOverlayCard}>
                    <MessageTime sentAt={sentAt} isMe={isMe} forceDark />
                </View>
            </View>
        );
    }

    const [copied, setCopied] = useState(false);

    const handleCopyCode = useCallback(async () => {
        if (!data?.orderCode) return;
        await Clipboard.setStringAsync(data.orderCode);
        setCopied(true);
        Toast.show({
            type: 'success',
            text1: 'Đã sao chép mã đơn hàng',
            text2: data.orderCode,
            position: 'top',
        });
        setTimeout(() => setCopied(false), 2000);
    }, [data?.orderCode]);

    const statusConfig = ORDER_STATUS_CONFIG[data.status] || {
        label: data.status,
        color: '#6B7280',
    };

    return (
        <View style={styles.orderCard}>
            {content && (
                <View style={styles.cardMessageHeader}>
                    <Text style={styles.cardMessageText}>
                        {content}
                    </Text>
                </View>
            )}

            <View style={styles.orderCardHeader}>
                <View style={styles.orderCardHeaderLeft}>
                    <IconSymbol name="shipping" size={16} color={theme.colors.primary} />
                    <Text style={styles.orderCardTitle}>Đơn hàng</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            <Pressable
                onPress={handleCopyCode}
                style={({ pressed }) => [
                    styles.orderCodeRow,
                    pressed && { opacity: 0.7 }
                ]}
            >
                <Text style={styles.orderCodeLarge}>{data.orderCode}</Text>
                <IconSymbol
                    name={copied ? "check" : "content-copy"}
                    size={14}
                    color={copied ? theme.colors.success : theme.colors.typographySecondary}
                />
            </Pressable>

            <View style={styles.orderItemsList}>
                {data.items.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.orderItemRow}>
                        <Image
                            source={{ uri: toPublicUrl(item.image) || 'https://via.placeholder.com/50' }}
                            style={styles.orderItemThumb}
                        />
                        <View style={styles.orderItemInfo}>
                            <Text style={styles.orderItemNameText} numberOfLines={1}>
                                {item.productName}
                            </Text>
                            <Text style={styles.orderItemQtyText}>x{item.quantity}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.orderCardFooterNew}>
                <View>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalValue}>{formatPrice(data.totalAmount)}</Text>
                </View>
                <View style={styles.viewOrderBtn}>
                    <Text style={styles.viewOrderBtnText}>Chi tiết</Text>
                </View>
            </View>
            <View style={styles.timeOverlayCard}>
                <MessageTime sentAt={sentAt} isMe={isMe} forceDark />
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
        marginBottom: theme.margins.sm,
    },
    containerMe: {
        justifyContent: 'flex-end',
    },
    containerOther: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        marginRight: theme.margins.sm,
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.backgroundInput,
    },
    bubbleWrapper: {
        maxWidth: '85%',
    },
    textContainerFixed: {
        position: 'relative',
        minWidth: 85,
        minHeight: 24,
    },
    textContent: {
        fontSize: 15,
        lineHeight: 22,
        color: theme.colors.typography,
    },
    textContentMe: {
        color: theme.colors.surface,
    },
    deletedText: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
    timeInside: {
        fontSize: 11,
        fontWeight: '400',
    },
    timeInsideMe: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    timeInsideOther: {
        color: theme.colors.typographySecondary,
    },
    timeOverlayText: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    timeOverlayImage: {
        position: 'absolute',
        right: 8,
        bottom: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    timeOnImage: {
        color: '#fff',
    },
    timeOverlayFile: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    timeOverlayCard: {
        position: 'absolute',
        right: 8,
        bottom: 4,
    },
    imageContainer: {
        marginHorizontal: -12,
        marginVertical: -8,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        position: 'relative',
    },
    messageImage: {
        width: 240,
        height: 180,
    },
    fileContainerMain: {
        width: 220,
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    fileIconContainer: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    fileSize: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    fileSizeMe: {
        color: theme.colors.textOnOverlay,
    },
    cardContainerMain: {
        minWidth: 150,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: theme.margins.sm,
    },
    cardMessageHeader: {
        paddingHorizontal: 12,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.backgroundSurface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    cardMessageText: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typography,
    },
    productCard: {
        width: 250,
        backgroundColor: theme.colors.surface,
        position: 'relative',
        minHeight: 250,
    },
    productCardHeader: {
        width: '100%',
        height: 150,
        backgroundColor: theme.colors.backgroundInput,
    },
    productImageLarge: {
        width: '100%',
        height: '100%',
    },
    productCardContent: {
        padding: 12,
        gap: 6,
    },
    productNameLarge: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 20,
    },
    productPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    productPriceLarge: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.warning,
    },
    orderCard: {
        width: 260,
        padding: 12,
        backgroundColor: theme.colors.surface,
        position: 'relative',
        minHeight: 280,
    },
    orderCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderCardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    orderCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: theme.margins.sm,
    },
    orderCodeLarge: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    orderItemsList: {
        gap: 10,
        marginBottom: theme.margins.sm,
    },
    orderItemRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    orderItemThumb: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.backgroundInput,
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemNameText: {
        fontSize: 13,
        color: theme.colors.typography,
    },
    orderItemQtyText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    orderCardFooterNew: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingBottom: 10, // Chừa chỗ cho giờ absolute
    },
    totalLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.warning,
    },
    viewOrderBtn: {
        backgroundColor: theme.colors.primarySubtle,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.m,
    },
    viewOrderBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
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
