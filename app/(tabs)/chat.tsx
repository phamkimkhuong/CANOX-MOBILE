import {
    ChatEmptyState,
    ChatHeader,
    ChatSkeleton,
    ConversationItem,
    PromoBanner,
} from '@/components/chat';
import { chatRoutes } from '@/constants/routes';
import { useChatList, useConversationActions, useRefreshChatList } from '@/hooks/api/chat/useChatList';
import { useChatSocket } from '@/hooks/api/useChatSocket';
import { useDebounce } from '@/hooks/useDebounce';
import { ChatFilter, Conversation } from '@/types/chat';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/** Debounce delay for search input (ms) */
const SEARCH_DEBOUNCE_MS = 300;

export default function ChatScreen() {
    const { theme } = useUnistyles();
    const { t } = useTranslation('chat');
    const styles = stylesheet;

    const [activeFilter, setActiveFilter] = useState<ChatFilter>(ChatFilter.ALL);
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search query to avoid excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

    // Track which row is currently swiped open (mutual exclusion)
    const [openedRowId, setOpenedRowId] = useState<string | null>(null);

    // Flag to stop render UI nặng cho đến khi kết thúc chuyển màn hình
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handle = requestIdleCallback(() => {
            setIsReady(true);
        }, { timeout: 500 });

        return () => cancelIdleCallback(handle);
    }, []);

    const {
        conversations,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useChatList(activeFilter, debouncedSearchQuery);

    // Smart refresh: only fetch page 0 instead of all loaded pages
    const { refresh: smartRefresh } = useRefreshChatList();
    // Initialize socket connection for realtime updates
    useChatSocket();

    const { pinConversation, muteConversation, deleteConversation } = useConversationActions();

    const handleFilterChange = useCallback((filter: ChatFilter) => {
        setActiveFilter(filter);
        // Close any open swipe when changing filter
        setOpenedRowId(null);
    }, []);

    const handleConversationPress = useCallback((item: Conversation) => {
        // Close any open swipe on press
        setOpenedRowId(null);
        Navigator.push(chatRoutes.detail(item.id, {
            partnerName: item.partner.name,
            partnerAvatar: item.partner.avatar,
            partnerIsOnline: item.partner.isOnline ? 'true' : 'false',
            partnerIsVerified: item.partner.isVerified ? 'true' : 'false',
            shopId: item.shopId,
        }));
    }, []);

    const handleSwipeOpen = useCallback((id: string | null) => {
        setOpenedRowId(id);
    }, []);

    const handlePin = useCallback(
        (item: Conversation) => {
            // Toggle pin state
            pinConversation.mutate({
                conversationId: item.id,
                isPinned: !item.isPinned,
            });
        },
        [pinConversation]
    );

    const handleMute = useCallback(
        (item: Conversation) => {
            // Toggle mute state
            muteConversation.mutate({
                conversationId: item.id,
                isMuted: !item.isMuted,
            });
        },
        [muteConversation]
    );

    const handleDelete = useCallback(
        (item: Conversation) => {
            deleteConversation.mutate(item.id);
        },
        [deleteConversation]
    );

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderItem = useCallback(
        ({ item }: { item: Conversation }) => (
            <ConversationItem
                item={item}
                openedRowId={openedRowId}
                onSwipeOpen={handleSwipeOpen}
                onPress={handleConversationPress}
                onPin={handlePin}
                onMute={handleMute}
                onDelete={handleDelete}
            />
        ),
        [handleConversationPress, handlePin, handleMute, handleDelete, handleSwipeOpen]
    );

    const renderHeader = useCallback(
        () => (
            <PromoBanner
                subtitle={t('promo.subtitle')}
                title={t('promo.title')}
                icon="shipping"
            />
        ),
        [t]
    );

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.colors.buttonActive} />
            </View>
        );
    }, [isFetchingNextPage, styles.loadingFooter, theme.colors.primary]);

    const renderEmpty = useCallback(() => <ChatEmptyState />, []);

    // Show skeleton on initial load or during transition
    if (isLoading || !isReady) {
        return (
            <View style={styles.container}>
                <ChatHeader
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <ChatSkeleton count={8} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <ChatHeader
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <FlashList
                data={conversations}
                extraData={openedRowId}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isLoading}
                        onRefresh={smartRefresh}
                        tintColor={theme.colors.buttonActive}
                        colors={[theme.colors.buttonActive]}
                    />
                }
                contentContainerStyle={styles.listContent}
            />
        </GestureHandlerRootView>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingBottom: theme.margins.lg,
    },
    loadingFooter: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
}));
