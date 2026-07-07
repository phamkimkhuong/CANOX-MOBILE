import { SlotDetailData } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { buildImageUrl } from '@/utils/url';

/**
 * One card per flash sale product. Use the first variant as the commercial
 * representative and generate a medium image for the home strip.
 */
export const transformSlotProductsToFlashSaleItems = (
    slot: SlotDetailData | null | undefined
): FlashSaleItem[] => {
    if (!slot?.products?.length) return [];

    return slot.products.flatMap((item) => {
        const productInfo = item.product;
        if (!productInfo) return [];

        const representativeVariant = item.variants?.[0];
        if (!representativeVariant) return [];

        const stockLimit = representativeVariant.stockLimit || 1;
        const stockSold = representativeVariant.stockSold || 0;
        const stockRemaining = representativeVariant.stockRemaining || 0;
        const progress = Math.min(Math.round((stockSold / stockLimit) * 100), 100);

        return [{
            id: productInfo.productId,
            productId: productInfo.productId,
            name: productInfo.productName || 'Sản phẩm Flash Sale',
            shopName: item.shopName || '',
            image: buildImageUrl(
                productInfo.thumbnailUrl || representativeVariant.variantImagePath,
                null,
                'medium'
            ),
            rating: productInfo.averageRating || 0,
            price: representativeVariant.salePrice || 0,
            originalPrice: representativeVariant.originalPrice || 0,
            discountPercentage: representativeVariant.discountPercent || 0,
            soldCount: stockSold,
            totalStock: stockLimit,
            stockRemaining,
            progress,
            isSoldOut: representativeVariant.isSoldOut || stockRemaining === 0,
        }];
    });
};
