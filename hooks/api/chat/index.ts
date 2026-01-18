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
    chatMessagesQueryKeys,
    useAddMessageToCache,
    useChatMessages,
    useDeleteMessage,
    useMarkMessagesAsRead,
    useSendMessage,
    useSendOrderCard,
    useSendProductCard
} from './useChatMessages';
export type { DeleteType } from './useChatMessages';
export { useSendMediaMessage } from './useSendMediaMessage';
export type { ChatMediaFile } from './useSendMediaMessage';

