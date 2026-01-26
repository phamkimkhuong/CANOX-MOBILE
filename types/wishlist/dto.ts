/**
 * ==============================================
 * WISHLIST DTO TYPES - API Response Structures
 * ==============================================
 * Types that match exactly with API response
 * These are the "raw" data from backend
 */

// ============================================
// PRIORITY LEVELS
// ============================================

export type WishlistItemPriority = 0 | 1 | 2;

export const PRIORITY_CONFIG = {
    0: { label: 'Bình thường', color: 'secondary', icon: 'bookmark-outline' },
    1: { label: 'Quan trọng', color: 'warning', icon: 'bookmark' },
    2: { label: 'Khẩn cấp', color: 'error', icon: 'fire' },
} as const;

// ============================================
// DTO TYPES (API Response - từ Backend)
// ============================================

/**
 * Variant option (e.g. color, size)
 */
export interface WishlistItemOptionDTO {
    option: string;
    value: string;
}

/**
 * Item in a wishlist - Dữ liệu thô từ API
 * Using optional (?) for nullable fields to match Zod output
 */
export interface WishlistItemDTO {
    id: string;
    wishlistId: string;
    variantId: string;
    sku: string;
    productId: string;
    productName: string;
    imageBasePath?: string | null;
    imageExtension?: string | null;
    productImage?: string | null;
    productPrice: number;
    productDescription: string;
    quantity: number;
    notes?: string | null;
    priority: WishlistItemPriority;
    priorityText: string;
    desiredPrice?: number | null;
    isPriceTargetMet: boolean;
    createdDate: string;
    lastModifiedDate: string;
    options: WishlistItemOptionDTO[];
}

/**
 * Wishlist summary (for list view) - Dữ liệu thô từ API
 */
export interface WishlistSummaryDTO {
    id: string;
    name: string;
    description?: string | null;
    isPublic: boolean;
    isDefault: boolean;
    buyerId: string;
    buyerName: string;
    itemCount: number;
    createdDate: string;
    lastModifiedDate: string;
    imageBasePath?: string | null;
    imageExtension?: string | null;
}

/**
 * Full wishlist detail with items - Dữ liệu thô từ API
 */
export interface WishlistDetailDTO extends WishlistSummaryDTO {
    items: WishlistItemDTO[];
    shareToken?: string | null;
    shareUrl?: string | null;
    ogMetadata?: unknown | null;
}

/**
 * Price target met response - Dữ liệu thô từ API
 */
export interface PriceTargetMetDTO {
    wishlists: WishlistDetailDTO[];
    totalItems: number;
    totalWishlists: number;
}

// ============================================
// PAGINATED RESPONSE
// ============================================

export interface WishlistPageDTO {
    content: WishlistSummaryDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
}
