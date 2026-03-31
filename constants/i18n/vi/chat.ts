import { ChatTranslation } from '../types';

export const CHAT_STRINGS: ChatTranslation = {
    list: {
        title: 'Tin nhắn',
        search: 'Tìm kiếm Shop, tin nhắn...',
        emptyTitle: 'Chưa có tin nhắn',
        emptySubtitle: 'Bắt đầu trò chuyện với Shop để được hỗ trợ về sản phẩm',
        filterAll: 'Tất cả',
        filterUnread: 'Chưa đọc',
        filterShop: 'Từ Shop',
        filterSupport: 'Hỗ trợ',
        actionPin: 'Ghim',
        actionUnpin: 'Bỏ ghim',
        actionMute: 'Tắt',
        actionUnmute: 'Bật',
        messageYou: 'Bạn: ',
        messageSentImage: 'Đã gửi một ảnh',
        messageProduct: 'Sản phẩm: {{name}}',
        responseRate: 'Phản hồi {{rate}}%',
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
    authRequired: {
        title: 'Đăng nhập để xem tin nhắn',
        login: 'Đăng nhập ngay',
    },
};
