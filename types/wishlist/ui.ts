/**
 * ==============================================
 * WISHLIST UI TYPES - View Layer Types
 * ==============================================
 * Types used by React components
 * Already formatted and ready for rendering
 * The Adapter transforms DTO → UI
 */

import type { WishlistItemOptionDTO, WishlistItemPriority } from './dto';

// ============================================
// UI TYPES (For Components - đã transform)
// ============================================

/**
 * Wishlist item enhanced for UI rendering
 * 
 * Used in: WishlistItemCard component
 */
export interface WishlistItemUI {
    id: string;
    wishlistId: string;
    productId: string;
    variantId: string;
    productName: string;
    imageUrl: string | null;        // Full URL (transformed from basePath + extension)
    price: number;
    formattedPrice: string;          // "10.000.000₫" (formatted for display)
    quantity: number;
    notes: string | null;
    priority: WishlistItemPriority;
    priorityLabel: string;           // "Khẩn cấp" (localized)
    priorityColor: string;           // Theme color key
    desiredPrice: number | null;
    formattedDesiredPrice: string | null; // Formatted for display
    isPriceTargetMet: boolean;
    priceDifference: number | null;  // Calculated: price - desiredPrice
    options: WishlistItemOptionDTO[];
    optionsDisplay: string;          // "Màu: Đỏ, Size: XL" (formatted string)
    createdAt: string;
}

/**
 * Wishlist card for list view
 * 
 * Used in: WishlistCard component
 */
export interface WishlistCardUI {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    isDefault: boolean;
    itemCount: number;
    coverImageUrl: string | null;    // Full URL (transformed)
    buyerName: string;
    formattedDate: string;           // "12/01/2024" (formatted)
}

/**
 * Full wishlist for detail view
 * 
 * Used in: WishlistDetailScreen
 */
export interface WishlistDetailUI extends WishlistCardUI {
    items: WishlistItemUI[];
    shareUrl: string | null;
}
