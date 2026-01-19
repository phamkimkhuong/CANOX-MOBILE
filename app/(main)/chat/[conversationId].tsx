/**
 * ChatDetailScreen - Chat conversation detail view
 * Features:
 * - Inverted FlatList for messages (newest at bottom)
 * - Keyboard handling with react-native-keyboard-controller
 * - Sticky context bar (product/order)
 * - Quick replies
 * - Message grouping by date
 * - Performance optimized with React.memo and FlatList props
 */

import {
    AttachmentMenu,
    ChatDetailHeader,
    ChatDetailSkeleton,
    ChatInputArea,
    ContextBar,
    DateSeparator,
    MessageActionSheet,
    MessageActionSheetRef,
    MessageItem,
    QuickReplyList,
    SafetyBanner
} from '@/components/chat/detail';
import { IconSymbol } from '@/components/ui/Icon';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { chatRoutes, orderRoutes, productRoutes } from '@/constants/routes';
import type { DeleteType } from '@/hooks/api/chat';
import { CONVERSATIONS_QUERY_KEY, useChatMessages, useDeleteMessage, useMarkMessagesAsRead, useSendMediaMessage, useSendMessage, useSendOrderCard, useSendProductCard } from '@/hooks/api/chat';
import { useChatImagePicker } from '@/hooks/api/chat/useChatImagePicker';
import { buildChatWithShopRequest, useCreateConversation } from '@/hooks/api/chat/useCreateConversation';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatPickerStore } from '@/store/useChatPickerStore';
import {
    ContextType,
    getQuickRepliesByContext,
    OrderContext,
    ProductContext,
    QuickReply,
} from '@/types/chat/contextBar';
import { ConversationPartner } from '@/types/chat/conversation';
import { Message, MessageType } from '@/types/chat/message';
import { OrderStatus } from '@/types/order/order';
import {
    groupMessagesByDate,
} from '@/utils/adapter/chat/messageAdapter';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, ListRenderItem, Modal, Pressable, Text, View } from 'react-native';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface MessageListItem {
    type: 'date-separator' | 'message';
    data: Message | string;
    id: string;
}

type BubblePosition = 'single' | 'first' | 'middle' | 'last';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if two messages are from the same user within time threshold
 */
const isSameUserWithinThreshold = (
    msg1: Message | undefined,
    msg2: Message | undefined,
    thresholdMinutes = 5
): boolean => {
    if (!msg1 || !msg2) return false;
    if (msg1.sender.userId !== msg2.sender.userId) return false;

    const time1 = new Date(msg1.sentAt).getTime();
    const time2 = new Date(msg2.sentAt).getTime();
    return Math.abs(time2 - time1) < thresholdMinutes * 60 * 1000;
};

/**
 * Get bubble position based on adjacent messages
 */
const calculateBubblePosition = (
    current: Message,
    prev: Message | undefined,
    next: Message | undefined
): BubblePosition => {
    const sameSenderAsPrev = isSameUserWithinThreshold(prev, current);
    const sameSenderAsNext = isSameUserWithinThreshold(current, next);

    if (!sameSenderAsPrev && !sameSenderAsNext) return 'single';
    if (!sameSenderAsPrev && sameSenderAsNext) return 'first';
    if (sameSenderAsPrev && sameSenderAsNext) return 'middle';
    return 'last';
};

/**
 * Check if avatar should be shown (only for other's messages, last in group)
 */
const calculateShowAvatar = (
    message: Message,
    prev: Message | undefined,
    currentUserId: string
): boolean => {
    if (message.sender.userId === currentUserId) return false;
    const sameSenderAsPrev = isSameUserWithinThreshold(prev, message);
    return !sameSenderAsPrev;
};

/**
 * Check if time should be shown (last message in consecutive group)
 */
const calculateShowTime = (
    message: Message,
    next: Message | undefined
): boolean => {
    const sameSenderAsNext = isSameUserWithinThreshold(message, next);
    return !sameSenderAsNext;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ChatDetailScreen() {
    const params = useLocalSearchParams<{
        conversationId: string;
        // Context params (optional - passed from product/order page)
        contextType?: ContextType;
        productId?: string;
        productName?: string;
        productPrice?: string;
        productImage?: string;
        orderId?: string;
        orderCode?: string;
        orderStatus?: OrderStatus;
        partnerName?: string;
        partnerAvatar?: string;
        partnerIsOnline?: string;
        partnerIsVerified?: string;
        shopUserId?: string;
        shopId?: string;
    }>();

    const { theme } = useUnistyles();
    const styles = stylesheet;
    const flatListRef = useRef<FlatList<MessageListItem>>(null);
    const attachmentMenuRef = useRef<BottomSheetModal>(null);
    const messageActionSheetRef = useRef<MessageActionSheetRef>(null);
    const {
        selectedProduct,
        selectedOrder,
        conversationId: pickerConvId,
        clearSelections
    } = useChatPickerStore();

    // State management for conversationId
    const [currentConvId, setCurrentConvId] = useState<string>(params.conversationId);
    const isGhostMode = currentConvId.startsWith('ghost_');
    const userId = useAuthStore((s) => s.userId);
    const myShopId = useAuthStore((s) => s.shopId);
    const insets = useSafeAreaInsets();

    // Flag to delay rendering of message list until the end of screen transition
    const [isReady, setIsReady] = useState(false);

    // ============================================
    // HOOKS (Main data)
    // ============================================

    const {
        messages,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
    } = useChatMessages(isGhostMode ? '' : currentConvId);

    // View images full screen
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const chatImages = useMemo(() => {
        const allImages: { uri: string; id: string }[] = [];
        // Extract all images from the conversation chronological order
        [...messages].reverse().forEach(msg => {
            if (msg.type === MessageType.IMAGE && msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    const url = att.url;
                    if (url) {
                        allImages.push({ uri: url, id: att.id });
                    }
                });
            }
        });
        return allImages;
    }, [messages]);

    const handleImagePress = useCallback((url: string) => {
        const index = chatImages.findIndex(img => img.uri === url);
        if (index >= 0) {
            setViewerIndex(index);
            setViewerVisible(true);
        }
    }, [chatImages]);

    // ============================================
    // EFFECTS & LOGIC
    // ============================================

    useEffect(() => {
        // Only delay rendering of message list if data is not yet available (loading)
        // If there is cache, we turn on isReady earlier
        const timeout = (messages?.length ?? 0) > 0 ? 50 : 150;

        const timer = setTimeout(() => {
            setIsReady(true);
        }, timeout);

        return () => clearTimeout(timer);
    }, [messages?.length]);

    // ============================================
    // STATE
    // ============================================

    // Context bar state
    const [contextType, setContextType] = useState<ContextType>(
        (params.contextType as ContextType) || 'NONE'
    );

    // Product context (if navigated from product page)
    const productContext: ProductContext | undefined = useMemo(() => {
        if (params.productId) {
            return {
                productId: params.productId,
                name: params.productName || '',
                price: Number(params.productPrice) || 0,
                thumbnail: params.productImage || '',
                shopId: '',
                shopName: params.partnerName || '',
            };
        }
        return undefined;
    }, [params]);

    // Order context (if navigated from order page)
    const orderContext: OrderContext | undefined = useMemo(() => {
        if (params.orderId) {
            return {
                orderId: params.orderId,
                orderCode: params.orderCode || '',
                status: (params.orderStatus || 'CREATED') as OrderStatus,
                totalAmount: 0,
                itemCount: 1,
            };
        }
        return undefined;
    }, [params]);

    // ============================================
    // HOOKS
    // ============================================

    // If ghost mode, automatically resolve to real ID
    const { mutate: createConv } = useCreateConversation();

    useEffect(() => {
        if (isGhostMode && params.shopUserId && params.partnerName) {
            if (params.shopId && params.shopId === myShopId) {
                logger.chat.warn('Attempted to resolve ghost mode for chatting with self - aborting');
                return;
            }
            const request = buildChatWithShopRequest(
                params.shopUserId,
                params.partnerName,
                params.partnerAvatar
            );

            createConv(request, {
                onSuccess: (res) => {
                    setCurrentConvId(res.data.id);
                    logger.chat.info('Ghost mode resolved to real ID', { id: res.data.id });
                }
            });
        }
    }, [isGhostMode, params.shopUserId, params.partnerName, params.partnerAvatar, createConv]);

    // Partner info from params or fallback to messages
    const partner: ConversationPartner | null = useMemo(() => {
        //  Try from params
        if (params.partnerName) {
            return {
                id: '',
                name: params.partnerName,
                avatar: params.partnerAvatar || undefined,
                isOnline: params.partnerIsOnline === 'true',
                isVerified: params.partnerIsVerified === 'true',
                type: 'SHOP',
                shopId: params.shopId,
            };
        }

        //  Fallback: try to find partner info from messages
        const otherMessage = messages.find((m) => m.sender.userId !== userId);
        if (otherMessage) {
            let shopIdFromMetadata: string | undefined;
            if (otherMessage.metadata) {
                try {
                    const metadata = JSON.parse(otherMessage.metadata);
                    shopIdFromMetadata = metadata.shopId;
                } catch (e) {
                    // Ignore parse error
                }
            }

            return {
                id: otherMessage.sender.userId,
                name: otherMessage.sender.displayName,
                avatar: otherMessage.sender.avatar || otherMessage.sender.shopLogo,
                isOnline: false,
                isVerified: false,
                type: 'SHOP', // Partner side is usually a shop in this app
                shopId: shopIdFromMetadata || params.shopId,
            };
        }

        return null;
    }, [params, messages, userId]);
    const partnerShopId = params.shopId;
    const sendMessageMutation = useSendMessage(currentConvId);
    const sendProductCardMutation = useSendProductCard(currentConvId);
    const sendOrderCardMutation = useSendOrderCard(currentConvId);
    const sendMediaMessageMutation = useSendMediaMessage(currentConvId);
    const deleteMessageMutation = useDeleteMessage(currentConvId);
    const markAsReadMutation = useMarkMessagesAsRead(currentConvId);
    const queryClient = useQueryClient();
    const hasMarkedAsRead = useRef(false);


    useEffect(() => {
        if (hasMarkedAsRead.current) return;

        const conversationsCache = queryClient.getQueriesData<{
            pages: Array<{ conversations: Array<{ id: string; unreadCount: number }> }>;
        }>({ queryKey: [CONVERSATIONS_QUERY_KEY] });

        let unreadCount = 0;
        for (const [, data] of conversationsCache) {
            if (data?.pages) {
                for (const page of data.pages) {
                    const conversation = page.conversations?.find((c) => c.id === currentConvId);
                    if (conversation) {
                        unreadCount = conversation.unreadCount || 0;
                        break;
                    }
                }
            }
            if (unreadCount > 0) break;
        }

        // If there's something to mark as read, do it in the background
        if (unreadCount > 0 && !isGhostMode) {
            hasMarkedAsRead.current = true;
            markAsReadMutation.mutate({
            });
        }
    }, [currentConvId, queryClient, markAsReadMutation, isGhostMode]);

    // ============================================
    // HANDLE PICKER SELECTIONS (from picker pages)
    // ============================================
    useEffect(() => {
        if (selectedProduct && pickerConvId === currentConvId && !isGhostMode) {
            const message = `Tôi muốn hỏi về sản phẩm: ${selectedProduct.title}`;
            sendProductCardMutation.mutate(
                {
                    productId: selectedProduct.id,
                    message: message,
                    productInfo: {
                        title: selectedProduct.title,
                        price: selectedProduct.price,
                        thumbnail: selectedProduct.thumbnail,
                        shopId: selectedProduct.shopId,
                        shopName: selectedProduct.shopName,
                    },
                },
                {
                    onSuccess: () => {
                        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                    },
                    onError: (error) => {
                        logger.chat.error('Failed to send product card', {
                            productId: selectedProduct.id,
                            error
                        });
                    },
                }
            );
            // Clear selection after consuming
            clearSelections();
        }
    }, [selectedProduct, pickerConvId, currentConvId, isGhostMode, sendProductCardMutation, clearSelections]);

    // Effect: Process selected order from picker page
    useEffect(() => {
        if (selectedOrder && pickerConvId === currentConvId && !isGhostMode) {
            const message = `Tôi muốn hỏi về đơn hàng: ${selectedOrder.orderNumber}`;
            sendOrderCardMutation.mutate(
                {
                    orderId: selectedOrder.orderId,
                    message: message,
                    orderInfo: {
                        orderCode: selectedOrder.orderNumber,
                        status: selectedOrder.status as OrderStatus,
                        totalAmount: selectedOrder.grandTotal,
                        items: selectedOrder.items.map(item => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                            image: item.imageUrl,
                        })),
                        shopId: selectedOrder.shopId,
                    },
                },
                {
                    onSuccess: () => {
                        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                    },
                    onError: (error) => {
                        logger.chat.error('Failed to send order card', {
                            orderId: selectedOrder.orderId,
                            error
                        });
                    },
                }
            );
            // Clear selection after consuming
            clearSelections();
        }
    }, [selectedOrder, pickerConvId, currentConvId, isGhostMode, sendOrderCardMutation, clearSelections]);

    // Quick replies based on context
    const quickReplies = useMemo(
        () => getQuickRepliesByContext(contextType),
        [contextType]
    );

    // ============================================
    // COMPUTED DATA
    // ============================================

    // Group messages by date and flatten for INVERTED list
    const flatListData: MessageListItem[] = useMemo(() => {
        if (!messages.length) return [];

        // Group by date, messages order: [newest → oldest] within each group
        const groups = groupMessagesByDate(messages);
        const items: MessageListItem[] = [];

        for (const group of groups) {
            for (const msg of group.messages) {
                items.push({
                    type: 'message',
                    data: msg,
                    id: msg.id,
                });
            }
            // Add date separator after messages (when inverted: appears above)
            items.push({
                type: 'date-separator',
                data: group.label,
                id: `date-${group.date}`,
            });
        }

        return items;
    }, [messages]);

    // Track if user is near bottom (for inverted list, bottom = offset near 0)
    const [isNearBottom, setIsNearBottom] = useState(true);
    const NEAR_BOTTOM_THRESHOLD = 150;
    // Track if user has scrolled (to prevent auto-fetch on initial render)
    const hasUserScrolledRef = useRef(false);

    useEffect(() => {
        if (flatListData.length > 0 && !isLoading) {
            const timer = setTimeout(() => {
                hasUserScrolledRef.current = true;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [flatListData.length, isLoading]);

    const handleScroll = useCallback((event: any) => {
        const { contentOffset } = event.nativeEvent;
        // For inverted list: offset 0 = bottom (newest messages)
        setIsNearBottom(contentOffset.y < NEAR_BOTTOM_THRESHOLD);
    }, []);

    // Auto scroll to bottom (offset 0) when keyboard opens (only if near bottom)
    // For inverted list: offset 0 = bottom (newest messages)
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            if (isNearBottom && flatListRef.current && flatListData.length > 0) {
                setTimeout(() => {
                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                }, 100);
            }
        });

        return () => {
            keyboardDidShowListener.remove();
        };
    }, [flatListData.length, isNearBottom]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleSendMessage = useCallback(
        (text: string) => {
            if (!text.trim() || isGhostMode) return;

            logger.chat.info('Sending message', { text: text.substring(0, 50) });

            sendMessageMutation.mutate(
                {
                    type: MessageType.TEXT,
                    content: text,
                },
                {
                    onSuccess: () => {
                        // Scroll to bottom (offset 0 for inverted list)
                        flatListRef.current?.scrollToOffset({
                            offset: 0,
                            animated: true,
                        });
                    },
                }
            );
        },
        [sendMessageMutation]
    );

    const handleQuickReply = useCallback(
        (reply: QuickReply) => {
            handleSendMessage(reply.text);
        },
        [handleSendMessage]
    );

    const handleMessagePress = useCallback((message: Message) => {
        if (message.type === 'ORDER_CARD' && message.metadata) {
            try {
                const data = JSON.parse(message.metadata);
                if (data.orderId) {
                    Navigator.push(orderRoutes.detail(data.orderId));
                }
            } catch (e) {
                logger.chat.error('Failed to parse order metadata for navigation', e);
            }
        } else if (message.type === 'PRODUCT_CARD' && message.metadata) {
            try {
                const data = JSON.parse(message.metadata);
                if (data.productId) {
                    Navigator.push(productRoutes.detail(data.productId));
                }
            } catch (e) {
                logger.chat.error('Failed to parse product metadata for navigation', e);
            }
        }
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && hasUserScrolledRef.current) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleContextDismiss = useCallback(() => {
        setContextType('NONE');
    }, []);
    const handleContextAction = useCallback(() => {
        if (contextType === 'PRODUCT' && productContext) {
            Navigator.push(productRoutes.detail(productContext.productId));
        } else if (contextType === 'ORDER' && orderContext) {
            logger.chat.info('Navigate to order', { orderId: orderContext.orderId });
            Navigator.push(orderRoutes.detail(orderContext.orderId));
        }
    }, [contextType, productContext, orderContext]);

    const handleOpenAttachment = useCallback(() => {
        Keyboard.dismiss();
        attachmentMenuRef.current?.present();
    }, []);

    /**
     * Handler when long press on message
     * Open MessageActionSheet with options: Copy, Recall, Delete
     */
    const handleMessageLongPress = useCallback((message: Message) => {
        const isMe = message.sender.userId === userId;
        messageActionSheetRef.current?.present(message, isMe);
    }, [userId]);


    /**
     * Handler when user selects recall or delete message
     */
    const handleRecallMessage = useCallback((messageId: string, deleteType: DeleteType) => {
        deleteMessageMutation.mutate(
            { messageId, deleteType },
            {
                onSuccess: () => {
                    logger.chat.info('Message recalled successfully', { messageId, deleteType });
                },
                onError: (error) => {
                    logger.chat.error('Failed to recall message', { messageId, error });
                },
            }
        );
    }, [deleteMessageMutation]);

    // Hook xử lý chọn ảnh/chụp ảnh
    const { pickMultipleImages, takePhoto, isProcessing: isImageProcessing } = useChatImagePicker();

    const handleSelectAttachmentOption = useCallback(async (type: 'image' | 'camera' | 'product' | 'order') => {
        attachmentMenuRef.current?.dismiss();
        logger.chat.info('Selected attachment option', { type });

        if (type === 'image') {
            const images = await pickMultipleImages(10);
            if (images.length > 0) {
                sendMediaMessageMutation.mutate({
                    files: images.map(img => ({
                        uri: img.uri,
                        fileName: img.fileName || `image_${Date.now()}.jpg`,
                        fileSize: img.fileSize,
                        mimeType: img.mimeType,
                        width: img.width,
                        height: img.height,
                    })),
                });
            }
        } else if (type === 'camera') {
            const photo = await takePhoto();
            if (photo) {
                sendMediaMessageMutation.mutate({
                    files: [{
                        uri: photo.uri,
                        fileName: photo.fileName || `photo_${Date.now()}.jpg`,
                        fileSize: photo.fileSize,
                        mimeType: photo.mimeType,
                        width: photo.width,
                        height: photo.height,
                    }],
                });
            }
        } else if (type === 'product') {
            Navigator.push(chatRoutes.selectProduct({
                shopId: partnerShopId || '',
                conversationId: currentConvId,
                shopName: partner?.name,
            }));
        } else if (type === 'order') {
            Navigator.push(chatRoutes.selectOrder({
                shopId: partnerShopId || '',
                conversationId: currentConvId,
            }));
        }
    }, [pickMultipleImages, takePhoto, partnerShopId, currentConvId, partner]);

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    const renderItem: ListRenderItem<MessageListItem> = useCallback(
        ({ item, index }) => {
            if (item.type === 'date-separator') {
                return <DateSeparator label={item.data as string} />;
            }

            const message = item.data as Message;
            const olderItem = flatListData[index - 1];
            const newerItem = flatListData[index + 1];

            const olderMessage = olderItem?.type === 'message' ? (olderItem.data as Message) : undefined;
            const newerMessage = newerItem?.type === 'message' ? (newerItem.data as Message) : undefined;
            const showAvatar = calculateShowAvatar(message, olderMessage, userId || '');
            const showTime = calculateShowTime(message, newerMessage);

            const position = calculateBubblePosition(message, olderMessage, newerMessage);

            return (
                <MessageItem
                    message={message}
                    currentUserId={userId || ''}
                    position={position}
                    showAvatar={showAvatar}
                    showTime={showTime}
                    onPress={handleMessagePress}
                    onLongPress={handleMessageLongPress}
                    onImagePress={handleImagePress}
                />
            );
        },
        [userId, flatListData, handleMessageLongPress, handleMessagePress, handleImagePress]
    );

    // Memoized keyExtractor to avoid recreating function on each render
    const keyExtractor = useCallback((item: MessageListItem) => item.id, []);

    const renderListHeader = useCallback(() => {
        // Show loading indicator when fetching older messages
        if (isFetchingNextPage) {
            return (
                <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            );
        }
        return null;
    }, [isFetchingNextPage, styles.loadingMore, theme.colors.primary]);

    const renderListFooter = useCallback(() => {
        return null;
    }, []);

    const renderEmptyComponent = useCallback(() => {
        if (isLoading || !isReady) {
            return <ChatDetailSkeleton count={8} />;
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{CHAT_STRINGS.detail.emptyMessages}</Text>
                <Text style={styles.emptySubtext}>
                    {CHAT_STRINGS.detail.emptySubtext}
                </Text>
            </View>
        );
    }, [isLoading, isReady, styles]);

    // ============================================
    // ERROR STATE
    // ============================================

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ChatDetailHeader partner={partner} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{CHAT_STRINGS.detail.cannotLoadMessages}</Text>
                    <Text style={styles.errorSubtext}>{error.message}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    // If there are messages in cache (from prefetch), render immediately without waiting for animation
    const messagesReady = !isLoading && messages.length > 0;
    const shouldShowList = isReady || messagesReady;

    return (
        <KeyboardProvider>
            <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
                {/* Header */}
                <ChatDetailHeader
                    partner={partner || {
                        id: params.shopUserId || '',
                        name: params.partnerName || CHAT_STRINGS.detail.ghostHeader,
                        avatar: params.partnerAvatar || undefined,
                        type: 'SHOP',
                        isOnline: params.partnerIsOnline === 'true',
                        isVerified: params.partnerIsVerified === 'true',
                        shopId: params.shopId,
                    }}
                />

                {/* Safety Banner */}
                <SafetyBanner />

                {/* Context Bar */}
                <ContextBar
                    type={contextType}
                    productData={productContext}
                    orderData={orderContext}
                    onDismiss={handleContextDismiss}
                    onAction={handleContextAction}
                />

                {/* Main content with keyboard avoidance */}
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior="padding"
                    keyboardVerticalOffset={0}
                >
                    {/* Messages List - INVERTED: newest at bottom, no scroll needed */}
                    {shouldShowList ? (
                        <>
                            {messages.length > 0 ? (
                                <FlatList
                                    ref={flatListRef}
                                    data={flatListData}
                                    renderItem={renderItem}
                                    keyExtractor={keyExtractor}
                                    inverted
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                    ListHeaderComponent={renderListFooter}
                                    ListFooterComponent={renderListHeader}
                                    onEndReached={handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    maintainVisibleContentPosition={{
                                        minIndexForVisible: 0,
                                        autoscrollToTopThreshold: 50,
                                    }}
                                    // Performance optimizations
                                    initialNumToRender={10}
                                    maxToRenderPerBatch={10}
                                    windowSize={10}
                                    updateCellsBatchingPeriod={30}
                                    removeClippedSubviews={false}
                                />
                            ) : (
                                renderEmptyComponent()
                            )}
                        </>
                    ) : (
                        <ChatDetailSkeleton count={10} />
                    )}

                    {/* Quick Replies - Now pinned to bottom above input */}
                    {quickReplies.length > 0 && (
                        <QuickReplyList
                            replies={quickReplies}
                            onReplyPress={handleQuickReply}
                        />
                    )}

                    {/* Input Area */}
                    <ChatInputArea
                        onSend={handleSendMessage}
                        onAttachment={handleOpenAttachment}
                        disabled={sendMessageMutation.isPending}
                    />
                </KeyboardAvoidingView>

                {/* Attachment Menu (Floating) */}
                <AttachmentMenu
                    ref={attachmentMenuRef}
                    onSelectOption={handleSelectAttachmentOption}
                />

                {/* Message Action Sheet (Long press menu) */}
                <MessageActionSheet
                    ref={messageActionSheetRef}
                    onRecallMessage={handleRecallMessage}
                />


                {/* Full Screen Image Viewer*/}
                <Modal
                    visible={viewerVisible}
                    transparent={true}
                    onRequestClose={() => setViewerVisible(false)}
                    animationType="fade"
                >
                    <View style={viewerStyles.container}>
                        <Gallery
                            data={chatImages}
                            keyExtractor={(item) => item.id}
                            initialIndex={viewerIndex}
                            onIndexChange={setViewerIndex}
                            onSwipeToClose={() => setViewerVisible(false)}
                            renderItem={({ item, setImageDimensions }: RenderItemInfo<{ uri: string; id: string }>) => (
                                <Image
                                    source={{ uri: item.uri }}
                                    style={viewerStyles.image}
                                    contentFit="contain"
                                    onLoad={(e) => {
                                        const { width, height } = e.source;
                                        setImageDimensions({ width, height });
                                    }}
                                />
                            )}
                        />
                        {/* Viewer Header with Close Button */}
                        <View style={[viewerStyles.header, { top: insets.top }]}>
                            <Pressable
                                style={viewerStyles.closeButton}
                                onPress={() => setViewerVisible(false)}
                            >
                                <IconSymbol name="close" size={24} color="#FFF" />
                            </Pressable>
                            <Text style={viewerStyles.headerText}>
                                {viewerIndex + 1} / {chatImages.length}
                            </Text>
                            <View style={{ width: 44 }} />
                        </View>
                    </View>
                    <StatusBar style="light" hidden />
                </Modal>
            </SafeAreaView>
        </KeyboardProvider>
    );
}

const viewerStyles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 10,
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}));

const stylesheet = StyleSheet.create((theme) => ({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    listFooter: {
        paddingVertical: theme.margins.sm,
    },
    loadingMore: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.xl,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.lg,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.error,
        marginBottom: theme.margins.sm,
    },
    errorSubtext: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
    },
}))
