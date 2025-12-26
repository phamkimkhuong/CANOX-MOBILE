import type { CategoryNode, ParentCategory, SubCategory } from '@/types/category';
import { toSizedImageUrl } from './url';

/**
 * Biến đổi API Tree -> Sidebar Data (ParentCategory[])
 */
export const transformToSidebarData = (nodes: CategoryNode[]): ParentCategory[] => {
    return nodes.map((node) => ({
        id: node.id,
        name: node.name,
        icon: undefined, // API không có icon vector
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
    return nodes.map((node) => ({
        id: node.id,
        title: node.name,
        showSeeAll: true,
        items: node.children
            ? node.children.map((child) => ({
                id: child.id,
                name: child.name,
                image: toSizedImageUrl(child.imageBasePath, child.imageExtension),
            }))
            : [],
    }));
};