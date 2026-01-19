import { ChatTranslation } from '../types';

export const CHAT_STRINGS: ChatTranslation = {
    list: {
        title: 'Messages',
        search: 'Search shops, messages...',
        emptyTitle: 'No messages yet',
        emptySubtitle: 'Start a conversation with shops for product support',
        filterAll: 'All',
        filterUnread: 'Unread',
        filterShop: 'From Shop',
        filterSupport: 'Support',
        actionPin: 'Pin',
        actionUnpin: 'Unpin',
        actionMute: 'Mute',
        actionUnmute: 'Unmute',
        messageYou: 'You: ',
        messageSentImage: 'Sent an image',
        messageProduct: 'Product: {{name}}',
        responseRate: 'Response rate {{rate}}%',
    },
    promo: {
        title: '50% Off International Shipping',
        subtitle: 'Upcoming 11.11 Event!',
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
