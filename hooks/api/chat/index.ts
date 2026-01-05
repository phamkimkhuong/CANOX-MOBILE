/**
 * ==============================================
 * CHAT HOOKS - Barrel Export
 * ==============================================
 */

// Unread message count for badge
export { CHAT_QUERY_KEYS, useUnreadMessageCount } from './useUnreadMessages';
// Chat list (conversations)
export {
    CONVERSATIONS_QUERY_KEY,
    useChatList,
    useConversationActions
} from './useChatList';

// Chat messages (detail view)
export {
    chatMessagesQueryKeys, useAddMessageToCache, useChatMessages, useMarkMessagesAsRead, useSendMessage
} from './useChatMessages';
