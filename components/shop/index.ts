/**
 * ==============================================
 * SHOP COMPONENTS - BARREL EXPORT
 * ==============================================
 * 
 * Central export for all shop-related components
 */

export { ShopBanner } from './ShopBanner';
export { ShopHeaderInfo } from './ShopHeaderInfo';
export { ShopHeaderSkeleton } from './ShopHeaderSkeleton';

// ============================================
// NAVIGATION COMPONENTS
// ============================================

export { ShopTabs } from './ShopTabs';
// Re-export tab types from types/shop for convenience
export { SHOP_TABS } from '@/types/shop';
export type { ShopTabType } from '@/types/shop';

// ============================================
// PRODUCT COMPONENTS
// ============================================

export { ShopProductItem } from './ShopProductItem';
export { ShopProductSkeleton } from './ShopProductSkeleton';

// ============================================
// STATE COMPONENTS
// ============================================

export { ShopEmptyState } from './ShopEmptyState';

