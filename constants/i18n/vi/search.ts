/**
 * ==============================================
 * SEARCH TRANSLATIONS - Vietnamese
 * ==============================================
 */

import type { SearchTranslation } from '../types';

export const SEARCH_STRINGS: SearchTranslation = {
    header: {
        placeholder: 'Bạn đang tìm gì hôm nay?',
        placeholderTyping: 'Tìm kiếm sản phẩm, shop...',
        cancel: 'Hủy',
    },
    recent: {
        title: 'Tìm kiếm gần đây',
        clearAll: 'Xóa tất cả',
        empty: 'Chưa có lịch sử tìm kiếm',
    },
    hot: {
        title: 'Xu hướng tìm kiếm',
        badge: 'HOT',
    },
    suggestions: {
        searchIn: 'Tìm trong',
        shopPrefix: 'Shop',
        categoryPrefix: 'Danh mục',
        noResults: 'Không tìm thấy gợi ý',
    },
    actions: {
        search: 'Tìm',
        searchByImage: 'Tìm bằng hình ảnh',
        searchByVoice: 'Tìm bằng giọng nói',
    },
    error: {
        loadFailed: 'Không thể tải dữ liệu. Vui lòng thử lại.',
    },
    // Search Results Screen
    results: {
        title: 'Kết quả tìm kiếm',
        count: '{{count}} sản phẩm',
        countPlural: '{{count}} sản phẩm',
        filter: 'Lọc',
        filterCount: 'Lọc ({{count}})',
    },
    sort: {
        relevance: 'Liên quan',
        newest: 'Mới nhất',
        bestSelling: 'Bán chạy',
        price: 'Giá',
        priceAsc: 'Giá tăng',
        priceDesc: 'Giá giảm',
    },
    quickFilter: {
        freeship: 'Freeship',
        express: 'Hỏa tốc',
        rating4Plus: '4 sao+',
        mall: 'Mall',
        voucher: 'Có voucher',
    },
    filterModal: {
        title: 'Bộ lọc',
        reset: 'Đặt lại',
        apply: 'Áp dụng',
        priceRange: 'Khoảng giá',
        priceMin: 'Giá thấp nhất',
        priceMax: 'Giá cao nhất',
        rating: 'Đánh giá',
        ratingFrom: 'Từ {{rating}} sao',
        category: 'Danh mục',
        location: 'Nơi bán',
        allLocations: 'Tất cả',
    },
    empty: {
        title: 'Không tìm thấy sản phẩm',
        subtitle: 'Không tìm thấy "{{keyword}}"',
        suggestion: 'Có thể bạn thích',
        tryAgain: 'Thử tìm kiếm khác',
        adjustFilters: 'Hoặc điều chỉnh bộ lọc',
    },
};

