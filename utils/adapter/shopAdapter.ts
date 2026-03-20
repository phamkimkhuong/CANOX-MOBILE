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
import {
    BrandGalleryItemDTO,
    BrandGalleryItemUI,
    ShopBrandProfileDTO,
    ShopBrandProfileUI,
    ShopDetailDTO,
    ShopHeaderUI,
    ShopProductDTO,
    ShopVoucherDTO,
    ShopVoucherUI,
    VoucherScope
} from '@/types/shop';
import { transformProduct } from '@/utils/adapter/product/productAdapter';
import { formatDate, formatMonthYear, safeParseDate } from '@/utils/date';
import { formatPriceShort } from '@/utils/format';
import { toSizedImageUrl } from '@/utils/url';

/** Default placeholder for shop logo */
const DEFAULT_SHOP_LOGO = 'https://via.placeholder.com/100x100?text=Shop';

/** Scope label mapping */
const SCOPE_LABELS: Record<VoucherScope, string> = {
    SHOP_ORDER: 'Đơn hàng',
    SHIPPING: 'Vận chuyển',
    PRODUCT: 'Sản phẩm',
};

/**
 * Build title display based on voucherScope and discountType
 */
const buildTitleDisplay = (
    voucherScope: VoucherScope,
    isPercentage: boolean,
    discountVal: number,
    maxDiscountVal: number
): string => {
    // Shipping voucher
    if (voucherScope === 'SHIPPING') {
        if (isPercentage && discountVal >= 100) {
            return 'Miễn phí vận chuyển';
        } else if (isPercentage) {
            return `Giảm ${discountVal}% phí ship`;
        } else {
            return `Giảm ${formatPriceShort(discountVal).replace('k', 'K')} phí ship`;
        }
    }

    // SHOP_ORDER or PRODUCT voucher
    if (isPercentage && maxDiscountVal > 0) {
        return `Giảm tối đa ${formatPriceShort(maxDiscountVal).replace('k', 'K')}`;
    } else if (isPercentage) {
        return `Giảm ${discountVal}%`;
    } else {
        return `Giảm ${formatPriceShort(discountVal).replace('k', 'K')}`;
    }
};

/**
 * Transform ShopVoucherDTO → ShopVoucherUI
 */
export const transformShopVoucher = (dto: ShopVoucherDTO): ShopVoucherUI => {
    const isPercentage = dto.discountType === 'PERCENTAGE';
    const discountVal = dto.discountValue ?? 0;
    const minSpend = dto.minOrderAmount ?? 0;
    const maxDiscountVal = dto.maxDiscount ?? 0;
    const voucherScope: VoucherScope = dto.voucherScope ?? 'SHOP_ORDER';

    // Build Title Display (main heading)
    const titleDisplay = buildTitleDisplay(voucherScope, isPercentage, discountVal, maxDiscountVal);

    // Build Discount Display (left section): "GIẢM 12%" or "GIẢM 150K"
    const discountDisplay = isPercentage
        ? `GIẢM ${discountVal}%`
        : `GIẢM ${formatPriceShort(discountVal).replace('k', 'K')}`;

    // Build Min Spend Display: "Đơn tối thiểu 350K"
    const minOrderDisplay = minSpend > 0
        ? `Đơn tối thiểu ${formatPriceShort(minSpend).replace('k', 'K')}`
        : 'Mọi đơn hàng';

    // Scope label for badge
    const scopeLabel = SCOPE_LABELS[voucherScope];

    const startD = safeParseDate(dto.startDate);
    const endD = safeParseDate(dto.endDate);
    const isExpired = endD ? endD.getTime() < Date.now() : false;

    return {
        id: dto.id,
        code: dto.code,
        name: dto.name ?? '',
        description: dto.description ?? '',
        titleDisplay,
        discountDisplay,
        minOrderDisplay,
        scopeLabel,
        voucherScope,
        maxDiscount: maxDiscountVal,
        minOrderAmount: minSpend,
        startDate: startD ? formatDate(startD, 'DD/MM/YYYY HH:mm') : '',
        endDate: endD ? formatDate(endD, 'DD/MM/YYYY HH:mm') : '',
        isExpired,
        discountType: (dto.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT') || 'PERCENTAGE',
        discountValue: discountVal,
        maxUsage: dto.maxUsage ?? 0,
        sponsorType: dto.sponsorType ?? 'SHOP',
        applyToAllProducts: dto.applyToAllProducts ?? true,
    };
};

export const toShopVouchersUI = (vouchers: ShopVoucherDTO[]): ShopVoucherUI[] => {
    return vouchers.map(transformShopVoucher);
};

/**
 * Transform ShopDetailDTO → ShopHeaderUI
 */
export const toShopHeaderUI = (dto: ShopDetailDTO): ShopHeaderUI => {
    // Compute joinDate: prefer createdAt, fallback to shopAge (days)
    let joinDate = formatMonthYear(dto.createdAt);
    if (!joinDate && dto.statistics?.shopAge) {
        const joinTimestamp = Date.now() - dto.statistics.shopAge * 86400000;
        const d = new Date(joinTimestamp);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        joinDate = `${month}/${year}`;
    }

    return {
        id: dto.shopId,
        userId: dto.userId ?? null,
        name: dto.shopName,
        description: dto.description || null,
        logoUrl: toSizedImageUrl(dto.logoPath, null, 'medium') || DEFAULT_SHOP_LOGO,
        bannerUrl: toSizedImageUrl(dto.bannerPath, null, 'large') || null,
        isVerified: false,
        status: dto.status ?? 'ACTIVE',
        onVacation: dto.onVacation ?? false,
        location: dto.place || dto.shop_location || null,
        joinDate,
        stats: {
            productCount: dto.statistics?.activeProducts ?? null,
            followerCount: null,
            rating: dto.statistics?.averageRating ?? null,
            reviewCount: dto.statistics?.totalReviews ?? null,
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

// ============================================
// SHOP BRAND PROFILE ADAPTER
// ============================================

/**
 * Transform a single gallery item DTO → UI
 */
const toGalleryItemUI = (dto: BrandGalleryItemDTO): BrandGalleryItemUI | null => {
    const url = toSizedImageUrl(dto.imagePath, null, 'medium') || dto.url || '';
    if (!url) return null;

    return {
        id: dto.id,
        type: (dto.type === 'video' ? 'video' : 'image') as 'image' | 'video',
        url,
        title: dto.title || null,
    };
};

/**
 * Transform ShopBrandProfileDTO → ShopBrandProfileUI
 */
export const toShopBrandProfileUI = (dto: ShopBrandProfileDTO): ShopBrandProfileUI => {
    const gallery = (dto.gallery ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toGalleryItemUI)
        .filter((item): item is BrandGalleryItemUI => item !== null);

    return {
        companyName: dto.companyName || null,
        registrationNumber: dto.registrationNumber || null,
        foundedYear: dto.foundedYear ?? null,
        aboutUs: dto.aboutUs || null,
        videoIntroUrl: dto.videoIntro?.url || null,
        gallery,
    };
};
