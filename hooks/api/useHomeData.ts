// import { API_ROUTES } from '@/constants/apiRoutes';
// import { request } from '@/services/api/client';
// import { CategoryResponseSchema } from '@/types/categories/category.detail';
// import { PublicProductListItemSchema } from '@/types/product/public-product.dto';
// import { useQuery } from '@tanstack/react-query';
// import { z } from 'zod';

// // Schema cho mảng kết quả
// const ProductListSchema = z.object({
//     content: z.array(PublicProductListItemSchema),
//     totalElements: z.number(),
//     totalPages: z.number(),
//     size: z.number(),
//     number: z.number(),
// });

// const ParentCategoriesSchema = z.array(CategoryResponseSchema);

// /**
//  * Hook duy nhất cho toàn bộ dữ liệu trang chủ
//  * Tự động gọi song song tất cả các API cần thiết
//  */
// export const useHomeData = () => {
//     // 1. Lấy danh mục cấp cha
//     const categoriesQuery = useQuery({
//         queryKey: ['home', 'categories'],
//         queryFn: () => request({
//             url: '/api/v1/categories/parents', // API path từ Web service
//             method: 'GET',
//         }, ParentCategoriesSchema),
//         staleTime: 1000 * 60 * 30, // Danh mục ít thay đổi (30 phút)
//     });

//     // 2. Lấy sản phẩm Flash Sale (Sale)
//     const flashSaleQuery = useQuery({
//         queryKey: ['home', 'flash-sale'],
//         queryFn: () => request({
//             url: API_ROUTES.PUBLIC_PRODUCTS.SALE,
//             method: 'GET',
//             params: { page: 0, size: 6 }, // Lấy 6 cái giống Web
//         }, ProductListSchema),
//     });

//     // 3. Lấy sản phẩm mới (New)
//     const newProductsQuery = useQuery({
//         queryKey: ['home', 'new-products'],
//         queryFn: () => request({
//             url: API_ROUTES.PUBLIC_PRODUCTS.NEW,
//             method: 'GET',
//             params: { page: 0, size: 12 },
//         }, ProductListSchema),
//     });

//     return {
//         // Dữ liệu
//         categories: categoriesQuery.data || [],
//         flashSale: flashSaleQuery.data?.content || [],
//         newProducts: newProductsQuery.data?.content || [],

//         // Trạng thái Loading (chỉ loading chính khi các query quan trọng đang chạy)
//         isLoading: categoriesQuery.isLoading || flashSaleQuery.isLoading,
//         isRefreshing: categoriesQuery.isRefetching || flashSaleQuery.isRefetching || newProductsQuery.isRefetching,

//         // Hàm làm mới toàn bộ
//         refresh: () => {
//             categoriesQuery.refetch();
//             flashSaleQuery.refetch();
//             newProductsQuery.refetch();
//         },

//         // Lỗi
//         error: categoriesQuery.error || flashSaleQuery.error || newProductsQuery.error
//     };
// };
