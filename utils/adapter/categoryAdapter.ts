import type { IconSymbolName } from '@/components/ui/Icon';
import type { CategoryItem, CategoryNode, ParentCategory, SubCategory } from '@/types/category';
import { toSizedImageUrl } from '@/utils/url';

/**
 * Category Icon Mapping
 * If category returns icon, no need to map -> delete this function
 */
const CATEGORY_SLUG_MAP: Record<string, IconSymbolName> = {
    // === Tech & Electronics ===
    'may-tinh': 'laptop-outline',
    'dien-thoai-phu-kien': 'smartphone',
    'thiet-bi-gia-dung': 'tv-outline',

    // === Fashion & Beauty ===
    'thoi-trang-nam': 'checkroom',
    'thoi-trang-nu': 'checkroom',
    'sac-dep': 'sparkles-outline',

    // === Lifestyle ===
    'thuc-pham': 'restaurant-outline',
    'bach-hoa': 'cart-outline',
    'suc-khoe': 'shield',
    'me-be': 'heart-outline',
    'thu-cung': 'paw-outline',

    // === Home & Vehicles ===
    'nha-cua-noi-that': 'home',
    'noi-that': 'home',
    'oto-xe-may': 'car-outline',

    // === Office & Others ===
    'van-phong-pham': 'document-outline',
    'thu-cong-my-nghe': 'brush-outline',

    // === Fallback ===
    'default': 'category',
};

/**
 * Helper function: Get icon from slug -> if api returns icon then no need to use this function anymore
 * @param slug - Category slug from API
 * @returns Valid IconSymbolName for Ionicons
 */
const mapSlugToIcon = (slug: string): IconSymbolName => {
    // 1. Exact match in map
    if (CATEGORY_SLUG_MAP[slug]) {
        return CATEGORY_SLUG_MAP[slug];
    }

    // 2. Fuzzy matching for slugs with common pattern
    if (slug.includes('thoi-trang')) return 'checkroom';
    if (slug.includes('dien-thoai')) return 'smartphone';
    if (slug.includes('noi-that')) return 'home';

    // 3. Return safe default icon
    return CATEGORY_SLUG_MAP['default'];
};

/**
 * Helper: Create CategoryItem object from CategoryNode
 */
const mapNodeToItem = (node: CategoryNode): CategoryItem => ({
    id: node.id,
    name: node.name,
    // Prioritize thumb image
    image: toSizedImageUrl(node.imageBasePath, node.imageExtension, '_thumb'),
});

/**
 * Transform API Tree -> Sidebar Data (ParentCategory[])
 */
export const transformToSidebarData = (nodes: CategoryNode[]): ParentCategory[] => {
    return nodes.map((node) => ({
        id: node.id,
        name: node.name,
        icon: mapSlugToIcon(node.slug),
        // icon: undefined, // API currently has no icon
        children: node.children ? transformContentData(node.children) : [],
    }));
};

/**
 * Transform Children of a Node -> Content Data (SubCategory[])
 * Logic mapping:
 * - Level 2 (Direct Child): Will be Section Header (Example: Furniture)
 * - Level 3 (Grandchild): Will be Grid Item (Example: Sofa, Table)
 */
export const transformContentData = (nodes: CategoryNode[]): SubCategory[] => {
    return nodes.map((node) => {
        let items: CategoryItem[] = [];
        if (node.children && node.children.length > 0) {
            // Case 1: Has children (Example: Furniture -> Table, Chair)
            items = node.children.map(child => mapNodeToItem(child));
        } else {
            // Case 2: No children (Example: sub menu 1 -> null)
            // Make itself an item so user has something to click
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