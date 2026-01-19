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
    footer: {
        selectAll: 'Tất cả',
        total: 'Tổng thanh toán',
        checkout: 'Mua hàng',
        savings: 'Tiết kiệm {{amount}}',
        checkoutWithCount: 'Mua hàng ({{count}})',
    },
    item: {
        variation: 'Phân loại',
        delete: 'Xóa',
        outOfStock: 'Hết hàng',
        findSimilar: 'Tìm SP tương tự',
        selectVariation: 'Chọn phân loại hàng',
    },
    status: {
        syncing: 'Đang cập nhật giá mới nhất...',
        rebuySuccess: 'Mua lại thành công',
        rebuySuccessDetail: 'Sản phẩm đã được thêm vào giỏ hàng của bạn',
    },
    error: {
        loadFailed: 'Không thể tải giỏ hàng',
        tryAgainLater: 'Vui lòng thử lại sau',
        retryButton: 'Thử lại',
    },
};
