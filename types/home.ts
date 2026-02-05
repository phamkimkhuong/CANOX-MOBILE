
/**
 * Flash Sale Slot Data (from Public Campaign API)
 */
export interface FlashSaleSlot {
    id: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
    label: string;     // e.g. "Khung giờ vàng", "Flash Sale 12h"
}

/**
 * Flash Sale Item for UI
 */
export interface FlashSaleItem {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    soldCount: number;
    totalStock: number;
    stockRemaining: number;
    progress: number; // 0 to 100
    isSoldOut: boolean;
    purchaseLimitPerUser?: number | null;
}

/**
 * Flash Sale UI State
 */
export interface FlashSaleData {
    slot: FlashSaleSlot;
    items: FlashSaleItem[];
}
