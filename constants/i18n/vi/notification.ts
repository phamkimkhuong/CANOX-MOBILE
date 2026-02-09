import { NotificationTranslation } from '../types';

export const NOTIFICATION_STRINGS: NotificationTranslation = {
    header: {
        title: 'Thông báo',
        markAllRead: 'Đánh dấu đã đọc tất cả',
    },
    filters: {
        all: 'Tất cả',
        order: 'Đơn hàng',
        promo: 'Khuyến mãi',
        product: 'Sản phẩm',
        shipping: 'Vận chuyển',
        wallet: 'Ví & Dịch vụ',
        system: 'Hệ thống',
    },
    empty: {
        title: 'Chưa có thông báo',
        subtitle: 'Bạn sẽ nhận được thông báo về đơn hàng và chương trình khuyến mãi tại đây',
        subtitleWithFilter: 'Bạn chưa có thông báo nào trong mục "{{filter}}"',
    },
    sections: {
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        thisWeek: 'Tuần này',
        earlier: 'Trước đó',
    },
    errors: {
        markAllAsReadFailed: 'Đánh dấu tất cả đã đọc thất bại',
        tryAgain: 'Vui lòng thử lại.',
    },
    actions: {
        markAllAsReadTitle: 'Đánh dấu đã đọc',
        markAllAsReadMessage: 'Bạn có muốn đánh dấu tất cả thông báo là đã đọc không?',
    },
    settings: {
        title: 'Cài đặt thông báo',
        systemDisabled: {
            title: 'Thông báo đang bị tắt',
            description: 'Bạn cần cho phép trong cài đặt điện thoại để nhận thông báo đơn hàng.',
            action: 'Mở Cài đặt máy',
        },
        groups: {
            transaction: {
                title: 'Giao dịch & Cá nhân',
                order: {
                    title: 'Cập nhật đơn hàng',
                    description: 'Thông báo khi trạng thái đơn hàng thay đổi, shipper bắt đầu giao hàng.',
                },
                chat: {
                    title: 'Tin nhắn mới',
                    description: 'Nhận thông báo khi có tin nhắn từ Shop hoặc hỗ trợ khách hàng.',
                },
            },
            promotion: {
                title: 'Khuyến mãi & Tin tức',
                deals: {
                    title: 'Khuyến mãi & Ưu đãi',
                    description: 'Các chương trình Flash Sale, Voucher độc quyền và quà tặng mỗi ngày.',
                },
                news: {
                    title: 'Tin tức CanoX',
                    description: 'Khám phá các tính năng mới, mẹo mua sắm và cập nhật từ cộng đồng CanoX.',
                },
            },
            advanced: {
                title: 'Nâng cao',
                systemSettings: 'Cài đặt thông báo trên điện thoại',
            },
        },
        messages: {
            enableSuccess: 'Đã bật thông báo {{topic}}',
            disableSuccess: 'Đã tắt thông báo {{topic}}',
            updateError: 'Không thể cập nhật cấu hình',
            featureDeveloping: 'Tính năng đang phát triển',
        },
    },
    softAsk: {
        title: 'Theo dõi đơn hàng',
        description: 'Bạn có muốn nhận thông báo ngay khi trạng thái đơn hàng thay đổi và khi shipper bắt đầu giao hàng không?',
        accept: 'Đồng ý',
        later: 'Để sau',
    },
    authRequired: {
        title: 'Đăng nhập để xem thông báo',
        login: 'Đăng nhập ngay',
    },
};
