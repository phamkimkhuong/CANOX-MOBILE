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
};
