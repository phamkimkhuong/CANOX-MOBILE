/**
 * ==============================================
 * SHOP COMPONENTS - BARREL EXPORT
 * ==============================================
 * 
 * Central export for all shop-related components
 * Organized by subdirectory for better maintainability
 */

// ============================================
// HEADER COMPONENTS
// ============================================
export {
    ShopBanner,
    ShopHeaderInfo,
    ShopHeaderSkeleton,
    ShopNavBar,
    ShopTabs
} from './header';
export type { ShopNavBarProps } from './header';

// ============================================
// PRODUCT COMPONENTS
// ============================================
export {
    ShopEmptyState,
    ShopProductItem,
    ShopProductSkeleton
} from './product';

// ============================================
// SEARCH COMPONENTS
// ============================================
export {
    ShopCategoriesTab,
    ShopSearchEmptyState,
    ShopSearchHeader
} from './search';
export type { ShopSearchHeaderRef } from './search';

// ============================================
// VOUCHER COMPONENTS
// ============================================
export {
    ShopVoucherCard,
    ShopVoucherSection,
    ShopVoucherSkeleton
} from './voucher';

// ============================================
// PROFILE COMPONENTS (Brand-First Strategy)
// ============================================
export {
    ShopBrandStory,
    ShopBusinessInfo,
    ShopCommitments,
    ShopGallery,
    ShopPlatformGuarantees,
    ShopProfileHero,
    ShopProfileTab,
    ShopTrustBadges
} from './profile';

// ============================================
// RE-EXPORTS FROM TYPES
// ============================================
export { SHOP_TABS } from '@/types/shop';
export type { ShopTabType } from '@/types/shop';

