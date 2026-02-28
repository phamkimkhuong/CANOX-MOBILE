export interface GlobalBanner {
    id: string;
    image: string;
    titleKey: string;
    subtitleKey: string;
    badgeTextKey: string;
    defaultTitle: string;
    defaultSubtitle: string;
    defaultBadgeText: string;
}

export const MOCK_GLOBAL_BANNERS: GlobalBanner[] = [
    {
        id: 'banner-1',
        image: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&q=80&w=800',
        titleKey: 'globalHub.banners.b1.title',
        subtitleKey: 'globalHub.banners.b1.subtitle',
        badgeTextKey: 'globalHub.banners.b1.badge',
        defaultTitle: 'Thế Giới Trong Tầm Tay',
        defaultSubtitle: 'Sản phẩm xách tay chính hãng • Vận tải hàng không',
        defaultBadgeText: 'GLOBAL HUB',
    },
    {
        id: 'banner-2',
        image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800', // Mỹ phẩm Hàn
        titleKey: 'globalHub.banners.b2.title',
        subtitleKey: 'globalHub.banners.b2.subtitle',
        badgeTextKey: 'globalHub.banners.b2.badge',
        defaultTitle: 'Mỹ Phẩm Nội Địa Hàn',
        defaultSubtitle: 'Trực tiếp từ Myeongdong • 100% Auth',
        defaultBadgeText: 'K-BEAUTY',
    },
    {
        id: 'banner-3',
        image: 'https://images.unsplash.com/photo-1542644445-4293e506d649?auto=format&fit=crop&q=80&w=800', // Đồ ăn vặt Nhật Bản
        titleKey: 'globalHub.banners.b3.title',
        subtitleKey: 'globalHub.banners.b3.subtitle',
        badgeTextKey: 'globalHub.banners.b3.badge',
        defaultTitle: 'Hương Vị Nhật Bản',
        defaultSubtitle: 'Đồ ăn dặm, bánh mứt kẹo gửi từ Tokyo',
        defaultBadgeText: 'JP TASTE',
    },
    {
        id: 'banner-4',
        image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800', // Sneaker Mỹ
        titleKey: 'globalHub.banners.b4.title',
        subtitleKey: 'globalHub.banners.b4.subtitle',
        badgeTextKey: 'globalHub.banners.b4.badge',
        defaultTitle: 'Săn Sneaker Độc Quyền',
        defaultSubtitle: 'US UK Authentic • Freeship mọi đơn hàng',
        defaultBadgeText: 'US STEAL',
    },
    {
        id: 'banner-5',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=800', // Điện tử công nghệ
        titleKey: 'globalHub.banners.b5.title',
        subtitleKey: 'globalHub.banners.b5.subtitle',
        badgeTextKey: 'globalHub.banners.b5.badge',
        defaultTitle: 'Công Nghệ Đỉnh Cao',
        defaultSubtitle: 'Hàng độc lạ Thâm Quyến (Trung Quốc)',
        defaultBadgeText: 'CN TECH',
    },
    {
        id: 'banner-6',
        image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&q=80&w=800', // Thực phẩm chức năng Úc
        titleKey: 'globalHub.banners.b6.title',
        subtitleKey: 'globalHub.banners.b6.subtitle',
        badgeTextKey: 'globalHub.banners.b6.badge',
        defaultTitle: 'Sức Khỏe Vàng',
        defaultSubtitle: 'Vitamin & Thực phẩm chức năng nhập Úc',
        defaultBadgeText: 'AUS CARE',
    },
    {
        id: 'banner-7',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', // Tai nghe / Điện tử
        titleKey: 'globalHub.banners.b7.title',
        subtitleKey: 'globalHub.banners.b7.subtitle',
        badgeTextKey: 'globalHub.banners.b7.badge',
        defaultTitle: 'Âm Thanh Audiophile',
        defaultSubtitle: 'Chính hãng US • Bảo hành toàn cầu',
        defaultBadgeText: 'US AUDIO',
    },
    {
        id: 'banner-8',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800', // Thời trang nữ
        titleKey: 'globalHub.banners.b8.title',
        subtitleKey: 'globalHub.banners.b8.subtitle',
        badgeTextKey: 'globalHub.banners.b8.badge',
        defaultTitle: 'Thời Trang Paris',
        defaultSubtitle: 'Thiết kế mới nhất từ tuần lễ thời trang',
        defaultBadgeText: 'EU FASHION',
    },
    {
        id: 'banner-9',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800', // Đồ dã ngoại / Thể thao
        titleKey: 'globalHub.banners.b9.title',
        subtitleKey: 'globalHub.banners.b9.subtitle',
        badgeTextKey: 'globalHub.banners.b9.badge',
        defaultTitle: 'Outdoor Adventure',
        defaultSubtitle: 'Đồ cắm trại & Thể thao từ Châu Âu',
        defaultBadgeText: 'EU SPORT',
    },
    {
        id: 'banner-10',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800', // Phụ kiện
        titleKey: 'globalHub.banners.b10.title',
        subtitleKey: 'globalHub.banners.b10.subtitle',
        badgeTextKey: 'globalHub.banners.b10.badge',
        defaultTitle: 'Phụ Kiện Luxury',
        defaultSubtitle: 'Xách tay miễn thuế • Độc quyền',
        defaultBadgeText: 'DUTY FREE',
    },
];
