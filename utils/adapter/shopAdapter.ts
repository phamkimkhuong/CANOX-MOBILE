/**
 * ==============================================
 * SHOP ADAPTER - Transform DTO to UI Types
 * ==============================================
 * 
 * Responsibilities:
 * 1. Transform raw API data to lightweight UI models
 * 2. Handle nullable fields with fallbacks
 * 3. Calculate derived values (price range, stock, etc.)
 */

import { ProductFeedItem } from '@/types/product/product';
import { ShopDetailDTO, ShopHeaderUI, ShopProductDTO } from '@/types/shop';
import { transformProduct } from '@/utils/adapter/product/productAdapter';

/** Default placeholder for shop logo */
const DEFAULT_SHOP_LOGO = 'https://via.placeholder.com/100x100?text=Shop';

/**
 * Transform ShopDetailDTO → ShopHeaderUI
 */
export const toShopHeaderUI = (dto: ShopDetailDTO): ShopHeaderUI => {
    let joinDate = '';
    if (dto.createdAt) {
        const date = new Date(dto.createdAt);
        joinDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    return {
        id: dto.shopId,
        name: dto.shopName,
        description: dto.description || null,
        logoUrl: dto.logoUrl || DEFAULT_SHOP_LOGO,
        bannerUrl: dto.bannerUrl || null,
        isVerified: false,
        location: null,
        joinDate,
        stats: {
            productCount: dto.statistics.totalProducts,
            followerCount: null,
            rating: dto.statistics.averageRating,
            responseRate: null,
        },
    };
};

/**
 * Unified Adapter for Shop Products
 * Now uses the master transformProduct logic to ensure consistency across Home and Shop
 */
export const toShopProductItemUI = (dto: ShopProductDTO): ProductFeedItem => {
    return transformProduct(dto);
};

export const toShopProductsUI = (products: ShopProductDTO[]): ProductFeedItem[] => {
    return products.map(toShopProductItemUI);
};
