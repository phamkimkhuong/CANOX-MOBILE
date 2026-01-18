/**
 * MessageItem - Smart message renderer
 * Routes to appropriate component based on message type
 */

import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { Message } from '@/types/chat/message';
import {
    BubblePosition,
    formatFileSize,
    isMyMessage,
} from '@/utils/adapter/chat/messageAdapter';
import { formatMessageTime } from '@/utils/date';
import { Navigator } from '@/utils/navigation';
import { toPublicUrl } from '@/utils/url';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
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
                        onLongPress={() => onLongPress?.(message)}
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
                    activeOpacity={message.isDeleted ? 1 : 0.8}
                    onPress={message.isDeleted ? undefined : handlePress}
                    onLongPress={message.isDeleted ? undefined : () => onLongPress?.(message)}
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

// ============================================
// SUB-COMPONENTS
// ============================================

const MessageTime: React.FC<{
    sentAt: string;
    isMe: boolean;
    status: string;
    onImage?: boolean;
    forceDark?: boolean;
}> = ({
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
            if (forceDark) return { color: theme.colors.typographySecondary };
            return isMe ? styles.timeInsideMe : styles.timeInsideOther;
        };

        if (status === 'PENDING') {
            return (
                <View style={{ marginLeft: 4 }}>
                    <ActivityIndicator size="small" color={onImage ? '#fff' : (isMe ? '#fff' : theme.colors.primary)} />
                </View>
            );
        }

        return (
            <Text numberOfLines={1} style={[styles.timeInside, getTimeStyle()]}>
                {time}
            </Text>
        );
    };

const TextContent: React.FC<{ content: string; isMe: boolean; sentAt: string; status: string }> = ({
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
};

const ImageContent: React.FC<{
    content?: string;
    attachments: any[];
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
        const { theme } = useUnistyles();
        const imageCount = attachments.length;

        if (imageCount === 0) return null;

        // Base constants for grid
        const GRID_WIDTH = 240;
        const GAP = 2;
        const RADIUS = 12;
        const SMALL_RADIUS = 4;

        /**
         * Calculate border radius for an image in the grid based on its position
         * This ensures the outer corners match the bubble and inner corners are sharp
         */
        const getGridImageRadius = (index: number, total: number) => {
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
        };

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
                            source={{ uri: attachments[0].url }}
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
                        {imagesToShow.map((img, idx) => (
                            <TouchableOpacity
                                key={img.id || idx}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={{ width: side, height: side * 1.2 }}
                            >
                                <Image
                                    source={{ uri: img.url }}
                                    style={[{ width: '100%', height: '100%' }, getGridImageRadius(idx, 2)]}
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
                            style={{ width: bigSide, height: bigSide }}
                        >
                            <Image
                                source={{ uri: imagesToShow[0].url }}
                                style={[{ width: bigSide, height: bigSide }, getGridImageRadius(0, 3)]}
                                contentFit="cover"
                            />
                        </TouchableOpacity>
                        <View style={{ gap: GAP }}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(imagesToShow[1].url)}
                                style={{ width: smallSide, height: smallHeight }}
                            >
                                <Image
                                    source={{ uri: imagesToShow[1].url }}
                                    style={[{ width: smallSide, height: smallHeight }, getGridImageRadius(1, 3)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(imagesToShow[2].url)}
                                style={{ width: smallSide, height: smallHeight }}
                            >
                                <Image
                                    source={{ uri: imagesToShow[2].url }}
                                    style={[{ width: smallSide, height: smallHeight }, getGridImageRadius(2, 3)]}
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
                <View style={{ gap: GAP }}>
                    <View style={styles.gridRow}>
                        {imagesToShow.slice(0, 2).map((img, idx) => (
                            <TouchableOpacity
                                key={img.id || idx}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={{ width: boxSide, height: boxSide }}
                            >
                                <Image
                                    source={{ uri: img.url }}
                                    style={[{ width: boxSide, height: boxSide }, getGridImageRadius(idx, 4)]}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.gridRow}>
                        {imagesToShow.slice(2, 4).map((img, idx) => (
                            <TouchableOpacity
                                key={img.id || idx + 2}
                                activeOpacity={0.9}
                                onLongPress={onLongPress}
                                onPress={() => onPress?.(img.url)}
                                style={{ width: boxSide, height: boxSide }}
                            >
                                <Image
                                    source={{ uri: img.url }}
                                    style={[{ width: boxSide, height: boxSide }, getGridImageRadius(idx + 2, 4)]}
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

const FileContent: React.FC<{ content?: string; attachments: any[]; isMe: boolean; sentAt: string; status: string }> = ({
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
            <View style={[styles.fileContainer, content ? { marginBottom: 4 } : null]}>
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

    if (!data) {
        return (
            <View style={styles.cardContainerMain}>
                <View style={styles.cardContainer}>
                    <IconSymbol name="cart" size={20} color={theme.colors.primary} />
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Text style={styles.textContent}>
                            {content}
                        </Text>
                        <MessageTime sentAt={sentAt} isMe={isMe} forceDark status={status} />
                    </View>
                </View>
            </View>
        );
    }

    const imageUrl = toPublicUrl(data.image);

    /**
     * Điều hướng đến trang chi tiết sản phẩm
     * Vì metadata chưa có variantId, cần chọn biến thể trước khi thêm vào giỏ
     */
    const handleViewProduct = useCallback(() => {
        Navigator.push(productRoutes.detail(data.productId));
    }, [data.productId]);

    /**
     * Điều hướng đến trang chi tiết với intent mua ngay
     * Sản phẩm sẽ được thêm vào giỏ và chuyển đến checkout sau khi chọn biến thể
     */
    const handleBuyNow = useCallback(() => {
        Navigator.push(productRoutes.detail(data.productId, { instantNav: true }));
    }, [data.productId]);

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
                    <Text style={styles.totalValue}>{formatPrice(data.totalAmount)}</Text>
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

export default MessageItem;
