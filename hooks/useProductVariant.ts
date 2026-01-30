import type {
    InventoryStatus,
    PriceBreakdown,
    PriceDisplay,
    ProductDetailUI,
    ProductOptionUI,
    SelectedOptions,
    VariantMatrixValue,
    VariantSelectionResult,
} from '@/types/product/productDetail';
import { createKeyFromSelection } from '@/utils/adapter/product/productDetailAdapter';
import { useCallback, useEffect, useMemo, useState } from 'react';

const LOW_STOCK_THRESHOLD = 5;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine inventory status from stock
 */
const getInventoryStatus = (stock: number): InventoryStatus => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
};

/**
 * Create summary string from selected options
 * Example: "Size L, Color Black"
 */
const createSelectionSummary = (selectedOptions: SelectedOptions): string => {
    const values = Object.entries(selectedOptions)
        .filter(([_, value]) => value !== '')
        .map(([_, value]) => value);

    return values.join(', ');
};

/**
 * Normalize string for comparison (lowercase, trim, single space)
 * Must match logic in productDetailAdapter.ts
 */
const normalizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
};

/**
 * Parse variant matrix key từ JSON format
 * Key format: '{"optionname1":"valuename1","optionname2":"valuename2"}'
 * @returns Record<optionName, valueName> normalized
 */
const parseVariantMatrixKey = (key: string): Record<string, string> => {
    try {
        return JSON.parse(key) as Record<string, string>;
    } catch {
        // Fallback if parse error
        return {};
    }
};

/**
 * Check if value is available based on current selection
 * Used to disable unavailable options
 * 
 * Logic:
 * 1. If options not fully selected -> check if at least 1 variant containing this value is in stock
 * 2. If fully selected -> check specific variant
 */
const isValueAvailable = (
    optionName: string,
    valueName: string,
    currentSelection: SelectedOptions,
    product: ProductDetailUI
): boolean => {
    // Normalize for exact comparison
    const normalizedOptionName = normalizeString(optionName);
    const normalizedValueName = normalizeString(valueName);

    // Create fake selection with this value
    const testSelection = {
        ...currentSelection,
        [optionName]: valueName,
    };

    // Count selected options (excluding empty string)
    const selectedCount = Object.values(testSelection).filter(v => v !== '').length;

    // If other options not fully selected
    if (selectedCount < product.options.length) {
        // Check if at least 1 variant matches
        for (const [key, variantValue] of product.variantMatrix) {
            // Parse key from JSON format
            const parsedKey = parseVariantMatrixKey(key);

            // Check if this variant contains the testing option value
            const hasMatchingValue = parsedKey[normalizedOptionName] === normalizedValueName;

            if (!hasMatchingValue) continue;

            // Check if variant matches other selected options
            let matchesOtherSelections = true;
            for (const [selOptName, selOptValue] of Object.entries(testSelection)) {
                if (selOptValue === '') continue; // Skip empty selections

                const normalizedSelOptName = normalizeString(selOptName);
                const normalizedSelOptValue = normalizeString(selOptValue);

                if (parsedKey[normalizedSelOptName] !== normalizedSelOptValue) {
                    matchesOtherSelections = false;
                    break;
                }
            }

            // If variant matches and in stock -> available
            if (matchesOtherSelections && variantValue.isAvailable) {
                return true;
            }
        }
        return false;
    }

    // Fully selected -> check specific variant
    const key = createKeyFromSelection(testSelection);
    const variant = product.variantMatrix.get(key);
    return variant?.isAvailable ?? false;
};

// ============================================
// MAIN HOOK
// ============================================

interface UseProductVariantOptions {
    /** Auto select first available variant */
    autoSelectFirst?: boolean;
}

interface UseProductVariantReturn {
    // State
    selectedOptions: SelectedOptions;

    // Derived data
    selectionResult: VariantSelectionResult;

    // Actions
    selectOption: (optionName: string, valueName: string) => void;
    resetSelection: () => void;

    // Helpers
    isOptionValueSelected: (optionName: string, valueName: string) => boolean;
    isOptionValueAvailable: (optionName: string, valueName: string) => boolean;
    getOptionsWithAvailability: () => ProductOptionWithAvailability[];
}

interface ProductOptionWithAvailability extends ProductOptionUI {
    values: Array<{
        id: string;
        name: string;
        displayOrder?: number;
        image?: string | null;
        isSelected: boolean;
        isAvailable: boolean;
    }>;
}

/**
 * Hook managing product variant selection logic
 */
export const useProductVariant = (
    product: ProductDetailUI | undefined,
    options: UseProductVariantOptions = {}
): UseProductVariantReturn => {
    const { autoSelectFirst = false } = options;

    // ===== STATE =====
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

    // Helper: Calculate initial selection (Cheapest & Available)
    const getInitialSelection = useCallback((prod: ProductDetailUI): SelectedOptions => {
        const initial: SelectedOptions = {};
        for (const option of prod.options) {
            initial[option.name] = '';
        }

        if (autoSelectFirst && prod.variantMatrix && prod.variantMatrix.size > 0) {
            let cheapestVariantKey: string | null = null;
            let lowestPrice = Infinity;

            for (const [key, value] of prod.variantMatrix) {
                if (value.isAvailable && value.price < lowestPrice) {
                    lowestPrice = value.price;
                    cheapestVariantKey = key;
                }
            }

            if (cheapestVariantKey) {
                try {
                    const parsedSelection = JSON.parse(cheapestVariantKey) as Record<string, string>;
                    for (const option of prod.options) {
                        const normalizedOptionName = option.name.trim().replace(/\s+/g, ' ').toLowerCase();
                        const selectedValueName = parsedSelection[normalizedOptionName];
                        if (selectedValueName) {
                            const matchingValue = option.values.find(
                                v => v.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedValueName
                            );
                            if (matchingValue) {
                                initial[option.name] = matchingValue.name;
                            }
                        }
                    }
                } catch (e) { }
            }
        }
        return initial;
    }, [autoSelectFirst]);

    // ===== STATE INITIALIZATION =====
    useEffect(() => {
        if (!product?.options || !product.variantMatrix) {
            setSelectedOptions({});
            return;
        }

        setSelectedOptions(getInitialSelection(product));
    }, [product?.id, getInitialSelection]);

    // ===== DERIVED: Current Variant =====
    const currentVariant = useMemo((): VariantMatrixValue | null => {
        if (!product) return null;

        const selectedCount = Object.values(selectedOptions).filter(v => v !== '').length;
        if (selectedCount < product.options.length) {
            return null; // Not fully selected
        }

        const key = createKeyFromSelection(selectedOptions);
        return product.variantMatrix.get(key) ?? null;
    }, [product, selectedOptions]);

    // ===== DERIVED: Is Fully Selected =====
    const isFullySelected = useMemo(() => {
        if (!product) return false;
        const selectedCount = Object.values(selectedOptions).filter(v => v !== '').length;
        return selectedCount === product.options.length;
    }, [product, selectedOptions]);

    // ===== DERIVED: Display Price =====
    const displayPrice = useMemo((): PriceDisplay => {
        if (!product) {
            return { currentPrice: 0, isRange: false };
        }

        // If a specific variant is selected
        if (currentVariant) {
            let finalPrice = currentVariant.price;
            let totalDiscountAmount = 0;

            const breakdown: PriceBreakdown = {
                basePrice: currentVariant.originalPrice ?? currentVariant.price,
                finalPrice: currentVariant.price, // Initial before vouchers
            };

            if (product.vouchers && product.vouchers.length > 0) {
                product.vouchers.forEach(voucher => {
                    const discountValue = voucher.discountValue ?? 0;
                    let currentVoucherDiscount = 0;

                    if (voucher.discountType === 'PERCENTAGE') {
                        const rawDiscount = (currentVariant.price * discountValue) / 100;
                        currentVoucherDiscount = voucher.maxDiscount
                            ? Math.min(rawDiscount, voucher.maxDiscount)
                            : rawDiscount;
                    } else {
                        currentVoucherDiscount = discountValue;
                    }
                    totalDiscountAmount += currentVoucherDiscount;

                    // Populate breakdown
                    if (voucher.sponsorType === 'PLATFORM') {
                        breakdown.platformVoucher = {
                            id: voucher.id,
                            name: voucher.name || 'CanoX Voucher',
                            amount: currentVoucherDiscount,
                            discountType: voucher.discountType,
                            discountValue: voucher.discountValue,
                            maxDiscount: voucher.maxDiscount,
                        };
                    } else {
                        // Default to shop voucher if not specified or SHOP
                        breakdown.shopVoucher = {
                            id: voucher.id,
                            name: voucher.name || 'Shop Voucher',
                            amount: currentVoucherDiscount,
                            discountType: voucher.discountType,
                            discountValue: voucher.discountValue,
                            maxDiscount: voucher.maxDiscount,
                        };
                    }
                });

                finalPrice -= totalDiscountAmount;
            }

            breakdown.finalPrice = finalPrice;

            // Base for discount calculation: prefers originalPrice from promotion/campaign
            const basePrice = currentVariant.originalPrice ?? currentVariant.price;
            const totalDiscountPercent = basePrice > finalPrice
                ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
                : 0;

            return {
                currentPrice: finalPrice,
                originalPrice: basePrice > finalPrice ? basePrice : undefined,
                discountPercentage: totalDiscountPercent > 0 ? totalDiscountPercent : undefined,
                voucherDiscount: totalDiscountAmount > 0 ? totalDiscountAmount : undefined,
                isRange: false,
                priceAfterVoucher: finalPrice,
                breakdown,
            };
        }

        // Default state: Use prices from product detail (already includes breakdown from adapter)
        return product.priceDisplay;
    }, [product, currentVariant]);

    // ===== DERIVED: Inventory Status =====
    const inventoryStatus = useMemo((): InventoryStatus => {
        if (currentVariant) {
            return getInventoryStatus(currentVariant.stock);
        }

        // Not fully selected -> check total stock
        if (!product) return 'out_of_stock';

        let totalStock = 0;
        for (const [_, value] of product.variantMatrix) {
            totalStock += value.stock;
        }

        return getInventoryStatus(totalStock);
    }, [product, currentVariant]);

    // ===== DERIVED: Available Stock =====
    const availableStock = useMemo((): number => {
        if (currentVariant) {
            return currentVariant.stock;
        }

        if (!product) return 0;

        let total = 0;
        for (const [_, value] of product.variantMatrix) {
            total += value.stock;
        }
        return total;
    }, [product, currentVariant]);

    // ===== DERIVED: Can Add To Cart =====
    const canAddToCart = useMemo(() => {
        if (!product?.hasVariants) {
            // Product has no variants -> check isAvailable
            return product?.isAvailable ?? false;
        }

        // Has variants -> must be fully selected and in stock
        return isFullySelected && currentVariant !== null && currentVariant.stock > 0;
    }, [product, isFullySelected, currentVariant]);

    // ===== DERIVED: Selection Summary =====
    const selectionSummary = useMemo(() => {
        return createSelectionSummary(selectedOptions);
    }, [selectedOptions]);

    // ===== DERIVED: Selection Result (Bundled) =====
    const selectionResult = useMemo((): VariantSelectionResult => ({
        selectedVariant: currentVariant,
        isFullySelected,
        displayPrice,
        inventoryStatus,
        availableStock,
        canAddToCart,
        selectionSummary,
    }), [
        currentVariant,
        isFullySelected,
        displayPrice,
        inventoryStatus,
        availableStock,
        canAddToCart,
        selectionSummary,
    ]);

    // ===== ACTIONS =====
    const selectOption = useCallback((optionName: string, valueName: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: prev[optionName] === valueName ? '' : valueName,
        }));
    }, []);

    const resetSelection = useCallback(() => {
        if (!product?.options || !product.variantMatrix) return;
        setSelectedOptions(getInitialSelection(product));
    }, [product, getInitialSelection]);

    // ===== HELPERS =====
    const isOptionValueSelected = useCallback(
        (optionName: string, valueName: string): boolean => {
            return selectedOptions[optionName] === valueName;
        },
        [selectedOptions]
    );

    const isOptionValueAvailable = useCallback(
        (optionName: string, valueName: string): boolean => {
            if (!product) return false;
            return isValueAvailable(optionName, valueName, selectedOptions, product);
        },
        [product, selectedOptions]
    );

    const getOptionsWithAvailability = useCallback((): ProductOptionWithAvailability[] => {
        if (!product) return [];

        return product.options.map(option => ({
            ...option,
            values: option.values.map(value => ({
                ...value,
                isSelected: selectedOptions[option.name] === value.name,
                isAvailable: isValueAvailable(
                    option.name,
                    value.name,
                    selectedOptions,
                    product
                ),
            })),
        }));
    }, [product, selectedOptions]);

    return {
        selectedOptions,
        selectionResult,
        selectOption,
        resetSelection,
        isOptionValueSelected,
        isOptionValueAvailable,
        getOptionsWithAvailability,
    };
};
