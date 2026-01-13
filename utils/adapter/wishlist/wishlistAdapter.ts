/**
 * ==============================================
 * WISHLIST ADAPTER - DTO to UI Transformation
 * ==============================================
 * Transforms raw API response data into UI-ready format
 * Following Adapter Pattern for clean separation
 */

import type {
    WishlistCardUI,
    WishlistDetailDTO,
    WishlistDetailUI,
    WishlistItemDTO,
    WishlistItemUI,
    WishlistSummaryDTO,
} from '@/types/wishlist';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { toSizedImageUrl } from '@/utils/url';

// ============================================
// PRIORITY CONFIGURATION
// ============================================

/**
 * Get priority configuration based on level
 * Returns localized label and theme color key
 */
const getPriorityConfig = (priority: 0 | 1 | 2) => {
    const config: Record<0 | 1 | 2, { label: string; color: string; icon: string }> = {
        0: { label: 'Bình thường', color: 'secondary', icon: 'bookmark-outline' },
        1: { label: 'Quan trọng', color: 'warning', icon: 'bookmark' },
        2: { label: 'Khẩn cấp', color: 'error', icon: 'fire' },
    };
    return config[priority];
};

// ============================================
// ADAPTER FUNCTIONS
// ============================================

/**
 * Transform wishlist item DTO to UI model
 * 
 * @param item - Raw item from API
 * @returns UI-ready item with formatted fields
 */
export const adaptWishlistItem = (item: WishlistItemDTO): WishlistItemUI => {
    const priorityConfig = getPriorityConfig(item.priority);
    const priceDiff = item.desiredPrice ? item.productPrice - item.desiredPrice : null;

    return {
        id: item.id,
        wishlistId: item.wishlistId,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        // Use existing URL utility with '_thumb' for list view optimization
        imageUrl: toSizedImageUrl(item.imageBasePath, item.imageExtension, '_thumb') ?? null,
        price: item.productPrice,
        // Use existing currency formatter
        formattedPrice: formatCurrency(item.productPrice),
        quantity: item.quantity,
        notes: item.notes ?? null,
        priority: item.priority,
        priorityLabel: priorityConfig.label,
        priorityColor: priorityConfig.color,
        desiredPrice: item.desiredPrice ?? null,
        formattedDesiredPrice: item.desiredPrice ? formatCurrency(item.desiredPrice) : null,
        isPriceTargetMet: item.isPriceTargetMet,
        priceDifference: priceDiff,
        options: item.options,
        optionsDisplay: item.options.map(o => `${o.option}: ${o.value}`).join(', '),
        createdAt: item.createdAt,
    };
};

/**
 * Transform wishlist summary DTO to card UI model
 * 
 * @param wishlist - Raw wishlist summary from API
 * @returns UI-ready card for list view
 */
export const adaptWishlistCard = (wishlist: WishlistSummaryDTO): WishlistCardUI => {
    return {
        id: wishlist.id,
        name: wishlist.name,
        description: wishlist.description ?? null,
        isPublic: wishlist.isPublic,
        isDefault: wishlist.isDefault,
        itemCount: wishlist.itemCount,
        // Use existing URL utility with '_medium' for card cover
        coverImageUrl: toSizedImageUrl(wishlist.imageBasePath, wishlist.imageExtension, '_medium') ?? null,
        buyerName: wishlist.buyerName,
        // Use existing date formatter - outputs "DD/MM/YYYY"
        formattedDate: formatDate(wishlist.createdAt),
    };
};

/**
 * Transform wishlist detail DTO to detail UI model
 * 
 * @param detail - Full wishlist detail from API
 * @returns UI-ready detail with items
 */
export const adaptWishlistDetail = (detail: WishlistDetailDTO): WishlistDetailUI => {
    return {
        ...adaptWishlistCard(detail),
        items: detail.items.map(adaptWishlistItem),
        shareUrl: detail.shareUrl ?? null,
    };
};

/**
 * Transform array of wishlist summaries
 * 
 * @param wishlists - Array of raw wishlist summaries
 * @returns Array of UI-ready cards
 */
export const adaptWishlistList = (wishlists: WishlistSummaryDTO[]): WishlistCardUI[] => {
    return wishlists.map(adaptWishlistCard);
};
