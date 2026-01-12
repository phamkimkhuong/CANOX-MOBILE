import { ChatTranslation } from '../types';

export const CHAT_STRINGS: ChatTranslation = {
    list: {
        title: 'Chat',
        search: 'Tìm kiếm tin nhắn...',
        empty: 'Chưa có cuộc hội thoại nào',
    },
    detail: {
        loadingMessages: 'Đang tải tin nhắn...',
        cannotLoadMessages: 'Không thể tải tin nhắn',
        emptyMessages: 'Chưa có tin nhắn nào',
        emptySubtext: 'Hãy bắt đầu cuộc trò chuyện với shop ngay nhé!',
        sendPlaceholder: 'Nhập tin nhắn...',
        ghostHeader: 'Shop',
    },
    error: {
        startChatFailed: 'Lỗi khi bắt đầu cuộc trò chuyện',
        tryAgainLater: 'Vui lòng thử lại sau',
        missingShopInfo: 'Thiếu thông tin shop để bắt đầu chat',
        chatWithSelf: 'Không thể chat với chính mình',
    },
};
