import type { IconSymbolName } from '@/components/ui/Icon';
import type { CategoryItem, CategoryNode, ParentCategory, SubCategory } from '@/types/category';
import { toSizedImageUrl } from '@/utils/url';

/**
 * Category Icon Mapping
 * Nếu category trả về icon thì không cần map -> xoá function này đi
 */
const CATEGORY_SLUG_MAP: Record<string, IconSymbolName> = {
    // === Công nghệ & Điện tử ===
    'may-tinh': 'laptop-outline',
    'dien-thoai-phu-kien': 'smartphone',
    'thiet-bi-gia-dung': 'tv-outline',

    // === Thời trang & Làm đẹp ===
    'thoi-trang-nam': 'checkroom',
    'thoi-trang-nu': 'checkroom',
    'sac-dep': 'sparkles-outline',

    // === Đời sống ===
    'thuc-pham': 'restaurant-outline',
    'bach-hoa': 'cart-outline',
    'suc-khoe': 'shield',
    'me-be': 'heart-outline',
    'thu-cung': 'paw-outline',

    // === Nhà cửa & Xe ===
    'nha-cua-noi-that': 'home',
    'noi-that': 'home',
    'oto-xe-may': 'car-outline',

    // === Văn phòng & Khác ===
    'van-phong-pham': 'document-outline',
    'thu-cong-my-nghe': 'brush-outline',

    // === Fallback ===
    'default': 'category',
};

/**
 * Helper function: Lấy icon từ slug -> nếu api trả về icon thì ko cần dùng hàm này nữa
 * @param slug - Slug của category từ API
 * @returns IconSymbolName hợp lệ cho Ionicons
 */
const mapSlugToIcon = (slug: string): IconSymbolName => {
    // 1. Tìm chính xác trong map
    if (CATEGORY_SLUG_MAP[slug]) {
        return CATEGORY_SLUG_MAP[slug];
    }

    // 2. Fuzzy matching cho các slug có pattern chung
    if (slug.includes('thoi-trang')) return 'checkroom';
    if (slug.includes('dien-thoai')) return 'smartphone';
    if (slug.includes('noi-that')) return 'home';

    // 3. Trả về icon mặc định an toàn
    return CATEGORY_SLUG_MAP['default'];
};

/**
 * Helper: Tạo object CategoryItem từ CategoryNode
 */
const mapNodeToItem = (node: CategoryNode): CategoryItem => ({
    id: node.id,
    name: node.name,
    // Ưu tiên lấy ảnh thumb
    image: toSizedImageUrl(node.imageBasePath, node.imageExtension, '_thumb'),
});

/**
 * Biến đổi API Tree -> Sidebar Data (ParentCategory[])
 */
export const transformToSidebarData = (nodes: CategoryNode[]): ParentCategory[] => {
    return nodes.map((node) => ({
        id: node.id,
        name: node.name,
        icon: mapSlugToIcon(node.slug),
        // icon: undefined, // API hiện tại chưa có icon
        children: node.children ? transformContentData(node.children) : [],
    }));
};

/**
 * Biến đổi Children của 1 Node -> Content Data (SubCategory[])
 * Logic mapping:
 * - Level 2 (Con trực tiếp): Sẽ là Section Header (Ví dụ: Nội thất)
 * - Level 3 (Cháu): Sẽ là Grid Item (Ví dụ: Sofa, Bàn)
 */
export const transformContentData = (nodes: CategoryNode[]): SubCategory[] => {
    return nodes.map((node) => {
        let items: CategoryItem[] = [];
        if (node.children && node.children.length > 0) {
            // Case 1: Có con (Ví dụ: Nội thất -> Bàn, Ghế)
            items = node.children.map(child => mapNodeToItem(child));
        } else {
            // Case 2: Không có con (Ví dụ: sub menu 1 -> null)
            // Biến chính nó thành item để user có cái để bấm vào
            items = [mapNodeToItem(node)];
        }
        return {
            id: node.id,
            title: node.name,
            showSeeAll: items.length > 3,
            items: items,
        };
    });
};