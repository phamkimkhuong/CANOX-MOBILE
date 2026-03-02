import { CartTranslation } from '../types';

export const CART_STRINGS: CartTranslation = {
    header: {
        title: 'Giỏ hàng',
        edit: 'Chỉnh sửa',
        done: 'Xong',
        viewShop: 'Xem shop {{shopName}}',
    },
    empty: {
        title: 'Giỏ hàng trống',
        subtitle: 'Hãy thêm sản phẩm vào giỏ hàng nhé!',
        shopNow: 'MUA SẮM NGAY',
    },
    authRequired: {
        title: 'Giỏ hàng của bạn đang trống',
        login: 'Đăng nhập ngay',
    },
    footer: {
        selectAll: 'Tất cả',
        total: 'Tổng thanh toán',
        checkout: 'Mua hàng',
        savings: 'Tiết kiệm {{amount}}',
        checkoutWithCount: 'Mua hàng ({{count}})',
        moveToWishlist: 'Lưu vào Yêu thích',
        deleteSelected: 'Xóa',
    },
    confirmations: {
        deleteSelected: {
            title: 'Xóa sản phẩm',
            message: 'Bạn có chắc chắn muốn xóa {{count}} sản phẩm đã chọn?',
        },
    },
    item: {
        variation: 'Phân loại',
        delete: 'Xóa',
        outOfStock: 'Hết hàng',
        findSimilar: 'Tìm SP tương tự',
        selectVariation: 'Chọn phân loại hàng',
        unsupportedRegion: 'Không hỗ trợ giao đến {{location}}.',
    },
    status: {
        syncing: 'Đang cập nhật giá mới nhất...',
        rebuySuccess: 'Mua lại thành công',
        rebuySuccessDetail: 'Sản phẩm đã được thêm vào giỏ hàng của bạn',
        addSuccess: 'Đã thêm vào giỏ hàng',
        addFailed: 'Thêm vào giỏ thất bại',
    },
    error: {
        loadFailed: 'Không thể tải giỏ hàng',
        tryAgainLater: 'Vui lòng thử lại sau',
        retryButton: 'Thử lại',
    },
};
