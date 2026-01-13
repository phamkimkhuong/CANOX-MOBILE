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
    MessageItem,
    QuickReplyList,
    SafetyBanner,
} from '@/components/chat/detail';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { orderRoutes, productRoutes } from '@/constants/routes';
import { CONVERSATIONS_QUERY_KEY, useChatMessages, useMarkMessagesAsRead, useSendMessage } from '@/hooks/api/chat';
import { useChatImagePicker } from '@/hooks/api/chat/useChatImagePicker';
import { buildChatWithShopRequest, useCreateConversation } from '@/hooks/api/chat/useCreateConversation';
import { useAuthStore } from '@/store/useAuthStore';
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
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, ListRenderItem, Text, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    // State management for conversationId
    const [currentConvId, setCurrentConvId] = useState<string>(params.conversationId);
    const isGhostMode = currentConvId.startsWith('ghost_');
    const userId = useAuthStore((s) => s.userId);
    const myShopId = useAuthStore((s) => s.shopId);

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
            };
        }

        //  Fallback: try to find partner info from messages
        const otherMessage = messages.find((m) => m.sender.userId !== userId);
        if (otherMessage) {
            return {
                id: otherMessage.sender.userId,
                name: otherMessage.sender.displayName,
                avatar: otherMessage.sender.avatar || otherMessage.sender.shopLogo,
                isOnline: false,
                isVerified: false,
                type: 'SHOP', // Partner side is usually a shop in this app
            };
        }

        return null;
    }, [params, messages, userId]);

    const sendMessageMutation = useSendMessage(currentConvId);
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

    // Hook xử lý chọn ảnh/chụp ảnh
    const { pickImage, takePhoto, isProcessing: isImageProcessing } = useChatImagePicker();

    const handleSelectAttachmentOption = useCallback(async (type: 'image' | 'camera' | 'product') => {
        attachmentMenuRef.current?.dismiss();
        logger.chat.info('Selected attachment option', { type });

        if (type === 'image') {
            const image = await pickImage();
            if (image) {
                // TODO: Upload ảnh lên server và gửi message với image URL
                logger.chat.info('Image selected for sending', {
                    fileName: image.fileName,
                    size: image.fileSize,
                    dimensions: `${image.width}x${image.height}`,
                });
                // Placeholder: Hiển thị thông báo thành công
                handleSendMessage(`[Ảnh đã chọn: ${image.fileName}]`);
            }
        } else if (type === 'camera') {
            const photo = await takePhoto();
            if (photo) {
                // TODO: Upload ảnh lên server và gửi message với image URL
                logger.chat.info('Photo captured for sending', {
                    fileName: photo.fileName,
                    size: photo.fileSize,
                    dimensions: `${photo.width}x${photo.height}`,
                });
                // Placeholder: Hiển thị thông báo thành công
                handleSendMessage(`[Ảnh đã chụp: ${photo.fileName}]`);
            }
        } else if (type === 'product' && productContext) {
            handleSendMessage(`Sản phẩm: ${productContext.name} - ${productContext.price}đ`);
        }
    }, [pickImage, takePhoto, productContext, handleSendMessage]);

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    const renderItem: ListRenderItem<MessageListItem> = useCallback(
        ({ item, index }) => {
            if (item.type === 'date-separator') {
                return <DateSeparator label={item.data as string} />;
            }

            const message = item.data as Message;

            // In a standard list:
            // - Index - 1 is OLDER (visually above)
            // - Index + 1 is NEWER (visually below)
            const olderItem = flatListData[index - 1];
            const newerItem = flatListData[index + 1];

            const olderMessage = olderItem?.type === 'message' ? (olderItem.data as Message) : undefined;
            const newerMessage = newerItem?.type === 'message' ? (newerItem.data as Message) : undefined;

            // Avatar: Show on the FIRST message of a group (top)
            const showAvatar = calculateShowAvatar(message, olderMessage, userId || '');

            // Time: Show on the LAST message of a group (bottom)
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
                />
            );
        },
        [userId, flatListData]
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
                            ListEmptyComponent={renderEmptyComponent}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                                autoscrollToTopThreshold: 50,
                            }}
                            // Performance optimizations for instant load
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            updateCellsBatchingPeriod={30}
                            removeClippedSubviews={false}
                        />
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
            </SafeAreaView>
        </KeyboardProvider>
    );
}

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
        paddingVertical: theme.margins.xl * 2,
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
