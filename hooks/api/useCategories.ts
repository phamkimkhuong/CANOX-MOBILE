import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { CategoryTreeResponseSchema } from '@/types/category';
import { transformContentData, transformToSidebarData } from '@/utils/categoryAdapter';
import { useQuery } from '@tanstack/react-query';

export const useCategoryTree = () => {
    return useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: async () => {
            const res = await request(
                { url: API_ROUTES.CATEGORIES.GETALL, method: 'GET' },
                CategoryTreeResponseSchema
            );
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        gcTime: 1000 * 60 * 120,
    });
};

// Hook cho Sidebar (Select data từ Tree)
export const useParentCategories = () => {
    const { data, ...rest } = useCategoryTree();

    // Memoized transformation
    const sidebarData = data ? transformToSidebarData(data) : [];

    return { data: sidebarData, ...rest };
};

// Hook cho Content
export const useCategoryContent = (parentId: string | null) => {
    const { data: treeData, isLoading } = useCategoryTree();

    if (!parentId || !treeData) return { data: null, isLoading };

    const parentNode = treeData.find((n) => n.id === parentId);

    if (!parentNode) return { data: null, isLoading: false };

    // Map dữ liệu API sang UI format
    const contentData = {
        parentId: parentNode.id,
        subCategories: parentNode.children ? transformContentData(parentNode.children) : [],
        featuredBrands: [], // API chưa có
    };

    return { data: contentData, isLoading };
};
