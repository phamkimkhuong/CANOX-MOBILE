import type { IconSymbolName } from '@/components/ui/Icon';

/**
 * Category Domain Types
 * 
 * Tree Structure để hỗ trợ mô hình Master-Detail:
 * - ParentCategory: Danh mục cha (hiển thị ở Sidebar)
 * - SubCategory: Danh mục con (hiển thị trong Content)
 * - CategoryItem: Sản phẩm/mục trong danh mục con
 */

/**
 * Item đơn lẻ trong một subcategory (ví dụ: Áo Thun, Áo Sơ Mi)
 */
export interface CategoryItem {
    id: string;
    name: string;
    image?: string; // URL ảnh hoặc undefined nếu dùng icon
    icon?: IconSymbolName; // Fallback icon khi không có ảnh
}

/**
 * SubCategory - Nhóm con trong một danh mục cha
 * Ví dụ: "Áo Nam", "Quần & Giày Dép"
 */
export interface SubCategory {
    id: string;
    title: string;
    showSeeAll?: boolean; // Hiển thị nút "Xem tất cả"
    items: CategoryItem[];
}

/**
 * ParentCategory - Danh mục cha hiển thị ở Sidebar
 * Ví dụ: "Thời trang Nam", "Điện thoại & Phụ kiện"
 */
export interface ParentCategory {
    id: string;
    name: string;
    icon?: IconSymbolName; // Icon hiển thị bên cạnh tên (optional)
    iconColor?: string; // Màu icon custom
    banner?: CategoryBanner; // Banner quảng cáo cho danh mục
    children: SubCategory[]; // Các subcategory
}

/**
 * Banner quảng cáo đầu Content
 */
export interface CategoryBanner {
    id: string;
    imageUrl: string;
    title: string;
    subtitle?: string;
    actionUrl?: string; // Deep link khi bấm vào banner
}

/**
 * Brand nổi bật trong danh mục
 */
export interface FeaturedBrand {
    id: string;
    name: string;
    logo?: string;
}

/**
 * Category Content Data - Dữ liệu đầy đủ cho phần Content bên phải
 */
export interface CategoryContentData {
    parentId: string;
    banner?: CategoryBanner;
    subCategories: SubCategory[];
    featuredBrands?: FeaturedBrand[];
}

/**
 * FlashList FlattenedItem types cho CategoryContent
 */
export interface CategorySectionHeader {
    type: 'section-header';
    id: string;
    title: string;
    showSeeAll?: boolean;
}

export interface CategoryGridItem {
    type: 'grid-item';
    id: string;
    data: CategoryItem;
    sectionId: string;
}

export interface CategoryBannerItem {
    type: 'banner';
    id: string;
    data: CategoryBanner;
}

export interface CategoryBrandSection {
    type: 'brands';
    id: string;
    brands: FeaturedBrand[];
}

export type FlattenedCategoryItem =
    | CategorySectionHeader
    | CategoryGridItem
    | CategoryBannerItem
    | CategoryBrandSection;
