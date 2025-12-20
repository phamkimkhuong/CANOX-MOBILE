import type { CategoryContentData, ParentCategory } from '@/types/category';
import { useQuery } from '@tanstack/react-query';

/**
 * Mock Data cho Categories
 * "Scroll to Center" of Sidebar
 */

const MOCK_PARENT_CATEGORIES: ParentCategory[] = [
    {
        id: 'suggestions',
        name: 'Gợi ý',
        icon: 'local-fire-department',
        iconColor: '#ef4444',
        children: [],
    },
    {
        id: 'men-fashion',
        name: 'Thời trang Nam',
        banner: {
            id: 'banner-men-1',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            title: 'Siêu Sale 9.9',
            subtitle: 'Giảm đến 50% thời trang nam',
        },
        children: [
            {
                id: 'men-tops',
                title: 'Áo Nam',
                showSeeAll: true,
                items: [
                    { id: 'ao-thun', name: 'Áo Thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
                    { id: 'ao-somi', name: 'Áo Sơ Mi', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200' },
                    { id: 'ao-khoac', name: 'Áo Khoác', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200' },
                    { id: 'ao-polo', name: 'Áo Polo', image: 'https://images.unsplash.com/photo-1625910513413-5fc45b67e1f4?w=200' },
                    { id: 'ao-vest', name: 'Áo Vest', icon: 'checkroom' },
                    { id: 'do-thethao', name: 'Đồ Thể Thao', icon: 'bolt' },
                ],
            },
            {
                id: 'men-bottoms',
                title: 'Quần & Giày Dép',
                items: [
                    { id: 'quan-jeans', name: 'Quần Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200' },
                    { id: 'quan-tay', name: 'Quần Tây', icon: 'checkroom' },
                    { id: 'quan-short', name: 'Quần Short', icon: 'checkroom' },
                    { id: 'giay-sneaker', name: 'Giày Sneaker', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
                    { id: 'giay-tay', name: 'Giày Tây', icon: 'checkroom' },
                    { id: 'dep-sandal', name: 'Dép & Sandal', icon: 'checkroom' },
                ],
            },
        ],
    },
    {
        id: 'women-fashion',
        name: 'Thời trang Nữ',
        banner: {
            id: 'banner-women-1',
            imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
            title: 'Flash Sale',
            subtitle: 'Thời trang nữ giảm 40%',
        },
        children: [
            {
                id: 'women-tops',
                title: 'Áo Nữ',
                showSeeAll: true,
                items: [
                    { id: 'ao-croptop', name: 'Áo Croptop', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200' },
                    { id: 'ao-kieu', name: 'Áo Kiểu', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=200' },
                    { id: 'ao-len', name: 'Áo Len', icon: 'checkroom' },
                ],
            },
            {
                id: 'women-bottoms',
                title: 'Váy & Đầm',
                items: [
                    { id: 'vay-ngan', name: 'Váy Ngắn', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200' },
                    { id: 'dam-du-tiec', name: 'Đầm Dự Tiệc', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200' },
                ],
            },
        ],
    },
    {
        id: 'phones',
        name: 'Điện thoại & PK',
        banner: {
            id: 'banner-phones-1',
            imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
            title: 'iPhone 15 Pro',
            subtitle: 'Giảm ngay 2 triệu',
        },
        children: [
            {
                id: 'smartphones',
                title: 'Điện thoại',
                showSeeAll: true,
                items: [
                    { id: 'iphone', name: 'iPhone', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200' },
                    { id: 'samsung', name: 'Samsung', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200' },
                    { id: 'xiaomi', name: 'Xiaomi', icon: 'smartphone' },
                    { id: 'oppo', name: 'Oppo', icon: 'smartphone' },
                ],
            },
            {
                id: 'accessories',
                title: 'Phụ kiện',
                items: [
                    { id: 'case', name: 'Ốp lưng', icon: 'smartphone' },
                    { id: 'charger', name: 'Sạc & Cáp', icon: 'bolt' },
                    { id: 'earphone', name: 'Tai nghe', icon: 'smartphone' },
                ],
            },
        ],
    },
    {
        id: 'mom-baby',
        name: 'Mẹ & Bé',
        children: [
            {
                id: 'baby-clothes',
                title: 'Quần áo bé',
                items: [
                    { id: 'bodysuits', name: 'Bodysuits', icon: 'checkroom' },
                    { id: 'baby-dress', name: 'Váy bé gái', icon: 'checkroom' },
                ],
            },
        ],
    },
    {
        id: 'home',
        name: 'Nhà cửa',
        children: [
            {
                id: 'furniture',
                title: 'Nội thất',
                items: [
                    { id: 'sofa', name: 'Sofa', icon: 'home' },
                    { id: 'bed', name: 'Giường', icon: 'home' },
                ],
            },
        ],
    },
    {
        id: 'beauty',
        name: 'Sắc đẹp',
        children: [
            {
                id: 'skincare',
                title: 'Chăm sóc da',
                items: [
                    { id: 'cleanser', name: 'Sữa rửa mặt', icon: 'star' },
                    { id: 'serum', name: 'Serum', icon: 'star' },
                ],
            },
        ],
    },
    {
        id: 'health',
        name: 'Sức khỏe',
        children: [
            {
                id: 'supplements',
                title: 'Thực phẩm chức năng',
                items: [
                    { id: 'vitamins', name: 'Vitamin', icon: 'shield' },
                ],
            },
        ],
    },
    {
        id: 'shoes',
        name: 'Giày Dép',
        children: [
            {
                id: 'sneakers',
                title: 'Giày thể thao',
                items: [
                    { id: 'running', name: 'Giày chạy bộ', icon: 'checkroom' },
                ],
            },
        ],
    },
    {
        id: 'bags',
        name: 'Túi Ví',
        children: [
            {
                id: 'handbags',
                title: 'Túi xách',
                items: [
                    { id: 'tote', name: 'Túi Tote', icon: 'shopping-bag' },
                ],
            },
        ],
    },
    {
        id: 'watches',
        name: 'Đồng hồ',
        children: [
            {
                id: 'men-watches',
                title: 'Đồng hồ nam',
                items: [
                    { id: 'mechanical', name: 'Cơ khí', icon: 'star' },
                ],
            },
        ],
    },
    {
        id: 'sports',
        name: 'Thể thao',
        children: [
            {
                id: 'gym',
                title: 'Gym & Fitness',
                items: [
                    { id: 'gym-clothes', name: 'Đồ tập', icon: 'bolt' },
                ],
            },
        ],
    },
    {
        id: 'toys',
        name: 'Đồ chơi',
        children: [
            {
                id: 'kids-toys',
                title: 'Đồ chơi trẻ em',
                items: [
                    { id: 'lego', name: 'Lego', icon: 'star' },
                ],
            },
        ],
    },
    {
        id: 'pets',
        name: 'Thú cưng',
        children: [
            {
                id: 'pet-food',
                title: 'Thức ăn',
                items: [
                    { id: 'dog-food', name: 'Thức ăn cho chó', icon: 'star' },
                ],
            },
        ],
    },
    {
        id: 'books',
        name: 'Sách',
        children: [
            {
                id: 'fiction',
                title: 'Tiểu thuyết',
                items: [
                    { id: 'novel', name: 'Văn học', icon: 'star' },
                ],
            },
        ],
    },
    {
        id: 'automotive',
        name: 'Ô tô - Xe máy',
        children: [
            {
                id: 'car-accessories',
                title: 'Phụ kiện xe',
                items: [
                    { id: 'car-perfume', name: 'Nước hoa ô tô', icon: 'star' },
                ],
            },
        ],
    },
];

/**
 * Mock API delay để test Skeleton loading
 */
const simulateNetworkDelay = (ms: number = 800): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lấy danh sách Parent Categories cho Sidebar
 */
const fetchParentCategories = async (): Promise<ParentCategory[]> => {
    await simulateNetworkDelay(300);
    return MOCK_PARENT_CATEGORIES;
};

/**
 * Lấy nội dung chi tiết của một Category
 */
const fetchCategoryContent = async (categoryId: string): Promise<CategoryContentData | null> => {
    await simulateNetworkDelay(600);

    const category = MOCK_PARENT_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return null;

    return {
        parentId: category.id,
        banner: category.banner,
        subCategories: category.children,
        featuredBrands: [
            { id: 'brand-a', name: 'BRAND A' },
            { id: 'brand-b', name: 'BRAND B' },
            { id: 'brand-c', name: 'BRAND C' },
            { id: 'brand-d', name: 'BRAND D' },
        ],
    };
};

/**
 * Hook: Lấy danh sách Parent Categories
 */
export const useParentCategories = () => {
    return useQuery({
        queryKey: ['categories', 'parents'],
        queryFn: fetchParentCategories,
        staleTime: 1000 * 60 * 10, // Cache 10 phút - categories ít thay đổi
        gcTime: 1000 * 60 * 30, // Giữ cache 30 phút
    });
};

/**
 * Hook: Lấy nội dung chi tiết của một Category
 * 
 * @param categoryId - ID của category đang chọn
 */
export const useCategoryContent = (categoryId: string | null) => {
    return useQuery({
        queryKey: ['categories', 'content', categoryId],
        queryFn: () => fetchCategoryContent(categoryId!),
        enabled: !!categoryId, // Chỉ fetch khi có categoryId
        staleTime: 1000 * 60 * 5, // Cache 5 phút
        gcTime: 1000 * 60 * 15,
    });
};
