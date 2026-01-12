import { ChatTranslation } from '../types';

export const CHAT_STRINGS: ChatTranslation = {
    list: {
        title: 'Chat',
        search: 'Search messages...',
        empty: 'No conversations yet',
    },
    detail: {
        loadingMessages: 'Loading messages...',
        cannotLoadMessages: 'Could not load messages',
        emptyMessages: 'No messages yet',
        emptySubtext: 'Start a conversation with the shop now!',
        sendPlaceholder: 'Type a message...',
        ghostHeader: 'Shop',
    },
    error: {
        startChatFailed: 'Failed to start conversation',
        tryAgainLater: 'Please try again later',
        missingShopInfo: 'Missing shop information',
        chatWithSelf: 'Cannot chat with yourself',
    },
};
