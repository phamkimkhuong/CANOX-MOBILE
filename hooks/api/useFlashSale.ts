import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { FlashSaleData, FlashSaleItem, FlashSaleResponse, FlashSaleResponseSchema } from '@/types/home';
import { getNextFlashSaleSlot } from '@/utils/date';
import { toPublicUrl } from '@/utils/url';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook lấy dữ liệu Flash Sale cho màn hình Home
 */
export const useFlashSale = () => {
    return useQuery({
        queryKey: ['flash-sale'],
        queryFn: async (): Promise<FlashSaleData> => {
            const response = await request<FlashSaleResponse>(
                {
                    url: API_ROUTES.PUBLIC_PRODUCTS.SALE,
                    method: 'GET',
                    params: {
                        page: 0,
                        size: 10,
                    },
                },
                FlashSaleResponseSchema
            );

            // 1. Lấy slot mô phỏng
            const slot = getNextFlashSaleSlot();

            // 2. Guard: Check response.data exists
            if (!response.data) {
                return { slot, items: [] };
            }

            // 3. Transform items
            const items: FlashSaleItem[] = response.data.content.map((product) => {
                // Tính tổng tồn kho từ các variant
                const totalStock = product.variants?.reduce((acc: number, v) => acc + (v.inventory?.stock || 0), 0) || 50;

                // Lấy số lượng đã bán
                const soldCount = product.reviewStatistics?.verifiedPurchaseCount || 0;

                // Tính % tiến độ (Mô phỏng nếu soldCount = 0 để nhìn đẹp hơn)
                // Hoặc dùng công thức: (Sold / (Sold + Stock)) * 100
                const progress = totalStock > 0
                    ? Math.min(Math.round((soldCount / (soldCount + totalStock)) * 100), 90)
                    : 0;

                // Lấy ảnh primary (with null safety)
                const mediaArray = product.media ?? [];
                const primaryMedia = mediaArray.find(m => m.isPrimary) || mediaArray[0];

                const basePrice = product.basePrice ?? 0;
                const currentPrice = product.priceAfterBestVoucher ?? product.priceMin ?? basePrice;

                // Calculate discount percentage safely
                const discountPercentage = basePrice > 0 && currentPrice !== null
                    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
                    : 0;

                return {
                    id: product.id,
                    productId: product.id,
                    name: product.name ?? 'Sản phẩm',
                    image: toPublicUrl(primaryMedia?.url),
                    price: currentPrice,
                    originalPrice: basePrice,
                    discountPercentage,
                    soldCount,
                    totalStock,
                    progress,
                };
            });

            return {
                slot,
                items,
            };
        },
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};
