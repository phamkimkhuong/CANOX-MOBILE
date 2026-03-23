import type {
    InventoryStatus,
    PriceBreakdown,
    PriceDisplay,
    ProductDetailUI,
    ProductOptionWithAvailability,
    ProductOptionValueWithAvailability,
    SelectedOptions,
    VariantMatrixValue,
    VariantSelectionResult,
    VoucherUI,
} from '@/types/product/productDetail';
import { createKeyFromSelection } from '@/utils/adapter/product/productDetailAdapter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LOW_STOCK_THRESHOLD = 5;
const TACTICAL_CAMPAIGN_TYPES = new Set([
    'FLASH_SALE',
    'DAILY_DEAL',
    'MEGA_SALE',
    'SHOP_SALE',
    'SHOP_PROMOTION',
]);

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

const getMatchingVariantsForSelection = (
    selection: SelectedOptions,
    product: ProductDetailUI
): VariantMatrixValue[] => {
    const matches: VariantMatrixValue[] = [];

    for (const [key, variantValue] of product.variantMatrix) {
        if (!variantValue.isAvailable) continue;

        const parsedKey = parseVariantMatrixKey(key);
        let matchesSelection = true;

        for (const [optionName, optionValue] of Object.entries(selection)) {
            if (optionValue === '') continue;

            const normalizedOptionName = normalizeString(optionName);
            const normalizedOptionValue = normalizeString(optionValue);

            if (parsedKey[normalizedOptionName] !== normalizedOptionValue) {
                matchesSelection = false;
                break;
            }
        }

        if (matchesSelection) {
            matches.push(variantValue);
        }
    }

    return matches;
};

const getOptionValuePromotionSignal = (
    optionName: string,
    valueName: string,
    currentSelection: SelectedOptions,
    product: ProductDetailUI
): Pick<ProductOptionValueWithAvailability, 'promotionState' | 'promotionType'> => {
    const testSelection = {
        ...currentSelection,
        [optionName]: valueName,
    };

    const matchingVariants = getMatchingVariantsForSelection(testSelection, product);
    if (matchingVariants.length === 0) {
        return { promotionState: 'none' };
    }

    const promotedVariants = matchingVariants.filter((variant) =>
        !!variant.campaignType && TACTICAL_CAMPAIGN_TYPES.has(variant.campaignType)
    );

    if (promotedVariants.length === 0) {
        return { promotionState: 'none' };
    }

    const campaignTypes = Array.from(new Set(
        promotedVariants
            .map((variant) => variant.campaignType)
            .filter((campaignType): campaignType is string => !!campaignType)
    ));

    return {
        promotionState: promotedVariants.length === matchingVariants.length
            ? 'active'
            : 'possible',
        promotionType: campaignTypes.length === 1 ? campaignTypes[0] : undefined,
    };
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

/**
 * Hook managing product variant selection logic
 */
export const useProductVariant = (
    product: ProductDetailUI | undefined,
    options: UseProductVariantOptions = {}
): UseProductVariantReturn => {
    const { autoSelectFirst = false } = options;

    const { t } = useTranslation('product');

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
                } catch {
                    // Ignore parse error
                }
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
    }, [product?.id, getInitialSelection, product]);

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

            // Add product promotion discount to breakdown (e.g., Shop Sale, Flash Sale)
            if (currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price) {
                breakdown.productDiscount = {
                    id: currentVariant.promotionId || 'product-discount',
                    name: currentVariant.promotionName || t('priceBreakdown.productDiscount'),
                    amount: currentVariant.originalPrice - currentVariant.price,
                    percentage: currentVariant.promotionPercentage,
                    campaignType: currentVariant.campaignType,
                };
            }

            if (product.vouchers && product.vouchers.length > 0) {
                // Find single best voucher for each sponsor type to match stacking rules
                let bestPlatformVoucher: VoucherUI | null = null;
                let bestPlatformAmount = 0;
                let bestShopVoucher: VoucherUI | null = null;
                let bestShopAmount = 0;

                for (const voucher of product.vouchers) {
                    const discountValue = voucher.discountValue ?? 0;
                    let amount = 0;

                    if (voucher.discountType === 'PERCENTAGE') {
                        const rawDiscount = (currentVariant.price * discountValue) / 100;
                        amount = voucher.maxDiscount
                            ? Math.min(rawDiscount, voucher.maxDiscount)
                            : rawDiscount;
                    } else {
                        amount = discountValue;
                    }

                    // Simple eligibility check (minOrderValue)
                    // Currently checks against 1 unit (matching standard product detail behavior)
                    const isEligible = !voucher.minOrderValue || currentVariant.price >= voucher.minOrderValue;

                    if (isEligible) {
                        if (voucher.sponsorType === 'PLATFORM') {
                            if (amount > bestPlatformAmount) {
                                bestPlatformAmount = amount;
                                bestPlatformVoucher = voucher;
                            }
                        } else {
                            // Default to SHOP if not specified
                            if (amount > bestShopAmount) {
                                bestShopAmount = amount;
                                bestShopVoucher = voucher;
                            }
                        }
                    }
                }

                // Apply stacking: 1 Platform + 1 Shop
                if (bestPlatformVoucher) {
                    totalDiscountAmount += bestPlatformAmount;
                    breakdown.platformVoucher = {
                        id: bestPlatformVoucher.id,
                        name: bestPlatformVoucher.name || 'CanoX Voucher',
                        amount: bestPlatformAmount,
                        discountType: bestPlatformVoucher.discountType,
                        discountValue: bestPlatformVoucher.discountValue,
                        maxDiscount: bestPlatformVoucher.maxDiscount,
                    };
                }

                if (bestShopVoucher) {
                    totalDiscountAmount += bestShopAmount;
                    breakdown.shopVoucher = {
                        id: bestShopVoucher.id,
                        name: bestShopVoucher.name || 'Shop Voucher',
                        amount: bestShopAmount,
                        discountType: bestShopVoucher.discountType,
                        discountValue: bestShopVoucher.discountValue,
                        maxDiscount: bestShopVoucher.maxDiscount,
                    };
                }

                finalPrice -= totalDiscountAmount;
            }

            breakdown.finalPrice = finalPrice;

            // ===== LAYERED PRICE LOGIC =====
            //  Base Price (Original)
            const baseOriginalPrice = currentVariant.originalPrice ?? currentVariant.price;

            // Variant has a Promotion/Vouchers
            const totalDiscountPercent = baseOriginalPrice > finalPrice
                ? Math.round(((baseOriginalPrice - finalPrice) / baseOriginalPrice) * 100)
                : undefined;

            return {
                currentPrice: finalPrice, // Shows 45,075 (Final Price)
                originalPrice: baseOriginalPrice > finalPrice ? baseOriginalPrice : undefined, // Shows 75,000
                discountPercentage: totalDiscountPercent, // Total discount % (e.g., 40%)
                voucherDiscount: totalDiscountAmount,
                shopVoucherDiscount: breakdown.shopVoucher?.amount,
                platformVoucherDiscount: breakdown.platformVoucher?.amount,
                priceAfterVoucher: finalPrice,
                isRange: false,
                breakdown,
            };
        }

        // Default state: Use prices from product detail (already includes breakdown from adapter)
        return product.priceDisplay;
    }, [product, currentVariant, t]);

    // ===== DERIVED: Inventory Status =====
    const inventoryStatus = useMemo((): InventoryStatus => {
        if (currentVariant) {
            return getInventoryStatus(currentVariant.stock);
        }

        // Not fully selected -> check total stock
        if (!product) return 'out_of_stock';

        let totalStock = 0;
        for (const [, value] of product.variantMatrix) {
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
        for (const [, value] of product.variantMatrix) {
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
                ...getOptionValuePromotionSignal(
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
