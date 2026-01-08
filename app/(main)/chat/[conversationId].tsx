/**
 * ChatDetailScreen - Chat conversation detail view
 * Features:
 * - Inverted FlashList for messages
 * - Keyboard handling with react-native-keyboard-controller
 * - Sticky context bar (product/order)
 * - Quick replies
 * - Message grouping by date
 */

import {
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
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

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
    const flashListRef = useRef<FlashListRef<MessageListItem>>(null);
    const router = useRouter();

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

    // Group messages by date and flatten (Standard order: Oldest -> Newest)
    const flatListData: MessageListItem[] = useMemo(() => {
        if (!messages.length) return [];

        //  Reverse to get [Oldest -> Newest]
        const sortedMessages = [...messages].reverse();

        //  Group by date
        const groups = groupMessagesByDate(sortedMessages);
        const items: MessageListItem[] = [];

        //  Reverse groups to get chronological order (oldest date first)
        const chronGroups = [...groups].reverse();

        for (const group of chronGroups) {
            // Add date separator first
            items.push({
                type: 'date-separator',
                data: group.label,
                id: `date-${group.date}`,
            });

            // Add messages
            for (const msg of group.messages) {
                items.push({
                    type: 'message',
                    data: msg,
                    id: msg.id,
                });
            }
        }

        return items;
    }, [messages]);

    // Track if user is near bottom of the list
    const [isNearBottom, setIsNearBottom] = useState(true);
    const NEAR_BOTTOM_THRESHOLD = 150; // pixels from bottom

    const handleScroll = useCallback((event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
        setIsNearBottom(distanceFromBottom < NEAR_BOTTOM_THRESHOLD);
    }, []);

    // Auto scroll to bottom when keyboard opens (only if near bottom)
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            if (isNearBottom && flashListRef.current && flatListData.length > 0) {
                setTimeout(() => {
                    flashListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        });

        return () => {
            keyboardDidShowListener.remove();
        };
    }, [flatListData.length, isNearBottom]);

    // Scroll to end when messages first load
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    useEffect(() => {
        if (!hasScrolledToEnd && flatListData.length > 0 && !isLoading) {
            setTimeout(() => {
                flashListRef.current?.scrollToEnd({ animated: false });
                setHasScrolledToEnd(true);
            }, 50);
        }
    }, [flatListData.length, isLoading, hasScrolledToEnd]);

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
                        // Scroll to bottom
                        flashListRef.current?.scrollToOffset({
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

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleContextDismiss = useCallback(() => {
        setContextType('NONE');
    }, []);
    const handleContextAction = useCallback(() => {
        if (contextType === 'PRODUCT' && productContext) {
            logger.chat.info('Navigate to product', { productId: productContext.productId });
            router.push(productRoutes.detail(productContext.productId));
        } else if (contextType === 'ORDER' && orderContext) {
            logger.chat.info('Navigate to order', { orderId: orderContext.orderId });
            router.push(orderRoutes.detail(orderContext.orderId));
        }
    }, [contextType, productContext, orderContext, router]);

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
                />
            );
        },
        [userId, flatListData]
    );

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
                    {/* Messages List - Standard Order with auto-scroll to end */}
                    {shouldShowList ? (
                        <FlashList
                            ref={flashListRef}
                            data={flatListData}
                            renderItem={renderItem}
                            keyExtractor={(item: MessageListItem) => item.id}
                            onScroll={handleScroll}
                            scrollEventThrottle={100}
                            ListHeaderComponent={renderListHeader}
                            ListFooterComponent={renderListFooter}
                            ListEmptyComponent={renderEmptyComponent}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
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
                        disabled={sendMessageMutation.isPending}
                    />
                </KeyboardAvoidingView>
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
