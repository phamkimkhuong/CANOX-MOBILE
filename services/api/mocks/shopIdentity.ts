/**
 * ==============================================
 * SHOP IDENTITY MOCK DATA - Based on API Spec v1.0.0
 * ==============================================
 *
 * Mock data matching SHOP_IDENTITY_API_SPEC.md structure:
 * - identity: Visual branding (logo, cover, tagline)
 * - legal: Business verification (company, tax, etc.)
 * - brandStory: Widget-based sections (VIDEO_INTRO, RICH_TEXT, GALLERY_GRID, TIMELINE)
 * - support: Customer service info (hotline, email, hours)
 *
 * Scenarios:
 * 1. Samsung Official Store - Full brand profile
 * 2. Verified Distributor - Business verification only
 * 3. New Shop - Minimal data
 */

import type {
    BrandStorySection,
    ShopIdentityResponseData,
    ShopInteraction,
    ShopStats,
} from '@/types/shop/shopIdentity';

// ============================================
// SCENARIO 1: BIG BRAND (Samsung Official Store)
// ============================================

const SAMSUNG_BRAND_STORY_SECTIONS: BrandStorySection[] = [
    {
        type: 'VIDEO_INTRO',
        name: 'intro_video',
        order: 1,
        data: {
            url: 'https://cdn.example.com/shops/samsung/intro_video.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
            duration: 45,
            isAutoplay: true,
            isMuted: true,
            controls: false,
            aspectRatio: 1.78,
        },
    },
    {
        type: 'RICH_TEXT',
        name: 'brand_intro',
        order: 2,
        data: {
            spans: [
                {
                    text: 'SAMSUNG VINA',
                    style: {
                        bold: true,
                        color: { light: '#034EA2', dark: '#5B9BD5' },
                        size: 18,
                    },
                },
                {
                    text: ' cam kết mang đến những sản phẩm công nghệ đỉnh cao, kiến tạo tương lai tốt đẹp cho người Việt. Với hơn ',
                },
                {
                    text: '28 năm',
                    style: { bold: true },
                },
                {
                    text: ' hoạt động tại Việt Nam, chúng tôi đã phục vụ hàng triệu khách hàng trên toàn quốc.',
                },
            ],
        },
    },
    {
        type: 'GALLERY_GRID',
        name: 'certifications',
        title: 'Chứng nhận & Giải thưởng',
        order: 3,
        data: {
            columnCount: 2,
            items: [
                {
                    thumbnailUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400',
                    originalUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200',
                    clickAction: {
                        type: 'VIEW_IMAGE',
                        payload: {
                            imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200',
                            zoomable: true,
                        },
                    },
                },
                {
                    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
                    originalUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
                    clickAction: {
                        type: 'EXTERNAL_WEB',
                        payload: {
                            url: 'https://news.samsung.com/vn/top-brand-2024',
                        },
                    },
                },
                {
                    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
                    originalUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
                    clickAction: {
                        type: 'INTERNAL_ROUTE',
                        payload: {
                            screen: 'PRODUCT_LIST',
                            params: { collectionId: 'galaxy-ai-2024' },
                        },
                    },
                },
                {
                    thumbnailUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
                    originalUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200',
                },
            ],
        },
    },
    {
        type: 'TIMELINE',
        name: 'brand_history',
        title: 'Hành trình phát triển',
        order: 4,
        data: {
            items: [
                {
                    year: '1996',
                    title: 'Gia nhập thị trường',
                    description: 'Chính thức có mặt tại Việt Nam với nhà máy SEVT',
                },
                {
                    year: '2008',
                    title: 'Mở rộng quy mô',
                    description: 'Đầu tư nhà máy Samsung Electronics tại Bắc Ninh',
                },
                {
                    year: '2014',
                    title: 'Nhà xuất khẩu #1',
                    description: 'Trở thành doanh nghiệp xuất khẩu lớn nhất Việt Nam',
                },
                {
                    year: '2024',
                    title: 'Kỷ nguyên AI',
                    description: 'Dẫn đầu xu hướng Galaxy AI, tích hợp AI vào mọi sản phẩm',
                },
            ],
        },
    },
    {
        type: 'TEXT_BLOCK',
        name: 'commitment',
        title: 'Cam kết của chúng tôi',
        order: 5,
        data: {
            title: 'Cam kết chất lượng',
            content: 'Tất cả sản phẩm bán tại Samsung Official Store đều là hàng chính hãng 100%, được bảo hành theo tiêu chuẩn của Samsung Việt Nam. Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với dịch vụ hậu mãi tận tâm.',
        },
    },
];

export const MOCK_SAMSUNG_IDENTITY: ShopIdentityResponseData = {
    identity: {
        shopId: 'samsung-official-store',
        shopName: 'Samsung Official Store',
        slug: 'samsung-official',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
        coverDesktopUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1920',
        coverMobileUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
        tagline: 'Inspire the World, Create the Future',
    },
    legal: {
        isOfficial: true,
        isMall: true,
        companyName: 'CÔNG TY TNHH ĐIỆN TỬ SAMSUNG VINA',
        taxId: '0300900999',
        registrationNumber: '411043000888',
        headquarters: 'Số 2, đường Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        foundedYear: 1996,
    },
    brandStory: {
        version: 1,
        sections: SAMSUNG_BRAND_STORY_SECTIONS,
    },
    support: {
        hotline: '1800 588 889',
        supportEmail: 'cskh@samsung.com',
        workingHoursDisplay: 'Thứ 2 - Thứ 7 (08:00 - 20:00)',
        operatingHours: [
            { day: 1, open: 480, close: 1200 }, // Mon 8:00-20:00
            { day: 2, open: 480, close: 1200 },
            { day: 3, open: 480, close: 1200 },
            { day: 4, open: 480, close: 1200 },
            { day: 5, open: 480, close: 1200 },
            { day: 6, open: 480, close: 1200 },
            { day: 7, open: null, close: null }, // Sun closed
        ],
        holidays: ['2026-05-01', '2026-09-02'],
        returnPolicyUrl: 'https://samsung.com/vn/support/return-policy',
    },
};

export const MOCK_SAMSUNG_STATS: ShopStats = {
    rating: 4.9,
    reviewCount: 15420,
    followerCount: 850000,
    responseRate: 99,
    joinedDate: '2018-05-20T00:00:00Z',
};

// ============================================
// SCENARIO 2: VERIFIED DISTRIBUTOR (Fashion Store)
// ============================================

export const MOCK_VERIFIED_DISTRIBUTOR_IDENTITY: ShopIdentityResponseData = {
    identity: {
        shopId: 'ff9e495e-5267-4c86-b284-64b4ca6971cf',
        shopName: 'Fashion Style Official',
        slug: 'fashion-style-official',
        logoUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200',
        coverDesktopUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920',
        coverMobileUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
        tagline: 'Thời trang cao cấp - Phong cách hiện đại',
    },
    legal: {
        isOfficial: true,
        isMall: false,
        companyName: 'CÔNG TY TNHH THỜI TRANG ABC',
        taxId: '0123456789',
        registrationNumber: '0123456789-001',
        headquarters: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        foundedYear: 2018,
    },
    brandStory: {
        version: 1,
        sections: [
            {
                type: 'IMAGE_HERO',
                name: 'hero_banner',
                order: 1,
                data: {
                    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                    originalUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
                    aspectRatio: 1.5,
                    clickAction: {
                        type: 'INTERNAL_ROUTE',
                        payload: {
                            screen: 'PRODUCT_LIST',
                            params: { collectionId: 'new-arrivals' },
                        },
                    },
                },
            },
            {
                type: 'TEXT_BLOCK',
                name: 'about_us',
                title: 'Về chúng tôi',
                order: 2,
                data: {
                    title: 'Về Fashion Style',
                    content: 'Chúng tôi chuyên cung cấp các sản phẩm thời trang cao cấp từ các thương hiệu nổi tiếng trong và ngoài nước. Với đội ngũ stylists chuyên nghiệp và mạng lưới nhà cung cấp uy tín, chúng tôi cam kết mang đến những bộ sưu tập mới nhất với chất lượng tốt nhất.',
                },
            },
            {
                type: 'GALLERY_GRID',
                name: 'lookbook',
                title: 'Lookbook',
                order: 3,
                data: {
                    columnCount: 3,
                    items: [
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
                        },
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
                        },
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
                        },
                    ],
                },
            },
        ],
    },
    support: {
        hotline: '1900 1234',
        supportEmail: 'support@fashionstyle.vn',
        workingHoursDisplay: 'Thứ 2 - Chủ nhật (09:00 - 21:00)',
        operatingHours: null,
        holidays: null,
        returnPolicyUrl: null,
    },
};

export const MOCK_VERIFIED_DISTRIBUTOR_STATS: ShopStats = {
    rating: 4.7,
    reviewCount: 3240,
    followerCount: 45000,
    responseRate: 95,
    joinedDate: '2020-03-15T00:00:00Z',
};

// ============================================
// SCENARIO 3: TECH STORE (Full brand)
// ============================================

export const MOCK_TECH_STORE_IDENTITY: ShopIdentityResponseData = {
    identity: {
        shopId: '7bbb7677-7024-41c7-82a9-945154acc569',
        shopName: 'Tech World Official',
        slug: 'tech-world-official',
        logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
        coverDesktopUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920',
        coverMobileUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        tagline: 'Công nghệ chính hãng - Giá tốt nhất',
    },
    legal: {
        isOfficial: true,
        isMall: true,
        companyName: 'CÔNG TY TNHH THƯƠNG MẠI CÔNG NGHỆ TECH WORLD',
        taxId: '0309876543',
        registrationNumber: '411043001234',
        headquarters: '456 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh',
        foundedYear: 2014,
    },
    brandStory: {
        version: 1,
        sections: [
            {
                type: 'RICH_TEXT',
                name: 'intro',
                order: 1,
                data: {
                    spans: [
                        {
                            text: 'Tech World',
                            style: {
                                bold: true,
                                color: { light: '#2563EB', dark: '#60A5FA' },
                                size: 20,
                            },
                        },
                        {
                            text: ' là nhà phân phối chính hãng các sản phẩm công nghệ hàng đầu với hơn ',
                        },
                        {
                            text: '10 năm',
                            style: { bold: true },
                        },
                        {
                            text: ' kinh nghiệm. Chúng tôi đã phục vụ hơn 500.000 khách hàng trên toàn quốc.',
                        },
                    ],
                },
            },
            {
                type: 'GALLERY_GRID',
                name: 'showroom',
                title: 'Showroom & Đội ngũ',
                order: 2,
                data: {
                    columnCount: 2,
                    items: [
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
                        },
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200',
                        },
                        {
                            thumbnailUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
                            originalUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200',
                        },
                    ],
                },
            },
            {
                type: 'TIMELINE',
                name: 'milestones',
                title: 'Cột mốc quan trọng',
                order: 3,
                data: {
                    items: [
                        {
                            year: '2014',
                            title: 'Thành lập',
                            description: 'Bắt đầu với 1 cửa hàng nhỏ tại Quận 1',
                        },
                        {
                            year: '2018',
                            title: 'Mở rộng',
                            description: 'Đạt 10 chi nhánh trên toàn quốc',
                        },
                        {
                            year: '2022',
                            title: 'Chuyển đổi số',
                            description: 'Ra mắt hệ thống bán hàng online',
                        },
                        {
                            year: '2024',
                            title: 'Top Shop',
                            description: 'Vinh danh Top 100 Shop uy tín',
                        },
                    ],
                },
            },
        ],
    },
    support: {
        hotline: '1800 123 456',
        supportEmail: 'support@techworld.vn',
        workingHoursDisplay: 'Thứ 2 - Chủ nhật (08:00 - 22:00)',
        operatingHours: [
            { day: 1, open: 480, close: 1320 },
            { day: 2, open: 480, close: 1320 },
            { day: 3, open: 480, close: 1320 },
            { day: 4, open: 480, close: 1320 },
            { day: 5, open: 480, close: 1320 },
            { day: 6, open: 480, close: 1320 },
            { day: 7, open: 540, close: 1260 },
        ],
        holidays: [],
        returnPolicyUrl: 'https://techworld.vn/chinh-sach-doi-tra',
    },
};

export const MOCK_TECH_STORE_STATS: ShopStats = {
    rating: 4.8,
    reviewCount: 8750,
    followerCount: 120000,
    responseRate: 98,
    joinedDate: '2019-08-10T00:00:00Z',
};

// ============================================
// SCENARIO 4: NEW SHOP (Minimal data)
// ============================================

export const MOCK_NEW_SHOP_IDENTITY: ShopIdentityResponseData = {
    identity: {
        shopId: 'new-shop-001',
        shopName: 'Shop Mới',
        slug: 'shop-moi',
        logoUrl: 'https://via.placeholder.com/200x200?text=New+Shop',
        coverDesktopUrl: null,
        coverMobileUrl: null,
        tagline: null,
    },
    legal: {
        isOfficial: false,
        isMall: false,
        companyName: null,
        taxId: null,
        registrationNumber: null,
        headquarters: null,
        foundedYear: null,
    },
    brandStory: null,
    support: null,
};

export const MOCK_NEW_SHOP_STATS: ShopStats = {
    rating: null,
    reviewCount: 0,
    followerCount: 5,
    responseRate: null,
    joinedDate: '2026-01-15T00:00:00Z',
};

// ============================================
// USER INTERACTION MOCKS
// ============================================

export const MOCK_FOLLOWED_INTERACTION: ShopInteraction = {
    isFollowed: true,
    isBlocked: false,
};

export const MOCK_NOT_FOLLOWED_INTERACTION: ShopInteraction = {
    isFollowed: false,
    isBlocked: false,
};

// ============================================
// SHOP ID MAPPING
// ============================================

const SHOP_IDENTITY_MAP: Record<string, ShopIdentityResponseData> = {
    'samsung-official-store': MOCK_SAMSUNG_IDENTITY,
    '7bbb7677-7024-41c7-82a9-945154acc569': MOCK_TECH_STORE_IDENTITY,
    'ff9e495e-5267-4c86-b284-64b4ca6971cf': MOCK_VERIFIED_DISTRIBUTOR_IDENTITY,
    'new-shop-001': MOCK_NEW_SHOP_IDENTITY,
};

const SHOP_STATS_MAP: Record<string, ShopStats> = {
    'samsung-official-store': MOCK_SAMSUNG_STATS,
    '7bbb7677-7024-41c7-82a9-945154acc569': MOCK_TECH_STORE_STATS,
    'ff9e495e-5267-4c86-b284-64b4ca6971cf': MOCK_VERIFIED_DISTRIBUTOR_STATS,
    'new-shop-001': MOCK_NEW_SHOP_STATS,
};

// ============================================
// GETTER FUNCTIONS
// ============================================

/**
 * Get mock shop identity by shop ID
 * Falls back to Tech Store if not found
 */
export const getMockShopIdentity = (shopId: string): ShopIdentityResponseData => {
    return SHOP_IDENTITY_MAP[shopId] ?? MOCK_TECH_STORE_IDENTITY;
};

/**
 * Get mock shop stats by shop ID
 * Falls back to Tech Store stats if not found
 */
export const getMockShopStats = (shopId: string): ShopStats => {
    return SHOP_STATS_MAP[shopId] ?? MOCK_TECH_STORE_STATS;
};

/**
 * Get mock user interaction (always returns not followed for mock)
 */
export const getMockShopInteraction = (_shopId: string): ShopInteraction => {
    return MOCK_NOT_FOLLOWED_INTERACTION;
};
