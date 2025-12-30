/**
 * Product Detail i18n strings
 * 
 * Tách các hardcoded strings ra để dễ dàng implement i18n trong tương lai
 * Hiện tại sử dụng tiếng Việt làm ngôn ngữ mặc định
 * 
 * Khi implement i18n, chỉ cần thay đổi file này hoặc wrap bằng i18n library
 * 
 * @example
 * ```tsx
 * import { PRODUCT_STRINGS } from '@/constants/strings.product';
 * 
 * <Text>{PRODUCT_STRINGS.description.title}</Text>
 * ```
 */

import { ProductTranslation } from '../types';

export const PRODUCT_STRINGS: ProductTranslation = {
    // === Product Description ===
    description: {
        title: 'Mô tả sản phẩm',
        empty: 'Chưa có mô tả',
        viewMore: 'Xem thêm',
        collapse: 'Thu gọn',
    },

    // === Product Specs ===
    specs: {
        title: 'Thông tin chi tiết',
        viewMore: 'Xem chi tiết',
        collapse: 'Thu gọn',
    },

    // === Variant Selector ===
    variant: {
        label: 'Phân loại',
        placeholder: 'Chọn phân loại',
        confirm: 'Xác nhận',
        stock: 'Kho',
    },

    // === Sticky Bottom Bar ===
    bottomBar: {
        chat: 'Chat',
        shop: 'Shop',
        addToCart: 'Thêm vào giỏ',
        buyNow: 'Mua ngay',
        outOfStock: 'Hết hàng',
        selectVariant: 'Chọn phân loại',
    },

    // === Shop Info ===
    shop: {
        rating: 'Đánh giá',
        responseRate: 'Tỉ lệ phản hồi',
        responseTime: 'Thời gian phản hồi',
        products: 'Sản phẩm',
        viewShop: 'Xem Shop',
        defaultResponseTime: 'Vài phút',
        online: 'Online',
    },

    // === Product Info ===
    info: {
        reviews: 'Đánh giá',
        sold: 'Đã bán',
        discount: 'Giảm',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'FLASH SALE',
        endsIn: 'Kết thúc trong',
        soldOut: 'Sắp hết hàng',
        selling: 'Đang bán chạy',
        soldPrefix: 'Đã bán',
    },

    // === Reviews ===
    reviews: {
        title: 'Đánh giá sản phẩm',
        viewAll: 'Xem tất cả',
        noReviews: 'Chưa có đánh giá',
        beFirst: 'Hãy là người đầu tiên đánh giá sản phẩm này',
        reviewCount: 'đánh giá',
        filterAll: 'Tất cả',
        filter5Star: '5 Sao',
        filterWithMedia: 'Có Hình ảnh',
        qna: 'Hỏi đáp về sản phẩm',
        askQuestion: 'Đặt câu hỏi',
        questions: 'câu hỏi',
        newest: 'Mới nhất',
        viewAllReviews: 'Xem tất cả đánh giá để biết thêm chi tiết về sản phẩm',
    },

    // === Gallery ===
    gallery: {
        noImages: 'Không có hình ảnh',
    },

    // === Error States ===
    error: {
        loadFailed: 'Không thể tải sản phẩm',
        generic: 'Đã có lỗi xảy ra',
        retry: 'Thử lại',
        notFound: 'Không tìm thấy sản phẩm',
        notFoundDetail: 'Sản phẩm này hiện tại không khả dụng hoặc đã bị gỡ bỏ.',
        home: 'Trang chủ',
    },

    // === Navigation ===
    navigation: {
        title: 'Chi tiết sản phẩm',
    },
    related: {
        title: 'Có thể bạn cũng thích',
    },

    // === Badges ===
    badges: {
        mall: 'Mall',
        international: 'Quốc tế',
    },
} as const;

// Type-safe key extraction
export type ProductStringKeys = typeof PRODUCT_STRINGS;

