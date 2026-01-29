import type { IconSymbolName } from '@/components/ui/Icon';
import z from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

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
    children: SubCategory[]; // Các subcategory
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

export interface CategoryBrandSection {
    type: 'brands';
    id: string;
    brands: FeaturedBrand[];
}

export type FlattenedCategoryItem =
    | CategorySectionHeader
    | CategoryGridItem
    | CategoryBrandSection;


export const CategoryNodeSchema: z.ZodType<CategoryNode> = z.lazy(() =>
    z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        active: z.boolean(),
        parentId: z.string().nullable(),
        imagePath: z.string().nullable().optional(),
        imageAssetId: z.string().nullable().optional(),
        imageBasePath: z.string().nullable().optional(),
        imageExtension: z.string().nullable().optional(),
        children: z.array(CategoryNodeSchema).nullable(), // Đệ quy
    })
);

export type CategoryNode = {
    id: string;
    name: string;
    slug: string;
    active: boolean;
    parentId: string | null;
    imagePath?: string | null;
    imageAssetId?: string | null;
    imageBasePath?: string | null;
    imageExtension?: string | null;
    children: CategoryNode[] | null;
};

export const CategoryTreeResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.array(CategoryNodeSchema),
});
