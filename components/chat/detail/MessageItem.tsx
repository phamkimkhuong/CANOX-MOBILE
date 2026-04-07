/**
 * MessageItem - Smart message renderer
 * Routes to appropriate component based on message type
 */

import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { Message, MessageAttachment } from '@/types/chat/message';
import {
    BubblePosition,
    formatFileSize,
    isMyMessage,
} from '@/utils/adapter/chat/messageAdapter';
import { formatMessageTime } from '@/utils/date';
import { formatMoney } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { buildImageUrl, toSizedImageUrl } from '@/utils/url';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import ChatBubble from './ChatBubble';

const stylesheet = StyleSheet.create((theme, _runtime) => ({
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
    timeOverlayCaption: {
        position: 'absolute',
        right: 12,
        bottom: 8,
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
    timeSecondary: {
        color: theme.colors.typographySecondary,
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
    // Redesigned Media Styles
    mediaContainerMain: {
        marginHorizontal: -12,
        marginVertical: -8,
        backgroundColor: 'transparent',
    },
    gridWrapper: {
        backgroundColor: theme.colors.backgroundInput,
        overflow: 'hidden',
    },
    gridRow: {
        flexDirection: 'row',
        gap: 2,
    },
    captionContainer: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    singleImageWrapper: {
        position: 'relative',
    },
    messageImage: {
        width: 240,
        height: 180,
    },
    videoPreviewContainer: {
        width: 240,
        height: 180,
        position: 'relative',
        backgroundColor: theme.colors.backgroundInput,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    videoPlaceholderMe: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.22)',
    },
    videoPlayButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    videoMetaBadge: {
        position: 'absolute',
        left: 8,
        bottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    videoMetaText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    plusOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
    },
    pendingIndicator: {
        marginLeft: 4,
    },
    dynamicGridHalf: (height: number) => ({
        flex: 1,
        height,
    }),
    dynamicGridBig: (width: number, height: number) => ({
        width,
        height,
    }),
    gridItemBig: {
        // bigSide is set via style prop
    },
    gridGap: {
        gap: 2,
    },
    fullSize: {
        width: '100%',
        height: '100%',
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
    cardErrorContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
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
        minHeight: 120,
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
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    productPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    productPriceLarge: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.error,
    },
    productCardActions: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 18,
    },
    productActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
    },
    productActionBtnOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.accent,
    },
    productActionBtnFilled: {
        backgroundColor: theme.colors.primary,
    },
    productActionBtnPressed: {
        backgroundColor: theme.colors.accentSoft,
    },
    productActionBtnFilledPressed: {
        opacity: 0.8,
        backgroundColor: theme.colors.primary,
    },
    productActionTextOutline: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.accent,
    },
    productActionTextFilled: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    productCardFooterTime: {
        position: 'absolute',
        right: 8,
        bottom: 4,
    },
    orderCard: {
        width: 260,
        padding: 12,
        backgroundColor: theme.colors.surface,
        position: 'relative',
        minHeight: 120,
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
    mb4: {
        marginBottom: 4,
    },
    dynamicStatusBg: (color: string) => ({
        backgroundColor: color + '15',
    }),
    dynamicStatusColor: (color: string) => ({
        color: color,
    }),
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    pressedOpacity: {
        opacity: 0.7,
    },
    orderCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: theme.margins.sm,
    },
    orderCodeLarge: {
        fontSize: 13,
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
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.error,
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

interface MessageItemProps {
    message: Message;
    currentUserId: string;
    position: BubblePosition;
    showAvatar: boolean;
    showTime: boolean;
    onPress?: (message: Message) => void;
    onLongPress?: (message: Message) => void;
    onImagePress?: (url: string) => void;
    onVideoPress?: (url: string) => void;
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
    onPress,
    onLongPress,
    onImagePress,
    onVideoPress,
    onRetry,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const isMe = isMyMessage(message, currentUserId);
    const isFailed = message.status === 'FAILED';

    const handlePress = useCallback(() => {
        if (isFailed && onRetry) {
            onRetry(message);
        } else {
            onPress?.(message);
        }
    }, [isFailed, onRetry, message, onPress]);

    const handleLongPress = useCallback(() => {
        onLongPress?.(message);
    }, [onLongPress, message]);

    const renderContent = () => {
        if (message.isDeleted) {
            return (
                <View style={styles.textContainerFixed}>
                    <Text style={[styles.textContent, styles.deletedText, isMe && styles.textContentMe]}>
                        Tin nhắn đã được thu hồi
                        <Text>{"          "}</Text>
                    </Text>
                    <View style={styles.timeOverlayText}>
                        <MessageTime sentAt={message.sentAt} isMe={isMe} status={message.status} />
                    </View>
                </View>
            );
        }

        switch (message.type) {
            case 'TEXT':
                return <TextContent content={message.content} isMe={isMe} sentAt={message.sentAt} status={message.status} />;
            case 'IMAGE':
                return (
                    <ImageContent
                        content={message.content}
                        attachments={message.attachments}
                        isMe={isMe}
                        onPress={onImagePress}
                        onLongPress={handleLongPress}
                        sentAt={message.sentAt}
                        status={message.status}
                    />
                );
            case 'VIDEO':
                return (
                    <VideoContent
                        content={message.content}
                        attachments={message.attachments}
                        isMe={isMe}
                        onPress={onVideoPress}
                        onLongPress={handleLongPress}
                        sentAt={message.sentAt}
                        status={message.status}
                    />
                );
            case 'FILE':
                return (
                    <FileContent
                        content={message.content}
                        attachments={message.attachments}
                        isMe={isMe}
                        sentAt={message.sentAt}
                        status={message.status}
                    />
                );
            case 'PRODUCT_CARD':
                return (
                    <ProductCardContent
                        content={message.content}
                        metadata={message.metadata}
                        isMe={isMe}
                        sentAt={message.sentAt}
                        status={message.status}
                    />
                );
            case 'ORDER_CARD':
                return (
                    <OrderCardContent
                        content={message.content}
                        metadata={message.metadata}
                        isMe={isMe}
                        sentAt={message.sentAt}
                        status={message.status}
                    />
                );
            default:
                return <TextContent content={message.content} isMe={isMe} sentAt={message.sentAt} status={message.status} />;
        }
    };

    return (
        <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
            {!isMe && (
                <View style={styles.avatarContainer}>
                    {showAvatar && (
                        <Image
                            source={{ uri: buildImageUrl(message.sender.avatar, null, 'thumb') }}
                            style={styles.avatar}
                        />
                    )}
                </View>
            )}

            <View style={styles.bubbleWrapper}>
                <TouchableOpacity
                    activeOpacity={message.isDeleted ? 1 : 0.8}
                    onPress={message.isDeleted ? undefined : handlePress}
                    onLongPress={message.isDeleted ? undefined : handleLongPress}
                    delayLongPress={200}
                    disabled={message.isDeleted && !isFailed}
                >
                    <ChatBubble
                        isMe={isMe}
                        position={position}
                        type={message.isDeleted ? 'TEXT' : message.type}
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

const formatVideoDuration = (durationSeconds?: number): string | null => {
    if (typeof durationSeconds !== 'number' || durationSeconds <= 0) {
        return null;
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ============================================
// SUB-COMPONENTS
// ============================================

const MessageTime: React.FC<{
    sentAt: string;
    isMe: boolean;
    status: string;
    onImage?: boolean;
    forceDark?: boolean;
}> = memo(({
    sentAt,
    isMe,
    status,
    onImage,
    forceDark = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const time = formatMessageTime(sentAt);

    const getTimeStyle = () => {
        if (onImage) return styles.timeOnImage;
        if (forceDark) return styles.timeSecondary;
        return isMe ? styles.timeInsideMe : styles.timeInsideOther;
    };

    if (status === 'PENDING') {
        return (
            <View style={styles.pendingIndicator}>
                <ActivityIndicator size="small" color={onImage ? '#fff' : (isMe ? '#fff' : theme.colors.primary)} />
            </View>
        );
    }

    return (
        <Text numberOfLines={1} style={[styles.timeInside, getTimeStyle()]}>
            {time}
        </Text>
    );
});

const TextContent: React.FC<{ content: string; isMe: boolean; sentAt: string; status: string }> = memo(({
    content,
    isMe,
    sentAt,
    status,
}) => {
    const styles = stylesheet;

    return (
        <View style={styles.textContainerFixed}>
            <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                {content}
                <Text>{"          "}</Text>
            </Text>
            <View style={styles.timeOverlayText}>
                <MessageTime sentAt={sentAt} isMe={isMe} status={status} />
            </View>
        </View>
    );
});

const ImageContent: React.FC<{
    content?: string;
    attachments: MessageAttachment[];
    isMe: boolean;
    sentAt: string;
    status: string;
    onPress?: (url: string) => void;
    onLongPress?: () => void;
}> = ({
    content,
    attachments,
    isMe,
    sentAt,
    status,
    onPress,
    onLongPress,
}) => {
        const styles = stylesheet;
        const imageCount = attachments.length;

        /**
         * Calculate border radius for an image in the grid based on its position
         * This ensures the outer corners match the bubble and inner corners are sharp
         */
        const getGridImageRadius = useCallback((index: number, total: number) => {
            const RADIUS = 12;
            const radii = {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            };

            // Top corners - only if it's the first row & not having content above (which is not current case)
            if (total === 1) {
                radii.borderTopLeftRadius = RADIUS;
                radii.borderTopRightRadius = RADIUS;
                if (!content) {
                    radii.borderBottomLeftRadius = RADIUS;
                    radii.borderBottomRightRadius = RADIUS;
                }
            } else if (total === 2) {
                if (index === 0) {
                    radii.borderTopLeftRadius = RADIUS;
                    if (!content) radii.borderBottomLeftRadius = RADIUS;
                } else {
                    radii.borderTopRightRadius = RADIUS;
                    if (!content) radii.borderBottomRightRadius = RADIUS;
                }
            } else if (total === 3) {
                if (index === 0) {
                    radii.borderTopLeftRadius = RADIUS;
                    if (!content) radii.borderBottomLeftRadius = RADIUS;
                } else if (index === 1) {
                    radii.borderTopRightRadius = RADIUS;
                } else if (index === 2) {
                    if (!content) radii.borderBottomRightRadius = RADIUS;
                }
            } else if (total >= 4) {
                if (index === 0) radii.borderTopLeftRadius = RADIUS;
                if (index === 1) radii.borderTopRightRadius = RADIUS;
                if (!content && index === 2) radii.borderBottomLeftRadius = RADIUS;
                if (!content && index === 3) radii.borderBottomRightRadius = RADIUS;
            }

            return radii;
        }, [content]);

        if (imageCount === 0) return null;

        // Base constants for grid
        const GRID_WIDTH = 240;
        const GAP = 2;

        const renderImages = () => {
            const imagesToShow = attachments.slice(0, 4);

            // Case 1: Single Image
            if (imageCount === 1) {
                return (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onPress?.(attachments[0].url)}
                        onLongPress={onLongPress}
                        style={styles.singleImageWrapper}
                    >
                        <Image
                            source={{ uri: buildImageUrl(attachments[0].url, null, 'medium') }}
                            style={[styles.messageImage, getGridImageRadius(0, 1)]}
                            contentFit="cover"
                            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                        />
                        {!content && (
                            <View style={styles.timeOverlayImage}>
                                <MessageTime sentAt={sentAt} isMe={isMe} onImage status={status} />
                            </View>
                        )}
                    </TouchableOpacity>
                );
            }

            // Case 2: Two Images
            if (imageCount === 2) {
                const side = (GRID_WIDTH - GAP) / 2;
                return (
                    <View style={styles.gridRow}>
                        {imagesToShow.map((img: MessageAttachment, idx: number) => (
                            <TouchableOpacity
                                key={img.id || idx}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={styles.dynamicGridHalf(side * 1.2)}
                            >
                                <Image
                                    source={{ uri: buildImageUrl(img.url, null, 'small') }}
                                    style={[styles.fullSize, getGridImageRadius(idx, 2)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                        ))}
                        {!content && (
                            <View style={styles.timeOverlayImage}>
                                <MessageTime sentAt={sentAt} isMe={isMe} onImage status={status} />
                            </View>
                        )}
                    </View>
                );
            }

            // Case 3: Three Images (1 big left, 2 small right)
            if (imageCount === 3) {
                const bigSide = (GRID_WIDTH - GAP) * 0.65;
                const smallSide = GRID_WIDTH - bigSide - GAP;
                const smallHeight = (bigSide - GAP) / 2;

                return (
                    <View style={styles.gridRow}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onLongPress={onLongPress}
                            onPress={() => onPress?.(imagesToShow[0].url)}
                            style={styles.dynamicGridBig(bigSide, bigSide)}
                        >
                            <Image
                                source={{ uri: buildImageUrl(imagesToShow[0].url, null, 'small') }}
                                style={[styles.dynamicGridBig(bigSide, bigSide), getGridImageRadius(0, 3)]}
                                contentFit="cover"
                            />
                        </TouchableOpacity>
                        <View style={styles.gridGap}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(imagesToShow[1].url)}
                                style={styles.dynamicGridBig(smallSide, smallHeight)}
                            >
                                <Image
                                    source={{ uri: buildImageUrl(imagesToShow[1].url, null, 'thumb') }}
                                    style={[styles.dynamicGridBig(smallSide, smallHeight), getGridImageRadius(1, 3)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(imagesToShow[2].url)}
                                style={styles.dynamicGridBig(smallSide, smallHeight)}
                            >
                                <Image
                                    source={{ uri: buildImageUrl(imagesToShow[2].url, null, 'thumb') }}
                                    style={[styles.dynamicGridBig(smallSide, smallHeight), getGridImageRadius(2, 3)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                        </View>
                        {!content && (
                            <View style={styles.timeOverlayImage}>
                                <MessageTime sentAt={sentAt} isMe={isMe} onImage status={status} />
                            </View>
                        )}
                    </View>
                );
            }

            // Case 4+: 2x2 Grid
            const boxSide = (GRID_WIDTH - GAP) / 2;
            return (
                <View style={styles.gridGap}>
                    <View style={styles.gridRow}>
                        {imagesToShow.slice(0, 2).map((img: MessageAttachment, idx: number) => (
                            <TouchableOpacity
                                key={img.id || idx}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={styles.dynamicGridHalf(boxSide)}
                            >
                                <Image
                                    source={{ uri: buildImageUrl(img.url, null, 'thumb') }}
                                    style={[styles.dynamicGridBig(boxSide, boxSide), getGridImageRadius(idx, 4)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.gridRow}>
                        {imagesToShow.slice(2, 4).map((img: MessageAttachment, idx: number) => (
                            <TouchableOpacity
                                key={img.id || idx + 2}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={styles.dynamicGridHalf(boxSide)}
                            >
                                <Image
                                    source={{ uri: toSizedImageUrl(img.url, null, 'thumb') ?? img.url }}
                                    style={[styles.dynamicGridBig(boxSide, boxSide), getGridImageRadius(idx + 2, 4)]}
                                    contentFit="cover"
                                />
                                {imageCount > 4 && idx === 1 && (
                                    <View style={styles.plusOverlay}>
                                        <Text style={styles.plusText}>+{imageCount - 4}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    {!content && (
                        <View style={styles.timeOverlayImage}>
                            <MessageTime sentAt={sentAt} isMe={isMe} onImage status={status} />
                        </View>
                    )}
                </View>
            );
        };

        return (
            <View style={styles.mediaContainerMain}>
                <View style={styles.gridWrapper}>
                    {renderImages()}
                </View>
                {content ? (
                    <View style={styles.captionContainer}>
                        <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                            {content}
                            <Text>{"          "}</Text>
                        </Text>
                        <View style={styles.timeOverlayCaption}>
                            <MessageTime sentAt={sentAt} isMe={isMe} status={status} />
                        </View>
                    </View>
                ) : null}
            </View>
        );
    };

const VideoContent: React.FC<{
    content?: string;
    attachments: MessageAttachment[];
    isMe: boolean;
    sentAt: string;
    status: string;
    onPress?: (url: string) => void;
    onLongPress?: () => void;
}> = ({
    content,
    attachments,
    isMe,
    sentAt,
    status,
    onPress,
    onLongPress,
}) => {
    const styles = stylesheet;
    const video = attachments[0];

    if (!video) return null;

    const durationLabel = formatVideoDuration(video.duration);
    const metaLabel = durationLabel || formatFileSize(video.fileSize || 0);
    const thumbnailSource = video.thumbnailSource ?? (video.thumbnail
        ? buildImageUrl(video.thumbnail, null, 'medium')
        : null);

    return (
        <View style={styles.mediaContainerMain}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress?.(video.url)}
                onLongPress={onLongPress}
                style={styles.singleImageWrapper}
            >
                {thumbnailSource ? (
                    <Image
                        source={thumbnailSource}
                        style={styles.messageImage}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View style={[
                        styles.videoPreviewContainer,
                        isMe && styles.videoPlaceholderMe,
                    ]}>
                        <IconSymbol
                            name="videocam-fill"
                            size={34}
                            color={isMe ? '#FFFFFF' : '#64748B'}
                        />
                    </View>
                )}

                <View style={styles.videoOverlay}>
                    <View style={styles.videoPlayButton}>
                        <IconSymbol name="play-fill" size={26} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.videoMetaBadge}>
                    <IconSymbol name="video" size={14} color="#FFFFFF" />
                    <Text style={styles.videoMetaText}>{metaLabel}</Text>
                </View>

                {!content && (
                    <View style={styles.timeOverlayImage}>
                        <MessageTime sentAt={sentAt} isMe={isMe} onImage status={status} />
                    </View>
                )}
            </TouchableOpacity>
            {content ? (
                <View style={styles.captionContainer}>
                    <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                        {content}
                        <Text>{"          "}</Text>
                    </Text>
                    <View style={styles.timeOverlayCaption}>
                        <MessageTime sentAt={sentAt} isMe={isMe} status={status} />
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const FileContent: React.FC<{ content?: string; attachments: MessageAttachment[]; isMe: boolean; sentAt: string; status: string }> = ({
    content,
    attachments,
    isMe,
    sentAt,
    status,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const file = attachments[0];

    if (!file) return null;

    return (
        <View style={styles.fileContainerMain}>
            <View style={[styles.fileContainer, content && styles.mb4]}>
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
            {content ? (
                <View style={styles.textContainerFixed}>
                    <Text style={[styles.textContent, isMe && styles.textContentMe]}>
                        {content}
                        <Text>{"          "}</Text>
                    </Text>
                    <View style={styles.timeOverlayText}>
                        <MessageTime sentAt={sentAt} isMe={isMe} status={status} />
                    </View>
                </View>
            ) : (
                <View style={styles.timeOverlayFile}>
                    <MessageTime sentAt={sentAt} isMe={isMe} status={status} />
                </View>
            )}
        </View>
    );
};

// Types for parsed metadata
interface OrderMetadata {
    orderId: string;
    orderCode: string;
    status: string;
    totalAmount: number;
    currency?: string;
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

const formatPrice = (amount: number, currency: string = 'VND'): string => {
    return formatMoney(amount, currency);
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    CREATED: { label: 'Mới tạo', color: '#3B82F6' },
    AWAITING_PAYMENT: { label: 'Chờ thanh toán', color: '#F59E0B' },
    PAID: { label: 'Đã thanh toán', color: '#10B981' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#8B5CF6' },
    PROCESSING: { label: 'Đang xử lý', color: '#F59E0B' },
    FULFILLING: { label: 'Đang xử lý', color: '#F59E0B' },
    READY_FOR_PICKUP: { label: 'Sẵn sàng lấy', color: '#0284C7' },
    SHIPPING: { label: 'Đang giao', color: '#10B981' },
    SHIPPED: { label: 'Đã gửi hàng', color: '#0284C7' },
    OUT_FOR_DELIVERY: { label: 'Đang giao', color: '#F59E0B' },
    DELIVERED: { label: 'Đã giao', color: '#059669' },
    COMPLETED: { label: 'Hoàn thành', color: '#059669' },
    FINALIZED: { label: 'Hoàn thành', color: '#059669' },
    REJECTED: { label: 'Bị từ chối', color: '#EF4444' },
    DELIVERY_FAILED: { label: 'Giao thất bại', color: '#EF4444' },
    RETURNING_TO_SENDER: { label: 'Đang hoàn', color: '#F59E0B' },
    RETURNED_TO_SENDER: { label: 'Đã hoàn', color: '#6B7280' },
    CANCELLED: { label: 'Đã hủy', color: '#EF4444' },
    RETURN_REQUESTED: { label: 'Chờ shop xác nhận', color: '#F59E0B' },
    RETURN_APPROVED: { label: 'Đã duyệt trả hàng', color: '#0284C7' },
    RETURN_REJECTED: { label: 'Từ chối trả hàng', color: '#EF4444' },
    RETURNING: { label: 'Đang gửi trả', color: '#0284C7' },
    RETURNED: { label: 'Shop đã nhận hàng trả', color: '#0284C7' },
    RETURN_DISPUTED: { label: 'Đang tranh chấp', color: '#F97316' },
    REFUND_PENDING: { label: 'Chờ hoàn tiền', color: '#0284C7' },
    REFUNDED: { label: 'Đã hoàn tiền', color: '#10B981' },
};

interface CardContentProps {
    content: string;
    metadata?: string;
    isMe: boolean;
    sentAt: string;
    status: string;
}

const ProductCardContent: React.FC<CardContentProps> = ({
    content,
    metadata,
    isMe,
    sentAt,
    status,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const data = parseMetadata<ProductMetadata>(metadata);

    /**
     * Điều hướng đến trang chi tiết sản phẩm
     * Vì metadata chưa có variantId, cần chọn biến thể trước khi thêm vào giỏ
     */
    const handleViewProduct = useCallback(() => {
        if (!data) return;
        Navigator.push(productRoutes.detail(data.productId));
    }, [data]);

    if (!data) {
        return (
            <View style={styles.cardContainerMain}>
                <View style={styles.cardContainer}>
                    <IconSymbol name="cart" size={20} color={theme.colors.primary} />
                    <View style={styles.cardErrorContent}>
                        <Text style={styles.textContent}>
                            {content}
                        </Text>
                        <MessageTime sentAt={sentAt} isMe={isMe} forceDark status={status} />
                    </View>
                </View>
            </View>
        );
    }

    const imageUrl = buildImageUrl(data.image, null, 'medium');

    return (
        <View style={styles.productCard}>
            {content && (
                <View style={styles.cardMessageHeader}>
                    <Text style={styles.cardMessageText}>
                        {content}
                    </Text>
                </View>
            )}

            <Pressable onPress={handleViewProduct}>
                <View style={styles.productCardHeader}>
                    <Image
                        source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                        style={styles.productImageLarge}
                        contentFit="cover"
                        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                        transition={300}
                    />
                </View>
                <View style={styles.productCardContent}>
                    <Text style={styles.productNameLarge} numberOfLines={2}>
                        {data.productName}
                    </Text>
                    <Text style={styles.productPriceLarge}>
                        {formatPrice(data.price)}
                    </Text>
                </View>
            </Pressable>

            {/* Action Buttons */}
            {/* <View style={styles.productCardActions}>
                <Pressable
                    style={({ pressed }) => [
                        styles.productActionBtn,
                        styles.productActionBtnOutline,
                        pressed && styles.productActionBtnPressed
                    ]}
                    onPress={handleViewProduct}
                >
                    <IconSymbol name="cart" size={16} color={theme.colors.accent} />
                    <Text style={styles.productActionTextOutline}>Thêm vào giỏ</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.productActionBtn,
                        styles.productActionBtnFilled,
                        pressed && styles.productActionBtnFilledPressed
                    ]}
                    onPress={handleBuyNow}
                >
                    <Text style={styles.productActionTextFilled}>Mua ngay</Text>
                </Pressable>
            </View> */}

            <View style={styles.productCardFooterTime}>
                <MessageTime sentAt={sentAt} isMe={isMe} forceDark status={status} />
            </View>
        </View>
    );
};

const OrderCardContent: React.FC<CardContentProps> = ({
    content,
    metadata,
    isMe,
    sentAt,
    status,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const data = parseMetadata<OrderMetadata>(metadata);
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
    }, [data]);

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
                    <MessageTime sentAt={sentAt} isMe={isMe} forceDark status={status} />
                </View>
            </View>
        );
    }

    const statusConfig = ORDER_STATUS_CONFIG[data.status] || {
        label: `UNKNOWN: ${data.status}`,
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
                <View style={[styles.statusBadge, styles.dynamicStatusBg(statusConfig.color)]}>
                    <Text style={[styles.statusText, styles.dynamicStatusColor(statusConfig.color)]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            <Pressable
                onPress={handleCopyCode}
                style={({ pressed }) => [
                    styles.orderCodeRow,
                    pressed && styles.pressedOpacity
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
                            source={{ uri: buildImageUrl(item.image, null, 'thumb') }}
                            style={styles.orderItemThumb}
                            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                            transition={300}
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
                    <Text style={styles.totalValue}>{formatPrice(data.totalAmount, data.currency)}</Text>
                </View>
                <View style={styles.viewOrderBtn}>
                    <Text style={styles.viewOrderBtnText}>Chi tiết</Text>
                </View>
            </View>
            <View style={styles.timeOverlayCard}>
                <MessageTime sentAt={sentAt} isMe={isMe} forceDark status={status} />
            </View>
        </View>
    );
};

export default React.memo(MessageItem);
