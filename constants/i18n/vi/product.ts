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
        addToCart: 'Thêm vào giỏ',
        buyNow: 'Mua ngay',
        stock: 'Kho',
        quantity: 'Số lượng',
        flashSaleBadge: 'Flash Sale',
        flashSaleCandidateBadge: 'Có giá flash sale',
        promoBadge: 'Ưu đãi',
        promoCandidateBadge: 'Có ưu đãi',
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
        soldCountTemplate: 'Đã bán {{soldCount}}',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'FLASH SALE',
        soldOut: 'Sắp hết hàng',
        selling: 'Đang bán chạy',
        soldPrefix: 'Đã bán',
        variantScopeHint: 'Flash Sale áp dụng cho một số phân loại',
        campaigns: {
            flashSale: 'FLASH SALE',
            megaSale: 'MEGA SALE',
            dailyDeal: '🎁 DEAL HÀNG NGÀY',
            shopSale: 'SHOP SALE',
            shopPromotion: 'SHOP PROMOTION',
        },
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
        newest: 'Mới nhất',
        viewAllReviews: 'Xem tất cả đánh giá để biết thêm chi tiết về sản phẩm',
        loading: 'Đang tải đánh giá...',
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
        authRequiredTitle: 'Yêu cầu đăng nhập',
        authRequiredChat: 'Vui lòng đăng nhập để bắt đầu trò chuyện',
        authRequiredCart: 'Vui lòng đăng nhập để thêm vào giỏ hàng',
        authRequiredBuyNow: 'Vui lòng đăng nhập để tiếp tục mua hàng',
        authRequiredGeneric: 'Vui lòng đăng nhập để thực hiện hành động này',
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
        international: 'Hàng quốc tế',
    },
    shipping: {
        title: 'Địa chỉ nhận hàng',
        addressRequired: 'Chọn địa chỉ để kiểm tra khả năng giao hàng',
        internationalOnly: 'Sản phẩm này chỉ hỗ trợ giao hàng quốc tế. Hãy đổi sang địa chỉ quốc tế.',
        domesticOnly: 'Sản phẩm này chỉ hỗ trợ giao hàng nội địa. Hãy đổi sang địa chỉ nội địa.',
    },
    share: {
        msgTemplate: 'Xem sản phẩm này trên Calatha: {{name}}\n{{url}}',
    },
    report: {
        title: 'Báo cáo sản phẩm',
        success: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sản phẩm này sớm nhất có thể.',
        reasons: {
            fake: 'Hàng giả, hàng nhái',
            prohibited: 'Sản phẩm bị cấm kinh doanh',
            offensive: 'Hình ảnh, nội dung phản cảm',
            scam: 'Có dấu hiệu lừa đảo',
            misleading: 'Thông tin sản phẩm sai lệch',
            other: 'Lý do khác',
        },
    },
    priceBreakdown: {
        title: 'Chi tiết giá',
        basePrice: 'Giá sản phẩm',
        productDiscount: 'Giảm giá sản phẩm',
        shopVoucher: 'Voucher người bán',
        platformVoucher: 'Voucher CanoX',
        finalSubtotal: 'Giá tạm tính',
        legalNote: '* Giá cuối cùng có thể thay đổi tùy thuộc vào phí vận chuyển và các ưu đãi khác khi thanh toán.',
        afterVoucher: 'Giá sau voucher',
    },
    // === Wishlist Notices in Card ===
    wishlist: {
        targetPrice: 'Mục tiêu',
        setupTargetPrice: 'Cài giá săn (Ấn giữ)',
        hasNotes: 'Có ghi chú',
    },
    // === Packaging Info ===
    packaging: {
        title: 'Quy cách đóng gói',
        dimensions: 'Kích thước',
        weight: 'Trọng lượng',
    },
} as const;

// Type-safe key extraction
export type ProductStringKeys = typeof PRODUCT_STRINGS;

