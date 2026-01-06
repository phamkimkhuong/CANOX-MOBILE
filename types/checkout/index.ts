/**
 * Checkout Types Index
 *
 * Structure:
 * - ../checkout.ts: UI types (CheckoutItemUI, CheckoutShopUI, etc.)
 * - ./checkoutPreview.ts: API DTO types (raw response from server)
 *
 * Usage:
 * - Components import UI types from here
 * - Adapter transforms DTO → UI types
 */

// Existing checkout UI types (for components)
export * from '../checkout';

// Checkout Preview API types (DTO - for adapter/hooks)
export * from './checkoutPreview';
export * from './order';
export * from './platformVoucherRecommendation';
export * from './shopVoucherRecommendation';

