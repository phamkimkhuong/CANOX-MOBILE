import { CommonTranslation } from '../types';

export const COMMON_STRINGS: CommonTranslation = {
    actions: {
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        back: 'Quay lại',
        save: 'Lưu',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        add: 'Thêm',
        done: 'Xong',
        next: 'Tiếp theo',
        retry: 'Thử lại',
        copy: 'Sao chép',
        viewNow: 'Xem ngay',
        seeAll: 'Xem tất cả',
        seeMore: 'Xem thêm',
        yes: 'Có',
        no: 'Không',
        quantityTemplate: 'x{{count}}'
    },
    status: {
        loading: 'Đang tải...',
        success: 'Thành công',
        error: 'Đã xảy ra lỗi',
        empty: 'Không có dữ liệu',
        verified: 'Đã xác thực',
        unverified: 'Chưa xác thực',
    },
    bottomTab: {
        home: 'Trang chủ',
        wishlist: 'Yêu thích',
        category: 'Danh mục',
        video: 'Video',
        chat: 'Chat',
        notify: 'Thông báo',
        me: 'Tôi',
    },
    popup: {
        skipToday: 'Không hiện lại hôm nay',
    },
    maintenance: {
        title: 'Hệ thống đang bảo trì',
        description: 'Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau ít phút.',
        retryButton: 'Thử lại ngay',
        contactSupport: 'Liên hệ hỗ trợ',
        support: '@TCANO E-Commerce Support',
    },
    update: {
        forceTitle: 'Cần cập nhật ứng dụng',
        forceDescription: 'Phiên bản bạn đang dùng đã quá cũ và không còn được hỗ trợ. Vui lòng cập nhật để tiếp tục sử dụng.',
        softTitle: 'Phiên bản mới đã có!',
        softDescription: 'Cập nhật ngay để trải nghiệm những tính năng mới và cải thiện hiệu suất.',
        updateNow: 'Cập nhật ngay',
        later: 'Để sau',
    },
    crash: {
        debugTitle: 'Chi tiết debug',
        scope: {
            app: 'Ứng dụng',
            group: 'Khu vực',
            screen: 'Màn hình',
            section: 'Nội dung',
        },
        app: {
            title: 'Ứng dụng tạm thời gặp lỗi',
            message: 'Không thể dựng giao diện ứng dụng ngay lúc này. Vui lòng thử lại để app render lại.',
        },
        tabs: {
            title: 'Khu vực tab tạm thời gặp lỗi',
            message: 'Không thể hiển thị khu vực chính của ứng dụng ngay lúc này. Vui lòng thử lại.',
        },
        main: {
            title: 'Khu vực điều hướng tạm thời gặp lỗi',
            message: 'Không thể hiển thị màn hình vừa mở ngay lúc này. Vui lòng thử lại để khôi phục khu vực này.',
        },
        auth: {
            title: 'Khu vực đăng nhập tạm thời gặp lỗi',
            message: 'Không thể hiển thị màn hình đăng nhập ngay lúc này. Vui lòng thử lại sau ít giây.',
        },
        home: {
            title: 'Trang chủ tạm thời gặp lỗi',
            message: 'Không thể hiển thị nội dung trang chủ ngay lúc này. Vui lòng thử lại để app render lại màn hình này.',
        },
        cart: {
            title: 'Giỏ hàng tạm thời gặp lỗi',
            message: 'Không thể hiển thị giỏ hàng ngay lúc này. Vui lòng thử lại để khôi phục màn hình này.',
        },
        checkout: {
            title: 'Thanh toán tạm thời gặp lỗi',
            message: 'Không thể hiển thị màn thanh toán ngay lúc này. Vui lòng thử lại để khôi phục phiên checkout.',
        },
        productDetail: {
            title: 'Trang sản phẩm tạm thời gặp lỗi',
            message: 'Không thể hiển thị chi tiết sản phẩm ngay lúc này. Vui lòng thử lại để render lại màn hình này.',
        },
        orderDetail: {
            title: 'Chi tiết đơn hàng tạm thời gặp lỗi',
            message: 'Không thể hiển thị chi tiết đơn hàng ngay lúc này. Vui lòng thử lại để app render lại màn hình này.',
        },
        chatDetail: {
            title: 'Trò chuyện tạm thời gặp lỗi',
            message: 'Không thể hiển thị màn trò chuyện ngay lúc này. Vui lòng thử lại để khôi phục màn hình này.',
        },
        section: {
            title: 'Lỗi hiển thị',
            message: 'Đã xảy ra lỗi khi hiển thị dữ liệu. Vui lòng thử lại.',
        },
    },
    sectionState: {
        secondaryDataError: {
            title: 'Chưa tải được phần này',
            message: 'Dữ liệu phụ đang tạm gián đoạn. Các nội dung chính vẫn có thể sử dụng bình thường.',
            actionLabel: 'Tải lại',
        },
        backgroundError: {
            title: 'Đang hiển thị dữ liệu gần nhất',
            message: 'Lần cập nhật mới chưa thành công. Bạn vẫn có thể tiếp tục với dữ liệu hiện có.',
            actionLabel: 'Cập nhật lại',
        },
        businessGuidance: {
            title: 'Chưa sẵn sàng',
            message: 'Trạng thái hiện tại chưa đáp ứng điều kiện để thực hiện thao tác này.',
            actionLabel: 'Xem hướng dẫn',
        },
        empty: {
            title: 'Chưa có nội dung',
            message: 'Phần này hiện chưa có dữ liệu để hiển thị.',
            actionLabel: 'Tải lại',
        },
        unavailable: {
            title: 'Tạm thời chưa khả dụng',
            message: 'Phần này chưa thể hiển thị ngay lúc này. Các nội dung khác vẫn hoạt động bình thường.',
            actionLabel: 'Thử lại',
        },
    },
    stateView: {
        network: {
            title: 'Mất kết nối mạng',
            message: 'Vui lòng kiểm tra kết nối internet và thử lại.',
            actionLabel: 'Thử lại',
        },
        server: {
            title: 'Lỗi hệ thống',
            message: 'Đã có lỗi xảy ra, chúng tôi đang khắc phục. Vui lòng thử lại sau.',
            actionLabel: 'Thử lại',
        },
        notFound: {
            title: 'Không tìm thấy',
            message: 'Dữ liệu không tồn tại hoặc đã bị xóa.',
            actionLabel: 'Quay lại',
        },
        empty: {
            title: 'Chưa có dữ liệu',
            message: 'Danh sách đang trống.',
            actionLabel: 'Tải lại',
        },
        forbidden: {
            title: 'Không có quyền truy cập',
            message: 'Bạn không có quyền xem nội dung này.',
            actionLabel: 'Quay lại',
        },
        actions: {
            home: 'Về trang chủ',
            errorCode: 'Mã lỗi: {{code}}',
        },
    },
};
