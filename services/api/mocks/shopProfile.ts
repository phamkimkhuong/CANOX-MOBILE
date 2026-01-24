/**
 * ==============================================
 * SHOP PROFILE MOCK DATA
 * ==============================================
 *
 * Mock data for shop profiles with 3 scenarios:
 * 1. Big Brand (Full profile)
 * 2. Verified Distributor
 * 3. New Shop (No profile data)
 */

import type { ShopProfileUI } from '@/types/shop';

/**
 * Big Brand Profile - Full data
 * Example: Samsung, Apple, Nike authorized stores
 */
export const MOCK_BRAND_PROFILE: ShopProfileUI = {
    type: 'brand',

    // Hero
    heroVideoUrl: 'https://example.com/brand-video.mp4',
    heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    tagline: 'Đồng hành cùng bạn trên mọi hành trình',

    // Brand Story
    brandStory: `Chúng tôi là nhà phân phối chính hãng với hơn 15 năm kinh nghiệm trong lĩnh vực công nghệ.

Với cam kết mang đến những sản phẩm chất lượng cao và dịch vụ hậu mãi tận tâm, chúng tôi đã phục vụ hơn 1 triệu khách hàng trên toàn quốc.

Mọi sản phẩm đều được nhập khẩu chính ngạch, có đầy đủ giấy tờ chứng nhận và bảo hành chính hãng.`,
    foundedYear: 2009,

    // Trust Badges
    trustBadges: [
        {
            id: 'auth',
            icon: 'verified',
            label: 'Đại lý ủy quyền',
            description: 'Được ủy quyền chính thức bởi thương hiệu',
        },
        {
            id: 'quality',
            icon: 'workspace-premium',
            label: 'Top Shop',
            description: 'Top 100 shop uy tín',
        },
        {
            id: 'fast',
            icon: 'local-shipping',
            label: 'Giao nhanh 2h',
            description: 'Giao hàng trong 2 giờ tại TP.HCM',
        },
        {
            id: 'return',
            icon: 'autorenew',
            label: '30 ngày đổi trả',
            description: 'Đổi trả miễn phí trong 30 ngày',
        },
        {
            id: 'warranty',
            icon: 'security',
            label: 'Bảo hành 24 tháng',
            description: 'Bảo hành mở rộng 24 tháng',
        },
        {
            id: 'support',
            icon: 'support-agent',
            label: 'Hỗ trợ 24/7',
            description: 'Đội ngũ CSKH luôn sẵn sàng',
        },
    ],

    // Gallery
    gallery: [
        {
            id: 'g1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
            caption: 'Showroom chính',
        },
        {
            id: 'g2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400',
            caption: 'Khu vực trưng bày',
        },
        {
            id: 'g3',
            type: 'video',
            url: 'https://example.com/showroom-tour.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
            caption: 'Tour showroom',
        },
        {
            id: 'g4',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
            caption: 'Đội ngũ kỹ thuật',
        },
    ],

    // Commitments
    commitments: [
        {
            id: 'c1',
            icon: 'check-circle',
            title: '100% Chính hãng',
            description: 'Cam kết tất cả sản phẩm đều là hàng chính hãng, có nguồn gốc rõ ràng',
        },
        {
            id: 'c2',
            icon: 'price-check',
            title: 'Giá tốt nhất',
            description: 'Hoàn tiền chênh lệch nếu bạn tìm thấy giá thấp hơn ở nơi khác',
        },
        {
            id: 'c3',
            icon: 'speed',
            title: 'Giao hàng nhanh',
            description: 'Giao hàng trong 2h tại nội thành, 24h toàn quốc',
        },
        {
            id: 'c4',
            icon: 'support-agent',
            title: 'Hỗ trợ tận tâm',
            description: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ kỹ thuật 24/7',
        },
    ],
};

/**
 * Verified Distributor Profile
 * Example: New official distributors with business verification
 */
export const MOCK_VERIFIED_PROFILE: ShopProfileUI = {
    type: 'verified',

    // Hero - Simple image
    heroVideoUrl: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800',
    tagline: 'Nhà phân phối chính thức',

    // Business Info
    businessInfo: {
        businessName: 'Công ty TNHH Thương mại ABC',
        businessType: 'Công ty TNHH',
        registrationNumber: '0123456789',
        taxId: '0123456789-001',
        address: '123 Nguyễn Huệ, Q.1, TP.HCM',
        verifiedAt: '15/12/2024',
    },

    // Minimal badges
    trustBadges: [
        {
            id: 'verified',
            icon: 'verified',
            label: 'Đã xác minh',
            description: 'Doanh nghiệp đã được xác minh',
        },
        {
            id: 'auth',
            icon: 'store',
            label: 'Nhà phân phối',
            description: 'Nhà phân phối chính thức',
        },
    ],

    // Gallery - Empty for verified type
    gallery: [],

    // Basic commitments
    commitments: [
        {
            id: 'c1',
            icon: 'check-circle',
            title: 'Hàng chính hãng',
            description: 'Sản phẩm nhập khẩu chính ngạch, có đầy đủ giấy tờ',
        },
        {
            id: 'c2',
            icon: 'receipt-long',
            title: 'Xuất hóa đơn VAT',
            description: 'Hỗ trợ xuất hóa đơn VAT cho doanh nghiệp',
        },
    ],

    // No brand story for verified type
    brandStory: null,
    foundedYear: null,
};

/**
 * New Shop Profile - Empty/Minimal
 * Uses platform guarantees as fallback
 */
export const MOCK_NEW_SHOP_PROFILE: ShopProfileUI = {
    type: 'new',

    heroVideoUrl: null,
    heroImageUrl: null,
    tagline: null,

    brandStory: null,
    foundedYear: null,

    trustBadges: [],
    gallery: [],
    commitments: [],
};

/**
 * Shop-specific profile data
 * Maps real shop IDs to their profile data
 */
const SHOP_PROFILES: Record<string, ShopProfileUI> = {
    // Shop 1: Tech Store - Full brand profile
    '7bbb7677-7024-41c7-82a9-945154acc569': {
        type: 'brand',
        heroVideoUrl: null,
        heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        tagline: 'Công nghệ chính hãng - Giá tốt nhất',

        brandStory: `Chúng tôi là nhà phân phối chính hãng các sản phẩm công nghệ hàng đầu với hơn 10 năm kinh nghiệm.

Với cam kết mang đến những sản phẩm chất lượng cao và dịch vụ hậu mãi tận tâm, chúng tôi đã phục vụ hơn 500.000 khách hàng trên toàn quốc.

Tất cả sản phẩm đều được nhập khẩu chính ngạch, có đầy đủ giấy tờ và bảo hành chính hãng.`,
        foundedYear: 2014,

        trustBadges: [
            { id: 'auth', icon: 'verified', label: 'Đại lý ủy quyền' },
            { id: 'quality', icon: 'workspace-premium', label: 'Top Shop' },
            { id: 'fast', icon: 'local-shipping', label: 'Giao nhanh 2h' },
            { id: 'return', icon: 'autorenew', label: '15 ngày đổi trả' },
            { id: 'warranty', icon: 'security', label: 'Bảo hành 12 tháng' },
            { id: 'support', icon: 'support-agent', label: 'Hỗ trợ 24/7' },
        ],

        gallery: [
            { id: 'g1', type: 'image', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', caption: 'Showroom' },
            { id: 'g2', type: 'image', url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400', caption: 'Sản phẩm' },
            { id: 'g3', type: 'image', url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400', caption: 'Đội ngũ' },
        ],

        commitments: [
            { id: 'c1', icon: 'check-circle', title: '100% Chính hãng', description: 'Cam kết tất cả sản phẩm đều là hàng chính hãng' },
            { id: 'c2', icon: 'price-check', title: 'Giá tốt nhất', description: 'Hoàn tiền chênh lệch nếu tìm thấy giá thấp hơn' },
            { id: 'c3', icon: 'speed', title: 'Giao hàng nhanh', description: 'Giao trong 2h nội thành, 24h toàn quốc' },
            { id: 'c4', icon: 'support-agent', title: 'Hỗ trợ tận tâm', description: 'Đội ngũ tư vấn chuyên nghiệp 24/7' },
        ],
    },

    // Shop 2: Fashion Store - Full brand profile
    'ff9e495e-5267-4c86-b284-64b4ca6971cf': {
        type: 'brand',
        heroVideoUrl: null,
        heroImageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
        tagline: 'Thời trang cao cấp - Phong cách hiện đại',

        brandStory: `Chúng tôi chuyên cung cấp các sản phẩm thời trang cao cấp từ các thương hiệu nổi tiếng trong và ngoài nước.

Với đội ngũ stylists chuyên nghiệp và mạng lưới nhà cung cấp uy tín, chúng tôi cam kết mang đến những bộ sưu tập mới nhất với chất lượng tốt nhất.

Mọi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng.`,
        foundedYear: 2018,

        trustBadges: [
            { id: 'auth', icon: 'verified', label: 'Shop uy tín' },
            { id: 'quality', icon: 'diamond', label: 'Hàng cao cấp' },
            { id: 'fast', icon: 'local-shipping', label: 'Freeship 99k' },
            { id: 'return', icon: 'autorenew', label: '7 ngày đổi trả' },
            { id: 'size', icon: 'straighten', label: 'Tư vấn size' },
            { id: 'cod', icon: 'payments', label: 'COD toàn quốc' },
        ],

        gallery: [
            { id: 'g1', type: 'image', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', caption: 'BST Mới' },
            { id: 'g2', type: 'image', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', caption: 'Lookbook' },
            { id: 'g3', type: 'image', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', caption: 'Behind the scenes' },
            { id: 'g4', type: 'image', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400', caption: 'Showroom' },
        ],

        commitments: [
            { id: 'c1', icon: 'check-circle', title: 'Chất lượng đảm bảo', description: 'Sản phẩm được kiểm tra kỹ trước khi giao' },
            { id: 'c2', icon: 'autorenew', title: 'Đổi trả dễ dàng', description: 'Đổi size miễn phí trong 7 ngày' },
            { id: 'c3', icon: 'local-shipping', title: 'Giao hàng nhanh', description: 'Ship COD toàn quốc, freeship đơn từ 99k' },
            { id: 'c4', icon: 'chat-bubble-outline', title: 'Tư vấn nhiệt tình', description: 'Hỗ trợ chọn size và phối đồ miễn phí' },
        ],
    },
};

/**
 * Get mock profile by shop ID
 * In production, this would be an API call
 */
export const getMockShopProfile = (shopId: string): ShopProfileUI | null => {
    // Check if we have specific profile for this shop
    if (SHOP_PROFILES[shopId]) {
        return SHOP_PROFILES[shopId];
    }

    // Fallback based on ID pattern for testing
    if (shopId.includes('brand') || shopId.startsWith('1')) {
        return MOCK_BRAND_PROFILE;
    }
    if (shopId.includes('verified') || shopId.startsWith('2')) {
        return MOCK_VERIFIED_PROFILE;
    }

    // Default to new shop (no profile)
    return MOCK_NEW_SHOP_PROFILE;
};
